'use strict';
const is = require('is'), isString = is.isString, isUndefined = is.undef;
const { seq, filter } = require('transducers.js');

const CRED_KEYS = new Set(['username', 'password', 'token']);
const OPTIONS_FIELDS = [...CRED_KEYS];

const DEFAULTS = {
  baseHost: 'restapi.surveygizmo.com'
};

const VERSIONS = {
  'head': '/head',
  'v4': '/v4',
  'v3': '/v3',
  'v2': '/v2',
  'v1': '/v1'
};

class SGClient {
  constructor(options) {
    const credentials = filter(options, kp => CRED_KEYS.has(kp[0]) && isString(kp[1]));
    if (!isString(credentials.token) && (
      !isString(credentials.username) || !isString(credentials.password))) {
      throw new Error('Must provide token or username/password');
    }
    Object.assign(this, options, credentials);
  }

  set baseHost(host) {
    this.baseHost = host;
    this.baseUrl = `https://${host}/${VERSIONS[this.version]}`;
  }
  
  getSurveys() {

  }

  getSurvey(id) {

  }

  getQuestion(id) {

  }

  getTeam(id) {

  }
}