# Local Binary Patterns for JavaScript #
Pattern detection using Local Binary Patterns algorithm

http://en.wikipedia.org/wiki/Local_binary_patterns

## Examples ##

```js
// image data (two dimensional array of pixel values in gray scale)
var data = [
    [6,5,2, ...],
    [7,6,1, ...],
    [9,8,7, ...],
    ...
];
var lbp = new LBP(data, 8, 1); // 8 is number of sampling points, 1 is radius

// calculate LBP, contrast and variance for pixel at position [1,1]
console.log(lbp.calculate(1, 1));

// calculate LBP distribution, contrast and variance for whole image
console.log(lbp.distribution());
```
## Rotation invariant binary patterns

By default, library is using rotation independent binary patterns.
It means, all following patterns will be rotated to one uniform pattern:
```
1100 0000 -> 0000 0011
0000 1100 -> 0000 0011
1000 0001 -> 0000 0011
```

If you want to desable this behaviour, please set `LBP.rotationInvariantLBPs` to `false`.

## Rotation invariant histogram

TODO

## Memory

For better performance library uses local memory for storing calculation results.
If you want to use your own memory adapter, it should implement following interface:
```js
MyAdapter.prototype.set = function(key, value) {};
MyAdapter.prototype.get = function(key) {}; // returns null if key is not found

// assign custom memory adapter
LBP.memory = new MyAdapter();
```

## Known issues

* Does not support rotation invariant histogram (yet)
* Need more testing with patterns different from (8,1)
* Contrast and variance values should be quantized

If you'd like to contribute, open an issue ticket or send pull request.

## Test

```
mocha -R spec
```