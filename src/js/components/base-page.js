import React from 'react';
import PropTypes from 'prop-types';
import { Badge, Col, Container, Nav, Navbar, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import QuickSearch from './quick-search';
import config from '../../../config/config.json';

export default class BasePage extends React.Component {
  static propTypes = {
    fluid: PropTypes.bool,
    flex: PropTypes.bool,
    noFooter: PropTypes.bool,
  }

  static defaultProps = {
    fluid: false,
    flex: false,
    noFooter: false,
  }

  static footer() {
    return (
      <footer className="page-footer font-small bg-dark text-white pt-4">
        <Container>
          <Row>
            <Col md={6}>
              <h5 className="text-uppercase">Полезные ссылки</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="https://github.com/TheDrHax/BlackSilverUfa/">
                    <i className="fab fa-github" />
                    {' '}
                    Репозиторий GitHub
                  </a>
                </li>
                <li>
                  <a href="https://t.me/BlackUFA_Monitor">
                    <i className="fab fa-telegram" />
                    {' '}
                    Канал BlackUFA_Monitor
                  </a>
                </li>
                <li>
                  <a href="https://matomo.thedrhax.pw/index.php?module=CoreAdminHome&action=optOut&language=ru">
                    Отказ от участия в статистике сайта
                  </a>
                </li>
              </ul>
            </Col>
            <Col lg={3} md={6}>
              <h5 className="text-uppercase">Каналы Артура</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="https://www.youtube.com/user/BlackSilverUFA">
                    <i className="fab fa-youtube" />
                    {' '}
                    BlackSilverUFA
                  </a>
                </li>
                <li>
                  <a href="https://www.youtube.com/user/BlackSilverChannel">
                    <i className="fab fa-youtube" />
                    {' '}
                    BlackSilverChannel
                  </a>
                </li>
                <li>
                  <a href="https://www.twitch.tv/blackufa/">
                    <i className="fab fa-twitch" />
                    {' '}
                    BlackUFA
                  </a>
                </li>
              </ul>
            </Col>
            <Col lg={3} md={6}>
              <h5 className="text-uppercase">Социальные сети</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="https://vk.com/b_silver">
                    <i className="fab fa-vk" />
                    {' '}
                    Группа ВКонтакте
                  </a>
                </li>
                <li>
                  <a href="https://vk.com/blacksilverufa">
                    <i className="fab fa-vk" />
                    {' '}
                    Страница ВКонтакте
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com/Sempai_Black">
                    <i className="fab fa-twitter" />
                    {' '}
                    Twitter
                  </a>
                </li>
              </ul>
            </Col>
          </Row>
        </Container>
        <div className="footer-copyright py-3 text-center small">
          <i className="far fa-copyright" />
          {' '}
          2017-
          {new Date().getFullYear()}
          , Дмитрий Карих. Весь контент принадлежит Артуру Блэку. Разрешение на
          его обработку предоставлено в
          {' '}
          <a href="https://www.youtube.com/watch?v=Bxj09aAOFaI&lc=UgwQmdNhl4TMNn9-Gg94AaABAg.8ZY93MRq32E8ZY9W3KGSJS">
            комментарии
          </a>
          {' '}
          (
          <a href="/static/images/answer.jpg">скриншот</a>
          ).
        </div>
      </footer>
    );
  }

  render() {
    const { fluid, flex, noFooter, children } = this.props;

    const containerClassNames = ['main-content'];

    if (flex) {
      containerClassNames.push('d-flex');
    }

    return (
      <>
        <div className="navbar-space">{/* floating navbar workaround */}</div>
        <Navbar variant="dark" expand="sm" fixed="top">
          <Container>
            <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
              {config.title}
              <Badge variant="warning" className="ml-2">beta</Badge>
            </Navbar.Brand>
            <Navbar.Toggle />

            <Navbar.Collapse id="navbar-collapse">
              <Nav className="mr-auto" />
              <QuickSearch />
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <Container fluid={fluid} className={containerClassNames}>
          {children}
        </Container>
        {!noFooter && BasePage.footer()}
      </>
    );
  }
}
