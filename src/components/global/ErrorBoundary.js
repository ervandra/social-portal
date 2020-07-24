import React, { Component } from 'react';
import * as Sentry from '@sentry/browser';
import { withTranslation } from "react-i18next";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(err, info) {
    this.setState({ hasError: true });
    Sentry.captureException(err);
  }

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return <h3>{t('error')}</h3>;
    }
    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary)