'use strict';
const {remove} = require('transducers.js');
const fetch    = require('node-fetch');
const qs       = require('qs');
const unesc    = require('querystring').unescape;
const has      = Reflect.has;
const md5      = require('md5');

const filterFields = {
  survey: {
    modifiedOn: 'modifiedon',
    createdOn: 'createdon',
    title: 'title',
    subType: 'subtype',
    team: 'team'
  }
};

const filterOperators = {
  equal: '=',
  notEqual: '<>',
  nil: 'IS NULL',
  notNil: 'IS NOT NULL',
  inList: 'in'
};

const parseFilters = (type, filters) => {
  if (Array.isArray(filters)) {
    return filters.map(filterObj => parseFilterObj(type, filterObj));
  } else {
    return [parseFilterObj(type, filters)];
  }
};

const parseFilterObj = (type, {field, operator, value}) => {
  const fields = filterFields[type];
  if (!has(filterOperators, operator)) {
    throw new Error(`'Invalid operator: ${operator}`);
  }
  if (!has(fields, field)) {
    throw new Error(`Invalid field [${field}], must be one of ${JSON.stringify(Object.keys(fields))}`);
  }
  return {
    field: fields[field], operator: filterOperators[operator], value
  };
};



function Client({baseURL = 'https://restapi.surveygizmo.com/v4', ...sessionInfo}) {
  this._baseURL = baseURL;
  this.setCredentials(sessionInfo);
}

const proto = {
  request(path, opts) {
    const queryObj = {
      ...opts.query,
      // ...remove(opts.query, kp => kp[0] === 'filter'),
      ...this._session
    };
    const query = has(opts, 'query') ? '?' + qs.stringify(queryObj) : '';
    // const filter = unesc(qs.stringify(opts.query.filter));

    const fetchOpts = remove(opts, kp => kp[0] === 'query');
    
    const url = `${this._baseURL}${path}${query}`;
    // if (filter.length) url += `&filter=${filter}`;
    console.log('Url: ', url);
    return fetch(url, fetchOpts);
  },
  setCredentials,
  getSurveys,
  getSurvey
};


function getSurveys(query) {
  const q = {};
  if (query && has(query, 'filter')) {
    q.filter = parseFilters('survey', query.filter);
  }
  return this.request('/survey', {query: {...remove(query, kp => kp[0] === 'filter'), ...q}});
}

function getSurvey(id, query) {
  const q = {};
  if (query && has(query, 'filter')) {
    q.filter = parseFilters('survey', query.filter);
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