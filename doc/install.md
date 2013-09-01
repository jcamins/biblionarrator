Installing Biblionarrator
=========================

Requirements
------------

Biblionarrator requires a server with the following:

* Node.js 0.8+
* npm (node package manager)
* grunt
* ElasticSearch 0.90.3
* Apache Cassandra 

*NOTE*: After step 1 you will need to run (in the biblionarrator root):

    npm install


If you are setting up a development environment, you will also need:

* git
* make
* lesscss

Installation procedure
----------------------

0) Install Java 6 or Java 7 from Oracle following the procedure appropriate to
   your operating system.

1) Install Node.js from http://nodejs.org/

   A PPA is available for Debian/Ubuntu, and Node.js is available for
   Fedora/CentOS/RHEL from the EPEL repository.

2) Install Cassandra by following the instructions at http://www.datastax.com/documentation/gettingstarted/index.html

3) Install ElasticSearch from http://www.elasticsearch.org/overview/#installation

4) Install redis from http://redis.io/
   
   On Debian/Ubuntu:

    sudo apt-get install redis-server

   Redis is available for Fedora/CentOS/RHEL from the EPEL repository.

5) Install grunt by running:

    sudo npm install -g grunt-cli

6) Download Biblionarrator. You can download a zip file from GitHub at
   https://github.com/biblionarrator/biblionarrator/archive/master.zip or
   clone the git repo:

    git clone git://github.com/biblionarrator/biblionarrator.git

    cd biblionarrator

7) Install Biblionarrator's dependencies using npm

    npm install

8) Configure Biblionarrator with grunt

    grunt

   The above command will run all the unit tests, check the code for violations,
   and generate API documentation. If you do not want to do those three things
   in addition to the regular build, you can use:

    grunt build

8) Copy the configuration files in config/ with the extension .dist
   for your local configuration, and customize them for your particular
   needs:

   cp config/auth.js.dist config/auth.js
   [etc.]

9) Start Biblionarrator
    
    node bin/start.js

10) Enjoy Biblionarrator
