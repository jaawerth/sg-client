'use strict';
const { toObj, mapcat, remove} = require('transducers.js');
const fetch                    = require('node-fetch');
const qs                       = require('qs');
const has                      = Reflect.has;
const md5                      = require('md5');
const isArray                  = require('is-array');

const buildEmpty = object => Object.assign(Object.create(null), object);
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
  value = isArray(value) ? value.join(',') : value;
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



function Client({baseURL = 'https://restapi.surveygizmo.com/v4', ...sessionInfo}) {
  this._baseURL = baseURL;
  this.setCredentials(sessionInfo);
}

const proto = {
  request(path, opts) {
    const queryObj = {
      ...opts.query,
      ...this._session
    };
    const query = has(opts, 'query') ? '?' + qs.stringify(queryObj) : '';
    // const filter = unesc(qs.stringify(opts.query.filter));

    const fetchOpts = remove(opts, kp => kp[0] === 'query');
    
    const url = `${this._baseURL}${path}${query}`;
    return fetch(url, fetchOpts).then(response => {
      if (response.status >= 400) {
        var {status, statusText, url, headers} = response;
        return Promise.reject({status, statusText, url, headers}); 
      }
      return response.json()
        .catch(error => Promise.reject({msg: 'Failed to parse JSON', url, error, status, statusText}));
    });
  },
  setCredentials,
  getSurveys,
  getSurvey
};


function getSurveys(query) {
  const q = {...query};
  if (query && has(query, 'filter')) {
    q.filter = parseFilters('survey')(query.filter);
  }
  return this.request('/survey', {query: {...remove(query, kp => kp[0] === 'filter'), ...q}});
}

function getSurvey(id, query) {
  const q = {};
  if (query && has(query, 'filter')) {
    q.filter = parseFilters('survey')(query.filter);
  }
  return this.request('/survey/${id}', {query: {...query, ...q}});
}

function setCredentials(auth) {
  if (has(auth, 'token')) {
    this._session = auth.token;
  } else if (has(auth, 'username')  && has(auth, 'password')) { 
    this._session = {
      'user:md5': `${auth.username}:${md5(auth.password)}`
    };
    //{ username: auth.username, password: auth.password };
  }
  return this;
}

Client.prototype = proto;

module.exports = Client;