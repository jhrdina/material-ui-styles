"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = createGenerateClassName;

var _warning = _interopRequireDefault(require("warning"));

var _hash = _interopRequireDefault(require("@emotion/hash"));

var escapeRegex = /([[\].#*$><+~=|^:(),"'`\s])/g;

function safePrefix(classNamePrefix) {
  var prefix = String(classNamePrefix);
  process.env.NODE_ENV !== "production" ? (0, _warning["default"])(prefix.length < 256, "Material-UI: the class name prefix is too long: ".concat(prefix, ".")) : void 0; // Sanitize the string as will be used to prefix the generated class name.

  return prefix.replace(escapeRegex, '-');
}

var themeHashCache = {}; // Returns a function which generates unique class names based on counters.
// When new generator function is created, rule counter is reset.
// We need to reset the rule counter for SSR for each request.
//
// It's inspired by
// https://github.com/cssinjs/jss/blob/4e6a05dd3f7b6572fdd3ab216861d9e446c20331/src/utils/createGenerateClassName.js

function createGenerateClassName() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _options$dangerouslyU = options.dangerouslyUseGlobalCSS,
      dangerouslyUseGlobalCSS = _options$dangerouslyU === void 0 ? false : _options$dangerouslyU,
      _options$productionPr = options.productionPrefix,
      productionPrefix = _options$productionPr === void 0 ? 'jss' : _options$productionPr,
      _options$seed = options.seed,
      seed = _options$seed === void 0 ? '' : _options$seed;
  var ruleCounter = 0;
  return function (rule, styleSheet) {
    var isStatic = !styleSheet.options.link;

    if (dangerouslyUseGlobalCSS && styleSheet && styleSheet.options.name && isStatic) {
      return "".concat(safePrefix(styleSheet.options.name), "-").concat(rule.key);
    }

    var suffix; // It's a static rule.

    if (isStatic) {
      var themeHash = themeHashCache[styleSheet.options.theme];

      if (!themeHash) {
        themeHash = (0, _hash["default"])(JSON.stringify(styleSheet.options.theme));
        themeHashCache[styleSheet.theme] = themeHash;
      }

      var raw = styleSheet.rules.raw[rule.key];
      suffix = (0, _hash["default"])("".concat(themeHash).concat(rule.key).concat(JSON.stringify(raw)));
    }

    if (!suffix) {
      ruleCounter += 1;
      process.env.NODE_ENV !== "production" ? (0, _warning["default"])(ruleCounter < 1e10, ['Material-UI: you might have a memory leak.', 'The ruleCounter is not supposed to grow that much.'].join('')) : void 0;
      suffix = ruleCounter;
    }

    if (process.env.NODE_ENV === 'production') {
      return "".concat(productionPrefix).concat(seed).concat(suffix);
    } // Help with debuggability.


    if (styleSheet && styleSheet.options.classNamePrefix) {
      return "".concat(safePrefix(styleSheet.options.classNamePrefix), "-").concat(rule.key, "-").concat(seed).concat(suffix);
    }

    return "".concat(rule.key, "-").concat(seed).concat(suffix);
  };
}