"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getClasses = getClasses;
exports.attach = attach;
exports.update = update;
exports.detach = detach;
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _warning = _interopRequireDefault(require("warning"));

var _jss = require("jss");

var _utils = require("@material-ui/utils");

var _indexCounter = require("./indexCounter");

var _mergeClasses = _interopRequireDefault(require("./mergeClasses"));

var _multiKeyStore = _interopRequireDefault(require("./multiKeyStore"));

var _getStylesCreator = _interopRequireDefault(require("./getStylesCreator"));

var _getThemeProps = _interopRequireDefault(require("./getThemeProps"));

var _hoistInternalStatics = _interopRequireDefault(require("./hoistInternalStatics"));

var _StylesProvider = require("./StylesProvider");

var _ThemeContext = _interopRequireDefault(require("./ThemeContext"));

/* eslint-disable react/no-multi-comp */
// We use the same empty object to ref count the styles that don't need a theme object.
var noopTheme = {};

function getClasses(_ref) {
  var classes = _ref.classes,
      Component = _ref.Component,
      state = _ref.state,
      stylesOptions = _ref.stylesOptions;

  if (stylesOptions.disableGeneration) {
    return classes || {};
  }

  if (!state.cacheClasses) {
    state.cacheClasses = {
      // Cache for the finalized classes value.
      value: null,
      // Cache for the last used classes prop pointer.
      lastProp: null,
      // Cache for the last used rendered classes pointer.
      lastJSS: {}
    };
  } // Tracks if either the rendered classes or classes prop has changed,
  // requiring the generation of a new finalized classes object.


  var generate = false;

  if (state.classes !== state.cacheClasses.lastJSS) {
    state.cacheClasses.lastJSS = state.classes;
    generate = true;
  }

  if (classes !== state.cacheClasses.lastProp) {
    state.cacheClasses.lastProp = classes;
    generate = true;
  }

  if (generate) {
    state.cacheClasses.value = (0, _mergeClasses["default"])({
      baseClasses: state.cacheClasses.lastJSS,
      newClasses: classes,
      Component: Component
    });
  }

  return state.cacheClasses.value;
}

function attach(_ref2) {
  var state = _ref2.state,
      props = _ref2.props,
      theme = _ref2.theme,
      stylesOptions = _ref2.stylesOptions,
      stylesCreator = _ref2.stylesCreator,
      name = _ref2.name;

  if (stylesOptions.disableGeneration) {
    return;
  }

  var sheetManager = _multiKeyStore["default"].get(stylesOptions.sheetsManager, stylesCreator, theme);

  if (!sheetManager) {
    sheetManager = {
      refs: 0,
      staticSheet: null,
      dynamicStyles: null
    };

    _multiKeyStore["default"].set(stylesOptions.sheetsManager, stylesCreator, theme, sheetManager);
  }

  var options = (0, _extends2["default"])({}, stylesCreator.options, stylesOptions, {
    theme: theme,
    flip: typeof stylesOptions.flip === 'boolean' ? stylesOptions.flip : theme.direction === 'rtl'
  });
  options.generateId = options.generateClassName;
  var sheetsRegistry = stylesOptions.sheetsRegistry;

  if (sheetManager.refs === 0) {
    var staticSheet;

    if (stylesOptions.sheetsCache) {
      staticSheet = _multiKeyStore["default"].get(stylesOptions.sheetsCache, stylesCreator, theme);
    }

    var styles = stylesCreator.create(theme, name);

    if (!staticSheet) {
      staticSheet = stylesOptions.jss.createStyleSheet(styles, (0, _extends2["default"])({
        link: false
      }, options));
      staticSheet.attach();

      if (stylesOptions.sheetsCache) {
        _multiKeyStore["default"].set(stylesOptions.sheetsCache, stylesCreator, theme, staticSheet);
      }
    }

    if (sheetsRegistry) {
      sheetsRegistry.add(staticSheet);
    }

    sheetManager.dynamicStyles = (0, _jss.getDynamicStyles)(styles);
    sheetManager.staticSheet = staticSheet;
  }

  if (sheetManager.dynamicStyles) {
    var dynamicSheet = stylesOptions.jss.createStyleSheet(sheetManager.dynamicStyles, (0, _extends2["default"])({
      link: true
    }, options));
    process.env.NODE_ENV !== "production" ? (0, _warning["default"])(props, 'Material-UI: properties missing.') : void 0;
    dynamicSheet.update(props).attach();
    state.dynamicSheet = dynamicSheet;

    if (sheetsRegistry) {
      sheetsRegistry.add(dynamicSheet);
    }

    state.classes = (0, _mergeClasses["default"])({
      baseClasses: sheetManager.staticSheet.classes,
      newClasses: dynamicSheet.classes
    });
  } else {
    state.classes = sheetManager.staticSheet.classes;
  }

  sheetManager.refs += 1;
}

