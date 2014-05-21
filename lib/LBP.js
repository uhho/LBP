/**
 * Local Binary Patterns
 * 
 * @author Lukasz Krawczyk <contact@lukaszkrawczyk.eu>
 * @license MIT
 */
 
/**
 * LBP class constructor
 *
 * @constructor
 * @param {Array.<number>} data
 * @param {number} P
 * @param {number} R
 * @param {boolean} rotationInvariantLBPs
 * @returns {LBP}
 * @access public
 */
function LBP(data, P, R, rotationInvariantLBPs) {
    /**
     * Number of sampling points
     * @type {number}
     */
    this.P = P || 8;
    /**
     * Radius
     * @type {number}
     */
    this.R = R || 1;
    /**
     * Input array
     * @type {Array.<number>}
     */
    this.data = data || [];
    /**
     * Enable rotation invariant LBPs
     * @type {boolean}
     */
    this.rotationInvariantLBPs = (rotationInvariantLBPs !== undefined) ? rotationInvariantLBPs : true;
    /**
     * Local memory for storing calculation results
     * @type {LBPMemory}
     */
    this.memory = new LBPMemory(Math.pow(2, this.P));
}

LBP.prototype = {

    /**
     * Calculate LBP, contrast and variance of a pixel
     * 
     * LBP maximum value depends on number of sampling points
     * 8 points = 1 + 2 + ... + 128 = 255
     * 4 points = 1 + 2 + ... + 16 = 31
     *
     * @param {number} xc
     * @param {number} yc
     * @return {Object}
     * @access public
     */
    calculate: function(xc, yc){
        var lbp = 0
            , biggerCnt = 0, smallerCnt = 0
            , biggerSum = 0, smallerSum = 0
            , varE = 0, varE2 = 0;

        for (var p = 0; p <= this.P - 1; p++) {
            var gp = this._neighbor(p, xc, yc)
                , bit = this._threshold(gp - this.data[xc][yc]);
            
            // counting LBP
            lbp += bit * Math.pow(2, p);
            
            // gathering data for calculating contrast and variance
            if (bit === 1) {
                biggerCnt++;
                biggerSum += gp;
            } else {
                smallerCnt++;
                smallerSum += gp;
            }
            
            varE += gp;
            varE2 += gp * gp;
        }

        varE /= this.P;
        varE2 /= this.P;

        if (this.memory.get(lbp) !== null)
            return this.memory.get(lbp);
        
        var mapping = (this.rotationInvariantLBPs)
            ? this._rotationInvariantMapping(lbp)
            : { raw: lbp, lbp: lbp, uniform: false, n: null, r: null };
        
        var biggerMean = (biggerCnt > 0) ? biggerSum / biggerCnt : 0
           , smallerMean = (smallerCnt > 0) ? smallerSum / smallerCnt : 0
           , stDev = Math.sqrt(varE2 - (varE * varE));
        
        var result = {
            raw: lbp,
            lbp: mapping.lbp,
            uniform: mapping.uniform,
            n: mapping.n,
            r: mapping.r,
            contrast: biggerMean - smallerMean,
            variance: stDev * stDev
        };
        
        this.memory.set(lbp, result);
        return result;
    },
    
    /**
     * Calculating LBP distribution
     * 
     * @param {Array} data
     * @return {Object}
     * @access public
     */
    distribution: function(data) {
        if (data !== undefined) this.data = data;
        
        this._check();
        var distribution = this._initDistribution()
            , contrastValues = []
            , varianceValues = [];

        for (var xc = this.R; xc < (this.data.length - 1); xc++) {
            for (var yc = this.R; yc < (this.data[xc].length - 1); yc++) {
                var result = this.calculate(xc, yc);
                
                if (this.rotationInvariantLBPs) {
                    if (result.uniform)
                        distribution[result.n]++;
                    else
                        distribution[this.P+1]++;
                } else {
                    distribution[result.lbp]++;
                }
                
                contrastValues.push(result.contrast);
                varianceValues.push(result.variance);
            }
        }
        
        return {
           lbp: distribution,
           contrast: contrastValues,
           variance: varianceValues
        };
    },

    /**
     * Thresholding (step) function
     * 
     * @param {number} z
     * @returns {number}
     * @access protected
     */
    _threshold : function(z) {
        return (z >= 0) ? 1 : 0;
    },
    
    /**
     * Return neighbor value
     * 
     * @param {number} p - neighbor index
     * @param {number} xc - central point x
     * @param {number} yc - central point y
     * @return {number}
     * @access protected
     */
    _neighbor : function(p, xc, yc) {
        var angle = 2 * Math.PI * p / this.P;
        return this.data
            [ Math.round(xc - this.R * Math.cos(angle)) ]
            [ Math.round(yc - this.R * Math.sin(angle)) ];
    },
    
    /**
     * Minimisation of LBP using circular bitwise right rotation
     * Used for rotation invariant LBP
     *
     * @example
     * ---------
     * 1010 0000
     * 0101 0000
     * ...
     * 0000 0101
     * ---------
     *
     * @todo find faster algorithm
     * @param {number} value
     * @return {Object}
     */
    _rotationInvariantMapping : function(value) {
        var fullBitMask = Math.pow(2, this.P) - 1
            , rotation = 0;
            
        // check if value is trivial
        if (value === 0)
            return { lbp: value, uniform: true, n: 0, r: rotation };
        if (value === fullBitMask)
            return { lbp: value, uniform: true, n: this.P, r: rotation };
           
        // check if value contain single bit
        var exp = Math.round(this._log2(value));
        if (Math.pow(2, exp) === value)
            return { lbp: 1, uniform: true, n: 1, r: exp };
        
        // bit rotation 1000 0001 (129) => 0000 0011 (3)
        var minValue = value;
        for (var i = 1; i <= this.P; i++) {
            var p = value << 1;
            value = (p & fullBitMask) + ((p & (fullBitMask + 1)) / (fullBitMask + 1));
            if (value < minValue) {
                minValue = value;
                rotation = this.P - i; // number of rotations to the right
            }
        }
        
        return (this._isUniform(minValue))
            ? { lbp: minValue, uniform: true, n: this._getPatternIndex(minValue), r: rotation }
            : { lbp: minValue, uniform: false, n: null, r: null };
    },

    /**
     * Check if given value is an uniform pattern
     *
     * @example
     * 00000011 = 3 OK
     * 00000101 = 5 X
     *
     * @param {number} value
     * @returns {boolean}
     * @access protected
     */
    _isUniform: function(value) {
        var pow = this._log2(value + 1);
        return pow === Math.round(pow);
    },

    
    /**
     * Get index of an uniform pattern
     *
     * @example
     * 00001111 -> 4
     * 
     * @param {number} value
     * @return {number}
     * @access protected
     */
    _getPatternIndex: function(value) {
        return this._log2(value + 1);
    },

    /**
     * Logarithm of 2
     *
     * @param {number}
     * @return {number}
     * @access public
     */
    _log2: function(num) {
        return Math.log(num) / Math.log(2);
    },

    /**
     * Prepare empty distribution array
     * 
     * @return {Array}
     * @access protected
     */
    _initDistribution: function() {
        var max = (this.rotationInvariantLBPs) ? this.P + 2 : Math.pow(2, this.P)
            , distribution = new Array(max);
        
        for (var i = 0; i < max; i++)
            distribution[i] = 0;
                
        return distribution;
    },
    
    /**
     * Parameter validation
     * 
     * @return {undefined}
     * @access protected
     */
    _check: function() {
        if (this.P > 8 * this.R) 
            throw new Error('Incorrect P and R values');
        
        if (typeof this.data[0] === 'undefined') 
            throw new Error('Data array must not be empty');
        
        if (this.data.length < 3 && this.data[0].length < 3) 
            throw new Error('Data array must be bigger than 3x3');
    }
};

/**
 * LBPMemory class
 * Loocal memory is used for storing calculation results
 *
 * @author Lukasz Krawczyk <contact@lukaszkrawczyk.eu>
 * @license MIT
 */

/**
 * Memory class constructor
 * @constructor
 */
function LBPMemory(size) {
    this.size = size;
    this.keys;
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
LBPMemory.prototype.set = function(key, value) {
    this.keys[key] = this.data.length;
    this.data.push(value);
};

/**
 * Get value associated with given key
 *
 * @param {number} key
 * @returns {number|boolean}
 * @access public
 */
LBPMemory.prototype.get = function(key) {
    return (this.keys[key] !== undefined && this.keys[key] !== null)
        ? this.data[this.keys[key]]
        : null;
};

/**
 * Clear memory
 *
 * @returns {undefined}
 * @access public
 */
LBPMemory.prototype.clear = function() {
    delete this.keys;
    delete this.data;
    
    this.keys = new Array(this.size);
    this.data = [];
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = new LBP();