'use strict';

const isArray = Array.isArray;

class Foo extends Map {
  constructor(iterable) {
    super(iterable);
  }
  static create(iterable) {
    new Foo(iterable); 
  }
  static fromObject(object) {
    return new Map(Object.entries(object));
  }
  ['@@transducers/init']() {
    return new Foo();
  }
  ['@@transducer/step'](col, [key, value]) {
    return col.set(key, value);  
  }
  ['@@transducer/result'](col) {
    return col; 
  }
}


module.exports = Foo;
