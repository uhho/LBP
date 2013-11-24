# Local Binary Patterns for JavaScript #
Pattern detection using Local Binary Patterns algorithm

http://en.wikipedia.org/wiki/Local_binary_patterns

## Examples ##

```js
LBP.data = [
    [6,5,2, ...],
    [7,6,1, ...],
    [9,8,7, ...],
    ...
];
LBP.P = 8;
LBP.R = 1;

// calculate one point
console.log(LBP.calculate(1,1));

// calculate whole LBP distribution
console.log(LBP.distribution());
```