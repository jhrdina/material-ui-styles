"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireDefault(require("react"));

var _ThemeContext = _interopRequireDefault(require("./ThemeContext"));

var _StylesProvider = require("./StylesProvider");

var _withStyles = require("./withStyles");

var _indexCounter = require("./indexCounter");

var _getStylesCreator = _interopRequireDefault(require("./getStylesCreator"));

// We use the same empty object to ref count the styles that don't need a theme object.
var noopTheme = {}; // Helper to debug
// let id = 0;

function makeStyles(stylesOrCreator) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$withTheme = options.withTheme,
      withTheme = _options$withTheme === void 0 ? false : _options$withTheme,
      name = options.name,
      defaultThemeOption = options.defaultTheme,
      stylesOptions2 = (0, _objectWithoutProperties2["default"])(options, ["withTheme", "name", "defaultTheme"]);
  var stylesCreator = (0, _getStylesCreator["default"])(stylesOrCreator);
  var listenToTheme = stylesCreator.themingEnabled || typeof name === 'string' || withTheme;
  var defaultTheme = defaultThemeOption || noopTheme;
  var meta = name || 'Hook';
  stylesCreator.options = {
    index: (0, _indexCounter.increment)(),
    // Use for the global CSS option
    name: name,
    // Help with debuggability.
    meta: meta,
    classNamePrefix: meta
  };
  return function () {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var theme = listenToTheme ? _react["default"].useContext(_ThemeContext["default"]) || defaultTheme : defaultTheme;
    var stylesOptions = (0, _extends2["default"])({}, _react["default"].useContext(_StylesProvider.StylesContext), stylesOptions2);
    var firstRender = false;

    var _React$useState = _react["default"].useState(function () {
      firstRender = true;
      return {};
    }),
        _React$useState2 = (0, _slicedToArray2["default"])(_React$useState, 1),
        state = _React$useState2[0]; // Execute synchronously every time the theme changes.


    _react["default"].useMemo(function () {
      (0, _withStyles.attach)({
        name: name,
        props: props,
        state: state,
        stylesCreator: stylesCreator,
        stylesOptions: stylesOptions,
        theme: theme
      });
    }, [theme]);

    _react["default"].useEffect(function () {
      if (!firstRender) {
        (0, _withStyles.update)({
          props: props,
          state: state,
          stylesCreator: stylesCreator,
          stylesOptions: stylesOptions,
          theme: theme
        });
      }
    }); // Execute asynchronously every time the theme changes.


    _react["default"].useEffect(function () {
      return function cleanup() {
        (0, _withStyles.detach)({
          state: state,
          stylesCreator: stylesCreator,
          stylesOptions: stylesOptions,
          theme: theme
        });
      };
    }, [theme]);

    return (0, _withStyles.getClasses)({
      classes: props.classes,
      Component: undefined,
      state: state,
      stylesOptions: stylesOptions
    });
  };
}

var _default = makeStyles;
exports["default"] = _default;