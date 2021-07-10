import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-date-picker';
import {
  InputGroup,
  Col,
  Dropdown,
  Form,
  Button,
} from 'react-bootstrap';
import updateState from '../../utils/update-state';
import Sugar from '../../utils/sugar';

export default class DateFilter extends React.Component {
  static propTypes = {
    onChange: PropTypes.func,
  }

  static defaultProps = {
    onChange: () => null,
  }

  scales = {
    month: 'День',
    year: 'Месяц',
    decade: 'Год',
  }

  static dateToRange(date, scale) {
    if (!date) {
      return [null, null];
    }

    const start = new Date(date);

    if (scale === 'year') {
      Sugar.Date.reset(start, 'month');
    } else if (scale === 'decade') {
      Sugar.Date.reset(start, 'year');
    }

    const end = new Date(start);

    if (scale === 'year') {
      Sugar.Date.advance(end, { months: 1 });
    } else if (scale === 'decade') {
      Sugar.Date.advance(end, { years: 1 });
    }

    Sugar.Date.rewind(end, { days: 1 });

    return [start, end];
  }

  constructor(props) {
    super(props);

    this.state = {
      start: null,
      end: null,
      scale: 'year',
    };
  }

  onChange(spec) {
    updateState(this, spec, () => {
      let { start, end } = this.state;
      const { scale } = this.state;
      const { onChange } = this.props;

      if (scale === 'year' || scale === 'decade') {
        [start, end] = DateFilter.dateToRange(start, scale);
      }

      onChange(start, end);
    });
  }

  render() {
    const { minDate, maxDate, tileContent, tileClassName } = this.props;
    const { start, end, scale } = this.state;

    const datePickerOptions = {
      maxDate,
      minDetail: 'decade',
      maxDetail: scale,
      locale: 'ru-RU',
      tileContent,
      tileClassName,
      showLeadingZeros: true,
    };

    const { xs, sm, md, lg, xl } = this.props;

    return (
      <InputGroup as={Col} {...{ xs, sm, md, lg, xl }}>
        <InputGroup.Prepend>
          <Dropdown>
            <Dropdown.Toggle variant="dark">
              {this.scales[scale]}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {Object.entries(this.scales).map(([key, name]) => (
                <Dropdown.Item
                  key={key}
                  active={key === scale}
                  onClick={() => this.onChange({
                    start: { $set: null },
                    end: { $set: null },
                    scale: { $set: key },
                  })}
                >
                  {name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </InputGroup.Prepend>
        <Form.Control
          as={DatePicker}
          value={start}
          onChange={(date) => this.onChange({ start: { $set: date } })}
          minDate={minDate}
          {...datePickerOptions}
        />
        {scale === 'month' && (
          <Form.Control
            as={DatePicker}
            value={end}
            onChange={(date) => this.onChange({ end: { $set: date } })}
            minDate={start || minDate}
            {...datePickerOptions}
          />
        )}
        {start && (
          <InputGroup.Append>
            <Button
              variant="danger"
              onClick={() => this.onChange({
                start: { $set: null },
                end: { $set: null },
                scale: { $set: 'year' },
              })}
            >x
            </Button>
          </InputGroup.Append>
        )}
      </InputGroup>
    );
  }
}
