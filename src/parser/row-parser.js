'use strict';
const {map, filter, into, compose} = require('transducers.js');
const rules = require('./rules');
const is = require('is');



const responseTransducer = {
  ['@@transducer/init']() {
    
  },
  ['@@transducer/result'](response) {
    return response;
  },
  ['@@transducer/step'](response, parsedRow) {

  }
};
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
