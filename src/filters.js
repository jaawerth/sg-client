'use strict';

const isArray = Array.isArray;

const filterFields = buildEmpty({
  survey: Object.assign(Object.create(null), {
    modifiedOn: 'modifiedon',
    modifiedon: 'modifiedon',
    lastModified: 'lastModified',
    lastmodified: 'lastmodified',
    createdOn: 'createdon',
    createdon: 'createdon',
    created: 'createdon',
    title: 'title',
    subType: 'subtype',
    subtype: 'subtype',
    team: 'team'
  })
});

const filterOperators = buildEmpty({
  equal: '=',
  equals: '=',
  eq: '=',
  '=':'=',
  '>': '>',
  'gt':'>',
  'lt':'<',
  '<':'<',
  notEqual: '<>',
  neq: '<>',
  nil: 'IS NULL',
  isNull: 'IS NULL',
  notNil: 'IS NOT NULL',
  inList: 'in',
  in: 'in',
  IN: 'in',
  like: 'like'
});

const buildEmpty = object => Object.assign(Object.create(null), object);


const parseFilters = type => filters => {
  filters = isArray(filters) ? filters : [filters];
  const parse = parseFilterObj(type);
  return filters.reduce((col, xo) => {
    const parsed = parse(xo);
    for (const key of ['field', 'value', 'operator']) {
      col[key].push(parsed[key]);
    }
    // col.field.push(xo.field);
    // col.operator.push(xo.operator);
    // col.value.push(xo.value);
    return col;
  }, {field: [], value: [], operator: []});
};

const parseFilterObj = type => ({field, operator, value}) => {
  const fields = filterFields[type];
  value = Array.isArray(value) ? value.join(',') : value;
  const builtFilterObj = {
    field: fields[field],
    operator: filterOperators[operator],
    value
  };

  if (typeof builtFilterObj.field === 'undefined') {
    throw new Error(`filter.field is undefined; ${JSON.stringify(builtFilterObj)}`);
  }
  if (typeof builtFilterObj.operator === 'undefined') {
    throw new Error(`filter.operator is undefined; ${JSON.stringify(builtFilterObj)}`);
  }
  if (typeof builtFilterObj.value === 'undefined') {
    throw new Error(`filter.value is undefined; ${JSON.stringify(builtFilterObj)}`);
  }
  return builtFilterObj;
};