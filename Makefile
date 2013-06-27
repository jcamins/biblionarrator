PLTESTS = tests/*.pl
JSTESTS = tests/*.js

build: public/css/style.min.css public/css/style.css
public/css/style.min.css: public/css/style.less
	lessc --yui-compress public/css/style.less > public/css/style.min.css
public/css/style.css: public/css/style.less
	lessc public/css/style.less > public/css/style.css

test:
	perl $(PLTESTS)
	mocha --timeout 5000 --reporter tap $(JSTESTS)

.PHONY: build test
