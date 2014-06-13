require('should');
var LBP = require('../lib/index').LBP
    , getPixels = require("get-pixels");

describe('LBP', function() {

    describe('#distribution() - rotation invariant patterns', function() {
        var lbp = new LBP();
        lbp.featureNormalization = false;
        lbp.rotationInvariant = 'pattern';

        it('should calculate lbp distribution for given array', function() {
            var data = [
                [6,5,2,6],
                [7,6,1,7],
                [9,8,7,9],
                [6,5,2,6]
            ];
            var result = lbp.distribution(data);
            result.feature.should.eql([0,1,0,0,0,1,0,0,1,1]);
        });

        it('should get image data', function(done) {
            getImageData('./test/image.png', function(err, data) {
                if (err) return done(err);
                var result = lbp.distribution(data);
                result.feature.should.eql([0,0,0,16,0,16,0,0,32,0]);
                done();
            });
        });

        it('should get image data', function(done) {
            getImageData('./test/image_2.jpg', function(err, data) {
                if (err) return done(err);
                var result = lbp.distribution(data);
                result.feature.should.eql([ 43948, 4990, 4232, 7048, 15347, 9170, 6631, 8781, 8724, 21057 ]);
                done();
            });
        });
    });

    describe('#distribution() - rotation invariant feature', function() {
        var lbp = new LBP();
        lbp.rotationInvariant = 'histogram';

        it('should compute similar feature for different images containing same pattern', function(done) {
            // load first image
            getImageData('./test/pattern_1.png', function(err, data) {
                if (err) return done(err);
                // count LBP
                var result = lbp.distribution(data);
                var feature1 = simplifyFeature(result.feature);

                // load second image
                getImageData('./test/pattern_2.png', function(err, data) {
                    if (err) return done(err);
                    // count LBP
                    var result = lbp.distribution(data);
                    var feature2 = simplifyFeature(result.feature);

                    feature2[0].should.be.approximately(feature1[0], 20);
                    feature2[1].should.be.approximately(feature1[1], 10);
                    feature2[2].should.be.approximately(feature1[2], 5);
                    done();
                });
            });
        });
    });

    describe('#calculate()', function() {
        it('should get LBP and contrast for one pixel', function() {
            var lbp = new LBP();
            
            lbp.data = [
                [6,5,2,6],
                [7,6,1,7],
                [9,8,7,9],
                [6,5,2,6]
            ];
            var result = lbp.calculate(1,1);
            result.raw.should.eql(62);
            dec2BinString(result.lbp).should.eql('00011111'); // 0011 1110 (62) -> 0001 1111 (31)
            result.uniform.should.eql(true);
            result.n.should.eql(5);
            result.r.should.eql(1);
            
            var result = lbp.calculate(1,2);
            result.raw.should.eql(255);
            dec2BinString(result.lbp).should.eql('11111111'); // 1111 1111 (255) -> 1111 1111 (255)
            result.uniform.should.eql(true);
            result.n.should.eql(8);
            result.r.should.eql(0);

            var result = lbp.calculate(2,1);
            result.raw.should.eql(4);
            dec2BinString(result.lbp).should.eql('00000001'); // 0000 0100 (4) -> 0000 0001 (1)
            result.uniform.should.eql(true);
            result.n.should.eql(1);
            result.r.should.eql(2);

            var result = lbp.calculate(2,2);
            result.raw.should.eql(196);
            dec2BinString(result.lbp).should.eql('00010011'); // 1100 0100 (196) -> 0001 0011 (19)
            result.uniform.should.eql(false);
            (result.n === null).should.eql(true);
            (result.r === null).should.eql(true);
            
        });
    });
  
    describe('#_isUniform()', function() {
        it('should check if pattern is uniform', function() {
           var lbp = new LBP();
            
           var result = lbp._isUniform(binString2Dec('00000001'));
           result.should.eql(true);
           
           var result = lbp._isUniform(binString2Dec('00000101'));
           result.should.eql(false);
        });
    });

    describe('#_rotationInvariantMapping()', function() {
        it('should return rotation invariant mapping', function() {
            var lbp = new LBP();
            
            var mapping = lbp._rotationInvariantMapping(binString2Dec('00001000'));
            dec2BinString(mapping.lbp).should.eql('00000001');
            
            var mapping = lbp._rotationInvariantMapping(binString2Dec('00000000'));
            dec2BinString(mapping.lbp).should.eql('00000000');
            
            var mapping = lbp._rotationInvariantMapping(binString2Dec('11111111'));
            dec2BinString(mapping.lbp).should.eql('11111111');
            
            var mapping = lbp._rotationInvariantMapping(binString2Dec('11111110'));
            dec2BinString(mapping.lbp).should.eql('01111111');
           
            var mapping = lbp._rotationInvariantMapping(binString2Dec('11111101'));
            dec2BinString(mapping.lbp).should.eql('01111111');
            
            var mapping = lbp._rotationInvariantMapping(binString2Dec('01100010'));
            dec2BinString(mapping.lbp).should.eql('00010011');
            
            var mapping = lbp._rotationInvariantMapping(binString2Dec('00010011'));
            dec2BinString(mapping.lbp).should.eql('00010011');
             
        });
    });

    describe('#_getPatternIndex()', function() {
        it('should get index of an uniform pattern', function() {
            var lbp = new LBP();
            
            var result = lbp._getPatternIndex(binString2Dec('00001111'));
            result.should.eql(4);
            
            var result = lbp._getPatternIndex(binString2Dec('00000000'));
            result.should.eql(0);
            
            var result = lbp._getPatternIndex(binString2Dec('11111111'));
            result.should.eql(8);
            
        });
    });
  
    describe('#_log2()', function() {
        it('should calculate log2', function() {
            var lbp = new LBP();
            
            var result = lbp._log2(16);
            result.should.eql(4);
        });
    });
    
    describe('#_initDistribution()', function() {
        it('should init distribution', function() {
            var lbp = new LBP();
            
            lbp.rotationInvariant = false;
            var result = lbp._initDistribution();
            result.should.have.length(256);
            result[0].should.eql(0);
        });
        
        it('should init distribution for rotation invariant pattern', function() {
            var lbp = new LBP();
            
            lbp.rotationInvariant = 'pattern';
            var result = lbp._initDistribution();
            result.should.have.length(10);
            result[1].should.eql([0,0,0,0,0,0,0,0]);
        });
    });

});

