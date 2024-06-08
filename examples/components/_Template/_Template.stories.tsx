// @ts-nocheck

import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import _Template from './_Template';

/**
 * Component Stories Meta
 *
 * Describes and sets up the `_Template` component's stories.
 */
export default {
  title: 'Components/_Template',
  component: _Template,
} as ComponentMeta<typeof _Template>;

/**
 * Component Stories Template
 *
 * This is the template that all `_Template` component stories
 * will use.
 */
const Template: ComponentStory<typeof _Template> = (args) => <_Template {...args} />;

/**
 * Playground
 *
 * This is the base story for the `_Template` component. It
 * extends the component stories template and is intended to
 * be a single place to develop and play with the props.
 */
export const Playground = Template.bind({});
Playground.args = {};
