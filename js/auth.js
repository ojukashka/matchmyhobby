// js/auth.js
import * as api from './api.js';
import { setCurrentUser, clearUserSession, getUserSession } from './store.js';
import { showMessage, updateNavForAuthState } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  // Update nav immediately in case of direct navigation to auth pages
  updateNavForAuthState();

  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.email.value;
      const password = loginForm.password.value; // Password matching is usually backend's job

      try {
        // BE doesn't have explicit login. We'll fetch all users and find a match by email.
        // This is NOT secure for a real app. A real backend would handle auth.
        const users = await api.getAllUsers();
        const user = users.find((u) => u.email === email); // Assuming email is unique & used for login

        if (user) {
          // In a real app, you'd also verify the password (hashed) via a /login endpoint.
          // For now, we assume login is successful if email is found.
          setCurrentUser({
            _id: user._id,
            name: user.name,
            email: user.email,
            location: user.location,
            hobbies: user.hobbies,
          }); // Store fetched user data
          showMessage(
            'login-message',
            'Login successful! Redirecting...',
            true
          );
          setTimeout(
            () => (window.location.href = '../pages/profile.html'),
            1500
          );
        } else {
          showMessage(
            'login-message',
            'Login failed: User not found or incorrect credentials.',
            false
          );
        }
      } catch (error) {
        showMessage('login-message', `Login error: ${error.message}`, false);
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = signupForm.name.value;
      const email = signupForm.email.value; // Assuming email is part of your user schema on BE
      const password = signupForm.password.value; // Password should be hashed on BE
      const location = signupForm.location.value;
      const hobbiesString = signupForm.hobbies.value;
      const hobbies = hobbiesString
        ? hobbiesString
            .split(',')
            .map((h) => h.trim())
            .filter((h) => h)
        : [];

      const newUser = { name, email, password, location, hobbies }; // Send password to BE for hashing

      try {
        const createdUser = await api.addUser(newUser);
        // Assuming BE returns the created user with an _id
        setCurrentUser({
          _id: createdUser._id,
          name: createdUser.name,
          email: createdUser.email,
          location: createdUser.location,
          hobbies: createdUser.hobbies,
        });
        showMessage(
          'signup-message',
          'Signup successful! Redirecting...',
          true
        );
        setTimeout(
          () => (window.location.href = '../pages/profile.html'),
          1500
        );
      } catch (error) {
        // Check if it's a duplicate email error (if backend provides specific messages)
        if (
          error.message.includes('duplicate') ||
          error.message.includes('already exists')
        ) {
          showMessage(
            'signup-message',
            `Signup failed: Email already in use.`,
            false
          );
        } else {
          showMessage(
            'signup-message',
            `Signup error: ${error.message}`,
            false
          );
        }
      }
    });
  }
});

// Export a logout function to be used in app.js or profile page script
export const handleLogout = () => {
  clearUserSession();
  setCurrentUser(null); // Clear from appState as well
  updateNavForAuthState(); // Update UI immediately
  // Redirect to login or home page
  if (window.location.pathname.includes('/pages/')) {
    window.location.href = '../pages/login.html';
  } else {
    window.location.href = 'pages/login.html';
  }
};
