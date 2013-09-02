Installing Biblionarrator
=========================

*NOTE*: If you are installing Biblionarrator for testing or development purposes
you may want to use Vagrant for the installation. In that case, see the section
at the end entitled [Vagrant installation]

Requirements
------------

Biblionarrator requires a server with the following:

* Node.js 0.8+
* npm (node package manager)
* grunt
* Redis

These instructions assume you will be using Titan with Apache Cassandra
and ElasticSearch 0.90+. However, depending on your desired configuration, you
may not need one or both of them.

If you are setting up a development environment, you will also need git.

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

9) Run the grunt-based installer and answer the questions based on your planned
   configuration

    grunt install

   Make any further changes your configuration requires to the configuration files
   in config/

10) Start Biblionarrator
    
    node bin/start.js

11) Enjoy Biblionarrator


Vagrant installation
====================

1) Install VirtualBox from https://www.virtualbox.org/

2) Follow the instructions on http://www.vagrantup.com/ to install Vagrant.

3) Configure the 64-bit Ubuntu Precise box for use with Vagrant:

    vagrant box add precise64 http://files.vagrantup.com/precise64.box

4) Download Biblionarrator. You can download a zip file from GitHub at
   https://github.com/biblionarrator/biblionarrator/archive/master.zip or
   clone the git repo:

    git clone git://github.com/biblionarrator/biblionarrator.git
    cd biblionarrator


5) Provision your Vagrant box:

    vagrant up

   When asked, choose your computer's primary network interface for bridging.

6) Connect to the configured machine:

    vagrant ssh

   Or:

    ssh vagrant@192.168.214.214

   The second option may be more stable, but requires you to enter a password
   (default: vagrant).

7) Run the grunt-based installer and answer the questions based on your planned
   configuration

    grunt install

   Make any further changes your configuration requires to the configuration files
   in config/

8) Start Biblionarrator
    
    node bin/start.js

9) Enjoy Biblionarrator

