require('should');
var Memory = require('../lib/index').Memory;

describe('Memory', function() {

    describe('#set() / get()', function() {
        it('should set and get data', function() {
            var m = new Memory(3);
            m.set('a', 10);
            m.set('b', 20);
            m.set('b', 30);
            m.set('d', 40);
            
            m.get('a').should.eql(10);
            m.get('b').should.eql(30);
            m.get('d').should.eql(40);
        });
         
    });

});