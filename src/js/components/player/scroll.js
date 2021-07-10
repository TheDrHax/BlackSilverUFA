import React from 'react';
import PropTypes from 'prop-types';
import CustomScroll from 'react-custom-scroll';
import Measure from 'react-measure';

export default class Scroll extends React.Component {
  static propTypes = {
    scrollToSelector: PropTypes.string,
    flex: PropTypes.string,
    heightRelativeToParent: PropTypes.string,
    keepAtBottom: PropTypes.bool,
    bottomSelector: PropTypes.string,
  }

  static defaultProps = {
    scrollToSelector: null,
    flex: null,
    heightRelativeToParent: null,
    keepAtBottom: false,
    bottomSelector: '* + :last-child',
  }

  constructor(props) {
    super(props);

    this.scrollRef = React.createRef();
    this.onSizeChange = this.onSizeChange.bind(this);

    this.outerHeight = 0;
    this.prevOuterHeight = 0;
    this.outerWidth = 0;
    this.prevOuterWidth = 0;
  }

  onSizeChange() {
    if (this.scrollRef.current) {
      this.scrollRef.current.forceUpdate();
    }
  }

  scrollToSelector(selector) {
    const scroll = this.scrollRef.current;
    const container = scroll.innerContainerRef.current;
    const node = container.querySelector(selector);

    if (node) {
      // We need to wait for child components to render
      // This is probably a bad solution
      setTimeout(() => {
        scroll.updateScrollPosition(node.offsetTop - container.offsetTop);
      }, 10);
    }
  }

  componentDidMount() {
    const { scrollToSelector, keepAtBottom } = this.props;

    if (scrollToSelector) {
      this.scrollToSelector(scrollToSelector);
    } else if (keepAtBottom) {
      this.keepAtBottom();
    }
  }

  componentDidUpdate(prevProps) {
    const { scrollToSelector } = this.props;

    if (scrollToSelector && prevProps.scrollToSelector !== scrollToSelector) {
      this.scrollToSelector(scrollToSelector);
    }
  }

  keepAtBottom() {
    const {
      scrollRef: {
        current: ref,
      },
      props: {
        keepAtBottom,
        bottomSelector,
      },
    } = this;

    if (keepAtBottom && ref) {
      this.scrollToSelector(bottomSelector);
    }
  }

  render() {
    const {
      children,
      scrollToSelector,
      flex,
      heightRelativeToParent,
      ...otherProps
    } = this.props;

    const containerStyle = {};

    if (flex) {
      containerStyle.flex = flex;
    } else if (heightRelativeToParent) {
      containerStyle.height = heightRelativeToParent;
    }

    return (
      <Measure onResize={this.onSizeChange}>
        {({
          contentRect: {
            entry: {
              width: outerWidth,
              height: outerHeight,
            },
          },
          measureRef: outerMeasureRef,
        }) => {
          this.prevOuterHeight = this.outerHeight;
          this.outerHeight = outerHeight;
          this.prevOuterWidth = this.outerWidth;
          this.outerWidth = outerWidth;

          if (this.prevOuterHeight !== this.outerHeight
              || this.prevOuterWidth !== this.outerWidth) {
            this.keepAtBottom();
          }

          return (
            <div ref={outerMeasureRef} style={containerStyle} className="scroll-outer">
              <CustomScroll
                ref={this.scrollRef}
                flex="1 1 0"
                {...otherProps}
              >
                <Measure onResize={this.onSizeChange}>
                  {({ measureRef }) => (
                    <div ref={measureRef}>{children}</div>
                  )}
                </Measure>
              </CustomScroll>
            </div>
          );
        }}
      </Measure>
    );
  }
}
