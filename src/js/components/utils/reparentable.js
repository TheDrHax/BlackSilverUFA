import React from 'react';
import PropTypes from 'prop-types';

/**
 * Source: https://github.com/facebook/react/issues/13044#issuecomment-428815909
 */
export default class Reparentable extends React.PureComponent {
  static propTypes = {
    el: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  componentDidMount() {
    const { el } = this.props;
    const ref = this.ref.current;

    if (ref) {
      ref.appendChild(el);
    }
  }

  render() {
    const { el, ...otherProps } = this.props;
    return <div ref={this.ref} {...otherProps} />;
  }
}
