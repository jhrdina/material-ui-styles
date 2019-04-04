import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/objectWithoutPropertiesLoose";
import _extends from "@babel/runtime/helpers/extends";

/* eslint-disable react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';
import warning from 'warning';
import { getDynamicStyles } from 'jss';
import { getDisplayName } from '@material-ui/utils';
import { increment } from './indexCounter';
import mergeClasses from './mergeClasses';
import multiKeyStore from './multiKeyStore';
import getStylesCreator from './getStylesCreator';
import getThemeProps from './getThemeProps';
import hoistStatics from './hoistInternalStatics';
import { StylesContext } from './StylesProvider';
import ThemeContext from './ThemeContext'; // We use the same empty object to ref count the styles that don't need a theme object.

const noopTheme = {};
export function getClasses({
  classes,
  Component,
  state,
  stylesOptions
}) {
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


  let generate = false;

  if (state.classes !== state.cacheClasses.lastJSS) {
    state.cacheClasses.lastJSS = state.classes;
    generate = true;
  }

  if (classes !== state.cacheClasses.lastProp) {
    state.cacheClasses.lastProp = classes;
    generate = true;
  }

  if (generate) {
    state.cacheClasses.value = mergeClasses({
      baseClasses: state.cacheClasses.lastJSS,
      newClasses: classes,
      Component
    });
  }

  return state.cacheClasses.value;
}
export function attach({
  state,
  props,
  theme,
  stylesOptions,
  stylesCreator,
  name
}) {
  if (stylesOptions.disableGeneration) {
    return;
  }

  let sheetManager = multiKeyStore.get(stylesOptions.sheetsManager, stylesCreator, theme);

  if (!sheetManager) {
    sheetManager = {
      refs: 0,
      staticSheet: null,
      dynamicStyles: null
    };
    multiKeyStore.set(stylesOptions.sheetsManager, stylesCreator, theme, sheetManager);
  }

  const options = _extends({}, stylesCreator.options, stylesOptions, {
    theme,
    flip: typeof stylesOptions.flip === 'boolean' ? stylesOptions.flip : theme.direction === 'rtl'
  });

  options.generateId = options.generateClassName;
  const sheetsRegistry = stylesOptions.sheetsRegistry;

  if (sheetManager.refs === 0) {
    let staticSheet;

    if (stylesOptions.sheetsCache) {
      staticSheet = multiKeyStore.get(stylesOptions.sheetsCache, stylesCreator, theme);
    }

    const styles = stylesCreator.create(theme, name);

    if (!staticSheet) {
      staticSheet = stylesOptions.jss.createStyleSheet(styles, _extends({
        link: false
      }, options));
      staticSheet.attach();

      if (stylesOptions.sheetsCache) {
        multiKeyStore.set(stylesOptions.sheetsCache, stylesCreator, theme, staticSheet);
      }
    }

    if (sheetsRegistry) {
      sheetsRegistry.add(staticSheet);
    }

    sheetManager.dynamicStyles = getDynamicStyles(styles);
    sheetManager.staticSheet = staticSheet;
  }

  if (sheetManager.dynamicStyles) {
    const dynamicSheet = stylesOptions.jss.createStyleSheet(sheetManager.dynamicStyles, _extends({
      link: true
    }, options));
    process.env.NODE_ENV !== "production" ? warning(props, 'Material-UI: properties missing.') : void 0;
    dynamicSheet.update(props).attach();
    state.dynamicSheet = dynamicSheet;

    if (sheetsRegistry) {
      sheetsRegistry.add(dynamicSheet);
    }

    state.classes = mergeClasses({
      baseClasses: sheetManager.staticSheet.classes,
      newClasses: dynamicSheet.classes
    });
  } else {
    state.classes = sheetManager.staticSheet.classes;
  }

  sheetManager.refs += 1;
}
export function update({
  state,
  props
}) {
  if (state.dynamicSheet) {
    state.dynamicSheet.update(props);
  }
}
export function detach({
  state,
  theme,
  stylesOptions,
  stylesCreator
}) {
  if (stylesOptions.disableGeneration) {
    return;
  }

  const sheetManager = multiKeyStore.get(stylesOptions.sheetsManager, stylesCreator, theme);
  sheetManager.refs -= 1;
  const sheetsRegistry = stylesOptions.sheetsRegistry;

  if (sheetManager.refs === 0) {
    multiKeyStore.delete(stylesOptions.sheetsManager, stylesCreator, theme);
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

const withStyles = (stylesOrCreator, options = {}) => Component => {
  const {
    withTheme = false,
    name,
    defaultTheme: defaultThemeOption
  } = options,
        stylesOptions2 = _objectWithoutPropertiesLoose(options, ["withTheme", "name", "defaultTheme"]);

  const stylesCreator = getStylesCreator(stylesOrCreator);
  const listenToTheme = stylesCreator.themingEnabled || typeof name === 'string' || withTheme;
  const defaultTheme = defaultThemeOption || noopTheme;
  let meta = name;

  if (process.env.NODE_ENV !== 'production' && !meta) {
    // Provide a better DX outside production.
    meta = getDisplayName(Component);
    process.env.NODE_ENV !== "production" ? warning(typeof meta === 'string', ['Material-UI: the component displayName is invalid. It needs to be a string.', `Please fix the following component: ${Component}.`].join('\n')) : void 0;
  }

  stylesCreator.options = {
    // Side effect.
    index: increment(),
    // Use for the global CSS option.
    name: name || Component.displayName,
    // Help with debuggability.
    meta,
    classNamePrefix: meta
  };

  class WithStylesInner extends React.Component {
    constructor() {
      super();
      this.state = {
        styles: {}
      };
    }

    componentDidUpdate() {
      update({
        props: this.props,
        state: this.state.styles
      });
    }

    componentWillUnmount() {
      detach({
        state: this.state.styles,
        stylesCreator,
        stylesOptions: this.props.stylesOptions,
        theme: this.props.theme
      });
    }

    render() {
      const _this$props = this.props,
            {
        classes,
        theme,
        innerRef,
        stylesOptions
      } = _this$props,
            other = _objectWithoutPropertiesLoose(_this$props, ["classes", "theme", "innerRef", "stylesOptions"]);

      const oldTheme = this.theme;
      this.theme = theme;

      if (oldTheme !== theme) {
        attach({
          name,
          props: this.props,
          state: this.state.styles,
          stylesCreator,
          stylesOptions,
          theme
        });

        if (oldTheme) {
          // Rerender the component so the underlying component gets the theme update.
          // By theme update we mean receiving and applying the new class names.
          setTimeout(() => {
            detach({
              state: this.state.styles,
              stylesCreator,
              stylesOptions,
              theme: oldTheme
            });
          });
        }
      }

      const more = getThemeProps({
        theme,
        name,
        props: other
      }); // Provide the theme to the wrapped component.
      // So we don't have to use the `withTheme()` Higher-order Component.

      if (withTheme) {
        more.theme = theme;
      }

      return React.createElement(Component, _extends({
        ref: innerRef,
        classes: getClasses({
          classes,
          Component,
          state: this.state.styles,
          stylesOptions
        })
      }, more));
    }

  }

  process.env.NODE_ENV !== "production" ? WithStylesInner.propTypes = {
    /**
     * Override or extend the styles applied to the component.
     */
    classes: PropTypes.object,
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    stylesOptions: PropTypes.object.isRequired,
    theme: PropTypes.object
  } : void 0;
  const WithStyles = React.forwardRef((props, ref) => React.createElement(StylesContext.Consumer, null, stylesOptions1 => {
    const stylesOptions = _extends({}, stylesOptions1, stylesOptions2);

    return listenToTheme ? React.createElement(ThemeContext.Consumer, null, theme => React.createElement(WithStylesInner, _extends({
      stylesOptions: stylesOptions,
      ref: ref,
      theme: theme || defaultTheme
    }, props))) : React.createElement(WithStylesInner, _extends({
      stylesOptions: stylesOptions,
      ref: ref,
      theme: defaultTheme
    }, props));
  }));
  process.env.NODE_ENV !== "production" ? WithStyles.propTypes = {
    /**
     * Override or extend the styles applied to the component.
     */
    classes: PropTypes.object,

    /**
     * Use that property to pass a ref callback to the decorated component.
     */
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object])
  } : void 0;

  if (process.env.NODE_ENV !== 'production') {
    WithStyles.displayName = `WithStyles(${getDisplayName(Component)})`;
  }

  hoistStatics(WithStyles, Component);

  if (process.env.NODE_ENV !== 'production') {
    // Exposed for test purposes.
    WithStyles.Naked = Component;
    WithStyles.options = options;
  }

  return WithStyles;
};

export default withStyles;