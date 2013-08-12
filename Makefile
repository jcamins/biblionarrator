PLTESTS = tests/*.pl
JSTESTS = tests/*.js
NODE = node
LESS = node_modules/less/bin/lessc
BROWSERIFY = node_modules/browserify/bin/cmd.js
UGLIFYJS = node_modules/uglify-js/bin/uglifyjs
MOCHA = mocha

build: public/css/style.min.css public/css/style.css public/js/generated/formathandlers.js public/js/generated/templates.js
public/css/style.min.css: public/css/style.less
	$(LESS) --yui-compress public/css/style.less > public/css/style.min.css
public/css/style.css: public/css/style.less
	$(LESS) public/css/style.less > public/css/style.css
public/js/generated/formathandlers.js: clientjs/formathandlers.js
	$(NODE) $(BROWSERIFY) clientjs/formathandlers.js | $(UGLIFYJS)  > public/js/generated/formathandlers.js
public/js/generated/templates.js: clientjs/templates.js
	$(NODE) $(BROWSERIFY) clientjs/templates.js | $(UGLIFYJS) > public/js/generated/templates.js

test: 
	perl $(PLTESTS)
	$(MOCHA) --timeout 5000 --reporter tap $(JSTESTS)

.PHONY: build test
