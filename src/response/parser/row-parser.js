'use strict';

'use strict';

const {map, filter, into, compose} = require('transducers.js');
// import rules from './rules';
const rules = require('./rules');
const is = require('is');
//const assert = require('assert');
// import models from '../../db';

const responseTransducer = {
  ['@@transducer/init']() {
    return Object.create(ruleTransducer);
  },
  ['@@transducer/result'](response) {
    return response;
  },
  ['@@transducer/step'](response, parsedRow) {

  }
};

function responseObject(base) {
  return Object.create(responseTransducer); 
}
function responseVars(keyPair) {
  const [iKey, iValue] = keyPair;
  const result = into({}, compose(
    map(([rule, regex]) => {
      //[rule, regex.exec(iKey)]),
      const match = regex.exec(ikey);
    }),
    filter(reg => !is.nil(reg[1])),
    map(kp => {
      let res = parseInt(kp[1][1]);
      if (Number.isNaN(res)) {
        res = kp[1][1];
      }
      return [kp[0], res];
    })
  ), rules);

  return [result, iValue];
  // return [{question: parseInt(res[1]), variable, option: opt, question_pipe: piped}, kp[1]];
};

const validate = parsedRow => {
  
};
