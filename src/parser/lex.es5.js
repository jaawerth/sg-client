
'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('transducers.js');

var filter = _require.filter;
var map = _require.map;
var into = _require.into;
var compose = _require.compose;
//const Either = require('data.either');

var regexes = new _map2.default({
  variable: /variable\("?([a-zA-Z_0-9]+)"?\)/,
  question: /question\(([0-9]+)\)\s?,?\s?(?:,?\s?(.+)?\s?)/,
  option: /option\(([0-9]+)\)\s?,?\s?(?:(.+)\s?)?$/,
  question_pipe: /question_pipe\(([0-9]+)\)\s?,?\s?(?:(.+)\s?)?/
});

var lexKey = function lexKey(regex) {
  return function (key) {
    return regex.exec(key);
  };
};
var lexers = map(regexes, function (_ref) {
  var _ref2 = (0, _slicedToArray3.default)(_ref, 2);

  var field = _ref2[0];
  var regex = _ref2[1];
  return [field, lexKey(regex)];
});

var lex = function lex(key) {
  return into({}, compose(map(function (_ref3) {
    var _ref4 = (0, _slicedToArray3.default)(_ref3, 2);

    var field = _ref4[0];
    var lexer = _ref4[1];
    return [field, lexer(key)];
  }), filter(function (xs) {
    return !!xs[1];
  })), lexers);
};

module.exports = parseRow;

function parseRow(_ref5) {
  var _ref6 = (0, _slicedToArray3.default)(_ref5, 2);

  var key = _ref6[0];
  var value = _ref6[1];

  return (0, _extends3.default)({ value: value }, lex(key));
}

var response = require('../../samples/test-responses.json');

var output = map(response, parseRow);

console.log(output);
