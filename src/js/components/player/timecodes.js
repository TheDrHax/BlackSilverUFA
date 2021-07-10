import React from 'react';
import PropTypes from 'prop-types';
import { Collapse, ListGroup, ListGroupItem } from 'react-bootstrap';
import { reverse } from 'lodash';
import updateState from '../../utils/update-state';

class TimecodeLink extends React.Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    visited: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
  }

  static defaultProps = {
    visited: false,
  }

  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick(event) {
    event.preventDefault();

    const { onClick } = this.props;
    onClick();
  }

  render() {
    const { visited, text } = this.props;

    return (
      <a
        href="#"
        className={visited ? 'visited' : ''}
        onClick={this.onClick}
      >
        {text}
      </a>
    );
  }
}

export default class Timecodes extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    currentTime: PropTypes.number,
    setTime: PropTypes.func,
    data: PropTypes.object.isRequired,
  }

  static defaultProps = {
    className: '',
    currentTime: 0,
    setTime: () => null,
  }

  static parseTime(time) { // 1:00:00 → 3600
    return reverse(time.split(':'))
      .map((value, index) => value * (60 ** index))
      .reduce((accumulator, value) => accumulator + value);
  }

  link(time) {
    const { currentTime, setTime } = this.props;
    const value = Timecodes.parseTime(time);

    return (
      <TimecodeLink
        key={value}
        visited={currentTime >= value}
        onClick={() => setTime(value)}
        text={time}
      />
    );
  }

  static name(value) {
    return <span dangerouslySetInnerHTML={{ __html: value }} />;
  }

  parse() {
    const { data } = this.props;

    return Object.entries(data).map(([key, value]) => {
      if (typeof value === 'string') { // regular timecode
        if (key.indexOf('~') === -1) { // simple time
          return (
            <ListGroup.Item key={key}>
              {this.link(key)}
              {' — '}
              {Timecodes.name(value)}
            </ListGroup.Item>
          );
        } else { // time range
          const [start, end] = key.split('~');

          return (
            <ListGroup.Item key={key}>
              {this.link(start)}
              {' - '}
              {this.link(end)}
              {' — '}
              {Timecodes.name(value)}
            </ListGroup.Item>
          );
        }
      } else if (Array.isArray(value)) {
        const links = value
          .map((t) => {
            if (t.indexOf('~') === -1) { // simple time
              return this.link(t);
            } else { // time range
              const [start, end] = t.split('~');
              return (
                <span key={t}>
                  {this.link(start)}
                  {' - '}
                  {this.link(end)}
                </span>
              );
            }
          })
          .reduce((prev, curr) => [prev, ', ', curr]);

        return (
          <ListGroup.Item key={value.join()}>
            {links}
            {' — '}
            {Timecodes.name(key)}
          </ListGroup.Item>
        );
      } else { // nested timecode
        return (
          <NestedTimecodes
            key={key}
            {...{
              ...this.props,
              name: key,
              data: value,
            }}
          />
        );
      }
    });
  }

  render() {
    const { className } = this.props;

    return (
      <ListGroup className={['timecodes-list', className].join(' ')}>
        {this.parse()}
      </ListGroup>
    );
  }
}

class NestedTimecodes extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    level: PropTypes.number,
  }

  static defaultProps = {
    level: 0,
  }

  constructor(props) {
    super(props);

    this.state = {
      open: true,
    };
  }

  render() {
    const { name, level } = this.props;
    const { open } = this.state;

    const glyphClass = `glyph fas fa-chevron-${open ? 'down' : 'right'}`;

    return (
      <>
        <ListGroupItem
          className="d-flex"
          action
          onClick={() => updateState(this, { $toggle: ['open'] })}
        >
          <i className={glyphClass} />
          <b>{name}</b>
        </ListGroupItem>
        <Collapse in={open}>
          <Timecodes
            {...{
              ...this.props,
              className: `timecodes-nested-${level}`,
              level: level + 1,
            }}
          />
        </Collapse>
      </>
    );
  }
}