function update(_ref3) {
  var state = _ref3.state,
      props = _ref3.props;

  if (state.dynamicSheet) {
    state.dynamicSheet.update(props);
  }
}

function detach(_ref4) {
  var state = _ref4.state,
      theme = _ref4.theme,
      stylesOptions = _ref4.stylesOptions,
      stylesCreator = _ref4.stylesCreator;

  if (stylesOptions.disableGeneration) {
    return;
  }

  var sheetManager = _multiKeyStore["default"].get(stylesOptions.sheetsManager, stylesCreator, theme);

  sheetManager.refs -= 1;
  var sheetsRegistry = stylesOptions.sheetsRegistry;

  if (sheetManager.refs === 0) {
    _multiKeyStore["default"]["delete"](stylesOptions.sheetsManager, stylesCreator, theme);

    stylesOptions.jss.removeStyleSheet(sheetManager.staticSheet);

    if (sheetsRegistry) {
      sheetsRegistry.remove(sheetManager.staticSheet);
    }
  }

  if (state.dynamicSheet) {
    stylesOptions.jss.removeStyleSheet(state.dynamicSheet);

    if (sheetsRegistry) {
      sheetsRegistry.remove(state.dynamicSheet);
    }
  }
} // Link a style sheet with a component.
// It does not modify the component passed to it;
// instead, it returns a new component, with a `classes` property.


