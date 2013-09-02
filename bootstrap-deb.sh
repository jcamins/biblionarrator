#!/usr/bin/env bash

apt-get update
#sudo apt-get upgrade -y
apt-get install -y python-software-properties equivs
echo "deb http://debian.datastax.com/community stable main" > /etc/apt/sources.list.d/cassandra.sources.list
wget -q -O- http://debian.datastax.com/debian/repo_key | apt-key add -
add-apt-repository ppa:chris-lea/node.js
add-apt-repository ppa:webupd8team/java
apt-get update
echo oracle-java7-installer shared/accepted-oracle-license-v1-1 select true | /usr/bin/debconf-set-selections
cat >oracle-java-dummy.cfg <<DUMMY_CFG
Section: misc
Priority: optional
Standards-Version: 3.9.2

Package: oracle-java-dummy
Version: 0.1
Maintainer: Biblionarrator <biblionarrator@cpbibliography.com>
Depends: oracle-java7-installer,oracle-java7-set-default
Provides: java5-runtime-headless
Description: Dummy package for Java deps
 Makes Oracle Java provide java5-runtime-headless
DUMMY_CFG
equivs-build oracle-java-dummy.cfg
dpkg -i oracle-java-dummy*.deb
apt-get install -f -y
update-java-alternatives -s java-7-oracle
apt-get install -y redis-server nodejs maven make g++ git vim
wget -q https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-0.90.3.deb
dpkg -i elasticsearch-0.90.3.deb
apt-get install -f -y
RUNLEVEL=1 apt-get install -y dsc12
update-rc.d cassandra disable
echo 'manual' > /etc/init/cassandra.override
cassandra
npm install -g grunt-cli
npm install -g node-gyp
sudo su - vagrant -c "cp -R /vagrant /home/vagrant/biblionarrator && cd /home/vagrant/biblionarrator && rm -R node_modules && npm install && grunt build"
rm oracle-java* elasticsearch*.deb
rmdir tmp
echo 'Your VM has been configured. To connect run `vagrant ssh` or `ssh vagrant@192.168.214.214`.'
echo '*WARNING*: Cassandra will not automatically start if you reboot your VM. You must run `sudo cassandra` in order to start Cassandra'
echo 'A copy of Biblionarrator has been built in ~/biblionarrator.'
