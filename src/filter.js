'use strict';

const operator = (operator, field, value) => {
  if (typeof value === 'number') value = value.toString();
  return { field, operator, value };
};

//const and = 
const operators = {
  like: operator.bind(null, 'LIKE'),
  eq: operator.bind(null, '='),
  neq: operator.bind(null, '<>'),
  gt: operator.bind(null, '>'),
  lt: operator.bind(null, '<'),
  gte: operator.bind(null, '>='),
  lte: operator.bind(null, '<='),
  in: operator.bind(null, 'IN'),
  operator: (op, field, value) => operator(op, field, value)
};

const filterReducer = (filters, { field, value, operator }) => {
  return new Filter({
    field: filters.field.concat(field),
    operator: filters.operator.concat(operator),
    value: filters.value.concat(value)
  });
};

class Filter {
  constructor(filter = { field: [], value: [], operator: [] }) {
    this.field = filter.field;
    this.value = filter.value;
    this.operator = filter.operator;
  }

  filter(...filterRules) {
    return filterRules.reduce(filterReducer, new Filter(this));
  }

  static from(filterRules = []) {
    return filterRules.reduce(filterReducer, new Filter());
  }

  static create = filter;
}

Object.entries(operators).forEach(([key, operator]) => {
  if (key === 'operator') {
    Filter.prototype[key] = function(op, field, value) {
      return this.filter([operator(op, field, value)]); 
    };
    Filter[key] = filter[key] = (op, field, value) => filter(operator(op, field, value));
  } else {
    Filter.prototype[key] = function(field, value) {
      return this.filter(operator(field, value)); 
    }; 
    Filter[key] = filter[key] = (field, value) => filter(operator(field, value));
  }
});

function filter(...filters) {
  return Filter.from(filters);
}



module.exports = { filter, Filter, operators };
