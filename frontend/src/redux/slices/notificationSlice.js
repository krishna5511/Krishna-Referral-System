import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    notifications: [],
    unreadCount: 0,
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    setLoading(state, action) { state.loading = action.payload; },
    setNotifications(state, action) {
      state.notifications = action.payload.notifications;
      state.pagination = action.payload.pagination;
    },
    setUnreadCount(state, action) { state.unreadCount = action.payload; },
    markRead(state, action) {
      const n = state.notifications.find(n => n._id === action.payload);
      if (n) { n.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
    },
    markAllRead(state) {
      state.notifications.forEach(n => { n.isRead = true; });
      state.unreadCount = 0;
    },
    removeNotification(state, action) {
      const n = state.notifications.find(n => n._id === action.payload);
      if (n && !n.isRead) state.unreadCount = Math.max(0, state.unreadCount - 1);
      state.notifications = state.notifications.filter(n => n._id !== action.payload);
    },
    setError(state, action) { state.error = action.payload; state.loading = false; },
  },
});

export const { setLoading, setNotifications, setUnreadCount, markRead, markAllRead, removeNotification, setError } = notificationSlice.actions;
export default notificationSlice.reducer;
