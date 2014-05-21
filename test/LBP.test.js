require('should');
var LBP = require('../lib/LBP');
var getPixels = require("get-pixels");

describe('LBP', function() {

    describe('#calculate()', function() {
        it('should get LBP and contrast for one pixel', function() {
        
            LBP.data = [
                [6,5,2,6],
                [7,6,1,7],
                [9,8,7,9],
                [6,5,2,6]
            ];
            var result = LBP.calculate(1,1);
            result.raw.should.eql(62);
            dec2BinString(result.lbp).should.eql('00011111'); // 0011 1110 (62) -> 0001 1111 (31)
            result.uniform.should.eql(true);
            result.n.should.eql(5);
            result.r.should.eql(1);
            
            var result = LBP.calculate(1,2);
            result.raw.should.eql(255);
            dec2BinString(result.lbp).should.eql('11111111'); // 1111 1111 (255) -> 1111 1111 (255)
            result.uniform.should.eql(true);
            result.n.should.eql(8);
            result.r.should.eql(0);

            var result = LBP.calculate(2,1);
            result.raw.should.eql(4);
            dec2BinString(result.lbp).should.eql('00000001'); // 0000 0100 (4) -> 0000 0001 (1)
            result.uniform.should.eql(true);
            result.n.should.eql(1);
            result.r.should.eql(2);

            var result = LBP.calculate(2,2);
            result.raw.should.eql(196);
            dec2BinString(result.lbp).should.eql('00010011'); // 1100 0100 (196) -> 0001 0011 (19)
            result.uniform.should.eql(false);
            (result.n === null).should.eql(true);
            (result.r === null).should.eql(true);
            
        });
    });
    
    describe('#distribution()', function() {
        it('should calculate lbp distribution for given array', function() {
            var data = [
                [6,5,2,6],
                [7,6,1,7],
                [9,8,7,9],
                [6,5,2,6]
            ];
            var result = LBP.distribution(data);
            result.lbp.should.eql([0,1,0,0,0,1,0,0,1,1]);
        });
        
        it('should get image data', function(done) {
            getImageData('./test/image.png', function(err, data) {
                if (err) return done(err);
                
                var result = LBP.distribution(data);
                result.lbp.should.eql([0,0,0,16,0,16,0,0,32,0]);
                
                done();
            });
        });
        
        it('should get image data', function(done) {
            getImageData('./test/image_2.jpg', function(err, data) {
                if (err) return done(err);
                
                var result = LBP.distribution(data);
                result.lbp.should.eql([ 43948, 4990, 4232, 7048, 15347, 9170, 6631, 8781, 8724, 21057 ])
                
                done();
            });
        });        
    });
  
    describe('#_isUniform()', function() {
        it('should check if pattern is uniform', function() {
           var result = LBP._isUniform(binString2Dec('00000001'));
           result.should.eql(true);
           
           var result = LBP._isUniform(binString2Dec('00000101'));
           result.should.eql(false);
        });
    });

    describe('#_rotationInvariantMapping()', function() {
        it('should return rotation invariant mapping', function() {
            
            var mapping = LBP._rotationInvariantMapping(binString2Dec('00001000'));
            dec2BinString(mapping.lbp).should.eql('00000001');
            
            var mapping = LBP._rotationInvariantMapping(binString2Dec('00000000'));
            dec2BinString(mapping.lbp).should.eql('00000000');
            
            var mapping = LBP._rotationInvariantMapping(binString2Dec('11111111'));
            dec2BinString(mapping.lbp).should.eql('11111111');
            
            var mapping = LBP._rotationInvariantMapping(binString2Dec('11111110'));
            dec2BinString(mapping.lbp).should.eql('01111111');
           
            var mapping = LBP._rotationInvariantMapping(binString2Dec('11111101'));
            dec2BinString(mapping.lbp).should.eql('01111111');
            
            var mapping = LBP._rotationInvariantMapping(binString2Dec('01100010'));
            dec2BinString(mapping.lbp).should.eql('00010011');
            
            var mapping = LBP._rotationInvariantMapping(binString2Dec('00010011'));
            dec2BinString(mapping.lbp).should.eql('00010011');
             
        });
    });

    describe('#_getPatternIndex()', function() {
        it('should get index of an uniform pattern', function() {
            var result = LBP._getPatternIndex(binString2Dec('00001111'));
            result.should.eql(4);
            
            var result = LBP._getPatternIndex(binString2Dec('00000000'));
            result.should.eql(0);
            
            var result = LBP._getPatternIndex(binString2Dec('11111111'));
            result.should.eql(8);
            
        });
    });
  
    describe('#_log2()', function() {
        it('should calculate log2', function() {
            var result = LBP._log2(16);
            result.should.eql(4);
        });
    });
 
});

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