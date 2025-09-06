IMAGE_NAME=gpxdivider
PORT=8080

.PHONY: build run

build:
	docker build -t $(IMAGE_NAME) .

run: build
	docker run --rm -p $(PORT):80 --name $(IMAGE_NAME)-container $(IMAGE_NAME)
