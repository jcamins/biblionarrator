module.exports = {
    default: 'titan',

    titan: {
        'storage.backend': 'cassandra',
        'storage.hostname': '127.0.0.1',
        'storage.keyspace': 'biblionarrator'
    },

    orient: {
        path: 'local:/var/lib/orient/biblionarrator',
        username: 'biblionarrator',
        password: 'biblionarrator'
    },

    tinker: {
        path: '/var/lib/tinker/biblionarrator'
    },

    neo4j: {
        path: '/var/lib/neo4j/biblionarrator'
    }
};
