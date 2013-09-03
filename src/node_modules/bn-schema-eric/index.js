module.exports = {
    indexes: {
        creator: {
            type: 'edge',
            unidirected: false
        },
        wrote: {
            type: 'inverseedge',
            edge: 'creator'
        },
        title: {
            type: 'text'
        },
        source: {
            type: 'text'
        },
        citation: {
            type: 'text'
        },
        description: {
            type: 'text'
        },
        publisher: {
            type: 'text'
        },
        uri: {
            type: 'property',
            unique: false,
            multivalue: true
        }
    }
};

