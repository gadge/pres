'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var components = require('@pres/components');
var program = require('@pres/program');
var terminfoParser = require('@pres/terminfo-parser');
var colors = require('@pres/util-colors');
var utilHelpers = require('@pres/util-helpers');
var unicode = require('@pres/util-unicode');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () {
            return e[k];
          }
        });
      }
    });
  }
  n['default'] = e;
  return Object.freeze(n);
}

var components__namespace = /*#__PURE__*/_interopNamespace(components);
var colors__namespace = /*#__PURE__*/_interopNamespace(colors);
var unicode__namespace = /*#__PURE__*/_interopNamespace(unicode);

class TerminalInterface {}
TerminalInterface.program = program.Program.build;
TerminalInterface.build = program.Program.build;
TerminalInterface.helpers = utilHelpers.helpers;
TerminalInterface.unicode = unicode__namespace;
TerminalInterface.colors = colors__namespace;
TerminalInterface.Tput = terminfoParser.Tput;
Object.assign(TerminalInterface, components__namespace); // Object.assign({}, TerminalInterface) |> Deco({ depth: 2, vert: 2 }) |> logger

exports.TerminalInterface = TerminalInterface;
