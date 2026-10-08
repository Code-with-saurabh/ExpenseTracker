import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';

export const fetchBudgets = createAsyncThunk('budgets/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await API.get('/budgets', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load budgets');
  }
});

export const createBudget = createAsyncThunk('budgets/create', async (data, { rejectWithValue }) => {
  try {
    const res = await API.post('/budgets', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create budget');
  }
});

export const updateBudget = createAsyncThunk('budgets/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await API.put(`/budgets/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update budget');
  }
});

export const deleteBudget = createAsyncThunk('budgets/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/budgets/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete budget');
  }
});

const budgetSlice = createSlice({
  name: 'budgets',
  initialState: {
    items: [],
    summary: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.summary = action.payload.summary;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBudget.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(updateBudget.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  },
});

export default budgetSlice.reducer;
