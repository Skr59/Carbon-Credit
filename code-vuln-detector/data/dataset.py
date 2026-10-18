"""
Dataset construction for training and evaluation.

Two sources are supported:

* ``hf``  - the CodeXGLUE *Defect Detection* (Devign) dataset published on the
  HuggingFace Hub. Requires network access and ``datasets``.
* ``builtin`` - a curated, self-contained corpus shipped with the project so the
  pipeline can be trained and demonstrated entirely offline.

Both sources are normalised to the same record shape::

    {"code": str, "label": int, "language": str}
"""
from __future__ import annotations

import csv
import json
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Sequence, Tuple

from .preprocess import detect_language, normalise

LabeledRecord = Dict[str, object]


# --------------------------------------------------------------------------- #
# Built-in corpus (safe + vulnerable, multiple languages / CWEs)
# --------------------------------------------------------------------------- #
_BUILTIN: List[Tuple[str, int, str]] = [
    # ---------------- Python : vulnerable ---------------- #
    ("""
import os
def run(cmd):
    os.system("ls " + cmd)
""", 1, "python"),
    ("""
import sqlite3
def get_user(conn, name):
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE name = '%s'" % name)
    return cur.fetchall()
""", 1, "python"),
    ("""
import pickle
def load(data):
    return pickle.loads(data)
""", 1, "python"),
    ("""
import hashlib
def hash_pw(pw):
    return hashlib.md5(pw.encode()).hexdigest()
""", 1, "python"),
    ("""
import subprocess
def ping(host):
    subprocess.call("ping -c 1 %s" % host, shell=True)
""", 1, "python"),
    ("""
PASSWORD = "SuperSecret123"
API_KEY = "AKIAIOSFODNN7EXAMPLE"

def connect():
    return PASSWORD
""", 1, "python"),
    ("""
from flask import request, render_template_string
def profile():
    name = request.args.get("name")
    return render_template_string("<h1>Hello " + name + "</h1>")
""", 1, "python"),
    ("""
import random
def token():
    return str(random.randint(100000, 999999))
""", 1, "python"),
    ("""
from flask import Flask
app = Flask(__name__)
if __name__ == "__main__":
    app.run(debug=True)
""", 1, "python"),
    ("""
import os
def read_file(name):
    with open("/data/" + name) as f:
        return f.read()
""", 1, "python"),
    # ---------------- Python : safe ---------------- #
    ("""
import sqlite3
def get_user(conn, name):
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE name = ?", (name,))
    return cur.fetchall()
""", 0, "python"),
    ("""
import subprocess
def ping(host):
    subprocess.run(["ping", "-c", "1", host], shell=False, check=True)
""", 0, "python"),
    ("""
import hashlib
def hash_pw(pw):
    return hashlib.sha256(pw.encode()).hexdigest()
""", 0, "python"),
    ("""
import json
def load(data):
    return json.loads(data)
""", 0, "python"),
    ("""
import os
PASSWORD = os.getenv("APP_PASSWORD")

def connect():
    return PASSWORD
""", 0, "python"),
    ("""
import secrets
def token():
    return secrets.token_urlsafe(32)
""", 0, "python"),
    ("""
def add(a, b):
    return a + b
""", 0, "python"),
    ("""
from flask import request
def profile():
    name = request.args.get("name", "")
    return {"name": name}
""", 0, "python"),
    ("""
import os
def read_file(name):
    base = "/data"
    path = os.path.realpath(os.path.join(base, name))
    if not path.startswith(base):
        raise ValueError("invalid path")
    with open(path) as f:
        return f.read()
""", 0, "python"),
    ("""
import logging
def divide(a, b):
    if b == 0:
        raise ValueError("division by zero")
    return a / b
""", 0, "python"),
    # ---------------- C / C++ : vulnerable ---------------- #
    ("""
#include <string.h>
void copy(char *dst, char *src) {
    strcpy(dst, src);
}
""", 1, "c"),
    ("""
#include <stdio.h>
void read_input() {
    char buf[64];
    gets(buf);
}
""", 1, "c"),
    ("""
#include <string.h>
void parse(char *user) {
    char cmd[128];
    sprintf(cmd, "echo %s", user);
    system(cmd);
}
""", 1, "cpp"),
    ("""
#include <stdlib.h>
void use(char *p) {
    free(p);
    p[0] = 'x';
}
""", 1, "c"),
    ("""
#include <string.h>
char *SECRET = "hardcodedpassword";
""", 1, "c"),
    # ---------------- C / C++ : safe ---------------- #
    ("""
#include <string.h>
void copy(char *dst, char *src, size_t n) {
    strncpy(dst, src, n - 1);
    dst[n - 1] = '\\0';
}
""", 0, "c"),
    ("""
#include <stdio.h>
void read_input() {
    char buf[64];
    if (fgets(buf, sizeof(buf), stdin) == NULL) {
        return;
    }
}
""", 0, "c"),
    ("""
int add(int a, int b) {
    return a + b;
}
""", 0, "cpp"),
    # ---------------- Java : vulnerable ---------------- #
    ("""
import java.sql.*;
public class UserDao {
    public ResultSet find(Statement st, String name) throws Exception {
        return st.executeQuery("SELECT * FROM users WHERE name = '" + name + "'");
    }
}
""", 1, "java"),
    ("""
import java.io.*;
public class Loader {
    public Object load(InputStream in) throws Exception {
        ObjectInputStream ois = new ObjectInputStream(in);
        return ois.readObject();
    }
}
""", 1, "java"),
    ("""
import java.security.MessageDigest;
public class Hash {
    public byte[] hash(String s) throws Exception {
        return MessageDigest.getInstance("MD5").digest(s.getBytes());
    }
}
""", 1, "java"),
    ("""
public class Config {
    private static final String PASSWORD = "admin123";
}
""", 1, "java"),
    # ---------------- Java : safe ---------------- #
    ("""
import java.sql.*;
public class UserDao {
    public ResultSet find(Connection c, String name) throws Exception {
        PreparedStatement ps = c.prepareStatement("SELECT * FROM users WHERE name = ?");
        ps.setString(1, name);
        return ps.executeQuery();
    }
}
""", 0, "java"),
    ("""
import java.security.MessageDigest;
public class Hash {
    public byte[] hash(String s) throws Exception {
        return MessageDigest.getInstance("SHA-256").digest(s.getBytes());
    }
}
""", 0, "java"),
    ("""
public class Math {
    public int add(int a, int b) {
        return a + b;
    }
}
""", 0, "java"),
    # ---------------- JavaScript : vulnerable ---------------- #
    ("""
const child_process = require("child_process");
function run(userInput) {
    child_process.exec("ls " + userInput);
}
""", 1, "javascript"),
    ("""
function show(userInput) {
    document.getElementById("out").innerHTML = userInput;
}
""", 1, "javascript"),
    ("""
const db = require("./db");
function findUser(name, cb) {
    db.query("SELECT * FROM users WHERE name = '" + name + "'", cb);
}
""", 1, "javascript"),
    ("""
const crypto = require("crypto");
function hash(s) {
    return crypto.createHash("md5").update(s).digest("hex");
}
""", 1, "javascript"),
    ("""
const API_KEY = "sk-live-1234567890abcdef";
module.exports = { API_KEY };
""", 1, "javascript"),
    # ---------------- JavaScript : safe ---------------- #
    ("""
const child_process = require("child_process");
function run(userInput) {
    child_process.execFile("/bin/ls", [userInput]);
}
""", 0, "javascript"),
    ("""
function show(userInput) {
    document.getElementById("out").textContent = userInput;
}
""", 0, "javascript"),
    ("""
function add(a, b) {
    return a + b;
}
""", 0, "javascript"),
    ("""
const crypto = require("crypto");
function hash(s) {
    return crypto.createHash("sha256").update(s).digest("hex");
}
""", 0, "javascript"),
    ("""
const API_KEY = process.env.API_KEY;
module.exports = { API_KEY };
""", 0, "javascript"),
]


