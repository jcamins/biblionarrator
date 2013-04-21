build: public/css/style.min.css public/css/style.css
public/css/style.min.css: public/css/style.less
	lessc --yui-compress public/css/style.less > public/css/style.min.css
public/css/style.css: public/css/style.less
	lessc public/css/style.less > public/css/style.css
