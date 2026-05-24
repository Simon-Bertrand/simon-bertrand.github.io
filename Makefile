NPM ?= npm
CV_PORT ?= 4321
BLOG_PORT ?= 4322
HOST ?= 127.0.0.1

.PHONY: help dev dev-cv dev-blog build build-cv build-blog preview-cv preview-blog sync-blog clean

help:
	@printf '%s\n' \
		'Available targets:' \
		'  make dev        Serve dist/ and rebuild CV + blog when sources/notebooks change' \
		'  make dev-cv     Start Astro dev server for the unified project' \
		'  make dev-blog   Alias of make dev for the unified /blog/ output' \
		'  make build      Build CV to dist/ and blog to dist/blog/' \
		'  make build-cv   Build the unified Astro site without notebook sync' \
		'  make build-blog Sync notebooks and run the unified Astro build' \
		'  make sync-blog  Convert notebooks and rebuild the blog search index' \
		'  make clean      Remove generated build artifacts'

dev:
	HOST=$(HOST) PORT=$(CV_PORT) node scripts/dev-static-watch.mjs

dev-cv:
	$(NPM) run dev -- --host $(HOST) --port $(CV_PORT)

dev-blog:
	$(MAKE) dev

build:
	$(NPM) run build

build-cv:
	$(NPM) run build:cv

build-blog:
	$(NPM) run build:blog

preview-cv:
	$(NPM) run preview -- --host $(HOST) --port $(CV_PORT)

preview-blog:
	$(NPM) run preview -- --host $(HOST) --port $(BLOG_PORT)

sync-blog:
	$(NPM) run sync:blog

clean:
	rm -rf dist .astro
	rm -rf .tmp public/blog/generated/search-index.json public/blog/generated/notebooks
