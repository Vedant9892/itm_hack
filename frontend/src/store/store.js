import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import workoutReducer from './slices/workoutSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workout: workoutReducer,
  },
});

export default store;
