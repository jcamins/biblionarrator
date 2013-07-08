PLTESTS = tests/*.pl
JSTESTS = tests/*.js

build: public/css/style.min.css public/css/style.css public/js/generated/formathandlers.js public/js/generated/templates.js
public/css/style.min.css: public/css/style.less
	lessc --yui-compress public/css/style.less > public/css/style.min.css
public/css/style.css: public/css/style.less
	lessc public/css/style.less > public/css/style.css
public/js/generated/formathandlers.js: clientjs/formathandlers.js
	node node_modules/browserify/bin/cmd.js clientjs/formathandlers.js > public/js/generated/formathandlers.js
public/js/generated/clients.js: clientjs/templates.js
	node node_modules/browserify/bin/cmd.js clientjs/templates.js > public/js/generated/templates.js

test:
	perl $(PLTESTS)
	mocha --timeout 5000 --reporter tap $(JSTESTS)

.PHONY: build test
