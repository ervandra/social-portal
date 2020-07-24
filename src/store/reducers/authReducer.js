import * as types from '../types';

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
}

const authStart = state => {
   return {
      ...state,
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
      mastodonUserName: null
   };
}

const authSuccess = (state, action) => {
   return {
      ...state,
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
      mastodonUserName: action.payload.user.mastodonUserName
   };
}

const authWithMastodon = (state, action) => {
   return {
      ...state,
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
      mastodonUserName: action.payload.user.mastodonUserName
   };
}

const authFail = (state) => {
   return {
      ...state,
      ...initialState,
   };
}

const authError = state => {
   return { ...state, insecure: true };
}

const authLogout = state => {
   return {
      ...state,
      ...initialState,
   };
}

const reducer = (state = initialState, action) => {
   switch (action.type) {
      case types.AUTH_START: return authStart(state)
      case types.AUTH_SUCCESS: return authSuccess(state, action)
      case types.AUTH_WITH_MASTODON: return authWithMastodon(state, action)
      case types.AUTH_FAIL: return authFail(state)
      case types.AUTH_ERROR: return authError(state)
      case types.AUTH_LOGOUT: return authLogout(state)
      default:
         return state;
   }
}

export default reducer;