module.exports = {
    indexes: {
        scopenote: {
            type: 'text',
        },
        preferred: {
            type: 'edge',
            unidirected: false
        },
        synonym: {
            type: 'inverseedge',
            edge: 'preferred'
        },
        broader: {
            type: 'edge',
            unidirected: false
        },
        narrower: {
            type: 'inverseedge',
            edge: 'broader'
        }
    }
};
