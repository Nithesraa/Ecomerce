import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from './authService.js';

const userStr = localStorage.getItem('user');
let user = null;
try {
  if (userStr) user = JSON.parse(userStr);
} catch (e) {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

const initialState = {
  user: user,
  isAuthenticated: !!user,
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
};

export const loginUser = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    const response = await authService.login(credentials);
    const { user, accessToken, refreshToken } = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return user;
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed';
    return thunkAPI.rejectWithValue(message);
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const response = await authService.register(userData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Registration failed';
    return thunkAPI.rejectWithValue(message);
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await authService.logout();
  } catch (error) {
    console.error('Logout error', error);
  } finally {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/me', async (_, thunkAPI) => {
  try {
    const response = await authService.getCurrentUser();
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return thunkAPI.rejectWithValue('Session expired');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Manual logout dispatch to clear state immediately if token refresh fails inside interceptor
    clearAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Register (Usually doesn't auto-login unless API returns token)
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'idle';
      })

      // Fetch Current User
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
