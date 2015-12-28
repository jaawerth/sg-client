'use strict';
const is = require('is'), isString = is.isString;
const { seq, filter } = require('transducers.js');
class Client {
  constructor(options) {
    const CRED_KEYS = new Set(['username', 'password', 'token']);
    const credentials = filter(options, kp => CRED_KEYS.has(kp[0]) && isString(kp[1]));
    if (Object.keys(credentials).)
    const opts = filter(options, kp => !CRED_KEYS.has(kp[0]));

  }
}