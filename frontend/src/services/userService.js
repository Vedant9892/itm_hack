import api from './api';

/**
 * userService - Centralized User API calls using Axios
 * All functions now return Axios promises.
 */
const userService = {
  // Login function using Axios
  login: async (credentials) => {
    try {
      const response = await api.post('/users/login', credentials);
      return response.data;
    } catch (error) {
      console.error('UserService: Login failed', error);
      throw error;
    }
  },

  // Register function using Axios
  register: async (userData) => {
    try {
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      console.error('UserService: Registration failed', error);
      throw error;
    }
  },

  // Get Profile Data using Axios
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('UserService: Fetching profile failed', error);
      throw error;
    }
  }
};

export default userService;
