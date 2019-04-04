"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("@material-ui/utils");

var _hoistNonReactStatics = _interopRequireDefault(require("hoist-non-react-statics"));

var _withStyles = _interopRequireDefault(require("./withStyles"));

function omit(input, fields) {
  var output = {};
  Object.keys(input).forEach(function (prop) {
    if (fields.indexOf(prop) === -1) {
      output[prop] = input[prop];
    }
  });
  return output;
} // styled-components's API removes the mapping between components and styles.
// Using components as a low-level styling construct can be simpler.


function styled(Component) {
  var componentCreator = function componentCreator(style, options) {
    function StyledComponent(props) {
      var children = props.children,
          classes = props.classes,
          classNameProp = props.className,
          clone = props.clone,
          ComponentProp = props.component,
          other = (0, _objectWithoutProperties2["default"])(props, ["children", "classes", "className", "clone", "component"]);
      var className = (0, _classnames["default"])(classes.root, classNameProp);

      if (clone) {
        return _react["default"].cloneElement(children, {
          className: (0, _classnames["default"])(children.props.className, className)
        });
      }

      var spread = other;

      if (style.filterProps) {
        var omittedProps = style.filterProps;
        spread = omit(spread, omittedProps);
      }

      if (typeof children === 'function') {
        return children((0, _extends2["default"])({
          className: className
        }, spread));
      }

      var FinalComponent = ComponentProp || Component;
      return _react["default"].createElement(FinalComponent, (0, _extends2["default"])({
        className: className
      }, spread), children);
    }

    process.env.NODE_ENV !== "production" ? StyledComponent.propTypes = (0, _extends2["default"])({
      /**
       * A render function or node.
       */
      children: _propTypes["default"].oneOfType([_propTypes["default"].node, _propTypes["default"].func]),
      classes: _propTypes["default"].object.isRequired,
      className: _propTypes["default"].string,

      /**
       * If `true`, the component will recycle it's children DOM element.
       * It's using `React.cloneElement` internally.
       */
      clone: (0, _utils.chainPropTypes)(_propTypes["default"].bool, function (props) {
        if (props.clone && props.component) {
          throw new Error('You can not use the clone and component properties at the same time.');
        }
      }),

      /**
       * The component used for the root node.
       * Either a string to use a DOM element or a component.
       */
      component: _propTypes["default"].oneOfType([_propTypes["default"].string, _propTypes["default"].func, _propTypes["default"].object]),
      theme: _propTypes["default"].object
    }, style.propTypes || {}) : void 0;

    if (process.env.NODE_ENV !== 'production') {
      StyledComponent.displayName = "Styled(".concat((0, _utils.getDisplayName)(Component), ")");
    }

    var styles = typeof style === 'function' ? function (theme) {
      return {
        root: function root(props) {
          return style((0, _extends2["default"])({
            theme: theme
          }, props));
        }
      };
    } : {
      root: style
    };
    (0, _hoistNonReactStatics["default"])(StyledComponent, Component);
    return (0, _withStyles["default"])(styles, options)(StyledComponent);
  };

  return componentCreator;
}

var _default = styled;
exports["default"] = _default;