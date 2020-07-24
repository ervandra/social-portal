import React, { Component } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { messaging } from "./init-fcm";
import { compose, lifecycle, withHandlers, withState } from "recompose";
import { connect } from 'react-redux';
import * as actions from './store/actions/index';
import asyncComponent from './hoc/asyncComponent';
import ErrorBoundary from './components/global/ErrorBoundary';
import { isSafari } from 'react-device-detect';

import ScrollToTop from './components/layouts/ScrollToTop';
import Homepage from './pages/Home';

const asyncPublicOrganisation = asyncComponent(() => {
  return import('./pages/PublicOrganisation');
});
const asyncPublicSkill = asyncComponent(() => {
  return import('./pages/PublicSkill');
});
const asyncSkill = asyncComponent(() => {
  return import('./pages/Skill');
});
const asyncPublicPath = asyncComponent(() => {
  return import('./pages/PublicPath');
});
const asyncOrganisationPath = asyncComponent(() => {
  return import('./pages/OrganisationPath');
});
const asyncPath = asyncComponent(() => {
  return import('./pages/Path');
});
const asyncProfile = asyncComponent(() => {
  return import('./pages/Profile');
});
const asyncMyPathDetail = asyncComponent(() => {
  return import('./pages/MyPathDetail');
});
const asyncDocumentViewer = asyncComponent(() => {
  return import('./pages/DocumentViewer');
});
const asyncNotificationViewer = asyncComponent(() => {
  return import('./pages/NotificationViewer');
});
const asyncError = asyncComponent(() => {
  return import('./pages/Error');
});
const asyncAuth = asyncComponent(() => {
  return import('./pages/Auth');
});
const asyncLogout = asyncComponent(() => {
  return import('./pages/Logout');
});
const asyncTrends = asyncComponent(() => {
  return import('./pages/Trends');
});

// const renderNotification = (notification, i) => <li key={i}>{notification}</li>;

const registerPushListener = pushNotification =>
  navigator.serviceWorker.addEventListener("message", ({ data }) => {
    pushNotification(
      data.data
        ? data.data
        : data["firebase-messaging-msg-data"].data
    );
  });

class App extends Component {
  state = {
    url: 'https://social.lifelearnplatform.com',
    loaded: false,
  }
  componentWillMount() {
    this.props.checkUserState();
  }
  componentDidMount() {
    const { loaded } = this.state;
    if (!loaded) {
      const win = typeof window !== undefined ? window : false;
      if (win) {
        this.setState({
          url: win.location.href,
          loaded: true,
        })
      }
    }
  }
  render() {
    const { url } = this.state;
    const { insecure } = this.props;
    let routes = (
      <Switch>
        <Route path="/" exact component={Homepage} />
        <Route path="/auth" exact component={asyncAuth} />
        <Route path="/logout" exact component={asyncLogout} />
        <Route path="/error" exact component={asyncError} />
        <Route path="/profile" exact component={asyncProfile} />
        <Route path="/trends" exact component={asyncTrends} />
        <Route path="/skill/:skillId" exact component={asyncSkill} />
        <Route path="/path/:pathId" component={asyncPath} />
        <Route path="/view/:pathId" exact component={asyncMyPathDetail} />
        <Route exact path="/view/:pathId/:documentId" component={asyncNotificationViewer} />
        <Route path="/view/:pathId/:stepIndex/:documentId" component={asyncDocumentViewer} />
        <Route path="/:organisationId/paths/:pathId" exact component={asyncOrganisationPath} />
        <Route path="/:organisationId/:skillId/:pathId" component={asyncPublicPath} />
        <Route path="/:organisationId/:skillId" component={asyncPublicSkill} />
        <Route path="/:organisationId" component={asyncPublicOrganisation} />
        <Redirect to="/" />
      </Switch>
    );

    if (insecure) return (
      <div style={{ textAlign: 'center', margin: '5% auto', maxWidth: '480px' }}>
        <h2>Something went wrong.</h2>
        <p>You need to enable cookies first before using this website, we use cookies to give you better learning experiences.</p>
        <p><a href={url} className="button secondary">Refresh this page</a></p>
      </div>
    );
    return (
      <BrowserRouter>
        <ErrorBoundary>
          {/* <div>token: {token}</div> */}
          {/* <div>Notification</div>
					{notifications.map(renderNotification)} */}
          <ScrollToTop>{routes}</ScrollToTop>
        </ErrorBoundary>
      </BrowserRouter>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    checkUserState: () => dispatch(actions.checkUserState()),
    authFirebase: token => dispatch(actions.authFirebase(token)),
  };
};

const mapStateToProps = state => {
  return {
    insecure: state.auth.insecure,
    firebaseToken: state.auth.firebaseToken,
  };
};

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withState("token", "setToken", ""),
  withState("notifications", "setNotifications", []),
  withHandlers({
    pushNotification: ({
      setNotifications,
      notifications
    }) => newNotification =>
        setNotifications(notifications.concat(newNotification))
  }),
  lifecycle({
    async componentDidMount() {
      const { authFirebase, pushNotification, setToken } = this.props;
      if (messaging && !isSafari) {
        messaging
          .requestPermission()
          .then(async function () {
            const token = await messaging.getToken();
            setToken(token);

            if (authFirebase && token) {
              authFirebase(token);

              let localToken = null;
              let gqlToken = null;
              try {
                localToken = localStorage.getItem('firebaseToken');
                gqlToken = localStorage.getItem('token');
              } catch (err) {
                console.log('failed to get firebaseToken');
              }

              if (token) {
                if (!localToken || localToken !== token) {
                  try {
                    localStorage.setItem('firebaseToken', token);
                  } catch (err) {
                    console.log('failed to save firebaseToken')
                  }
                }
                localToken = token;
                if (gqlToken && localToken) {
                  const query = JSON.stringify({
                    query: `mutation setFirebaseToken {
															setFirebaseToken(input:{ clientMutationId: "save_firebase_token", token: "${token}" }){
																clientMutationId,
																firebaseTokenNode {
																	user {
																		username,
																	}
																}
															}
														}
														`
                  });
                  await fetch(`https://gql.lifelearnplatform.com/api/2`, {
                    headers: {
                      'content-type': 'application/json',
                      authorization: gqlToken ? `Bearer ${gqlToken}` : null
                    },
                    method: 'POST',
                    body: query,
                  });
                }
              };
            }
          })
          .catch(function (err) {
            console.log("Unable to get permission to notify.", err);
          });

        registerPushListener(pushNotification);
      }
    }
  })
)(App);


