// js/auth.js
import * as api from './api.js';
import { setCurrentUser, clearUserSession } from './store.js';
import { showMessage, updateNavForAuthState } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  // Nav direkt anpassen falls man direkt auf Login/Signup-Seite landet
  updateNavForAuthState();

  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = loginForm.name.value; // Falls dein Backend mit 'name' arbeitet, sonst 'email'
      const password = loginForm.password.value;

      try {
        // Echter Login über API
        const result = await api.loginUser({ name, password });

        if (result.token) {
          // Token kannst du speichern, hier als Beispiel nur Name speichern
          setCurrentUser({ name });

          showMessage('login-message', 'Login erfolgreich! Weiterleitung...', true);
          setTimeout(() => window.location.href = '../pages/profile.html', 1500);
        } else {
          showMessage('login-message', 'Login fehlgeschlagen', false);
        }
      } catch (error) {
        showMessage('login-message', `Login Fehler: ${error.message}`, false);
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = signupForm.name.value;
      const email = signupForm.email.value;
      const password = signupForm.password.value;
      const location = signupForm.location.value;
      const hobbiesString = signupForm.hobbies.value;
      const hobbies = hobbiesString
        ? hobbiesString.split(',').map(h => h.trim()).filter(h => h)
        : [];

      const newUser = { name, email, password, location, hobbies };

      try {
        const createdUser = await api.addUser(newUser);
        setCurrentUser({
          _id: createdUser.userId || createdUser._id,
          name: createdUser.name,
          email: createdUser.email,
          location: createdUser.location,
          hobbies: createdUser.hobbies,
        });
        showMessage('signup-message', 'Signup erfolgreich! Weiterleitung...', true);
        setTimeout(() => window.location.href = '../pages/profile.html', 1500);
      } catch (error) {
        if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          showMessage('signup-message', 'Signup fehlgeschlagen: Nutzername oder Email bereits vergeben.', false);
        } else {
          showMessage('signup-message', `Signup Fehler: ${error.message}`, false);
        }
      }
    });
  }
});

// Logout-Funktion exportieren
export const handleLogout = () => {
  clearUserSession();
  setCurrentUser(null);
  updateNavForAuthState();

  if (window.location.pathname.includes('/pages/')) {
    window.location.href = '../pages/login.html';
  } else {
    window.location.href = 'pages/login.html';
  }
};
