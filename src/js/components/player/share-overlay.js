import React from 'react';
import { sum, reverse, range, padStart } from 'lodash';
import { Button, Col, Form, InputGroup, Popover } from 'react-bootstrap';

function ptime(t) {
  return sum(reverse(t.split(':')).map((x, i) => x * 60 ** i));
}

function ftime(t) {
  return range(2, -1, -1).map((i) => {
    const res = Math.floor(t / 60 ** i);
    t %= 60 ** i;
    return padStart(res, 2, '0');
  }).join(':');
}

const ShareOverlay = React.forwardRef((props, ref) => {
  const {
    game,
    segment,
    offset,
    currentTime,
    ...otherProps
  } = props;

  const inputRef = React.useRef();
  const time = Math.floor(currentTime);
  const [includeTime, setIncludeTime] = React.useState(true);

  let baseUrl = `https://bsu.us.to/${game}/${segment}`;

  if (includeTime) {
    baseUrl += `?at=${time + offset}`;
  }

  return (
    <Popover ref={ref} {...otherProps} className="share-popover">
      <Popover.Title as="h3">Создать короткую ссылку</Popover.Title>
      <Popover.Content>
        <Form.Row>
          <Col>
            <InputGroup>
              <Form.Control ref={inputRef} readOnly value={baseUrl} />
              <InputGroup.Append>
                <Form.Control
                  as={Button}
                  variant="dark"
                  onClick={() => {
                    const input = inputRef.current;

                    if (input) {
                      input.select();
                      input.setSelectionRange(0, 200);
                      document.execCommand('copy');
                    }
                  }}
                >
                  <i className="fas fa-copy" />
                </Form.Control>
              </InputGroup.Append>
            </InputGroup>
          </Col>
        </Form.Row>

        <Form.Row className="mt-2">
          <Col className="d-flex align-content-center">
            <Form.Check
              className="mr-2"
              type="checkbox"
              label="Начать с таймкода: "
              checked={includeTime}
              onChange={({ target: { checked } }) => setIncludeTime(checked)}
            />

            <Form.Control
              className="time-selector"
              value={ftime(time)}
              size="sm"
              readOnly
              htmlSize={4}
            />
          </Col>
        </Form.Row>
      </Popover.Content>
    </Popover>
  );
});

export { ShareOverlay };
