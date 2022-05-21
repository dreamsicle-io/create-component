import React from 'react';
import classNames from 'classnames';
import './_Template.scss';

export interface Props {
  id?: string;
  className?: string;
  children?: React.ReactNode;
}

export interface State {}

/**
 * Components / _Template
 *
 * Describe the `_Template` component's use cases here.
 * Include what it does, why it was developed, and why
 * it's awesome.
 *
 * @since _version Added by the `create-component` script on `_date`
 */
class _Template extends React.Component<Props, State> {
  static defaultProps: Props = {};

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const { id, className, children } = this.props;
    const {} = this.state;
    const containerClass = classNames('_Template', className);
    return (
      <div id={id} className={containerClass}>
        <h3>
          Hello from the <code>_Template</code> component.
        </h3>
        {children}
      </div>
    );
  }
}

export default _Template;
