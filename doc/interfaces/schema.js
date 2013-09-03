/**
 * @namespace
 * @alias bn-schema-
 * @desc Schemas are implemented as separate npm modules in the bn-schema-*
 * namespace. The schema described here is used only for documentation purposes.
 */
var schema = {
    /**
     * @property indexes 
     * Lookup table of indexes that are provided by the specified schema.
     *
     * @property indexes[name].type
     * Type of index. Allowable values are 'edge', 'inverseedge',
     * 'property', 'text', and 'dbcallback'. Edge indexes are equivalent
     * to vertex-centric out-edges and inverseedge indexes are equivalent
     * to vertex-centric in-edges. Property indexes are used for exact
     * match searches and faceting. Text indexes use the fulltext capabilities
     * of the database backend, when available (if unavailable, text indexes
     * will fall back to a string comparison, but this is incredibly slow and
     * should be avoided at all costs). Dbcallback indexes are for indexes
     * that are handled in the search engine driver.
     *
     * @property indexes[name].datatype
     * Applicable only to property indexes (String is implied for text indexes).
     * The *Java* data type for the property.
     *
     * @property indexes[name].unique
     * Applicable to property indexes only (false is implied for text indexes).
     * If set to true, no two records can have the same value in this index.
     *
     * @property indexes[name].multivalue
     * Applicable to property indexes only (false is implied for text indexes).
     * If set to true, a record can have more than one value in this index.
     *
     * @property indexes[name].unidirected
     * Applicable to edge indexes only. If set to true, the indexed edge is
     * unidirectional and cannot be traversed in the reverse direction.
     */
    indexes: {
        name: {
            type: 'property',
            datatype: 'String',
            unique: true,
            multivalue: false,
            unidirected: true
        }
    }
};

module.exports = Schema;
