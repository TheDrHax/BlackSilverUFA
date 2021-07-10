import React from 'react';
import PropTypes from 'prop-types';
import { Accordion, Badge, Button, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Scroll from './scroll';
import Sugar from '../../utils/sugar';

export default class Playlist extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    items: PropTypes.array.isRequired,
    activeItem: PropTypes.object.isRequired,
    fullHeight: PropTypes.bool,
    opened: PropTypes.bool,
  }

  static defaultProps = {
    id: 'streams',
    fullHeight: false,
    opened: false,
  }

  constructor(props) {
    super(props);

    this.state = {
      collapsed: !props.opened,
    };
  }

  componentDidUpdate(prevProps) {
    const { opened: prevOpened } = prevProps;
    const { opened } = this.props;

    if (prevOpened !== opened) {
      setTimeout(() => {
        this.setState({ collapsed: !opened });
      }, 10);
    }
  }

  renderNowPlaying() {
    const { items, activeItem, id } = this.props;

    const activeIndex = items.indexOf(activeItem);
    const prevItem = activeIndex !== -1 && items[activeIndex - 1];
    const nextItem = activeIndex !== -1 && items[activeIndex + 1];

    return (
      <div className="playlist-now">
        {prevItem ? (
          <Button as={Link} to={prevItem.ref.url} variant="dark" size="sm">
            <i className="fas fa-arrow-left" />
          </Button>
        ) : (
          <Button variant="dark" size="sm" disabled>
            <i className="fas fa-arrow-left" />
          </Button>
        )}
        <Accordion.Toggle
          as={Button}
          variant="dark"
          size="sm"
          className="border-left border-right now-playing"
          eventKey={id}
        >
          {activeItem.ref.game.name}
        </Accordion.Toggle>
        {nextItem ? (
          <Button as={Link} to={nextItem.ref.url} variant="dark" size="sm">
            <i className="fas fa-arrow-right" />
          </Button>
        ) : (
          <Button variant="dark" size="sm" disabled>
            <i className="fas fa-arrow-right" />
          </Button>
        )}
      </div>
    );
  }

  renderList() {
    const { items, activeItem: { ref: segmentRef } } = this.props;

    return (
      <ListGroup className="playlist">
        {items.map(({ ref, segment }) => (
          <ListGroup.Item
            key={ref.segment}
            as={Link}
            to={ref.url}
            action
            active={ref === segmentRef}
            className="d-flex flex-row align-items-center"
          >
            <span className="flex-grow-1">{ref.name}</span>
            <span>
              <Badge pill variant="dark">
                {Sugar.Date.format(segment.date, '{dd}.{MM}.{yy}')}
              </Badge>
            </span>
          </ListGroup.Item>
        ))}
      </ListGroup>
    );
  }

  renderScrollableList() {
    const { items, fullHeight } = this.props;
    const { collapsed } = this.state;

    if (!fullHeight && items.length <= 4) {
      return this.renderList();
    }

    const component = (
      <Scroll
        heightRelativeToParent="100%"
        scrollToSelector={collapsed ? undefined : '.active'}
      >
        {this.renderList()}
      </Scroll>
    );

    if (fullHeight) return component;

    return (
      <div style={{ height: '125px' }}>
        {component}
      </div>
    );
  }

  render() {
    const { id } = this.props;

    return (
      <>
        {this.renderNowPlaying()}
        <Accordion.Collapse eventKey={id} className="flex-1-1-0">
          {this.renderScrollableList()}
        </Accordion.Collapse>
      </>
    );
  }
}
