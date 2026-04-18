import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Triggers the n8n soreness relief plan generation via our backend.
 * @param {string[]} muscles - Array of sore muscle names
 * @param {string} userId - Optional user ID
 */
export const fetchSorenessPlan = async (muscles, userId = null) => {
  const response = await axios.post(`${BASE_URL}/soreness/trigger`, {
    user_id: userId,
    sore_muscles: muscles,
    timestamp: new Date().toISOString(),
    request_type: 'soreness_relief'
  });
  return response.data;
};

/**
 * Submits the post-plan relief feedback score.
 * @param {Object} payload
 */
export const submitSorenessFeedback = async (payload) => {
  const response = await axios.post(`${BASE_URL}/soreness/feedback`, payload);
  return response.data;
};
