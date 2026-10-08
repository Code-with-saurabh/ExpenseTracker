import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';

export const fetchTransactions = createAsyncThunk('transactions/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await API.get('/transactions', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load transactions');
  }
});

export const createTransaction = createAsyncThunk('transactions/create', async (data, { rejectWithValue }) => {
  try {
    const res = await API.post('/transactions', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add transaction');
  }
});

export const updateTransaction = createAsyncThunk('transactions/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await API.put(`/transactions/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update transaction');
  }
});

export const deleteTransaction = createAsyncThunk('transactions/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/transactions/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete transaction');
  }
});

export const toggleFavorite = createAsyncThunk('transactions/toggleFavorite', async (id, { rejectWithValue }) => {
  try {
    const res = await API.patch(`/transactions/${id}/favorite`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update favorite');
  }
});

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    items: [],
    pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    loading: false,
    error: null,
    lastAddedId: null,
  },
  reducers: {
    clearLastAdded(state) {
      state.lastAddedId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.lastAddedId = action.payload.data._id;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload.data._id);
        if (index !== -1) state.items[index] = action.payload.data;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload.data._id);
        if (index !== -1) state.items[index] = action.payload.data;
      });
  },
});

export const { clearLastAdded } = transactionSlice.actions;
export default transactionSlice.reducer;
