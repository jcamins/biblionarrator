#!/usr/bin/env bash

apt-get update
#sudo apt-get upgrade -y
apt-get install -y python-software-properties
echo "deb http://debian.datastax.com/community stable main" > /etc/apt/sources.list.d/cassandra.sources.list
wget -q -O- http://debian.datastax.com/debian/repo_key | apt-key add -
add-apt-repository ppa:chris-lea/node.js
apt-get update
apt-get install -y openjdk-6-jdk dsc12 redis-server nodejs maven make g++
update-alternatives --config java
echo 'JAVA_HOME="/usr/lib/jvm/java-6-openjdk-amd64"' >> /etc/environment
wget -q https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-0.90.3.deb
dpkg -i elasticsearch-0.90.3.deb
apt-get install -f -y
service cassandra start
npm install -g grunt-cli
npm install -g node-gyp
useradd -m -s /bin/bash biblionarrator
sudo su - biblionarrator -c "cp -R /vagrant /home/biblionarrator/biblionarrator && cd /home/biblionarrator && npm install && grunt"
