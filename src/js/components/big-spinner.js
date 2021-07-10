import React from 'react';
import { Spinner } from 'react-bootstrap';
import BasePage from './base-page';

export default function BigSpinner() {
  return (
    <BasePage flex>
      <div className="flex-grow-1 d-flex justify-content-center align-items-center">
        <Spinner variant="primary" animation="border" size="xl" />
      </div>
    </BasePage>
  );
}
