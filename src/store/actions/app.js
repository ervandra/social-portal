import * as actionTypes from './actionTypes';

export const togglePath = (open) => {
	return {
		type: actionTypes.OPEN_PATH,
		payload: { open }
	}
}
export const toggleMessage = (open) => {
	return {
		type: actionTypes.OPEN_MESSAGE,
		payload: { open }
	}
}
export const toggleNotification = (open) => {
	return {
		type: actionTypes.OPEN_NOTIFICATION,
		payload: { open }
	}
}
export const toggleMore = (open) => {
	return {
		type: actionTypes.OPEN_MORE,
		payload: { open }
	}
}
