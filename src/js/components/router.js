import React from 'react';

import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom';

import { ReactRouterGlobalHistory } from 'react-router-global-history';
import { Button } from 'react-bootstrap';

import InteractiveSearch from './interactive-search';
import Game from './game';
import SegmentPlayer from './segment-player';
import { RedirectLinks, RedirectR } from './redirects';
import BasePage from './base-page';

export default class App extends React.PureComponent {
  render() {
    return (
      <Router>
        <ReactRouterGlobalHistory />
        <Switch>
          <Route path="/play/:game/:segment" component={SegmentPlayer} />
          <Route path="/play/:game" component={Game} />
          <Route path="/links/:game.html" component={RedirectLinks} />
          <Route path="/r" component={RedirectR} />
          <Route exact path="/" component={InteractiveSearch} />
          <Route path="*">
            <BasePage flex>
              <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                <h3 className="text-white">
                  Страница не найдена
                </h3>
                <Button variant="primary" as={Link} to="/" className="mt-4">
                  Вернуться на главную
                </Button>
              </div>
            </BasePage>
          </Route>
        </Switch>
      </Router>
    );
  }
}
