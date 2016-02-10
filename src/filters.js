'use strict';
const {toObj, map, mapcat} = require('transducers.js');
// const isArray = Array.isArray;

const filterFields = {
  survey: {
    modifiedon: ['lastModified', 'modifiedOn', 'modified', 'whenModified'],
    createdon: ['created', 'createdOn', 'whenCreated'], 
    title: ['title'],
    subtype: ['subType', 'subtype'],
    team: ['team'], 
    status: ['status']
  },
  campaign: {
    name: ['name'],
    _type: ['_type', 'type'],
    status: ['status'],
    ssl: ['ssl'],
    datecreated: ['createdOn', 'created'],
    datemodified: ['modified', 'modifiedOn', 'lastModified']
  },
  user: {
    status: ['status'], email: ['email', 'mail']
  }
};//buildEmpty({
  // survey: Object.assign(Object.create(null), {
  //   lastModified: 'modifiedon',
  //   createdOn: 'createdon',
  //   createdon: 'createdon',
  //   created: 'createdon',
  //   title: 'title',
  //   subType: 'subtype',
  //   subtype: 'subtype',
  //   team: 'team'
  // })
// });

const opsTable = {
  equal: '=',
  equals: '=',
  eq: '=',
  '=':'=',
  '>': '>',
  'gt':'>',
  'lt':'<',
  '<':'<',
  '<=': '<=',
  'lte': '<=',
  '>=': '>=',
  'gte': '>=',
  notEqual: '<>',
  neq: '<>',
  nil: 'IS NULL',
  isNull: 'IS NULL',
  notNil: 'IS NOT NULL',
  inList: 'in',
  in: 'in',
  IN: 'in',
  like: 'like',
  LIKE: 'like'
};

const opsCache = new Set();
const mkOperator = operator => {
  return opsCache.has(operator) ? opsCache.get(operator) : function filterOperator(field, value) {
    if (typeof field !== 'string') throw new TypeError('Field must be a string.');
    if (typeof value === 'undefined') throw new TypeError('Please provide a value');
    return {operator, field, value};
  };
};

const operators = map(opsTable, ([key, op]) => [key, mkOperator(op)]);
module.exports = {
  operators,
  fields: map(filterFields, ([objType, fields]) => [objType, toObj(fields, mapcat(function([field, keys]) {
    return keys.map(key => [key, field]);
  }))])
};

// const operators = toObj(new Set(Object.values(filterOperators)), map(function(op) {
//   return [op, operator(op)];
// }));

// const buildEmpty = object => Object.assign(Object.create(null), object);


// const parseFilters = type => filters => {
//   filters = isArray(filters) ? filters : [filters];
//   const parse = parseFilterObj(type);
//   return filters.reduce((col, xo) => {
//     const parsed = parse(xo);
//     for (const key of ['field', 'value', 'operator']) {
//       col[key].push(parsed[key]);
//     }
//     // col.field.push(xo.field);
//     // col.operator.push(xo.operator);
//     // col.value.push(xo.value);
//     return col;
//   }, {field: [], value: [], operator: []});
// };

// const parseFilterObj = type => ({field, operator, value}) => {
//   const fields = filterFields[type];
//   value = Array.isArray(value) ? value.join(',') : value;
//   const builtFilterObj = {
//     field: fields[field],
//     operator: filterOperators[operator],
//     value
//   };

//   if (typeof builtFilterObj.field === 'undefined') {
//     throw new Error(`filter.field is undefined; ${JSON.stringify(builtFilterObj)}`);
//   }
//   if (typeof builtFilterObj.operator === 'undefined') {
//     throw new Error(`filter.operator is undefined; ${JSON.stringify(builtFilterObj)}`);
//   }
//   if (typeof builtFilterObj.value === 'undefined') {
//     throw new Error(`filter.value is undefined; ${JSON.stringify(builtFilterObj)}`);
//   }
//   return builtFilterObj;
// };