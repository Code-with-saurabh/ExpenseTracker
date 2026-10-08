import { createSlice } from '@reduxjs/toolkit';

const savedTheme = localStorage.getItem('theme');
const savedThemeId = localStorage.getItem('themeId');

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    dark: savedTheme === 'dark',
    themeId: savedThemeId || 'option8',
  },
  reducers: {
    toggleTheme(state) {
      state.dark = !state.dark;
    },
    setTheme(state, action) {
      state.themeId = action.payload;
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
