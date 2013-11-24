/**
 * Local Binary Pattern class
 * 
 * @author Lukasz Krawczyk <contact@lukaszkrawczyk.eu>
 * @license MIT
 */
var LBP = {
    /**
     * Number of sampling points
     * @type Number
     */
    P : 8,
    /**
     * @type Number
     */
    R : 1,
    /**
     * Input array
     * @type Array
     */
    data : [],
    
    /**
     * Calculate LBP and contrast value of a pixel
     * 
     * @param {int} xc
     * @param {int} yc
     * @return {object}
     * @access public
     */
    calculate : function(xc, yc){
        var lbp = 0,
            contrast = 0,
            positives = [],
            negatives = [];
        
        for (var p = 0; p <= this.P - 1; p++) {
            var gp = this._neighbor(p, xc, yc),
                gc = this.data[xc][yc],
                bit = this._threshold(gp - gc);
            
            // counting LBP
            lbp += bit * Math.pow(2, p);
            
            // gathering data for counting contrast
            if (bit === 1) positives.push(gp);
            else negatives.push(gp);
        }
        
        // counting contrast
        contrast = (lbp === 0 || lbp === 255)
            ? 0
            : (this._mean(positives) - this._mean(negatives));
        
        return {
            lbp : lbp,
            contrast : contrast
        };
    },
    
    /**
     * Calculating LBP distribution
     * 
     * @return {array}
     * @access public
     */
    distribution : function() {
        this.__check();
        var distribution = this.__initDistribution();
        
        for (var xc = this.R; xc < (this.data.length - 1); xc++) {
            for (var yc = this.R; yc < (this.data[xc].length - 1); yc++) {
                var result = this.calculate(xc, yc);
                distribution[result.lbp]++;
            }
        }
        
        return distribution;
    },
    
    /**
     * Thresholding (step) function
     * 
     * @param {int} z
     * @returns {int}
     * @access protected
     */
    _threshold : function(z) {
        return (z >= 0) ? 1 : 0;
    },
    
    /**
     * Return neighbor value
     * 
     * @param {int} p neighbor index
     * @param {int} xc central point x
     * @param {int} yc central point y
     * @return {int}
     * @access protected
     */
    _neighbor : function(p, xc, yc) {
        var angle = 2 * Math.PI * p / this.P,
            xp = Math.round(xc - this.R * Math.cos(angle)),
            yp = Math.round(yc - this.R * Math.sin(angle));
        return this.data[xp][yp];
    },
    
    /**
     * Count avg value on an array
     * 
     * @param {array} arr
     * @return {int}
     * @access protected
     */
    _mean : function(arr) {
        return arr.reduce(function(pv, cv) { return pv + cv; }, 0) / arr.length;
    },
    
    /**
     * Prepare empty distribution array
     * 
     * @return {void}
     * @access private
     */
    __initDistribution : function() {
        var distribution = [];
        for (var i = 0; i <= 255; i++)
            distribution[i] = 0;
        return distribution;
    },
    
    /**
     * Parameter validation
     * 
     * @return {void}
     * @access private
     */
    __check : function() {
        if (this.P > 8 * this.R) 
            throw new Error('Incorrect P and R values');
        
        if (typeof this.data[0] === 'undefined') 
            throw new Error('Data array must not be empty');
        
        if (this.data.length < 3 && this.data[0].length < 3) 
            throw new Error('Data array must be bigger than 3x3');
    }
};