def builtin_records() -> List[LabeledRecord]:
    """Return the built-in corpus as normalised records."""
    records: List[LabeledRecord] = []
    for code, label, lang in _BUILTIN:
        records.append(
            {
                "code": normalise(code).strip(),
                "label": int(label),
                "language": lang,
            }
        )
    return records


# --------------------------------------------------------------------------- #
# CodeXGLUE / Devign loader
# --------------------------------------------------------------------------- #
def load_codexglue(
    name: str = "code_x_glue_cc_defect_detection",
    split: str = "train",
    limit: Optional[int] = None,
) -> List[LabeledRecord]:
    """Load the Devign defect detection dataset from the HuggingFace Hub."""
    from datasets import load_dataset  # imported lazily

    ds = load_dataset(name, split=split)
    records: List[LabeledRecord] = []
    for i, row in enumerate(ds):
        if limit is not None and i >= limit:
            break
        code = normalise(str(row.get("func", "") or row.get("code", "")))
        label = int(row.get("target", row.get("label", 0)))
        records.append(
            {"code": code, "label": label, "language": detect_language(code)}
        )
    return records


# --------------------------------------------------------------------------- #
# Dataset wrapper + splits
# --------------------------------------------------------------------------- #
@dataclass
class VulnDataset:
    records: List[LabeledRecord]

    def __len__(self) -> int:
        return len(self.records)

    def labels(self) -> List[int]:
        return [int(r["label"]) for r in self.records]

    def texts(self) -> List[str]:
        return [str(r["code"]) for r in self.records]

    def class_balance(self) -> Dict[str, int]:
        pos = sum(1 for r in self.records if int(r["label"]) == 1)
        return {"vulnerable": pos, "safe": len(self.records) - pos}

    def split(
        self, train: float = 0.8, val: float = 0.1, seed: int = 42
    ) -> Tuple["VulnDataset", "VulnDataset", "VulnDataset"]:
        records = list(self.records)
        random.Random(seed).shuffle(records)
        n = len(records)
        n_train = int(n * train)
        n_val = int(n * val)
        return (
            VulnDataset(records[:n_train]),
            VulnDataset(records[n_train : n_train + n_val]),
            VulnDataset(records[n_train + n_val :]),
        )


