PLTESTS = tests/*.pl
JSTESTS = tests/*.js
NODE = node
LESS = lessc
MOCHA = mocha

build: public/css/style.min.css public/css/style.css public/js/generated/formathandlers.js public/js/generated/templates.js
public/css/style.min.css: public/css/style.less
	$(LESS) --yui-compress public/css/style.less > public/css/style.min.css
public/css/style.css: public/css/style.less
	$(LESS) public/css/style.less > public/css/style.css
public/js/generated/formathandlers.js: clientjs/formathandlers.js
	$(NODE) node_modules/browserify/bin/cmd.js clientjs/formathandlers.js > public/js/generated/formathandlers.js
public/js/generated/clients.js: clientjs/templates.js
	$(NODE) node_modules/browserify/bin/cmd.js clientjs/templates.js > public/js/generated/templates.js

test:
	perl $(PLTESTS)
	$(MOCHA) --timeout 5000 --reporter tap $(JSTESTS)

.PHONY: build test
