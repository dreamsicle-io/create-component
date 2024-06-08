// @ts-nocheck

import React from 'react';
import { render } from '@testing-library/react';
import _Template from './_Template';

/**
 * Renders with required props
 *
 * This test passes when the `_Template` component renders with it's
 * required props without crashing.
 */
test('renders with required props', () => {
  render(<_Template />);
});
