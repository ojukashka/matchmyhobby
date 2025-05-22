// js/app.js
import * as api from './api.js';
import * as ui from './ui.js';
import { getCurrentUser, setCurrentUser, isLoggedIn } from './store.js';
import { handleLogout } from './auth.js'; // Import for use on profile page

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  setCurrentUser(user); // Ensure appState is initialized
  ui.setupGlobalUI(); // Initial UI setup based on auth state

  const page = document.body.id || window.location.pathname;

  // Page specific initializations
  if (page.includes('index.html') || page === '/') {
    initLandingPage();
  } else if (page.includes('hobbies.html')) {
    initHobbiesPage();
  } else if (page.includes('profile.html')) {
    if (!isLoggedIn()) {
      window.location.href = '../pages/login.html'; // Redirect if not logged in
      return;
    }
    initProfilePage();
  } else if (page.includes('matches.html')) {
    if (!isLoggedIn()) {
      window.location.href = '../pages/login.html';
      return;
    }
    initMatchesPage();
  }
  // Login and Signup pages are mostly handled by auth.js
});

// --- Landing Page ---
async function initLandingPage() {
  console.log('Initializing Landing Page');
  try {
    const quoteData = await api.getRandomQuote();
    ui.displayQuote(quoteData);
  } catch (error) {
    console.error('Failed to load quote:', error);
    ui.displayQuote({
      content: 'Could not load quote at the moment.',
      author: 'System',
    });
  }
  // Potentially load some dynamic images or content for the grid if needed
}

// --- Hobbies Page ---
async function initHobbiesPage() {
  console.log('Initializing Hobbies Page');
  const hobbyGallery = document.querySelector('.hobby-gallery');
  const prevButton = document.getElementById('prev-hobby');
  const nextButton = document.getElementById('next-hobby');
  const applyFiltersBtn = document.getElementById('apply-filters-btn');

  // Load initial users (e.g., all users or some popular ones)
  async function loadHobbyUsers(hobby = null, location = null) {
    try {
      let users;
      if (hobby || location) {
        users = await api.getMatchedUsers(hobby, location);
      } else {
        users = await api.getAllUsers(); // Fetch all if no filter
      }
      // Filter out current user if logged in, so they don't see themselves here
      const currentUser = getCurrentUser();
      if (currentUser) {
        users = users.filter((u) => u._id !== currentUser._id);
      }
      ui.displayHobbyUsers(users.slice(0, 10)); // Display first 10 for example
    } catch (error) {
      console.error('Failed to load hobby users:', error);
      if (hobbyGallery)
        hobbyGallery.innerHTML =
          '<p>Could not load users. Please try again later.</p>';
    }
  }
  loadHobbyUsers(); // Initial load

  // Filters
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', () => {
      // This requires more complex filter selection UI.
      // For now, let's imagine text inputs or selected active links
      const selectedHobby = document.querySelector(
        '#hobby-filter-list a.active'
      )?.dataset.hobby;
      const selectedLocation = document.querySelector(
        '#location-filter-list a.active'
      )?.dataset.location;
      loadHobbyUsers(selectedHobby, selectedLocation);
    });
  }
  // Add event listeners to filter links to add 'active' class
  document
    .querySelectorAll('#hobby-filter-list a, #location-filter-list a')
    .forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        // Toggle active class within its own group
        const parentList = e.target.closest('ul');
        parentList
          .querySelectorAll('a')
          .forEach((a) => a.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

  // Horizontal Scroll for hobby gallery
  if (hobbyGallery && prevButton && nextButton) {
    const scrollAmount = 320; // Width of one item + gap
    prevButton.addEventListener('click', () => {
      hobbyGallery.scrollLeft -= scrollAmount;
    });
    nextButton.addEventListener('click', () => {
      hobbyGallery.scrollLeft += scrollAmount;
    });
  }

  // Load external API for activity (S1)
  try {
    const activityData = await api.getRandomActivity();
    ui.displayActivity(activityData);
  } catch (error) {
    console.error('Failed to load activity:', error);
    ui.displayActivity({ activity: 'Could not load an activity suggestion.' });
  }
}