/**
 * Simplify feature vector for testing purposes
 * 
 * @param {Array} feature
 * @returns {Array}
 */
function simplifyFeature(feature) {
    return [
        Math.round(feature[0] * 1000),
        Math.round(feature[5] * 1000),
        Math.round(feature[8] * 1000)
    ];
};

/**
 * Get image data and convert to grayscale
 * 
 * @param {string} src
 * @param {function} cb
 * @returns {undefined}
 */
function getImageData(src, cb) {
    getPixels(src, function(err, pixels) {
        if(err) return cb(new Error("Bad image path"));

        var size = pixels.shape.slice()
            , h = size[0]
            , w = size[1]
            , data = new Array(h);
            
        for (var i = 0; i < w; i++) {
            data[i] = new Array(h);
            for (var j = 0; j < h; j++) {
                // change to grayscale
                var luma = Math.floor(
                    pixels.get(i, j, 0) * 0.3 + pixels.get(i, j, 1) * 0.59 + pixels.get(i, j, 2) * 0.11
                );
                data[i][j] = luma;
            }
        }
        
        cb(null, data);
    });
}

/**
 * Decimal (number) to binary (string) conversion
 *
 * @param {number} d
 * @return {string}
 * @access protected
 */
function dec2BinString(d) {
    var b = '';

    for (var i = 0; i < 8; i++) {
        b = (d % 2) + b;
        d = Math.floor(d / 2);
    }

    return b;
}

/**
 * Binary (string) to decimal (number) conversion
 * 
 * @param {string} str
 * @return {number}
 * @access protected
 */
function binString2Dec(str) {
    return parseInt(str, 2);
}