var withStyles = function withStyles(stylesOrCreator) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return function (Component) {
    var _options$withTheme = options.withTheme,
        withTheme = _options$withTheme === void 0 ? false : _options$withTheme,
        name = options.name,
        defaultThemeOption = options.defaultTheme,
        stylesOptions2 = (0, _objectWithoutProperties2["default"])(options, ["withTheme", "name", "defaultTheme"]);
    var stylesCreator = (0, _getStylesCreator["default"])(stylesOrCreator);
    var listenToTheme = stylesCreator.themingEnabled || typeof name === 'string' || withTheme;
    var defaultTheme = defaultThemeOption || noopTheme;
    var meta = name;

    if (process.env.NODE_ENV !== 'production' && !meta) {
      // Provide a better DX outside production.
      meta = (0, _utils.getDisplayName)(Component);
      process.env.NODE_ENV !== "production" ? (0, _warning["default"])(typeof meta === 'string', ['Material-UI: the component displayName is invalid. It needs to be a string.', "Please fix the following component: ".concat(Component, ".")].join('\n')) : void 0;
    }

    stylesCreator.options = {
      // Side effect.
      index: (0, _indexCounter.increment)(),
      // Use for the global CSS option.
      name: name || Component.displayName,
      // Help with debuggability.
      meta: meta,
      classNamePrefix: meta
    };

    var WithStylesInner =
    /*#__PURE__*/
    function (_React$Component) {
      (0, _inherits2["default"])(WithStylesInner, _React$Component);

      function WithStylesInner() {
        var _this;

        (0, _classCallCheck2["default"])(this, WithStylesInner);
        _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(WithStylesInner).call(this));
        _this.state = {
          styles: {}
        };
        return _this;
      }

      (0, _createClass2["default"])(WithStylesInner, [{
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
          update({
            props: this.props,
            state: this.state.styles
          });
        }
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          detach({
            state: this.state.styles,
            stylesCreator: stylesCreator,
            stylesOptions: this.props.stylesOptions,
            theme: this.props.theme
          });
        }
      }, {
        key: "render",
        value: function render() {
          var _this2 = this;

          var _this$props = this.props,
              classes = _this$props.classes,
              theme = _this$props.theme,
              innerRef = _this$props.innerRef,
              stylesOptions = _this$props.stylesOptions,
              other = (0, _objectWithoutProperties2["default"])(_this$props, ["classes", "theme", "innerRef", "stylesOptions"]);
          var oldTheme = this.theme;
          this.theme = theme;

          if (oldTheme !== theme) {
            attach({
              name: name,
              props: this.props,
              state: this.state.styles,
              stylesCreator: stylesCreator,
              stylesOptions: stylesOptions,
              theme: theme
            });

            if (oldTheme) {
              // Rerender the component so the underlying component gets the theme update.
              // By theme update we mean receiving and applying the new class names.
              setTimeout(function () {
                detach({
                  state: _this2.state.styles,
                  stylesCreator: stylesCreator,
                  stylesOptions: stylesOptions,
                  theme: oldTheme
                });
              });
            }
          }

          var more = (0, _getThemeProps["default"])({
            theme: theme,
            name: name,
            props: other
          }); // Provide the theme to the wrapped component.
          // So we don't have to use the `withTheme()` Higher-order Component.

          if (withTheme) {
            more.theme = theme;
          }

          return _react["default"].createElement(Component, (0, _extends2["default"])({
            ref: innerRef,
            classes: getClasses({
              classes: classes,
              Component: Component,
              state: this.state.styles,
              stylesOptions: stylesOptions
            })
          }, more));
        }
      }]);
      return WithStylesInner;
    }(_react["default"].Component);

    process.env.NODE_ENV !== "production" ? WithStylesInner.propTypes = {
      /**
       * Override or extend the styles applied to the component.
       */
      classes: _propTypes["default"].object,
      innerRef: _propTypes["default"].oneOfType([_propTypes["default"].func, _propTypes["default"].object]),
      stylesOptions: _propTypes["default"].object.isRequired,
      theme: _propTypes["default"].object
    } : void 0;

    var WithStyles = _react["default"].forwardRef(function (props, ref) {
      return _react["default"].createElement(_StylesProvider.StylesContext.Consumer, null, function (stylesOptions1) {
        var stylesOptions = (0, _extends2["default"])({}, stylesOptions1, stylesOptions2);
        return listenToTheme ? _react["default"].createElement(_ThemeContext["default"].Consumer, null, function (theme) {
          return _react["default"].createElement(WithStylesInner, (0, _extends2["default"])({
            stylesOptions: stylesOptions,
            ref: ref,
            theme: theme || defaultTheme
          }, props));
        }) : _react["default"].createElement(WithStylesInner, (0, _extends2["default"])({
          stylesOptions: stylesOptions,
          ref: ref,
          theme: defaultTheme
        }, props));
      });
    });

    process.env.NODE_ENV !== "production" ? WithStyles.propTypes = {
      /**
       * Override or extend the styles applied to the component.
       */
      classes: _propTypes["default"].object,

      /**
       * Use that property to pass a ref callback to the decorated component.
       */
      innerRef: _propTypes["default"].oneOfType([_propTypes["default"].func, _propTypes["default"].object])
    } : void 0;

    if (process.env.NODE_ENV !== 'production') {
      WithStyles.displayName = "WithStyles(".concat((0, _utils.getDisplayName)(Component), ")");
    }

    (0, _hoistInternalStatics["default"])(WithStyles, Component);

    if (process.env.NODE_ENV !== 'production') {
      // Exposed for test purposes.
      WithStyles.Naked = Component;
      WithStyles.options = options;
    }

    return WithStyles;
  };
};

var _default = withStyles;
exports["default"] = _default;