// --- Profile Page ---
async function initProfilePage() {
  console.log('Initializing Profile Page');
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser._id) {
    console.error('No user session found for profile page.');
    window.location.href = '../pages/login.html'; // Redirect
    return;
  }

  try {
    // Fetch the latest user data, as it might have been updated
    const userData = await api.getUserById(currentUser._id);
    if (userData) {
      setCurrentUser(userData); // Update local store with fresh data
      ui.populateProfileForm(userData);
    } else {
      throw new Error('User data not found.');
    }
  } catch (error) {
    console.error('Failed to load user profile data:', error);
    ui.showMessage(
      'edit-profile-message',
      `Error: Could not load profile. ${error.message}`,
      false
    );
    // If loading fails critically, consider logging out or showing a persistent error
    // handleLogout(); // Or redirect to an error page
  }

  const editProfileForm = document.getElementById('edit-profile-form');
  if (editProfileForm) {
    editProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = editProfileForm['edit-name'].value;
      const location = editProfileForm['edit-location'].value;
      const hobbiesString = editProfileForm['edit-hobbies'].value;
      const hobbies = hobbiesString
        .split(',')
        .map((h) => h.trim())
        .filter((h) => h);

      const updatedData = { name, location, hobbies };

      try {
        const updatedUser = await api.updateUser(currentUser._id, updatedData);
        setCurrentUser(updatedUser); // Update stored user data
        ui.populateProfileForm(updatedUser); // Re-populate form and display
        ui.showMessage(
          'edit-profile-message',
          'Profile updated successfully!',
          true
        );
      } catch (error) {
        ui.showMessage(
          'edit-profile-message',
          `Error updating profile: ${error.message}`,
          false
        );
      }
    });
  }

  const logoutButton = document.getElementById('logout-btn');
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }

  const deleteProfileButton = document.getElementById('delete-profile-btn');
  if (deleteProfileButton) {
    deleteProfileButton.addEventListener('click', async () => {
      if (
        confirm(
          'Are you sure you want to delete your profile? This action cannot be undone.'
        )
      ) {
        try {
          await api.deleteUser(currentUser._id);
          ui.showMessage(
            'edit-profile-message',
            'Profile deleted successfully. Logging out...',
            true
          );
          setTimeout(handleLogout, 2000);
        } catch (error) {
          ui.showMessage(
            'edit-profile-message',
            `Error deleting profile: ${error.message}`,
            false
          );
        }
      }
    });
  }
  // Add body class for specific background styling, if profile.css needs it
  document.body.classList.add('profile-body-bg');
}

// --- Matches Page ---
async function initMatchesPage() {
  console.log('Initializing Matches Page');
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = '../pages/login.html'; // Should be caught by general check, but good fallback
    return;
  }

  const fetchMatchesBtn = document.getElementById('fetch-matches-btn');
  const hobbyFilterInput = document.getElementById('match-hobby-filter');
  const locationFilterInput = document.getElementById('match-location-filter');

  // Pre-fill with current user's primary hobby and location if available and desired
  if (
    currentUser.hobbies &&
    currentUser.hobbies.length > 0 &&
    hobbyFilterInput
  ) {
    // hobbyFilterInput.value = currentUser.hobbies[0]; // Example: first hobby
  }
  if (currentUser.location && locationFilterInput) {
    // locationFilterInput.value = currentUser.location;
  }

  async function fetchAndDisplayMatches() {
    const hobby = hobbyFilterInput.value.trim();
    const location = locationFilterInput.value.trim();

    if (!hobby && !location) {
      ui.displayMatches([]); // Clear or show message to enter filters
      alert('Please enter at least one filter (hobby or location).');
      return;
    }

    try {
      let matchedUsers = await api.getMatchedUsers(hobby, location);
      // Filter out the current user from matches
      matchedUsers = matchedUsers.filter(
        (user) => user._id !== currentUser._id
      );
      ui.displayMatches(matchedUsers);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      const container = document.getElementById('matches-container');
      if (container)
        container.innerHTML =
          '<p>Could not load matches. Please try again.</p>';
    }
  }

  if (fetchMatchesBtn) {
    fetchMatchesBtn.addEventListener('click', fetchAndDisplayMatches);
  }

  // Optionally, load some initial matches based on the current user's profile, or popular matches
  // fetchAndDisplayMatches(); // Call on load if you want to pre-populate based on default/user filters
}
