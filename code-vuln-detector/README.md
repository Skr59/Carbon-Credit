# Autonomous Code Vulnerability Detection System

> Fine-tuned **CodeBERT** fused with a multi-language **CWE rule engine** for
> explainable, multi-language vulnerability detection in source code.

A BTech (Computer Science) final-year project that combines *learned* and
*symbolic* security analysis into a single, explainable REST service and web UI.

---

## 1. Abstract

Modern software ships faster than manual security review can keep up. Automated
static analysers are precise but brittle (pattern-only), while large language
models are flexible but opaque. This project presents a **hybrid detection
architecture** that fine-tunes a transformer encoder (`microsoft/codebert-base`)
for vulnerability classification and **fuses** its probabilistic judgement with a
deterministic **multi-language static rule engine** mapped to the Common Weakness
Enumeration (CWE). The fusion yields three benefits:

1. **Higher recall** — the model catches semantic vulnerabilities the rules miss.
2. **Explainability** — the rule engine localises the issue to a line and a CWE,
   and provides remediation guidance.
3. **Language coverage** — C/C++, Python, Java and JavaScript are supported.

---

## 2. Key Features

| Feature | Description |
|---|---|
| **CodeBERT classifier** | Transformer encoder fine-tuned for binary vulnerability classification. |
| **Multi-language rule engine** | 25+ regex/AST-lite rules mapped to 15 CWEs across 5 languages. |
| **Explainable reports** | Natural-language summary + line-level findings + CWE remediation. |
| **Token attribution** | Gradient-based (integrated-gradients style) token importance for the transformer backend. |
| **Offline fallback** | A TF-IDF + Logistic Regression backend keeps the system fully functional without a GPU or network. |
| **REST API** | FastAPI service with single + batch endpoints and interactive OpenAPI docs. |
| **Demo UI** | Streamlit application with code samples and visual reports. |
| **Ablation benchmark** | Quantifies rules-only vs model-only vs hybrid performance. |

---

## 3. Architecture

```
                         ┌────────────────────────────┐
        source code ───► │      Preprocessing          │
                         │  normalise · language detect│
                         └──────────────┬─────────────┘
                                        │
                   ┌────────────────────┴────────────────────┐
                   ▼                                         ▼
        ┌──────────────────────┐                 ┌───────────────────────┐
        │  CodeBERT classifier │                 │  Static rule engine   │
        │  P(vulnerable)        │                 │  findings -> CWE      │
        └───────────┬──────────┘                 └───────────┬───────────┘
                    │                                        │
                    └───────────────┬────────────────────────┘
                                    ▼
                         ┌────────────────────────┐
                         │   Fusion / Explainer   │
                         │  risk · summary · CWE  │
                         └───────────┬────────────┘
                                     ▼
                    ┌────────────────────────────────┐
                    │  FastAPI  +  Streamlit UI        │
                    └────────────────────────────────┘
```

The **fusion policy** marks a snippet vulnerable if *either* the model
probability exceeds the threshold *or* a static rule fires (max-combination in
`scripts/benchmark.py`). This favours recall, which is the right default for a
security triage tool where missed vulnerabilities (false negatives) are costlier
than false alarms.

---

## 4. Project Structure

```
code-vuln-detector/
├── config/            # central configuration (dataclasses + env overrides)
│   └── config.py
├── data/              # dataset construction, language detection, preprocessing
│   ├── dataset.py     # built-in corpus + CodeXGLUE/Devign loader + splits
│   └── preprocess.py
├── models/
│   ├── codebert_classifier.py   # transformer wrapper: fit/predict/attribution
│   ├── heuristic.py             # offline TF-IDF fallback
│   ├── detector.py              # unified facade (model + rules + explanation)
│   └── train.py                 # fine-tuning CLI
├── explanation/
│   ├── cwe_db.py      # CWE knowledge base (name/severity/remediation)
│   ├── rules.py       # multi-language rule engine
│   └── explainer.py   # report builder
├── evaluation/
│   └── metrics.py     # accuracy/precision/recall/F1/ROC-AUC
├── api/
│   ├── main.py        # FastAPI app
│   └── schemas.py     # pydantic models
├── ui/
│   └── app.py         # Streamlit demo
├── scripts/
│   ├── download_data.py
│   ├── evaluate.py
│   └── benchmark.py   # rules vs model vs hybrid
├── notebooks/
│   └── demo.ipynb
├── tests/             # pytest suite (rules, explainer, metrics, api, detector)
├── requirements.txt
├── pyproject.toml
├── Makefile
└── README.md
```

---

## 5. Installation

Requires **Python 3.9+**.

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
```

> The system is fully functional **without a GPU**. The default detection
> backend is the offline heuristic model, which trains in seconds.

---

## 6. Quickstart

### 6.1 Analyse a snippet in Python

```python
from models import CodeVulnerabilityDetector

det = CodeVulnerabilityDetector()          # auto: transformer if present, else heuristic
report = det.analyse('import os\nos.system("ls " + x)\n', "python")
print(report.risk_level, report.summary)
for f in report.findings:
    print(f["cwe_id"], f["line"], f["message"])
