import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import viewerReducer from '../components/viewerSlice';
import logger from 'redux-logger';

export default configureStore({
  reducer: {
    counter: counterReducer,
    viewer: viewerReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
