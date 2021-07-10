import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Col, Row } from 'react-bootstrap';
import { zip } from 'lodash';
import { Data } from '../data';
import config from '../../../config/config.json';
import BasePage from './base-page';
import updateState from '../utils/update-state';
import Matomo from '../matomo';

export default class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      name: null,
      segments: null,
      segmentRefs: [],
    };

    this.renderRefCard = this.renderRefCard.bind(this);
  }

  loadData() {
    const { match: { params: { game: gameId } } } = this.props;

    Data.then(({ games, segments }) => {
      const game = games.by('id', gameId);

      document.title = `${game.name} | ${config.title}`;

      Matomo.trackPageView();

      updateState(this, {
        loaded: { $set: true },
        name: { $set: game.name },
        segments: { $set: game.streams.map((ref) => segments.by('segment', ref.segment)) },
        segmentRefs: { $set: game.streams },
      });
    });
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    const { match: { params } } = this.props;
    const { match: { params: prevParams } } = prevProps;

    if (params.game !== prevParams.game) {
      this.loadData();
    }
  }

  renderRefCard([ref, segment]) {
    const { match: { url } } = this.props;

    return (
      <Col className="col-card" xs={6} md={4} lg={3} xl={2} key={ref.segment}>
        <Card>
          <Link to={`${url}/${ref.segment}`}>
            <Card.Img variant="top" src={segment.thumbnail} />
            <Card.ImgOverlay className="overlay-transparent-bottom bg-dark text-white">
              <Card.Text>{ref.name}</Card.Text>
            </Card.ImgOverlay>
          </Link>
        </Card>
      </Col>
    );
  }

  render() {
    const { loaded } = this.state;

    if (!loaded) {
      return 'loading...';
    }

    const { name, segments, segmentRefs } = this.state;

    return (
      <BasePage>
        <Row>
          <Col>
            <h1 className="text-white pt-2">{name}</h1>
          </Col>
        </Row>
        <Row className="d-flex">
          {zip(segmentRefs, segments).map(this.renderRefCard)}
        </Row>
      </BasePage>
    );
  }
}
