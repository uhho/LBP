# Local Binary Patterns for JavaScript #
Pattern detection using Local Binary Patterns algorithm

http://en.wikipedia.org/wiki/Local_binary_patterns

## Installation ##

```
npm install lbp
```

or

Put the library in your JavaScript root directory and add following script tags:
```html
// (fft.js is necessary only if you want to use rotation invariant features)
<script src="{js directory}/lbp/lib/fft.js"></script>
<script src="{js directory}/lbp/lib/lbp.js"></script>
<script>
    var lbp = new LBP();
    ...
</script>
```

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
## Rotation invariance

Library is providing two methods for computing rotation invariat features:
- Rotation invariant uniform binary patterns
- Rotation invariant features based on histogram transformation

By default, library is using rotation invariant binary patterns.
It means, all following patterns will be rotated to one uniform pattern:
```
LBP pattern -> Uniform Pattern
1100 0000 -> 0000 0011
0000 1100 -> 0000 0011
1000 0001 -> 0000 0011
```

Computed feature will have the following form: `F = [h(U(0)), h(U(1), ..., h(U(P), h(non-uniform))`
where `h` is an occurrence counter, `U` is Uniform Pattern of index `n`, `P` is a number of sampling points.
Additionally, feature will contain information about number of non-uniform patterns.
Dimension of this feature is `P+1`.

Second method is rotation invariance based on histogram transformation.
In this method, histogram of all possible pattern rotations is transformed using Fast Fourier Transform.
Computed feature will have the following form:
```
F = [|H(1, 0)|, |H(1, 1)|, ... |H(1, P/2)|,
     ...
     |H(P-1, 0)|, |H(P-1, 1)|, ... |H(P-1, P/2)|,
     h(U(0,0)), h(U(P,0)), h(non-uniform)]
```

Feature contains Fourier magnitude spectrum and three histogram values - all zeros, all ones and non-uniform patterns.
Dimension of the feature vector is `((P-1) * (floor(P/2) + 1)) + 3`.

If you want to disable rotation invariant LBPs, please set `LBP.rotationInvariant` to `false`.

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

* Need more testing with patterns with more sampling points or bigger radius
* Quantization of contrast and variance values

If you want to contribute, please open an issue ticket or send a pull request.

## Test

```
mocha -R spec
```