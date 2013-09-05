/**
 * @namespace
 * @alias importer
 * @desc Standardized API for Biblionarrator stream-based importers. Importer
 * scripts should handle all relevant events.
 */

/**
 * @constructor
 * @param options {object} Configuration options for the stream importer
 * Configuration options are mostly format-specific
 * @param options.files {array} files to be imported
 * @param options.collect {array} (XML-based importers) list of elements that should
 * be parsed into arrays rather than scalars
 * @param options.recordElement {string} (XML-based importers) record element
 *
 * @fires Importer#filestart
 *
 * @fires Importer#filefinish
 *
 * @fires Importer#commit
 *
 * @fires Importer#record
 *
 * @fires Importer#done
 */

var Importer = function (options) {
    /**
     * Fired when the stream has been initialized and a file is about to be processed
     *
     * @event Importer#filestart
     */
    this.emit('filestart');

    /**
     * Fired when a file has been processed
     *
     * @event Importer#filefinish
     */
    this.emit('filefinish');

    /**
     * Fired every thousand records or at the end of the file.
     *
     * @event Importer#commit
     * @param promise {promise} This promise must be resolved by a listener
     * after the transaction has been committed
     */
    this.emit('commit', promise);

    /**
     * Fired for every record read. Records are not guaranteed to be processed in series
     *
     * @event Importer#record
     * @param record {object} Object with the data for a single record
     */
    this.emit('record', record);

    /**
     * Fired when all files are finished
     *
     * @event Importer#done
     */
    this.emit('done');
};
