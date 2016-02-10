'use strict';
const qs = require('qs');
const axios = require('axios').create({
  responseType: 'json',
  paramsSerializer: qs.stringify
});


module.exports = axios;