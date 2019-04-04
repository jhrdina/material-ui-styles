"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.StylesContext = exports.sheetsManager = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _warning = _interopRequireDefault(require("warning"));

var _utils = require("@material-ui/utils");

var _createGenerateClassName = _interopRequireDefault(require("./createGenerateClassName"));

var _jss = require("jss");

var _jssPreset = _interopRequireDefault(require("./jssPreset"));

// Default JSS instance.
var jss = (0, _jss.create)((0, _jssPreset["default"])()); // Use a singleton or the provided one by the context.
//
// The counter-based approach doesn't tolerate any mistake.
// It's much safer to use the same counter everywhere.

var generateClassName = (0, _createGenerateClassName["default"])(); // Exported for test purposes

var sheetsManager = new Map();
exports.sheetsManager = sheetsManager;
var defaultOptions = {
  disableGeneration: false,
  generateClassName: generateClassName,
  jss: jss,
  sheetsCache: typeof window === 'undefined' ? new Map() : null,
  sheetsManager: sheetsManager,
  sheetsRegistry: null
};

var StylesContext = _react["default"].createContext(defaultOptions);

exports.StylesContext = StylesContext;

function StylesProvider(props) {
  var children = props.children,
      localOptions = (0, _objectWithoutProperties2["default"])(props, ["children"]);
  process.env.NODE_ENV !== "production" ? (0, _warning["default"])(typeof window !== 'undefined' || localOptions.sheetsManager, ['Material-UI: you need to provide a sheetsManager to the StyleProvider ' + 'when rendering on the server.'].join('\n')) : void 0;
  return _react["default"].createElement(StylesContext.Consumer, null, function (outerOptions) {
    return _react["default"].createElement(StylesContext.Provider, {
      value: (0, _extends2["default"])({}, outerOptions, localOptions)
    }, children);
  });
}

process.env.NODE_ENV !== "production" ? StylesProvider.propTypes = {
  /**
   * You can wrap a node.
   */
  children: _propTypes["default"].node.isRequired,

  /**
   * You can disable the generation of the styles with this option.
   * It can be useful when traversing the React tree outside of the HTML
   * rendering step on the server.
   * Let's say you are using react-apollo to extract all
   * the queries made by the interface server-side.
   * You can significantly speed up the traversal with this property.
   */
  disableGeneration: _propTypes["default"].bool,

  /**
   * JSS's class name generator.
   */
  generateClassName: _propTypes["default"].func,

  /**
   * JSS's instance.
   */
  jss: _propTypes["default"].object,

  /**
   * @ignore
   *
   * In beta.
   */
  sheetsCache: _propTypes["default"].object,

  /**
   * The sheetsManager is used to deduplicate style sheet injection in the page.
   * It's deduplicating using the (theme, styles) couple.
   * On the server, you should provide a new instance for each request.
   */
  sheetsManager: _propTypes["default"].object,
  sheetsRegistry: _propTypes["default"].object
} : void 0;

if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_ENV !== "production" ? StylesProvider.propTypes = (0, _utils.exactProp)(StylesProvider.propTypes) : void 0;
}

StylesProvider.defaultProps = {
  disableGeneration: false
};
var _default = StylesProvider;
exports["default"] = _default;