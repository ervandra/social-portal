import { combineReducers } from 'redux';
import authReducer from './authReducer';
import appReducer from './appReducer'

const rootReducer = combineReducers({
   app: appReducer,
   auth: authReducer
});

export default rootReducer;