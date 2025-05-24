// js/store.js

const STORE_KEY = 'matchMyHobbyUser';

export const saveUserSession = (userData) => {
  // In a real app, this would be a JWT token.
  // For this example, we'll store basic user info including their ID.
  localStorage.setItem(STORE_KEY, JSON.stringify(userData));
};

export const getUserSession = () => {
  const user = localStorage.getItem(STORE_KEY);
  return user ? JSON.parse(user) : null;
};

export const clearUserSession = () => {
  localStorage.removeItem(STORE_KEY);
};

export const isLoggedIn = () => {
  return !!getUserSession();
};

// You can add more state management features if needed,
// e.g., for current filters, hobby lists, etc.
let appState = {
  currentUser: getUserSession(),
  // other global states
};

export const getCurrentUser = () => appState.currentUser;

export const setCurrentUser = (user) => {
  appState.currentUser = user;
  if (user) {
    saveUserSession(user);
  } else {
    clearUserSession();
  }
};
