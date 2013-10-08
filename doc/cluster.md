Clustering
==========

Biblionarrator is designed to support a clustered topology using Titan + Cassandra,
ElasticSearch, and MongoDB. These instructions will walk you through the configuration
of a Biblionarrator cluster with every node mirroring every service required for
Biblionarrator. The instructions are for a cluster of three nodes, but any odd number
of nodes can be used by adjusting the configuration. Except where indicated, each step
must be performed on each node, with IP addresses changed as appropriate.

Basic assumptions
-----------------

There are three nodes:

* bn1 - 192.168.0.201 
* bn2 - 192.168.0.202 
* bn3 - 192.168.0.203 

The host names must resolve on all the nodes, either using DNS or using entries in
the /etc/hosts file. This guide will use host names that have been added to /etc/hosts.

Before continuing, you will need to follow the Biblionarrator installation instructions
on each node (or you can install Biblionarrator on one node and clone it, changing the
host name and IP addresses).

Cassandra
---------

Once Cassandra has been installed, you will need to modify the following properties
in /etc/cassandra/cassandra.yaml:

    cluster_name: 'Biblionarrator cluster'
    seed_provider:
        - class_name: org.apache.cassandra.locator.SimpleSeedProvider
          parameters:
              - seeds: "192.168.0.201,192.168.0.202,192.168.0.203"
    listen_address: 192.168.0.201
    broadcast_address: 192.168.0.201
    rpc_address: 192.168.0.201

If Cassandra was previously started, you will need to remove the obsolete data files
before your new cluster will start:

    > sudo rm -R /var/lib/cassandra/*

Restart Cassandra into your new cluster:

    > sudo service cassandra restart

ElasticSearch
-------------

Once ElasticSearch has been installed, you will need to modify the following
properties in /etc/elasticsearch/elasticsearch.yml:

    cluster.name: bncluster
    index.number_of_replicates: 2
    network.host: 192.168.0.201

Restart ElasticSearch into your new cluster:

    > sudo service cassandra restart

MongoDB
-------

Once MongoDB has been installed, you will need to modify the following properties
in /etc/mongodb.conf:

    bind_ip=192.168.0.201
    replSet=bncluster

Restart MongoDB:

    > sudo service mongodb restart

After starting MongoDB on all your nodes, start up the mongo shell on one node
(only!):

    > mongo

Run the following commands in the shell:

    > rs.initiate();
    > rs.add('192.168.0.202');
    > rs.add('192.168.0.203');
    > rs.conf(); # Check that all three hosts are displayed

Biblionarrator
--------------

Modify the Biblionarrator config file (config/config.json if you are using the
default configuration) to have the following options set:

    "cacheconf": {
        "backend": "mongo",
        "hostname": "192.168.0.201"
    },
    "dataconf": {
        "backend": "mongo",
        "hostname": "192.168.0.201"
    },
    "sessionconf": {
        "backend": "mongo",
    },
    "graphconf": {
        "engine": "titan",
        "titan": {
            "storage.backend": "cassandra",
            "storage.hostname": "192.168.0.201",
            "storage.keyspace": "biblionarrator",
            "storage.replication-factor": "3",
            "storage.index.search.backend": "elasticsearch",
            "storage.index.search.client-only": true,
            "storage.index.search.hostname": "192.168.0.201",
            "storage.index.search.index-name": "biblionarrator"
        }
    }

Start Biblionarrator on each node:

    > bin/biblionarrator


Changing the number of nodes
----------------------------

In order to change the number of nodes, you simply need to:

1. Spin up the appropriate number of nodes.
2. Change index.number_of_replicates in /etc/elasticsearch/elasticsearch.yml
   to be equal to one less than the number of nodes.
3. Change the "storage.replication-factor" option in the Biblionarrator configuration
   files to be equal to the number of nodes.
4. Run rs.add() for each additional node.
5. Restart each service.
