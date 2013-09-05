/**
 * @namespace importers
 * @desc Standardized API for Biblionarrator stream-based importers. Importer
 * scripts should handle all relevant events.
 */

/**
 * @constructor
 * @param options {object} Configuration options for the stream importer
 * Configuration options are format-specific, except for a standard files
 * array which contains a list of the files to be imported.
 */

var Importer = function (options) {
    /**
     * @event filestart
     * Fired when the stream has been initialized and a file is about to be processed.
     */
     this.emit('filestart');

     /**
      * @event filefinish
      * Fired when a file has been processed.
      */
     this.emit('filefinish');

     /**
      * @event commit
      * @param promise
      * Fired every thousand records or at the end of the file. Once any
      * processing that must be done has been completed, you must call
      * promise.resolve(true)
      */
     var promise;
     this.emit('commit', promise);

     /**
      * @event record
      * @param data {object} Javascript object with the record's data.
      * Fired every time a record has been read from a file.
      */
      this.emit('record');
};
