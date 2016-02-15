'use strict';
const { remove, compose } = require('transducers.js');
const axios               = require('axios');                            
const qs                  = require('qs');            
const md5                 = require('md5');           
const isInteger           = Number.isInteger;

const filters             = require('./filters');
function authConfig({username, password, token, secret }) {
  return username && password ?
    { 'user:md5': `${username}:${md5(password)}`} : { api_token: token, api_token_secret: secret };
}

const authSetter = authConfig => config =>
  ({...config, params: {...config.params, ...authConfig } });

const authInterceptor = compose(authSetter, authConfig);

class Client {

  constructor({baseURL = 'https://restapi.surveygizmo.com', version = 'v4', ...opts} = {}) {

    const http = axios.create({
      requestType: 'json',
      baseURL,
      paramSerializer: params => qs.stringify(params)
    });

    http.intercepters.request.use(authInterceptor(opts));

    Object.defineProperty(this, '_http', {
      configurable: true, writable: false, enumerable: false, value: http
    });
  }

  static create(opts = {}) {
    return new Client(opts);
  }

  static filters = filters;
 
  getSurveys(query={}) {

    return this._http({
      url: '/survey/',
      // params: {...remove(query, filter: query.filter},
      method: 'get'
    });
  }
  getSurvey(id, opts) {
    id = Number(id);
    if (!isInteger(id)) throw new TypeError('Must provide a numerical ID');
    // const q = {...query};
    // if (query && has(query, 'filter')) {
    //   q.filter = parseFilters('survey')(query.filter);
    // }
    return this._http({
      url: `/survey/${id}`,
      params: {...opts},
      method: 'get'
    });
  }
}
// const proto = {
//   getSurveys,
//   getSurvey
// };

module.exports = Client;

// TODO: fully document API
/**
 * [get surveys (paginated)]
 * @param  {object} opts Options, such a filter
 * @return {Promise}      Promise that resolves to survey data
 */
// function getSurveys(query={}) {

//   return this._http({
//     url: '/survey/',
//     params: {...remove(query, filter: query.filter},
//     method: 'get'
//   });
// }

// TODO: fully document API
/**
 * [get a single survey by ID]
 * @param  {number} id   Numerical ID for target survey
 * @param  {object} opts Options, such a filter
 * @return {Promise}      Promise that resolves to survey data
 */
// function getSurvey(id, opts) {
//   id = Number(id);
//   if (!isInteger(id)) throw new TypeError('Must provide a numerical ID');
//   const q = {...query};
//   if (query && has(query, 'filter')) {
//     q.filter = parseFilters('survey')(query.filter);
//   }
//   return this._http({
//     url: `/survey/${id}`,
//     params: {...opts},
//     method: 'get'
//   });
// }



// function authInterceptor(authConfig) {
//   if (username && password) {
//     return function attachCredentials(config) {
//       config.params = {
//         ...config.params,
//         'user:md5': `${username}:${md5(password)}`
//       }
//     };
//   }

  // if (has(auth, 'token')) {
  //   this._session = auth.token;
  // } else if (has(auth, 'username')  && has(auth, 'password')) { 
  //   this._session = {
  //     'user:md5': `${auth.username}:${md5(auth.password)}`
  //   };
  //   //{ username: auth.username, password: auth.password };
  // }
  // return this;
// }
