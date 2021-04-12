'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var componentsCore = require('@pres/components-core');
var unicode = require('@pres/util-unicode');
var fs = require('fs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

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

var unicode__namespace = /*#__PURE__*/_interopNamespace(unicode);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

/**
 * helpers.js - helpers for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
/**
 * Helpers
 */

const helpers = {
  get Screen() {
    if (!helpers._screen) helpers._screen = componentsCore.Screen;
    return helpers._screen;
  },

  get Element() {
    if (!helpers._element) helpers._element = componentsCore.Element;
    return helpers._element;
  }

};

helpers.merge = function (a, b) {
  Object.keys(b).forEach(function (key) {
    a[key] = b[key];
  });
  return a;
};

helpers.asort = function (obj) {
  return obj.sort(function (a, b) {
    a = a.name.toLowerCase();
    b = b.name.toLowerCase();

    if (a[0] === '.' && b[0] === '.') {
      a = a[1];
      b = b[1];
    } else {
      a = a[0];
      b = b[0];
    }

    return a > b ? 1 : a < b ? -1 : 0;
  });
};

helpers.hsort = function (obj) {
  return obj.sort(function (a, b) {
    return b.index - a.index;
  });
};

helpers.findFile = function (start, target) {
  return function read(dir) {
    let files, file, stat, out;

    if (dir === '/dev' || dir === '/sys' || dir === '/proc' || dir === '/net') {
      return null;
    }

    try {
      files = fs__default['default'].readdirSync(dir);
    } catch (e) {
      files = [];
    }

    for (let i = 0; i < files.length; i++) {
      file = files[i];

      if (file === target) {
        return (dir === '/' ? '' : dir) + '/' + file;
      }

      try {
        stat = fs__default['default'].lstatSync((dir === '/' ? '' : dir) + '/' + file);
      } catch (e) {
        stat = null;
      }

      if (stat && stat.isDirectory() && !stat.isSymbolicLink()) {
        out = read((dir === '/' ? '' : dir) + '/' + file);
        if (out) return out;
      }
    }

    return null;
  }(start);
}; // Escape text for tag-enabled elements.


helpers.escape = function (text) {
  return text.replace(/[{}]/g, function (ch) {
    return ch === '{' ? '{open}' : '{close}';
  });
};

helpers.parseTags = function (text, screen) {
  return helpers.Element.prototype._parseTags.call({
    parseTags: true,
    screen: screen || helpers.Screen.global
  }, text);
};

helpers.generateTags = function (style, text) {
  let open = '',
      close = '';
  Object.keys(style || {}).forEach(function (key) {
    let val = style[key];

    if (typeof val === 'string') {
      val = val.replace(/^light(?!-)/, 'light-');
      val = val.replace(/^bright(?!-)/, 'bright-');
      open = '{' + val + '-' + key + '}' + open;
      close += '{/' + val + '-' + key + '}';
    } else {
      if (val === true) {
        open = '{' + key + '}' + open;
        close += '{/' + key + '}';
      }
    }
  });

  if (text != null) {
    return open + text + close;
  }

  return {
    open: open,
    close: close
  };
};

helpers.attrToBinary = function (style, element) {
  return helpers.Element.prototype.sattr.call(element || {}, style);
};

helpers.stripTags = function (text) {
  if (!text) return '';
  return text.replace(/{(\/?)([\w\-,;!#]*)}/g, '').replace(/\x1b\[[\d;]*m/g, '');
};

helpers.cleanTags = function (text) {
  return helpers.stripTags(text).trim();
};

helpers.dropUnicode = function (text) {
  if (!text) return '';
  return text.replace(unicode__namespace.chars.all, '??').replace(unicode__namespace.chars.combining, '').replace(unicode__namespace.chars.surrogate, '?');
};

exports.helpers = helpers;
