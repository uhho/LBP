/**
 * Memory class
 * Loocal memory is used for storing calculation results
 *
 * @author Lukasz Krawczyk <contact@lukaszkrawczyk.eu>
 * @license MIT
 */

/**
 * Memory class constructor
 * @constructor
 */
function Memory(size) {
    this.size = size;
    this.data;
    this.clear();
}

/**
 * Set value
 *
 * @param {number} key
 * @param {number} value
 * @returns {undefined}
 * @access public
 */
Memory.prototype.set = function(key, value) {
    this.data[key] = value;
};

/**
 * Get value associated with given key
 *
 * @param {number} key
 * @returns {number|boolean}
 * @access public
 */
Memory.prototype.get = function(key) {
    return (this.data[key] !== undefined && this.data[key] !== null)
        ? this.data[key]
        : null;
};

/**
 * Clear memory
 *
 * @returns {undefined}
 * @access public
 */
Memory.prototype.clear = function() {
    delete this.data;
    this.data = new Array(this.size);
};

if (typeof module !== 'undefined')
    module.exports = Memory;