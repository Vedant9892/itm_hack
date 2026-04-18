import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  todayWorkout: null,
  todayReadiness: null,
  isLoadingWorkout: false,
};

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    setWorkoutLoading: (state, action) => {
      state.isLoadingWorkout = action.payload;
    },
    setTodayWorkout: (state, action) => {
      state.todayWorkout = action.payload;
    },
    setTodayReadiness: (state, action) => {
      state.todayReadiness = action.payload;
    },
  },
});

export const { setWorkoutLoading, setTodayWorkout, setTodayReadiness } = workoutSlice.actions;

export default workoutSlice.reducer;
