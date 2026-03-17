SHELL := /bin/sh

.PHONY: install dev lint test infra-plan

install:
	cd frontend && npm install
	cd services/auth && npm install
	cd services/reviews && npm install
	cd services/cars && pip install -r requirements.txt
	cd services/chatbot && pip install -r requirements.txt
	cd services/ml-price && pip install -r requirements.txt

dev:
	docker compose up --build

lint:
	@echo "Add project-specific lint commands here."

test:
	@echo "Add project-specific test commands here."

infra-plan:
	cd infra/terraform && terraform init && terraform plan

