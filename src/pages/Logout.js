import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import { compose } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../store/actions';
import { withTranslation } from 'react-i18next';

class Logout extends Component {
  state = {
    isLoggedOut: true
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.isAuthenticated !== this.props.isAuthenticated) {
      window.location = "https://id.lifelearnplatform.com/logout"
    } else {
      this.setState({ isLoggedOut: false })
    }
  }
  componentDidMount() {
    this.props.onLogout();
  }

  render() {
    if (!this.props.isAuthenticated && !this.state.isLoggedOut) {
      return <Redirect to="/" />
    }
    const { t } = this.props;
    return (
      <div className="loading">{t('signOut')}</div>
    );
  }
}

const mapStateToProps = state => {
  return {
    isAuthenticated: state.auth.isAuthenticated
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onLogout: () => dispatch(actions.logout())
  }
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation()
)(Logout);
