import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';

export const fetchGoals = createAsyncThunk('goals/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/goals');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load goals');
  }
});

export const createGoal = createAsyncThunk('goals/create', async (data, { rejectWithValue }) => {
  try {
    const res = await API.post('/goals', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create goal');
  }
});

export const updateGoal = createAsyncThunk('goals/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await API.put(`/goals/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update goal');
  }
});

export const deleteGoal = createAsyncThunk('goals/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/goals/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete goal');
  }
});

export const addMoneyToGoal = createAsyncThunk('goals/addMoney', async ({ id, amount }, { rejectWithValue }) => {
  try {
    const res = await API.post(`/goals/${id}/add-money`, { amount });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add money');
  }
});

const goalSlice = createSlice({
  name: 'goals',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.items.unshift(action.payload.data);
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload.data._id);
        if (index !== -1) state.items[index] = action.payload.data;
      })
      .addCase(addMoneyToGoal.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload.data._id);
        if (index !== -1) state.items[index] = action.payload.data;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  },
});

export default goalSlice.reducer;
