import React from 'react';
import PropTypes from 'prop-types';

import {
  Row,
  Col,
  Media,
  ListGroup,
} from 'react-bootstrap';

import Pagination from '@vlsergey/react-bootstrap-pagination';

import { Link } from 'react-router-dom';
import agreeWithNum from '../../utils/agree-with-num';
import Sugar from '../../utils/sugar';

class GenericList extends React.Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
  }

  key() {
    throw new Error('Not Implemented');
  }

  thumbnail() {
    throw new Error('Not Implemented');
  }

  url() {
    throw new Error('Not Implemented');
  }

  description() {
    throw new Error('Not Implemented');
  }

  items() {
    const { items } = this.props;

    return items.map((item) => (
      <ListGroup.Item key={this.key(item)}>
        <Media>
          <img width={128} className="mr-3" src={this.thumbnail(item)} alt="thumbnail" />

          <Media.Body>
            <Row>
              <Col>
                <Link to={this.url(item)}>{item.name}</Link>
              </Col>
            </Row>
            <Row>
              <Col>
                {this.description(item)}
              </Col>
            </Row>
          </Media.Body>
        </Media>
      </ListGroup.Item>
    ));
  }

  render() {
    return (
      <ListGroup variant="flush">
        {this.items()}
      </ListGroup>
    );
  }
}

class SegmentsList extends GenericList {
  key(segment) {
    return segment.name;
  }

  thumbnail(segment) {
    return segment.thumbnail;
  }

  url(segment) {
    return segment.url;
  }

  description(segment) {
    return Sugar.Date.short(segment.date);
  }
}

class GamesList extends GenericList {
  key(game) {
    return game.name;
  }

  url(game) {
    return game.url;
  }

  thumbnail(game) {
    const { data: { segments } } = this.props;
    const segment = segments.by('segment', game.segment);
    return segment.thumbnail;
  }

  description(game) {
    let res = '';
    const { segments } = game;
    const { streams } = game;

    res += `${streams} ${agreeWithNum(streams, 'стрим', ['', 'а', 'ов'])}`;

    if (streams > 1) {
      res += ` с ${Sugar.Date.short(segments[0].date)}`;
      res += ` по ${Sugar.Date.short(segments[segments.length - 1].date)}`;
    } else {
      res += ` ${Sugar.Date.short(segments[0].date)}`;
    }

    return res;
  }
}

class ResultsPagination extends React.Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
    page: PropTypes.number,
    max: PropTypes.number,
    renderer: PropTypes.func.isRequired,
    rendererProps: PropTypes.object,
    onPageChange: PropTypes.func.isRequired,
  }

  static defaultProps = {
    page: 0,
    max: 10,
    rendererProps: {},
  }

  items() {
    const { items, max, page } = this.props;

    if (items.length <= max) {
      return items;
    }

    return items.slice(page * max, (page + 1) * max);
  }

  content() {
    const { renderer, rendererProps } = this.props;

    return React.createElement(renderer, {
      ...rendererProps,
      items: this.items(),
      key: 'content',
    });
  }

  navigator() {
    const { items, max, page, onPageChange } = this.props;

    const pages = Math.ceil(items.length / max);

    if (pages <= 1) {
      return null;
    }

    return (
      <Row key="navigator">
        <Col className="d-flex justify-content-center">
          <Pagination
            totalPages={pages}
            value={page}
            showFirstLast={false}
            atBeginEnd={1}
            aroundCurrent={2}
            onChange={({ target: { value } }) => onPageChange(value)}
          />
        </Col>
      </Row>
    );
  }

  render() {
    return [
      this.content(),
      this.navigator(),
    ];
  }
}

export { SegmentsList, GamesList, ResultsPagination };
