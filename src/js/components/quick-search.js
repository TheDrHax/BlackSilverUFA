import React from 'react';
import getHistory from 'react-router-global-history';
import { Form } from 'react-bootstrap';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { Data } from '../data';
import fts from '../utils/full-text-search';
import Matomo from '../matomo';

export default class QuickSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      index: null,
      segments: null,
      query: {
        text: null,
        count: 0,
      },
      suggestions: [],
    };

    this.fetch = this.fetch.bind(this);
    this.onItemSelected = this.onItemSelected.bind(this);
  }

  componentDidMount() {
    Data.then(({ index, segments }) => {
      this.setState({
        loaded: true,
        index,
        segments,
      });
    });
  }

  fetch(query) {
    const { index, segments } = this.state;

    if (query.length < 2) {
      this.clear();
      return;
    }

    let suggestions;

    if (!Number.isNaN(+query)) { // by stream ID
      suggestions = segments.chain()
        .find({ streams: { $contains: query } })
        .where((segment) => segment.games.length > 0)
        .data()
        .map(({ name, url }) => ({
          name,
          url,
        }));
    } else {
      suggestions = index.chain()
        .where((item) => item.category.search !== false)
        .simplesort('date', { desc: true })
        .data();

      suggestions = fts(
        query,
        suggestions,
        (item) => item.name,
      ).map(({ name, url }) => ({
        name,
        url,
      }));
    }

    this.setState({
      suggestions,
      query: {
        text: query,
        count: suggestions.length,
      },
    });
  }

  onItemSelected(items) {
    if (items.length > 0) {
      const { query: { text, count } } = this.state;
      Matomo.trackSiteSearch({
        keyword: text,
        category: 'quick-search',
        count,
      });

      const history = getHistory();
      history.push(items[0].url);
    }
  }

  render() {
    const { loaded } = this.state;

    if (!loaded) {
      return null;
    }

    const { suggestions } = this.state;

    return (
      <Form
        ref={this.container}
        inline
        autoComplete="false"
        onSubmit={(e) => e.preventDefault()}
      >
        <AsyncTypeahead
          id="быстрый переход"
          filterBy={() => true}
          isLoading={false}
          delay={0}
          labelKey="name"
          minLength={2}
          paginate
          maxResults={20}
          onSearch={this.fetch}
          options={suggestions}
          placeholder="Быстрый переход"
          emptyLabel="Ничего не найдено"
          promptText="Идёт поиск..."
          paginationText="Показать ещё"
          renderMenuItemChildren={(option) => (
            // TODO: Добавить дату и количество стримов
            <span>{option.name}</span>
          )}
          flip
          highlightOnlyResult
          onChange={this.onItemSelected}
        />
      </Form>
    );
  }
}
