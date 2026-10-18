"""
Streamlit demo UI for the Autonomous Code Vulnerability Detection System.

Run with::

    streamlit run ui/app.py

The UI talks to the local detector directly (no API required) but can also be
pointed at a running API via the ``VULN_API_URL`` environment variable.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

# Allow running as a script: make the project root importable.
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import streamlit as st  # noqa: E402

from config import CONFIG  # noqa: E402
from data import detect_language  # noqa: E402
from models import get_detector  # noqa: E402

SEVERITY_COLORS = {
    "CRITICAL": "#b71c1c",
    "HIGH": "#e65100",
    "MEDIUM": "#f9a825",
    "LOW": "#2e7d32",
}

SAMPLES = {
    "Python - command injection": (
        "python",
        'import os\n\ndef run(user_input):\n    os.system("ls " + user_input)\n',
    ),
    "Python - SQL injection": (
        "python",
        "import sqlite3\n\ndef get(conn, name):\n"
        "    cur = conn.cursor()\n"
        '    cur.execute("SELECT * FROM users WHERE name = \'%s\'" % name)\n'
        "    return cur.fetchall()\n",
    ),
    "C - buffer overflow": (
        "c",
        "#include <string.h>\n\nvoid copy(char *dst, char *src) {\n"
        "    strcpy(dst, src);\n}\n",
    ),
    "Java - weak crypto": (
        "java",
        "import java.security.MessageDigest;\n\npublic class Hash {\n"
        "    public byte[] hash(String s) throws Exception {\n"
        '        return MessageDigest.getInstance("MD5").digest(s.getBytes());\n'
        "    }\n}\n",
    ),
    "JavaScript - XSS": (
        "javascript",
        "function show(userInput) {\n"
        '    document.getElementById("out").innerHTML = userInput;\n}\n',
    ),
    "Safe - parameterised query": (
        "python",
        "import sqlite3\n\ndef get(conn, name):\n"
        "    cur = conn.cursor()\n"
        '    cur.execute("SELECT * FROM users WHERE name = ?", (name,))\n'
        "    return cur.fetchall()\n",
    ),
}


def _render_report(report: dict) -> None:
    prob = report["probability"]
    vuln = report["is_vulnerable"]
    risk = report["risk_level"]
    color = SEVERITY_COLORS.get(risk, "#555")

    c1, c2, c3 = st.columns(3)
    c1.metric("Verdict", "VULNERABLE" if vuln else "SAFE")
    c2.metric("Probability", f"{prob * 100:.1f}%")
    c3.markdown(
        f"**Risk**<br><span style='color:{color};font-size:1.4rem;"
        f"font-weight:700'>{risk}</span>",
        unsafe_allow_html=True,
    )

    st.progress(min(max(prob, 0.0), 1.0))

    st.subheader("Explanation")
    st.info(report["summary"])

    if report["cwe_ids"]:
        st.markdown("**Detected CWEs:** " + ", ".join(f"`{c}`" for c in report["cwe_ids"]))

    findings = report.get("findings", [])
    if findings:
        st.subheader(f"Static findings ({len(findings)})")
        for f in findings:
            with st.expander(
                f"[{f['severity']}] {f['cwe_id']} - {f['cwe_name']} "
                f"(line {f['line']})"
            ):
                st.code(f["snippet"].strip() or "<line>", language=report["language"])
                st.markdown(f"**Issue:** {f['message']}")
                st.markdown(f"**Remediation:** {f['remediation']}")
                st.caption(f"Rule {f['rule_id']} | confidence {f['confidence']}")
    else:
        st.success("No static rule matched this snippet.")

    tokens = report.get("top_tokens", [])
    if tokens:
        st.subheader("Most influential tokens (gradient attribution)")
        st.bar_chart({t["token"]: t["score"] for t in tokens[:15]})


def main() -> None:
    st.set_page_config(
        page_title="Code Vulnerability Detector",
        page_icon="🛡️",
        layout="wide",
    )
    st.title("🛡️ Autonomous Code Vulnerability Detection")
    st.caption(
        "Fine-tuned CodeBERT fused with a multi-language CWE rule engine for "
        "explainable vulnerability detection."
    )

    detector = get_detector()
    st.sidebar.header("Configuration")
    st.sidebar.write(f"**Backend:** `{detector.backend}`")
    st.sidebar.write(f"**Model path:** `{CONFIG.api.model_path}`")

    language_options = ["auto", "python", "c", "cpp", "java", "javascript"]
    lang_choice = st.sidebar.selectbox("Language", language_options, index=0)
    threshold = st.sidebar.slider("Threshold", 0.05, 0.95, 0.5, 0.05)
    explain = st.sidebar.checkbox("Token attribution", value=True)

    st.sidebar.divider()
    sample_name = st.sidebar.selectbox("Load sample", ["<none>"] + list(SAMPLES.keys()))

    default_code = ""
    default_lang = "auto"
    if sample_name != "<none>":
        default_lang, default_code = SAMPLES[sample_name]

    code = st.text_area(
        "Source code",
        value=default_code,
        height=320,
        placeholder="Paste code here...",
    )

    col_a, col_b = st.columns([1, 1])
    analyse_clicked = col_a.button("🔍 Analyse", type="primary", use_container_width=True)
    clear_clicked = col_b.button("Clear", use_container_width=True)
    if clear_clicked:
        st.rerun()

    if analyse_clicked:
        if not code.strip():
            st.warning("Please provide some source code to analyse.")
            return
        language = None if lang_choice == "auto" else lang_choice
        detected = language or detect_language(code)
        st.write(f"Analyzing `{detected}` ({len(code.splitlines())} lines)...")
        with st.spinner("Running classifier + static analysis..."):
            report = detector.analyse(
                code=code,
                language=language,
                threshold=threshold,
                with_attribution=explain,
            ).to_dict()
        _render_report(report)


if __name__ == "__main__":
    main()
