
'use strict';
const {toArray, seq, filter, map, into, toObj, compose} = require('transducers.js');

//const Either = require('data.either');

const regexes = {
  variable: /variable\("?([a-zA-Z_0-9]+)"?\)/,
  question: /question\(([0-9]+)\)\s?,?\s?(?:,?\s?(.+)?\s?)/,
  option: /option\(([0-9]+)\)\s?,?\s?(?:(.+)\s?)?$/,
  question_pipe: /question_pipe\(([0-9]+)\)\s?,?\s?(?:(.+)\s?)?/
};

const setToJson = target => Object.defineProperty(target, 'toJSON', {
  value: function() { return toObj(this); }, configurable: true, writable: true
});
function Container() {
  this.$$question = new Map();
  this.$$variable = new Map();
  this.data = [];
  setToJson(this.$$question);
  setToJson(this.$$variable);
}

const container = Container.prototype = {
  '@@transducer/init': () => new Container(),
  '@@transducer/step': (col, obj) => {
    if (obj.question) {
      const bin = col.$$question.get(obj.question) || {};
      col.$$question.set(obj.question, {...obj, ...bin});
    } else if (obj.variable && obj.variable.match(/^\d+$/)) {
      if (Object.keys(obj).length <= 2 && !obj.value.length) {
        console.log('empty', obj, '| keys:', Object.keys(obj)); return col; 
      }
      const bin = col.$$question.get(obj.question) || {};
      col.$$variable.set(obj.variable, {...obj, ...bin});
    } else {
      col.data.push(obj.variable ? {[obj.variable]: obj.value} : obj); 
    }
    return col;
  },
  '@@transducer/result': col => col
};


const lexKey = regex => key => regex.exec(key);
const lexers = map(regexes, ([field, regex]) => [field, lexKey(regex)]);

const lex = key => into({}, compose(
  map(([field, lexer]) => [field, lexer(key) && lexer(key)[1] || null]),
  filter(xs => !!xs[1])
), lexers);


module.exports = parseRow;

function parseRow([key, value]) {
  return {value, ...lex(key)};
}


const response = require('../../samples/test-responses.json');

const output = map(response.data, r => into(new Container, map(parseRow), r));

const writeFile = require('@jaawerth/promisify')(require('fs').writeFile);

writeFile('./testout.json', JSON.stringify(output, null, 2));



