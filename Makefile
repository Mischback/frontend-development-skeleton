DEVELOPMENT_FLAG = dev

INTERMEDIATE_BUILD_DIR =./build
INTERMEDIATE_BUILD_CSS_DIR = $(INTERMEDIATE_BUILD_DIR)/css

# utility function to create required directories on the fly
create_dir = @mkdir -p $(@D)

.SILENT:


build: build/css

build/css: $(INTERMEDIATE_BUILD_CSS_DIR)/style.css

$(INTERMEDIATE_BUILD_CSS_DIR)/%.css: _src/sass/%.scss _src/sass/*
	$(create_dir)
ifeq ($(BUILD_MODE),$(DEVELOPMENT_FLAG))
	echo "building css (dev): $@"
else
	echo "building css (prod): $@"
endif
	touch $@

.PHONY: prod dev dev/serve

prod:
	GNUMAKEFLAGS=--no-print-directory $(MAKE) build

dev:
	BUILD_MODE=$(DEVELOPMENT_FLAG) GNUMAKEFLAGS=--no-print-directory $(MAKE) build

# Uses NodeJS to watch for file changes and triggers rebuilding
# "npm-watch" is actually a wrapper around "nodemon" and simplifies
# configuration.
# "npm-watch" is configured in "./package.json" and basically triggers
# "make dev", rebuilding whatever is required.
dev/serve:
	npm run watch build
