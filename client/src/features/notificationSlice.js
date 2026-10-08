import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/notifications');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load notifications');
  }
});

export const markAllRead = createAsyncThunk('notifications/markAll', async (_, { rejectWithValue }) => {
  try {
    await API.patch('/notifications/read-all');
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to mark notifications');
  }
});

export const markOneRead = createAsyncThunk('notifications/markOne', async (id, { rejectWithValue }) => {
  try {
    await API.patch(`/notifications/${id}/read`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to mark notification');
  }
});

export const deleteNotification = createAsyncThunk('notifications/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/notifications/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete notification');
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.unreadCount = 0;
        state.items = state.items.map((item) => ({ ...item, read: true }));
      })
      .addCase(markOneRead.fulfilled, (state, action) => {
        const item = state.items.find((entry) => entry._id === action.payload);
        if (item && !item.read) {
          item.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const item = state.items.find((entry) => entry._id === action.payload);
        if (item && !item.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items = state.items.filter((entry) => entry._id !== action.payload);
      });
  },
});

export default notificationSlice.reducer;
