"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("@material-ui/utils");

var _hoistInternalStatics = _interopRequireDefault(require("./hoistInternalStatics"));

var _ThemeContext = _interopRequireDefault(require("./ThemeContext"));

// Provide the theme object as a property to the input component.
var withTheme = function withTheme() {
  return function (Component) {
    var WithTheme = function WithTheme(props) {
      return _react["default"].createElement(_ThemeContext["default"].Consumer, null, function (theme) {
        var innerRef = props.innerRef,
            other = (0, _objectWithoutProperties2["default"])(props, ["innerRef"]);
        return _react["default"].createElement(Component, (0, _extends2["default"])({
          theme: theme,
          ref: innerRef
        }, other));
      });
    };

    process.env.NODE_ENV !== "production" ? WithTheme.propTypes = {
      /**
       * Use that property to pass a ref callback to the decorated component.
       */
      innerRef: _propTypes["default"].oneOfType([_propTypes["default"].func, _propTypes["default"].object])
    } : void 0;

    if (process.env.NODE_ENV !== 'production') {
      WithTheme.displayName = "WithTheme(".concat((0, _utils.getDisplayName)(Component), ")");
    }

    (0, _hoistInternalStatics["default"])(WithTheme, Component);
    return WithTheme;
  };
};

var _default = withTheme;
exports["default"] = _default;