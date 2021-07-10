import { find } from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  Accordion,
  Button,
  Col,
  ListGroup,
  OverlayTrigger,
  Row,
  Tab,
  Tabs,
  Tooltip,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import MediaQuery from 'react-responsive';
import { Rnd } from 'react-rnd';
import { Data } from '../data';
import SavedPosition from '../utils/saved-position';
import Persist from '../utils/persist';
import BasePage from './base-page';
import Chat from './player/chat';
import Player from './player/player';
import Timecodes from './player/timecodes';
import Scroll from './player/scroll';
import Playlist from './player/playlist';
import Reparentable from './utils/reparentable';
import config from '../../../config/config.json';
import BigSpinner from './big-spinner';
import Matomo from '../matomo';
import Sugar from '../utils/sugar';
import updateState from '../utils/update-state';
import { ShareOverlay } from './player/share-overlay';

export default class SegmentPlayer extends React.Component {
  createChatContainer() {
    const chatContainer = document.createElement('div');

    chatContainer.style.height = '100%';
    chatContainer.style.display = 'flex';
    chatContainer.style.flexDirection = 'column';

    return chatContainer;
  }

  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      fullscreen: false,
      segment: null,
      segmentRef: null,
      playlists: null,
      timecodes: null,
      currentTime: 0,
      setTime: null,
      playlistAccordion: null,
      ...Persist.load('SegmentPlayer', {
        chatOverlay: {
          width: null,
          height: null,
          x: null,
          y: null,
        },
        sidebarCollapsed: false,
      }),
    };

    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.renderPlayerOverlay = this.renderPlayerOverlay.bind(this);
    this.onPlaylistAccordionSelect = this.onPlaylistAccordionSelect.bind(this);

    this.chatContainer = this.createChatContainer();
  }

  resolveUrl({ segments, games }) {
    const { location: { search: reqSearch } } = this.props;
    const search = new URLSearchParams(reqSearch);
    const params = {
      at: +search.get('at'),
      t: +search.get('t'),
    };
    let redirect = false;
    let {
      match: {
        params: {
          game: gameId,
          segment: segmentId,
        },
      },
    } = this.props;

    // Handle missing segments
    if (!segments.by('segment', segmentId)) {
      let found = false;

      if (segmentId.indexOf(',') !== -1) {
        const joinedParts = segmentId.split(',');

        for (let i = 0; i < joinedParts.length; i += 1) {
          const part = joinedParts[i];

          if (segments.by('segment', part)) {
            segmentId = part;
            redirect = true;
            found = true;
            break;
          }
        }
      } else if (segmentId.indexOf('.') !== -1) {
        const mainSegment = segmentId.substr(0, segmentId.indexOf('.'));

        if (segments.by('segment', mainSegment)) {
          segmentId = mainSegment;
          redirect = true;
          found = true;
        }
      }

      if (!found) {
        return null;
      }
    }

    // Handle segments without refs
    if (segments.by('segment', segmentId).games.length === 0) {
      let found = false;

      // Redirect to joined streams
      const candidates = segments.chain()
        .find({ segment: { $contains: ',' } })
        .where((s) => s.segment.split(',').indexOf(segmentId) !== -1)
        .data()
        .map((s) => s.segment);

      if (candidates.length > 0) {
        const oldSegmentId = segmentId;
        [segmentId] = candidates;
        redirect = true;
        found = true;

        // Rebase timestamp
        if (params.at) {
          const segment = segments.by('segment', segmentId);
          const index = segmentId.split(',').indexOf(oldSegmentId);

          const t = params.at;
          let offset = segment.offsets[index];

          if (segment.cuts) {
            segment.cuts
              .filter(([start, end]) => end <= t + offset)
              .forEach(([start, end]) => {
                offset -= end - start;
              });
          }

          params.at = t + offset;
          redirect = true;
        }
      }

      if (!found) {
        return null;
      }
    }

    const segment = segments.by('segment', segmentId);

    // Handle missing or unknown game
    if (!games.by('id', gameId) || segment.games.indexOf(gameId) === -1) {
      [gameId] = segments.by('segment', segmentId).games;
      redirect = true;
    }

    const game = games.by('id', gameId);
    const segmentRef = find(game.streams, (ref) => ref.segment === segmentId);

    let newUrl = null;

    if (redirect) {
      newUrl = `/play/${gameId}/${segmentId}`;
      if (params.at) {
        newUrl += `?at=${params.at}`;
      } else if (params.t) {
        newUrl += `?t=${params.t}`;
      }
    }

    return {
      segment,
      game,
      segmentRef,
      params,
      redirect: newUrl,
    };
  }

  loadData() {
    Data.then(({ segments, timecodes, games }) => {
      const { history } = this.props;
      const request = this.resolveUrl({ segments, games });

      if (!request) {
        history.replace('/404');
        return;
      }

      if (request.redirect) {
        history.replace(request.redirect);
      }

      const {
        game,
        segment,
        segmentRef,
        params,
      } = request;

      const relatedGames = segment.games.map((gameId) => games.by('id', gameId));

      let playlists = relatedGames.map((relatedGame) => relatedGame.streams.map((ref) => ({
        ref,
        segment: segments.by('segment', ref.segment),
      })));

      if (playlists.length === 0) {
        playlists = null;
      }

      document.title = `${segmentRef.name} | ${game.name} | ${config.title}`;

      Matomo.trackPageView();

      this.setState({
        loaded: true,
        segment,
        game,
        segmentRef,
        playlists,
        playlistAccordion: game.id,
        params,
        savedPositionAdapter: new SavedPosition(segment),
        timecodes: timecodes[segment.segment],
      });
    });
  }

  componentDidMount() {
    this.loadData();
  }

  shouldComponentUpdate(prevProps, nextState) {
    Persist.save('SegmentPlayer', this.state, nextState, [
      'chatOverlay',
      'sidebarCollapsed',
    ]);

    return true;
  }

  componentDidUpdate(prevProps) {
    const { match: { params } } = this.props;
    const { match: { params: prevParams } } = prevProps;

    if (params.segment !== prevParams.segment) {
      this.loadData();
    } else if (params.game !== prevParams.game) {
      this.loadData();
    }
  }

  toggleSidebar() {
    const { sidebarCollapsed } = this.state;

    if (!sidebarCollapsed) { // collapse immediately
      const { pointerEvents } = document.body.style;

      // release focus
      document.activeElement.blur();

      // release hover for 100ms
      document.body.style.pointerEvents = 'none';
      setTimeout(() => {
        document.body.style.pointerEvents = pointerEvents;
      }, 100);
    }

    this.setState({ sidebarCollapsed: !sidebarCollapsed });
  }

  renderPlayer() {
    const {
      segmentRef: {
        start, end,
        force_start: forceStart,
      },
      segment: {
        youtube, direct,
        abs_start: offset,
      },
      params: {
        t, at,
      },
      savedPositionAdapter,
    } = this.state;

    let autostart = null;

    if (at) {
      autostart = at - offset;
    } else if (t) {
      autostart = t;
    }

    const playerProps = {
      youtube,
      direct,
      start,
      autostart,
      end,
      forceStart,
      savedPositionAdapter,
      onTimeChange: (time) => this.setState({ currentTime: time }),
      onReady: (plyr) => {
        this.setState({
          setTime: (ts) => {
            plyr.currentTime = ts;
            plyr.play();
          },
          toggleFullscreen: () => plyr.fullscreen.toggle(),
        });
      },
      onFullScreen: (fullscreen) => this.setState({ fullscreen }),
      onDestroy: () => this.setState({
        setTime: null,
        currentTime: 0,
      }),
      renderOverlay: this.renderPlayerOverlay,
    };

    return (
      <Row>
        <Col>
          <Player {...playerProps} />
        </Col>
      </Row>
    );
  }

  renderPlayerOverlay({ width, height }) {
    const {
      fullscreen,
      segment: {
        subtitles,
      },
      chatOverlay: ol,
    } = this.state;

    if (!fullscreen || !subtitles) {
      return null;
    }

    return (
      <Rnd
        className="chat-overlay"
        position={{
          x: ol.x !== null ? ol.x * width : 0,
          y: ol.y !== null ? ol.y * height : 0.65 * height,
        }}
        size={{
          width: ol.width ? `${ol.width * 100}%` : '35%',
          height: ol.height ? `${ol.height * 100}%` : '35%',
        }}
        onDragStop={(e, { x, y }) => {
          updateState(this, {
            chatOverlay: {
              $merge: {
                x: x / width,
                y: y / height,
              }
            },
          });
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          updateState(this, {
            chatOverlay: {
              $merge: {
                width: ref.offsetWidth / width,
                height: ref.offsetHeight / height,
                x: position.x / width,
                y: position.y / height,
              },
            },
          });
        }}
        bounds="parent"
      >
        {this.renderChat()}
      </Rnd>
    );
  }

  renderPlayerControls() {
    const {
      toggleFullscreen,
      segment: { segment, abs_start: absStart },
      game: { id: game },
      currentTime,
    } = this.state;

    return (
      <Row className="no-gutters">
        <Col>
          <div className="player-controls border-top border-bottom">
            <div className="flex-grow-1" />

            <OverlayTrigger
              trigger="click"
              rootClose
              placement="top"
              overlay={(
                <ShareOverlay
                  game={game}
                  segment={segment}
                  offset={absStart}
                  currentTime={currentTime}
                />
              )}
            >
              <Button variant="dark" size="sm" className="mr-2">
                <i className="fas fa-share-square" />
                <span>Поделиться</span>
              </Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement="top"
              overlay={(props) => (
                <Tooltip {...props}>
                  Развернуть плеер на весь экран
                </Tooltip>
              )}
            >
              <Button variant="dark" size="sm" onClick={toggleFullscreen}>
                <i className="fas fa-expand" />
                <span>На весь экран</span>
              </Button>
            </OverlayTrigger>
          </div>
        </Col>
      </Row>
    );
  }

  renderChat() {
    const {
      fullscreen,
      currentTime,
      segment: {
        subtitles,
        abs_start: absStart,
      },
    } = this.state;

    const header = (
      <div className="sidebar-header">
        Чат
      </div>
    );

    if (!subtitles) {
      return (
        <>
          {header}
          <div className="p-4 flex-grow-1 align-self-center text-white">
            Для этого стрима нет записи чата :(
          </div>
        </>
      );
    }

    return (
      <>
        {!fullscreen && header}
        <Chat
          currentTime={currentTime}
          offset={-absStart}
          subtitles={subtitles}
          simple={fullscreen}
        />
      </>
    );
  }

  renderTimecodes() {
    const {
      timecodes, setTime, currentTime,
    } = this.state;

    return (
      <>
        <div className="sidebar-header">
          Таймкоды
        </div>
        <Scroll flex="1 1 0">
          <Timecodes
            data={timecodes}
            setTime={setTime}
            currentTime={currentTime}
          />
        </Scroll>
      </>
    );
  }

  onPlaylistAccordionSelect(eventKey) {
    this.setState({ playlistAccordion: eventKey });
  }

  renderPlaylist({ autoExpand = false, fullHeight = false } = {}) {
    const {
      segmentRef,
      playlists,
      playlistAccordion,
    } = this.state;

    if (!playlists) return null;

    const playlistComp = (
      playlists && playlists.map((playlist) => {
        const { ref: { game: { id } } } = playlist[0];

        return (
          <Playlist
            key={id}
            id={id}
            items={playlist}
            activeItem={find(playlist, ({ ref }) => ref.segment === segmentRef.segment)}
            fullHeight={fullHeight}
            opened={playlistAccordion === id}
          />
        );
      })
    );

    return (
      <>
        <div className="sidebar-header">
          Плейлист
        </div>
        <Accordion
          onSelect={this.onPlaylistAccordionSelect}
          activeKey={autoExpand ? playlistAccordion : undefined}
          className={fullHeight ? 'h-100 d-flex flex-column' : undefined}
        >
          {playlistComp}
        </Accordion>
      </>
    );
  }

  renderLeftSidebar() {
    const {
      sidebarCollapsed,
      timecodes,
      playlists,
      segment: {
        subtitles,
      },
    } = this.state;

    const leftSidebarClasses = [
      'col-sidebar border-right',
      sidebarCollapsed ? 'collapsed' : '',
    ].join(' ');

    if (!subtitles) { // move all content to right sidebar
      return null;
    }

    return (
      <>
        {(timecodes || playlists) && (
          <MediaQuery minDeviceWidth={1200}>
            <Col className={leftSidebarClasses} tabIndex="0">
              <div className="sidebar-row-overlay flex-row-reverse">
                <Button
                  variant="link"
                  size="sm"
                  onClick={this.toggleSidebar}
                >
                  {sidebarCollapsed ? (
                    <i className="fas fa-caret-square-right" />
                  ) : (
                    <i className="fas fa-caret-square-left" />
                  )}
                </Button>
              </div>

              {playlists && this.renderPlaylist()}
              {timecodes && this.renderTimecodes()}

              <div className="collapsed-content">
                {playlists && (
                  <div className="sidebar-header">Плейлист</div>
                )}
                {timecodes && (
                  <div className="sidebar-header">Таймкоды</div>
                )}
              </div>
            </Col>
            {sidebarCollapsed && (
              <div className="sidebar-placeholder" />
            )}
          </MediaQuery>
        )}

        {(timecodes || playlists) && (
          <MediaQuery minDeviceWidth={768} maxDeviceWidth={1199}>
            <Col className="col-sidebar border-right collapsed" tabIndex="0">
              {playlists && this.renderPlaylist()}
              {timecodes && this.renderTimecodes()}

              <div className="collapsed-content">
                {playlists && (
                  <div className="sidebar-header">Плейлист</div>
                )}
                {timecodes && (
                  <div className="sidebar-header">Таймкоды</div>
                )}
              </div>
            </Col>
            <div className="sidebar-placeholder" />
          </MediaQuery>
        )}
      </>
    );
  }

  renderRightSidebar() {
    const {
      chatContainer,
      state: {
        fullscreen,
        playlists,
        timecodes,
        segment: {
          subtitles,
        },
      },
    } = this;

    if (!subtitles && !playlists && !timecodes) {
      return null;
    }

    return (
      <MediaQuery minDeviceWidth={768}>
        <Col className="col-sidebar-wide border-left">
          {(subtitles && !fullscreen) && (
            <Reparentable el={chatContainer} className="flex-1-1-0" />
          )}
          {(!subtitles && playlists) && this.renderPlaylist()}
          {(!subtitles && timecodes) && this.renderTimecodes()}
        </Col>
      </MediaQuery>
    );
  }

  renderDescription() {
    const {
      game,
      segment,
      segmentRef,
    } = this.state;

    return (
      <Row className="stream-description">
        <Col>
          <h3>
            <Link to={`/play/${game.id}`}>{game.name}</Link>
            <span> — </span>
            <span className="flex-grow-1">{segmentRef.name}</span>
          </h3>

          <ListGroup variant="flush" size="sm">
            <ListGroup.Item>
              Дата стрима:
              {' '}
              {Sugar.Date.medium(segment.date)}
              {' '}
              ({Sugar.Date.relative(segment.date)})
            </ListGroup.Item>

            {!segment.segment.startsWith('00') ? (
              <ListGroup.Item>
                Источник стрима:
                {' '}
                <a href={`https://twitch.tv/videos/${segment.segment}`} target="blank">
                  <i className="fab fa-twitch" />
                  <span>Twitch</span>
                </a>
                {' '}
                (ID: <code>{segment.segment}</code>)
              </ListGroup.Item>
            ) : (
              <ListGroup.Item>
                ID стрима: <code>{segment.segment}</code>
              </ListGroup.Item>
            )}

            <ListGroup.Item>
              Источник записи:
              {' '}
              {segment.youtube ? (
                <>
                  <a href={`https://youtu.be/${segment.youtube}`} target="blank">
                    <i className="fab fa-youtube" />
                    <span>YouTube</span>
                  </a>
                  {' '}
                  ({segment.official === false ? 'неофициальный' : 'официальный'} канал)
                </>
              ) : (
                <a href={segment.direct}>
                  <i className="fas fa-link" />
                  <span>Прямая ссылка</span>
                </a>
              )}
            </ListGroup.Item>

            {segment.torrent && (
              <ListGroup.Item>
                Торрент:
                {' '}
                <a href={segment.torrent}>
                  <i className="fas fa-download" />
                  <span>Скачать</span>
                </a>
              </ListGroup.Item>
            )}
          </ListGroup>
        </Col>
      </Row>
    );
  }

  renderBelowPlayer() {
    const {
      chatContainer,
      state: {
        fullscreen,
        playlists,
        timecodes,
        segment: {
          subtitles,
        },
      },
    } = this;

    return (
      <>
        <MediaQuery minDeviceWidth={768}>
          {this.renderDescription()}
        </MediaQuery>

        <MediaQuery maxDeviceWidth={767}>
          <MediaQuery maxDeviceWidth={575}>
            {(subtitlesInTab) => (
              <Row className="flex-grow-1 flex-shrink-1 no-gutters">
                <Col className="sidebar-content">
                  <Tabs mountOnEnter>
                    <Tab eventKey="description" title="Описание">
                      {!subtitlesInTab ? (
                        <Scroll flex="1 1 0">
                          {this.renderDescription()}
                        </Scroll>
                      ) : this.renderDescription()}
                    </Tab>

                    {timecodes && (
                      <Tab eventKey="timecodes" title="Таймкоды">
                        {this.renderTimecodes()}
                      </Tab>
                    )}

                    {playlists && (
                      <Tab eventKey="playlist" title="Плейлист">
                        {this.renderPlaylist({
                          autoExpand: true,
                          fullHeight: true,
                        })}
                      </Tab>
                    )}

                    {subtitles && subtitlesInTab && (
                      <Tab eventKey="chat" title="Чат">
                        {!fullscreen && (
                          <Reparentable el={chatContainer} className="flex-1-1-0" />
                        )}
                      </Tab>
                    )}
                  </Tabs>
                </Col>

                {subtitles && !subtitlesInTab && (
                  <Col className="sidebar-content border-left">
                    {!fullscreen && (
                      <Reparentable el={chatContainer} className="flex-1-1-0" />
                    )}
                  </Col>
                )}
              </Row>
            )}
          </MediaQuery>
        </MediaQuery>
      </>
    );
  }

  render() {
    const { loaded } = this.state;

    if (!loaded) {
      return <BigSpinner />;
    }

    const {
      chatContainer,
      state: {
        segment: {
          subtitles,
        },
      },
    } = this;

    return (
      <BasePage fluid flex noFooter>
        {subtitles && ReactDOM.createPortal(this.renderChat(), chatContainer)}

        <Row className="flex-grow-1 no-gutters">
          {this.renderLeftSidebar()}

          <Col className="d-flex flex-column">
            {this.renderPlayer()} {/* Can't be moved without reloading */}
            {this.renderPlayerControls()}
            {this.renderBelowPlayer()}
          </Col>

          {this.renderRightSidebar()}
        </Row>
      </BasePage>
    );
  }
}