```

### 6.2 Run the REST API

```bash
uvicorn api.main:app --reload
# Interactive docs: http://localhost:8000/docs
```

```bash
curl -X POST http://localhost:8000/api/v1/analyse \
  -H "Content-Type: application/json" \
  -d '{"code":"import os\nos.system(\"ls \" + x)","language":"python"}'
```

### 6.3 Launch the demo UI

```bash
streamlit run ui/app.py
```

---

## 7. Training

### 7.1 Offline heuristic backend (fast, CPU)

```bash
python -m models.train --backend heuristic --source builtin --augment
```

### 7.2 Fine-tune CodeBERT (GPU recommended)

```bash
# Self-contained corpus
python -m models.train --backend transformer --source builtin --epochs 4

# Real-world CodeXGLUE / Devign benchmark
python -m models.train --backend transformer --source hf --limit 8000 --epochs 4
```

The checkpoint is written to `artifacts/codebert-vuln` and is automatically
picked up by the detector on the next start.

---

## 8. Evaluation & Ablation

```bash
# Held-out metrics with threshold sweep
python scripts/evaluate.py --backend heuristic --source builtin

# rules-only vs model-only vs hybrid
python scripts/benchmark.py --backend heuristic --source builtin
```

Reports are written to `artifacts/eval_report.json` and `artifacts/benchmark.json`.

**Metrics reported:** accuracy, precision, recall, F1, ROC-AUC, confusion
matrix (TN/FP/FN/TP) and the F1-optimal threshold.

---

## 9. API Reference

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Service + backend status |
| GET | `/api/v1/backends` | Which backends are available |
| POST | `/api/v1/analyse` | Analyse one snippet |
| POST | `/api/v1/analyse/batch` | Analyse up to 64 snippets |
| GET | `/api/v1/cwe/{id}` | CWE metadata |
| GET | `/api/v1/cwe` | List all known CWEs |
| GET | `/api/v1/rules` | List static rules |

---

## 10. Methodology & Novelty

* **Hybrid neuro-symbolic detection.** The primary novelty is the tight fusion of
  a fine-tuned transformer with a maintainable CWE rule engine, producing
  *actionable* explanations rather than a bare label.
* **Explainable-by-construction.** Because findings are tied to concrete lines,
  the explanation does not depend on brittle post-hoc saliency alone.
* **Reproducible ablations.** The benchmark script isolates the contribution of
  each component, a common reviewer expectation.
* **Practical robustness.** Auto language detection, an offline backend and a
  batch API make the system deployable in CI pipelines.

---

## 11. Technology Stack

| Layer | Technology |
|---|---|
| Deep learning | PyTorch, HuggingFace Transformers (CodeBERT) |
| Classical ML | scikit-learn (TF-IDF + Logistic Regression) |
| Backend | FastAPI, Uvicorn, Pydantic |
| Frontend | Streamlit |
| Data | HuggingFace Datasets (CodeXGLUE / Devign) |
| Testing | pytest, HTTPX |

---

## 12. Testing

```bash
pytest tests -v
```

The suite covers the rule engine, explainer, preprocessing, metrics, the unified
detector and the REST API (using the fast offline backend).

---

## 13. Suggestions for the Project Report / Viva

* **Literature review:** CodeBERT (Feng et al., 2020), Devign (Zhou et al., 2019),
  GraphCodeBERT (Guo et al., 2021), LineVul (Fu & Tantithamthavorn, 2022).
* **Datasets:** CodeXGLUE Defect Detection (Devign), Big-Vul, D2A.
* **Figures to include:** architecture diagram, confusion matrices, ROC curves,
  ablation table, sample explainable report.
* **Baselines to compare:** rule-only, CodeBERT-only, hybrid (all provided).

---

## 14. Limitations & Future Work

* The built-in corpus is small; production use should fine-tune on CodeXGLUE /
  Big-Vul at scale.
* The rule engine is regex-based; migrating to AST/CFG queries (e.g. tree-sitter
  or Semgrep rules) would reduce false positives.
* Multi-class CWE classification (instead of binary) and interprocedural data-flow
  analysis are natural extensions.
* Adding a `grep`-style repository scanner and GitHub Action for CI integration.

---

## 15. References

1. Feng, Z., et al. *CodeBERT: A Pre-Trained Model for Programming and Natural
   Languages.* EMNLP 2020.
2. Zhou, Y., et al. *Devign: Effective Vulnerability Identification by Learning
   Comprehensive Program Semantics via Graph Neural Networks.* NeurIPS 2019.
3. Guo, D., et al. *GraphCodeBERT: Pre-training Code Representations with Data
   Flow.* ICLR 2021.
4. Fu, M., Tantithamthavorn, C. *LineVul: A Transformer-based Line-Level
   Vulnerability Prediction.* MSR 2022.
5. MITRE. *Common Weakness Enumeration (CWE).* https://cwe.mitre.org

---

## 16. License

Released for academic use as part of a BTech final-year submission. MIT License.
