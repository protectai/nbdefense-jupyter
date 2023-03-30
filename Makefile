install-dev: clean
	pip install -e .[dev]
	python -m spacy download en_core_web_trf
	pre-commit install
	jlpm install
	jlpm build
	jupyter labextension develop . --overwrite
	jupyter server extension enable nbdefense_jupyter

install: clean
	pip install .[test]

build-prod:
	pip install build
	python -m build

clean:
	pip uninstall nbdefense_jupyter -y
