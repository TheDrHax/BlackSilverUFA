import React from 'react';
import animateScrollTo from 'animated-scroll-to';
import { invert } from 'lodash/object';
import {
  Row,
  Col,
  Form,
  InputGroup,
  Dropdown,
  Button,
  Alert,
  Card,
} from 'react-bootstrap';

import { Data } from '../data';
import fts, { tokenize } from '../utils/full-text-search';
import config from '../../../config/config.json';
import agreeWithNum from '../utils/agree-with-num';
import updateState from '../utils/update-state';
import DateFilter from './search/date-filter';
import BasePage from './base-page';
import {
  SegmentsList,
  GamesList,
  ResultsPagination,
} from './search/results';
import BigSpinner from './big-spinner';
import Matomo from '../matomo';

class InteractiveSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      mode: 'segments',
      data: {
        segments: null,
        categories: null,
        games: null,
      },
      filters: {
        text: '',
        category: 'any',
        dateStart: null,
        dateEnd: null,
      },
      sorting: {
        mode: 'date',
        desc: true,
      },
      results: {
        mode: null,
        items: [],
        page: 0,
      },
    };

    this.submitForm = this.submitForm.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
  }

  loadData() {
    return Data.then(({ segments, categories, index }) => {
      updateState(this, {
        data: { $merge: { segments, categories, index } },
        loaded: { $set: true },
      });
    });
  }

  async componentDidMount() {
    await this.loadData();
    document.title = `Главная страница | ${config.title}`;
    Matomo.trackPageView();
    this.submitForm();
  }

  submitForm(event) {
    if (event) {
      event.preventDefault();
    }

    const { mode, data: { segments, index }, filters } = this.state;
    let chain;

    if (mode === 'segments') {
      chain = segments.chain();

      {
        const { filters: { dateStart, dateEnd } } = this.state;

        if (dateStart) {
          if (dateEnd) {
            chain = chain.find({
              date: { $between: [dateStart, dateEnd] },
            });
          } else {
            chain = chain.find({ date: { $dteq: dateStart } });
          }
        }
      }

      chain = chain.find({ games: { $size: { $gt: 0 } } });
    } else if (mode === 'games') {
      chain = index.chain();

      const { category } = filters;
      if (category !== 'any') {
        chain = chain.find({ 'category.id': category });
      }

      chain = chain.where((item) => item.category.search !== false);
    }

    {
      const { sorting: { mode: sortMode, desc } } = this.state;

      if (sortMode === 'date') {
        chain = chain.compoundsort([['date', desc], ['segment', desc]]);
      } else if (sortMode === 'stream_count' && mode === 'games') {
        chain = chain.compoundsort([['streams', desc], ['date', desc], ['segment', desc]]);
      }
    }

    let results = chain.data();

    {
      const { filters: { text } } = this.state;

      if (tokenize(text).length > 0) {
        results = fts(text, results, ({ name }) => name);

        if (event) {
          Matomo.trackSiteSearch({
            keyword: text,
            category: mode,
            count: results.length,
          });
        }
      }
    }

    updateState(this, {
      results: {
        $merge: {
          mode,
          items: results,
          page: 0,
        },
      },
    });
  }

  filters() {
    const {
      data: { segments, categories },
      mode, filters, sorting,
    } = this.state;

    const components = [];

    if (mode === 'segments') {
      const minDate = new Date(segments.min('date'));
      const maxDate = new Date(segments.max('date'));

      components.push(
        <DateFilter
          key="date"
          xs={12}
          sm={8}
          md={6}
          lg={4}
          minDate={minDate}
          maxDate={maxDate}
          tileContent={({ date, view }) => {
            if (view === 'month' || date > maxDate) return null;
            const range = DateFilter.dateToRange(date, view);
            const count = segments.count({ date: { $between: range } });
            return (
              <div>
                {count}
                {' '}
                {agreeWithNum(count, 'стрим', ['', 'а', 'ов'])}
              </div>
            );
          }}
          tileClassName={({ date, view }) => {
            if (view !== 'month') return null;
            const count = segments.count({ date: { $dteq: date } });
            return count > 0 ? 'bg-lightgreen' : 'bg-lightcoral';
          }}
          onChange={(start, end) => updateState(this, {
            filters: {
              dateStart: { $set: start },
              dateEnd: { $set: end },
            },
          }, this.submitForm)}
        />,
      );
    } else if (mode === 'games') {
      const { category } = filters;

      const catMap = Object.assign({ any: 'Любая' },
        ...Object.values(categories.data)
          .filter(({ search }) => search !== false)
          .map(({ id, name }) => ({ [id]: name })));

      const invCatMap = invert(catMap);

      components.push(
        <InputGroup key="category" xs={12} sm={8} md={6} lg={4} as={Col}>
          <InputGroup.Prepend>
            <InputGroup.Text>Категория:</InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            as="select"
            custom
            value={catMap[category]}
            onChange={({ target: { value } }) => updateState(this, {
              filters: { category: { $set: invCatMap[value] } },
            }, this.submitForm)}
          >
            {Object.entries(catMap).map(([key, name]) => (
              <option key={key}>{name}</option>
            ))}
          </Form.Control>
        </InputGroup>,
      );
    }

    {
      const { mode: sortMode, desc } = sorting;

      const sortModes = {
        date: 'дата',
      };

      if (mode === 'games') {
        sortModes.stream_count = 'стримы';
      }

      const invSortModes = invert(sortModes);

      components.push(
        <InputGroup key="sorting" xs={12} sm={8} md={6} lg={4} as={Col}>
          <InputGroup.Prepend>
            <InputGroup.Text>Сортировка:</InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            as="select"
            custom
            value={sortModes[sortMode]}
            onChange={({ target: { value } }) => updateState(this, {
              sorting: { mode: { $set: invSortModes[value] } },
            }, this.submitForm)}
          >
            {Object.entries(sortModes).map(([key, name]) => (
              <option key={key}>{name}</option>
            ))}
          </Form.Control>
          <InputGroup.Append>
            <Button
              variant="dark"
              onClick={() => updateState(this, {
                sorting: { $toggle: ['desc'] },
              }, this.submitForm)}
            >
              {desc ? (
                <i className="fas fa-sort-amount-down" />
              ) : (
                <i className="fas fa-sort-amount-up" />
              )}
            </Button>
          </InputGroup.Append>
        </InputGroup>,
      );
    }

    return <Form.Row>{components}</Form.Row>;
  }

  inputForm() {
    const { mode } = this.state;

    return (
      <Form onSubmit={this.submitForm}>
        <InputGroup>
          <InputGroup.Prepend>
            <Dropdown>
              <Dropdown.Toggle variant="success">
                {mode === 'segments' ? 'Стримы' : 'Игры'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  active={mode === 'segments'}
                  onClick={() => updateState(this, {
                    mode: { $set: 'segments' },
                    sorting: {
                      mode: { $set: 'date' },
                    },
                  }, this.submitForm)}
                >
                  Стримы
                </Dropdown.Item>
                <Dropdown.Item
                  active={mode === 'games'}
                  onClick={() => updateState(this, {
                    mode: { $set: 'games' },
                    sorting: {
                      mode: { $set: 'date' },
                    },
                  }, this.submitForm)}
                >
                  Игры
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </InputGroup.Prepend>
          <Form.Control
            onChange={(event) => updateState(this, {
              filters: { text: { $set: event.target.value } },
            })}
            onKeyPress={(event) => { if (event.code === 'Enter') this.submitForm(event); }}
            type="text"
            placeholder="Поиск по названию"
          />
          <InputGroup.Append>
            <Button variant="primary" onClick={this.submitForm}>Найти</Button>
          </InputGroup.Append>
        </InputGroup>
        {this.filters()}
      </Form>
    );
  }

  onPageChange(newPage) {
    updateState(this, {
      results: {
        page: { $set: newPage },
      },
    });

    animateScrollTo(0);
  }

  render() {
    const { data, loaded, results: { items, page, mode } } = this.state;

    if (!loaded) {
      return <BigSpinner />;
    }

    let renderer = null;
    if (mode === 'segments') {
      renderer = SegmentsList;
    } if (mode === 'games') {
      renderer = GamesList;
    }

    return (
      <BasePage>
        <Row className="pt-3">
          <Col>
            <Alert variant="dark">
              Поиск ещё находится на стадии разработки. Я планирую добавить больше
              фильтров, сортировку результатов и доработать оформление :)
            </Alert>
          </Col>
        </Row>
        <Row className="interactive-search-form">
          <Col>
            <Card className="w-100 h-0 pl-3 pr-3 pt-3 pb-2">
              {this.inputForm()}
            </Card>
          </Col>
        </Row>
        {renderer ? (
          <ResultsPagination
            items={items}
            page={page}
            onPageChange={this.onPageChange}
            max={10}
            renderer={renderer}
            rendererProps={{ data: { ...data } }}
          />
        ) : null}
      </BasePage>
    );
  }
}

export default InteractiveSearch;
