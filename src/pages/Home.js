import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Navigation from '../components/layouts/Navigation';
import { compose } from 'redux';
import { Link } from 'react-router-dom';

import LearningImg from '../assets/images/learning.png';

class Home extends Component {
  render() {
    const { t } = this.props;
    return (
      <div className="container" fluid>
        <Navigation type="static" title={t('homepage')} style={{ background: '#ffffff' }} />
        <div className="grid-container">
          <div className="grid-x grid-margin-x">
            <div className="cell">
              <div
                style={{ padding: '2rem 0', minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
                vertical
              >
                <img src={LearningImg} centered style={{ marginBottom: '2rem', width: '180px' }} size="large" alt="Onboarding" />
                <h1>Welcome to LifeLearn</h1>
                <p style={{ marginBottom: '3rem' }}>{t('welcomeText')}</p>
                <div className="button-group">
                  <Link to="/demo"><a href="/demo" className="button secondary large pill">Get Started</a></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  withTranslation(),
)(Home);
