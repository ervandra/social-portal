import * as types from '../types';

const initialState = {
   openPath: false,
   openMessage: false,
   openNotification: false,
}

const openPath = (state, action) => {
   return {
      ...state,
      openPath: action.payload.open,
   };
}
const openMessage = (state, action) => {
   return {
      ...state,
      openMessage: action.payload.open,
   };
}
const openNotification = (state, action) => {
   return {
      ...state,
      openNotification: action.payload.open,
   };
}

const appReducer = (state = initialState, action) => {
   switch (action.type) {
      case types.OPEN_PATH: return openPath(state, action);
      case types.OPEN_MESSAGE: return openMessage(state, action);
      case types.OPEN_NOTIFICATION: return openNotification(state, action);
      default: return state
   }
}

export default appReducer;