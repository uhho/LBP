var lbp = require('../lib/LBP')
    , getPixels = require("get-pixels");

/******************************************************************************/

getImageData('./pattern_2.png', function(err, data) {
    if (err) throw err;

    var result = lbp.distribution(data);
    console.log(result.lbp);
});

/******************************************************************************/
// helper function
function getImageData(src, cb) {
    getPixels(src, function(err, pixels) {
        if(err) return cb(new Error("Bad image path"));

        var size = pixels.shape.slice()
            , height = size[0]
            , width = size[1]
            , data = new Array(height);

        for (var i = 0; i < width; i++) {
            data[i] = new Array(height);
            for (var j = 0; j < height; j++) {
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