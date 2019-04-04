import _extends from "@babel/runtime/helpers/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/objectWithoutPropertiesLoose";
import React from 'react';
import PropTypes from 'prop-types';
import { getDisplayName } from '@material-ui/utils';
import hoistStatics from './hoistInternalStatics';
import ThemeContext from './ThemeContext'; // Provide the theme object as a property to the input component.

const withTheme = () => Component => {
  const WithTheme = props => React.createElement(ThemeContext.Consumer, null, theme => {
    const {
      innerRef
    } = props,
          other = _objectWithoutPropertiesLoose(props, ["innerRef"]);

    return React.createElement(Component, _extends({
      theme: theme,
      ref: innerRef
    }, other));
  });

  process.env.NODE_ENV !== "production" ? WithTheme.propTypes = {
    /**
     * Use that property to pass a ref callback to the decorated component.
     */
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object])
  } : void 0;

  if (process.env.NODE_ENV !== 'production') {
    WithTheme.displayName = `WithTheme(${getDisplayName(Component)})`;
  }

  hoistStatics(WithTheme, Component);
  return WithTheme;
};

export default withTheme;