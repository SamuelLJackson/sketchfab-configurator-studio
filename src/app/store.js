import { configureStore } from '@reduxjs/toolkit';
import viewerReducer from '../components/viewerSlice';
import logger from 'redux-logger';

export default configureStore({
  reducer: viewerReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
