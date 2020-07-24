import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utility';

const initialState = {
  userId: null,
  username: null,
  firstName: null,
  lasttName: null,
  avatar: null,
  documentAuthToken: null,
  mastodonAuthToken: null,
  mastodonUser: null,
  error: null,
  isLoading: false,
  isAuthenticated: false,
  insecure: false,
  isMentor: false,
  mastodonUserName: null,
  firebaseToken: null,
}

const authStart = (state) => {
  return updateObject(state, {
    userId: null,
    username: null,
    firstName: null,
    lasttName: null,
    avatar: null,
    documentAuthToken: null,
    mastodonAuthToken: null,
    mastodonUser: null,
    error: null,
    isLoading: true,
    isAuthenticated: false,
    isMentor: false,
    mastodonUserName: null,
  });
}

const authSuccess = (state, action) => {
  return updateObject(state, {
    userId: action.payload.user.viewer.id,
    username: action.payload.user.viewer.username,
    firstName: action.payload.user.viewer.firstName,
    lastName: action.payload.user.viewer.lastName,
    avatar: action.payload.user.viewer.profilePictureUrl,
    isMentor: action.payload.user.viewer.isMentor,
    documentAuthToken: action.payload.user.documentAuthToken,
    mastodonAuthToken: action.payload.user.mastodonAuthToken,
    mastodonUser: null,
    error: null,
    isLoading: false,
    isAuthenticated: true,
    mastodonUserName: action.payload.user.mastodonUserName,
  })
}

const authFirebase = (state, action) => {
  return updateObject(state, {
    firebaseToken: action.payload.token
  })
}

const authWithMastodon = (state, action) => {
  return updateObject(state, {
    userId: action.payload.user.viewer.id,
    username: action.payload.user.viewer.username,
    firstName: action.payload.user.viewer.firstName,
    lastName: action.payload.user.viewer.lastName,
    avatar: action.payload.user.viewer.profilePictureUrl,
    isMentor: action.payload.user.viewer.isMentor,
    documentAuthToken: action.payload.user.documentAuthToken,
    mastodonAuthToken: action.payload.user.mastodonAuthToken,
    mastodonUser: action.payload.mastodonUser,
    error: null,
    isLoading: false,
    isAuthenticated: true,
    mastodonUserName: action.payload.user.mastodonUserName,
  })
}

const authFail = (state) => {
  return updateObject(state, initialState);
}

const authError = (state) => {
  return updateObject(state, {
    insecure: true
  });
}

const authLogout = (state) => {
  return updateObject(state, initialState)
}

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.AUTH_START: return authStart(state)
    case actionTypes.AUTH_SUCCESS: return authSuccess(state, action)
    case actionTypes.AUTH_FIREBASE: return authFirebase(state, action)
    case actionTypes.AUTH_WITH_MASTODON: return authWithMastodon(state, action)
    case actionTypes.AUTH_FAIL: return authFail(state)
    case actionTypes.AUTH_ERROR: return authError(state)
    case actionTypes.AUTH_LOGOUT: return authLogout(state)
    default:
      return state;
  }
}

export default authReducer;