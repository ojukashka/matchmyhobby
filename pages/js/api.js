// js/api.js

const BASE_URL = 'http://localhost:3000'; // Your backend URL

const request = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  // If you implement JWT tokens, you'd add Authorization header here:
  // const token = getStoredToken(); // Function to get token from localStorage
  // if (token) options.headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    // For DELETE or other methods that might not return content
    if (
      response.status === 204 ||
      response.headers.get('content-length') === '0'
    ) {
      return null; // Or a success message/status
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    throw error; // Re-throw to be caught by the caller
  }
};

// User related API calls
export const getAllUsers = () => request('/users');
export const getUserById = (id) => request(`/users/${id}`); // Assuming backend supports this, otherwise filter from getAllUsers

// Wichtig: Registrierung benutzt den Pfad /users/register, nicht nur /users
export const addUser = (userData) => request('/users/register', 'POST', userData);

export const updateUser = (userId, userData) =>
  request(`/users/${userId}`, 'PUT', userData);
export const deleteUser = (userId) => request(`/users/${userId}`, 'DELETE');

export const getMatchedUsers = (hobby, location) => {
  let query = '/users/match?';
  const params = [];
  if (hobby) params.push(`hobby=${encodeURIComponent(hobby)}`);
  if (location) params.push(`location=${encodeURIComponent(location)}`);
  query += params.join('&');
  return request(query);
};

// Auth related API calls
export const loginUser = (credentials) => request('/auth/login', 'POST', credentials);

// External API Calls (Example: Quotable for M8)
const QUOTABLE_API_URL = 'https://api.quotable.io/random';
export const getRandomQuote = async () => {
  try {
    const response = await fetch(QUOTABLE_API_URL);
    if (!response.ok) {
      throw new Error(`Quotable API error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching random quote:', error);
    return { content: 'Could not fetch quote.', author: 'System' };
  }
};

// External API for S1 (Example: Bored API)
const BORED_API_URL = 'https://www.boredapi.com/api/activity/';
export const getRandomActivity = async () => {
  try {
    const response = await fetch(BORED_API_URL);
    if (!response.ok) {
      throw new Error(`Bored API error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching random activity:', error);
    return {
      activity: 'Could not fetch an activity. Maybe try reading a book?',
    };
  }
};

// Placeholder for a third external API (C1) - e.g., Public Holidays API for a given country
// This one requires a year and country code.
// Example: Nager.Date API `https://date.nager.at/api/v3/PublicHolidays/{year}/{countryCode}`
const HOLIDAY_API_URL_BASE = 'https://date.nager.at/api/v3/NextPublicHolidays'; // Simpler endpoint for next public holidays worldwide
export const getNextPublicHolidays = async (countryCode = 'AT') => {
  // Default to Austria
  try {
    const response = await fetch(`${HOLIDAY_API_URL_BASE}/${countryCode}`);
    if (!response.ok) {
      throw new Error(`Holiday API error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching public holidays:', error);
    // Return a limited structure or an empty array on error to avoid breaking UI
    return [{ name: 'Could not fetch holiday data.', date: '' }];
  }
};
