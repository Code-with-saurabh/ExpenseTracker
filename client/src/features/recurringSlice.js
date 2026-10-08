import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';

export const fetchRecurring = createAsyncThunk('recurring/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/recurring-expenses');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load recurring expenses');
  }
});

export const createRecurring = createAsyncThunk('recurring/create', async (data, { rejectWithValue }) => {
  try {
    const res = await API.post('/recurring-expenses', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create recurring expense');
  }
});

export const deleteRecurring = createAsyncThunk('recurring/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/recurring-expenses/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete recurring expense');
  }
});

export const toggleRecurring = createAsyncThunk('recurring/toggle', async (id, { rejectWithValue }) => {
  try {
    const res = await API.patch(`/recurring-expenses/${id}/toggle`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to toggle recurring expense');
  }
});

const recurringSlice = createSlice({
  name: 'recurring',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecurring.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecurring.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
      })
      .addCase(fetchRecurring.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createRecurring.fulfilled, (state, action) => {
        state.items.push(action.payload.data);
      })
      .addCase(deleteRecurring.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(toggleRecurring.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload.data._id);
        if (index !== -1) state.items[index] = action.payload.data;
      });
  },
});

export default recurringSlice.reducer;
