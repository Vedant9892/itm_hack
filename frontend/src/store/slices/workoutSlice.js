import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  todayWorkout: null,
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
  },
});

export const { setWorkoutLoading, setTodayWorkout } = workoutSlice.actions;

export default workoutSlice.reducer;
