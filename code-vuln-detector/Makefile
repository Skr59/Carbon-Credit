.PHONY: help install install-dev test lint train train-transformer serve ui benchmark eval clean

help:
	@echo "Targets:"
	@echo "  install            install runtime deps"
	@echo "  install-dev        install dev + ui + xai extras"
	@echo "  test               run the test suite"
	@echo "  train              train the offline heuristic backend"
	@echo "  train-transformer  fine-tune CodeBERT (needs GPU / time)"
	@echo "  serve              start the FastAPI server"
	@echo "  ui                 launch the Streamlit demo"
	@echo "  benchmark          run the rules/model/hybrid comparison"
	@echo "  eval               evaluate the heuristic backend"
	@echo "  clean              remove caches and artifacts"

install:
	pip install -r requirements.txt

install-dev:
	pip install -e ".[dev,ui,xai]"

test:
	pytest tests -v

train:
	python -m models.train --backend heuristic --source builtin --augment

train-transformer:
	python -m models.train --backend transformer --source hf --limit 8000 --epochs 4

serve:
	uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

ui:
	streamlit run ui/app.py

benchmark:
	python scripts/benchmark.py --backend heuristic --source builtin

eval:
	python scripts/evaluate.py --backend heuristic --source builtin

clean:
	rm -rf artifacts/* datasets/processed/* .pytest_cache
	find . -type d -name __pycache__ -exec rm -rf {} +
