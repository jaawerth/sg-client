
'use strict';
const {filter, map, into, compose} = require('transducers.js');
//const Either = require('data.either');

const regexes = {
  variable: /variable\("?([a-zA-Z_0-9]+)"?\)/,
  question: /question\(([0-9]+)\)\s?,?\s?(?:,?\s?(.+)?\s?)/,
  option: /option\(([0-9]+)\)\s?,?\s?(?:(.+)\s?)?$/,
  question_pipe: /question_pipe\(([0-9]+)\)\s?,?\s?(?:(.+)\s?)?/
};

const lexKey = regex => key => regex.exec(key);
const lexers = map(regexes, ([field, regex]) => [field, lexKey(regex)]);

const lex = key => into({}, compose(
  map(([field, lexer]) => [field, lexer(key)]),
  filter(xs => !!xs[1])
), lexers);


module.exports = parseRow;

function parseRow([key, value]) {
  return {value, ...lex(key)};
}

const response = require('../../samples/test-responses.json').data;

const output = map(response, parseRow);

const writeFile = require('@jaawerth/promisify')(require('fs').writeFile);

writeFile('./testout.json', JSON.stringify(output, null, 2));



