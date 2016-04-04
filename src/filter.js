'use strict';
const {toObj, map, mapcat} = require('transducers.js');


const filter = filters => filters.reduce((fs, {field, value, operator}) => {
  fs.filter.field.push(field);
  fs.filter.operator.push(operator);
  fs.filter.value.push(value);
  return fs;
}, {filter: {field: [], value: [], operator: []}});


const f = (field, operator, value) => ({field, operator, value});

filter.f = f;

module.exports = f;