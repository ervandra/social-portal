import * as actionTypes from './actionTypes';
import { API_URL } from '../../constant';
import axios from 'axios';

export const authStart = () => {
	return {
		type: actionTypes.AUTH_START,
	};
};

export const authSuccess = (token, user) => {
	return {
		type: actionTypes.AUTH_SUCCESS,
		payload: { token, user },
	};
};

export const authFirebase = token => {
	return {
		type: actionTypes.AUTH_FIREBASE,
		payload: { token },
	};
};

export const authWithMastodon = (token, user, mastodonUser) => {
	return {
		type: actionTypes.AUTH_WITH_MASTODON,
		payload: { token, user, mastodonUser },
	};
};

export const authFail = error => {
	return {
		type: actionTypes.AUTH_FAIL,
		error,
	};
};

export const authError = () => {
	return {
		type: actionTypes.AUTH_ERROR,
	};
};

export const logout = () => {
	return dispatch => {
		try {
			localStorage.removeItem('token');
			localStorage.removeItem('refresh_token');
			localStorage.removeItem('documentAuthToken');
			localStorage.removeItem('mastodonAuthToken');
			dispatch(authFail())
		} catch (err) {
			dispatch(authError())
		}
	};
};

export const refresh = () => {
	return dispatch => {
		let refresh_token = null;
		try {
			refresh_token = localStorage.getItem('refresh_token') || null;
		} catch (err) {
			dispatch(authError())
		};

		if (refresh_token) {
			dispatch(authStart());
			const formData = new FormData();
			formData.append('grant_type', 'refresh_token');
			formData.append('refresh_token', refresh_token);
			formData.append('client_id', process.env.REACT_APP_OAUTH_CLIENT_ID);
			axios.post(process.env.REACT_APP_OAUTH_TOKEN_URL, formData)
				.then(response => {
					try {
						localStorage.setItem('refresh_token', response.data.refresh_token)
						localStorage.setItem('token', response.data.access_token)
						dispatch(authUser(response.data.access_token));
					} catch (err) {
						dispatch(authError());
					}

				})
				.catch(err => {
					try {
						localStorage.removeItem('token');
						localStorage.removeItem('refresh_token');
						localStorage.removeItem('documentAuthToken');
						localStorage.removeItem('mastodonAuthToken');
						dispatch(authFail(err))
					} catch (err) {
						dispatch(authError())
					}
				});
		} else {
			dispatch(logout());
		}
	};
};

export const checkUserState = () => {
	return dispatch => {
		let token = null;
		let refresh_token = null;
		try {
			token = localStorage ? localStorage.getItem('token') : null;
			refresh_token = localStorage.getItem('refresh_token') || null;
		} catch (err) {
			dispatch(authError());
		};
		if (token) {
			dispatch(authUser(token));
		} else if (refresh_token) {
			dispatch(refresh());
		} else {
			dispatch(logout());
		}
	};
};

export const authToken = code => {
	return dispatch => {
		dispatch(authStart());
		const formData = new FormData();
		formData.append('grant_type', 'authorization_code');
		formData.append('code', code);
		formData.append('client_id', process.env.REACT_APP_OAUTH_CLIENT_ID);
		formData.append('redirect_uri', process.env.REACT_APP_OAUTH_REDIRECT_URI);
		axios.post(process.env.REACT_APP_OAUTH_TOKEN_URL, formData)
			.then(response => {
				try {
					localStorage.setItem('refresh_token', response.data.refresh_token)
					localStorage.setItem('token', response.data.access_token)
				} catch (err) {
					dispatch(authError())
				}
				dispatch(authUser(response.data.access_token));
			})
			.catch(err => {
				dispatch(authFail(err))
			});
	};
};

export const authUser = token => {
	return dispatch => {
		axios({
			url: API_URL,
			method: 'post',
			data: {
				query: `
          query getUser{
            viewer{
							id,
							username,
							firstName,
							lastName,
							profilePictureUrl,
							isMentor,
							mastodonUserName
						}
						documentAuthToken,
						mastodonAuthToken
					}
        `,
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}).then(response => {
			if (response.data.data.viewer) {
				// console.log('au', response.data.data);
				if (response.data.data.documentAuthToken) {
					try {
						localStorage.setItem('documentAuthToken', response.data.data.documentAuthToken)
					} catch (err) {
						console.log('error setup vuo')
					}
				}
				if (response.data.data.mastodonAuthToken) {
					// dispatch(authMastodon(token, response.data.data))
					try {
						localStorage.setItem('mastodonAuthToken', response.data.data.mastodonAuthToken)
					} catch (err) {
						console.log('error setup mastodon')
					}
					const mastodonURL = process.env.REACT_APP_MASTODON_SERVER || 'https://mastodon.lifelearnplatform.com/';
					axios({
						url: `${mastodonURL}api/v1/accounts/verify_credentials`,
						headers: {
							Authorization: `Bearer ${response.data.data.mastodonAuthToken}`
						}
					}).then(mstResponse => {
						dispatch(authWithMastodon(token, response.data.data, mstResponse.data));
					}).catch(err => {
						dispatch(authSuccess(token, response.data.data));
					})
				} else {
					dispatch(authSuccess(token, response.data.data));
				}
			} else {
				dispatch(refresh());
			}
		}).catch(err => {
			dispatch(authFail(err));
		})
	};
};
