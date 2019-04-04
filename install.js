"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = install;

var _utils = require("@material-ui/utils");

var _ThemeProvider = _interopRequireDefault(require("./ThemeProvider"));

var _withTheme = _interopRequireDefault(require("./withTheme"));

var _withStyles = _interopRequireDefault(require("./withStyles"));

/* eslint-disable no-underscore-dangle */
function install() {
  if (!_utils.ponyfillGlobal.__MUI_STYLES__) {
    _utils.ponyfillGlobal.__MUI_STYLES__ = {};
  }

  _utils.ponyfillGlobal.__MUI_STYLES__.MuiThemeProvider = _ThemeProvider["default"];
  _utils.ponyfillGlobal.__MUI_STYLES__.withTheme = _withTheme["default"];
  _utils.ponyfillGlobal.__MUI_STYLES__.withStyles = _withStyles["default"];
}