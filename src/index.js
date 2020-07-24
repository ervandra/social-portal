import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
// import registerServiceWorker from './registerServiceWorker';
import { ApolloProvider } from 'react-apollo';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import * as Sentry from '@sentry/browser';
import { I18nextProvider } from 'react-i18next';

import { isSafari } from 'react-device-detect';
import { registerServiceWorker } from "./register-sw";

import './assets/scss/base.scss';
import 'semantic-ui-css/semantic.min.css';
import './assets/scss/fontface.scss';
import './assets/scss/global.scss';
import './assets/scss/lifelearn.scss';
import './assets/scss/viewer.scss';
import './assets/scss/mastodon.scss';
import './assets/scss/v2.scss';
import './assets/scss/trend.scss';

import i18n from './i18n';

import App from './App';
import appClient from './components/apollo/appClient';

import appReducer from './store/reducers/app';
import authReducer from './store/reducers/auth';

//Create Middleware
const logger = store => {
  return next => {
    return action => {
      // console.log('[MiddleWare] Dispatching', action);
      const result = next(action);
      // console.log('[MiddleWare] next state', store.getState());
      return result;
    };
  };
};

//Create Redux Store
const appReducers = combineReducers({
  app: appReducer,
  auth: authReducer
});

const composeEnhancers = typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;

export const appStore = createStore(
  appReducers,
  composeEnhancers(applyMiddleware(logger, thunk))
);

const SENTRY_RELEASE = '0.1.0';
const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN || null;
const SENTRY_ENVIRONMENT = process.env.REACT_APP_SENTRY_ENVIRONMENT || 'production';
if (process.env.REACT_APP_SENTRY_ENVIRONMENT !== 'local') { // comment out this to let Sentry works only in productions environment.
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      release: SENTRY_RELEASE,
      environment: SENTRY_ENVIRONMENT
    });
  }
}

if (!isSafari) {
  registerServiceWorker();
}

ReactDOM.render(
  <I18nextProvider i18n={i18n}>
    <Provider store={appStore}>
      <ApolloProvider client={appClient}>
        <App />
      </ApolloProvider>
    </Provider>
  </I18nextProvider>,
  document.getElementById('root')
);

// registerServiceWorker();
