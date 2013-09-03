/**
 * @namespace
 * @alias bn-format-
 * @desc Metadata formats are implemented as separate npm modules in the
 * bn-format-* namespace. The format described here is used only for documentation
 * purposes.
 */
var FormatHandler;

/**
 * @static render
 * Renders a record into HTML for display. By convention all fields should have
 * the class [schema]_[field].
 * @param {object} recorddata Record data (not a Record model)
 * @returns {string} HTML rendered version of the record
 */
FormatHandler.render = function(recorddata) {
};

/**
 * @static snippet
 * Renders a snippet for use in the results display.
 * @param {object} recorddata Record data (not a Record model)
 * @returns {string} HTML rendered snippet
 */
FormatHandler.snippet = function (recorddata) {
};

/**
 * @static indexes
 * Generates the indexes for the specified record. Every format
 * should create at least a keyword index, possibly using the
 * recursive private stringify function shown below
 * @param {object} recorddata Record data (not a Record model)
 * @returns {object} Every key in this object is created as a
 * record-level index.
 *
 * @example
 *  function stringify (object) {
 *      var string = '';
 *      if (typeof object !== 'object') {
 *          return object;
 *      }
 *      for (var el in object) {
 *          string = string + ' ' + stringify(object[el]);
 *      }
 *      return string;
 *  }
 *
 *  module.exports.indexes = function (recorddata) {
 *      return { keyword: stringify(recorddata) };
 *  };
 */
FormatHandler.indexes = function (recorddata) {
};

/**
 * @static links
 * Generates a list of the vertex-centric out edges that should
 * exist on this record.
 * @param {object} recorddata Record data (not a Record model)
 * @returns {object} List of edges
 */
FormatHandler.links = function (recorddata) {
};

/**
 * @static decompile
 * Given the HTML from the interface, creates the canonical
 * representation for saving.
 * @param {object} htmldom DOM object
 * @returns {object} recorddata Record data (not a Record model)
 */
FormatHandler.decompile = function (htmldom) {
};

module.exports = FormatHandler;
