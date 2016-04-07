'use strict';
const {toObj, map, mapcat} = require('transducers.js');


const filter = filters => filters.reduce((fs, {field, value, operator}) => {
  fs.filter.field.push(field);
  fs.filter.operator.push(operator);
  fs.filter.value.push(value);
  return fs;
}, {filter: {field: [], value: [], operator: []}});


const f = (field, operator, value) => ({field, operator, value});

filter.f = filter.filter = f;


const filters = {
  like: (field, value) => f(field, 'LIKE', value),
  eq: (field, value) => f(field, '=', value),
  neq: (field, value) => f(field, '<>', value),
  gt: (field, value) => f(field, '>', value),
  lt: (field, value) => f(field, '<', value),
  gte: (field, value) => f(field, '>=', value),
  lte: (field, value) => f(field, '<=', value),
  in: (field, value) => f(field, 'IN', value)
};
module.exports = f;
