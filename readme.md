# Biblionarrator - a new type of cataloging system

## Installation

1. Unzip/clone the biblionarrator source code somewhere sensible
2. Choose a name for your environment. In this example, we are calling
the environment "joe"
3. Copy the example environment configuration:

    cp -R application/config/example application/config/joe

4. Generate an application key for your environment:

    sed -i "s/'key' => ''/'key' => '`pwgen -1 32`'/" application/config/joe/application.php

5. Create a MySQL database and database user for Biblionarrator
6. Record the MySQL credentials you just created in
application/config/joe/database.php
7. Run the laravel migration to initialize your database:

    php artisan migrate:install
    php artisan migrate

8. Decide on a domain name/URL (optional if you are going to be accessing
biblionarrator only via IP). In this example, we are going to use
"biblionarrator.joe" as our domain name
9. Copy paths.php.dist to paths.php and edit the environments stanza
to point the environment you chose to the URL that you will be using
to access biblionarrator (optional if you only plan on running one
instance of biblionarrator)
10. Install the web server configuration files:

For nginx:

    sudo cp conf/biblionarrator-nginx.conf.sample /etc/nginx/sites-available/biblionarrator.conf
    sudo vim /etc/nginx/sites-available/biblionarrator.conf # Adjust server name to match your domain
    sudo ln -s /etc/nginx/sites-available/biblionarrator.conf /etc/nginx/sites-enabled/
    sudo service nginx restart

For Apache2:

    sudo cp conf/biblionarrator-apache2.conf.sample /etc/apache2/sites-available/biblionarrator.conf
    sudo ln -s /etc/apache2/sites-available/biblionarrator.conf /etc/apache2/sites-enabled/
    sudo vim /etc/apache2/sites-available/biblionarrator.conf # Adjust server name to match your domain
    sudo apache2ctl restart

11. Navigate to your biblionarrator URL, and login using username: admin@domain.com and password "admin"
12. Change password and login, and enjoy Biblionarrator.

## License

Biblionarrator is open source software licensed under the GNU Affero General version 3.0 or any later version.

Biblionarrator incorporates code from the following projects:
* emogrifier - http://www.pelagodesign.com/sidecar/emogrifier/ - distributed under the MIT license
* Laravel - http://laravel.com/ - distributed under the MIT license
* Bootstrap - http://twitter.github.com/bootstrap/ - distributed under the Apache License v2.0
* html5shiv - https://code.google.com/p/html5shiv/ - distributed under the MIT license
* jQuery - http://jquery.com/ - distributed under the MIT license
* jsTree - http://www.jstree.com/ - distributed under the MIT license
* DataTables - http://datatables.net/ - distributed under the BSD license
* Rangy - https://code.google.com/p/rangy/ - distributed under the MIT license
