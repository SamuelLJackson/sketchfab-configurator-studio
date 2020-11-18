import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import viewerReducer from '../components/viewerSlice';

export default configureStore({
  reducer: {
    counter: counterReducer,
    viewer: viewerReducer,
  },
});
