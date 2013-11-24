function grayscale(imageData, channel) {
    for (var i = 0; i < imageData.data.length; i+=4) {
        if (typeof channel === 'undefined') {
            var luma = Math.floor(
                imageData.data[i] * 0.3 +
                imageData.data[i+1] * 0.59 +
                imageData.data[i+2] * 0.11
            );
            imageData.data[i] = imageData.data[i+1] = imageData.data[i+2] = luma;
        } else {
            switch (channel) {
                case 'red' :
                    imageData.data[i+1] = imageData.data[i+2] = imageData.data[i];
                    break;
                case 'green' :
                    imageData.data[i] = imageData.data[i+2] = imageData.data[i+1];
                    break;
                case 'blue' :
                    imageData.data[i] = imageData.data[i+1] = imageData.data[i+2];
                    break;    
            }
        }
        imageData.data[i+3] = 255;
    }
    return imageData;
}

function getPixelValue(imageData, x, y) {
    var offset = x * 4 + y * 4 * imageData.width;
    return imageData.data[offset];
}

function getCanvasCoordinates(n, width) {
    var x = (n / 4) % width,
        y = (n / 4 - x ) / width;
    return { x : x, y : y }
}