def build_dataset(
    source: str = "builtin",
    limit: Optional[int] = None,
    augment: bool = False,
) -> VulnDataset:
    """Factory that returns a :class:`VulnDataset` from the chosen source.

    ``source='builtin'`` works offline; ``source='hf'`` pulls CodeXGLUE.
    ``augment=True`` duplicates vulnerable built-in samples with shuffled
    whitespace to add mild lexical diversity for tiny training runs.
    """
    if source == "hf":
        records = load_codexglue(limit=limit)
    else:
        records = builtin_records()
        if augment:
            records = _augment(records)

    if source == "builtin" and limit is not None:
        records = records[:limit]
    return VulnDataset(records)


def _augment(records: Sequence[LabeledRecord]) -> List[LabeledRecord]:
    out: List[LabeledRecord] = list(records)
    rng = random.Random(1234)
    for rec in records:
        if int(rec["label"]) != 1:
            continue
        code = str(rec["code"])
        lines = code.splitlines()
        rng.shuffle(lines)
        out.append(
            {
                "code": "\n".join(lines),
                "label": 1,
                "language": rec["language"],
            }
        )
    return out


def save_jsonl(records: Sequence[LabeledRecord], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        for rec in records:
            fh.write(json.dumps(rec) + "\n")


def load_jsonl(path: Path) -> List[LabeledRecord]:
    records: List[LabeledRecord] = []
    with path.open("r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


def save_csv(records: Sequence[LabeledRecord], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=["code", "label", "language"])
        writer.writeheader()
        for rec in records:
            writer.writerow(rec)
