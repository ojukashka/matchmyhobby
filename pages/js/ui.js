// js/ui.js
import { getCurrentUser } from './store.js';

export const showMessage = (elementId, message, isSuccess = true) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.className = 'form-message'; // Reset classes
    if (isSuccess) {
      element.classList.add('success');
    } else {
      element.classList.add('error');
    }
    // Clear message after some time
    setTimeout(() => {
      element.textContent = '';
      element.className = 'form-message';
    }, 5000);
  }
};

export const updateNavForAuthState = () => {
  const user = getCurrentUser();
  const loginLink = document.getElementById('nav-login');
  const signupLink = document.getElementById('nav-signup');
  const profileIconLink = document.getElementById('nav-profile-icon'); // Assumes a profile icon/link
  const logoutBtn = document.getElementById('logout-btn'); // On profile page

  // For main header auth links
  const authLinksContainer = document.querySelector('header .auth-links');

  if (user) {
    if (loginLink) loginLink.style.display = 'none';
    if (signupLink) signupLink.style.display = 'none';
    if (authLinksContainer) authLinksContainer.style.display = 'none';

    if (profileIconLink) {
      profileIconLink.style.display = 'inline-block'; // Or 'block'
      profileIconLink.href = '../pages/profile.html'; // Ensure correct path
    }
    // If on index.html and nav-profile-icon exists
    const navProfileIconIndex = document.querySelector(
      'header #nav-profile-icon'
    );
    if (navProfileIconIndex) {
      navProfileIconIndex.style.display = 'inline-block';
      navProfileIconIndex.innerHTML = `Hi, ${user.name.split(' ')[0]} 👤`;
    }
  } else {
    if (loginLink) loginLink.style.display = 'inline-block';
    if (signupLink) signupLink.style.display = 'inline-block';
    if (authLinksContainer) authLinksContainer.style.display = 'flex'; // Or 'block' depending on your layout

    if (profileIconLink) profileIconLink.style.display = 'none';
    // If on index.html and nav-profile-icon exists
    const navProfileIconIndex = document.querySelector(
      'header #nav-profile-icon'
    );
    if (navProfileIconIndex) {
      navProfileIconIndex.style.display = 'none';
    }
  }
};

// --- Landing Page UI ---
export const displayQuote = (quoteData) => {
  const quoteTextEl = document.getElementById('quote-text');
  const quoteAuthorEl = document.getElementById('quote-author');
  if (quoteTextEl && quoteAuthorEl) {
    quoteTextEl.textContent = `"${quoteData.content}"`;
    quoteAuthorEl.textContent = `- ${quoteData.author}`;
  }
};

// --- Hobbies Page UI ---
export const displayHobbyUsers = (users) => {
  const gallery = document.querySelector('.hobby-gallery');
  if (!gallery) return;
  gallery.innerHTML = ''; // Clear existing

  if (!users || users.length === 0) {
    gallery.innerHTML =
      '<p>No users found for these criteria. Try broadening your search!</p>';
    return;
  }

  users.forEach((user) => {
    // Creating items somewhat like the "Hobbies choosing page design.jpg"
    // This needs more info from user objects if they have profile images, etc.
    // Assuming 'user.images' is an array of image URLs, or use a placeholder.
    const firstHobbyImage =
      user.profileImageUrl || '../assets/images/hobby-choice-placeholder.jpg';

    const item = document.createElement('div');
    item.className = 'hobby-item';
    item.innerHTML = `
            <img src="${firstHobbyImage}" alt="${user.name}'s hobby showcase">
            <div class="hobby-info">
                <span class="hobby-name">${user.name}</span>
                <span class="hobby-location">${user.location}</span>
                <p class="user-hobbies-preview">Hobbies: ${user.hobbies
                  .slice(0, 2)
                  .join(', ')}...</p>
            </div>
        `;
    // Add event listener to view full profile or interact
    item.addEventListener('click', () => {
      // Potentially navigate to a public view of this user's profile
      // or show a modal with more details.
      console.log('View user:', user.name);
      alert(
        `User: ${user.name}\nLocation: ${
          user.location
        }\nHobbies: ${user.hobbies.join(', ')}`
      );
    });
    gallery.appendChild(item);
  });
};

export const displayActivity = (activityData) => {
  const activityTextEl = document.getElementById('activity-text');
  if (activityTextEl) {
    activityTextEl.textContent =
      activityData.activity || 'No activity found right now.';
  }
};

// --- Profile Page UI ---
export const populateProfileForm = (userData) => {
  if (!userData) return;

  // Display fields
  const nameDisplay = document.getElementById('user-name-display');
  const emailDisplay = document.getElementById('user-email-display');
  const locationDisplay = document.getElementById('user-location-display');
  const hobbiesList = document.getElementById('user-hobbies-list');

  if (nameDisplay) nameDisplay.textContent = userData.name;
  if (emailDisplay)
    emailDisplay.textContent = userData.email || 'Email not provided'; // Assuming email might not be in all user objects from GET /users
  if (locationDisplay)
    locationDisplay.textContent = `Location: ${userData.location}`;

  if (hobbiesList) {
    hobbiesList.innerHTML = ''; // Clear old hobbies
    if (userData.hobbies && userData.hobbies.length > 0) {
      userData.hobbies.forEach((hobby) => {
        const li = document.createElement('li');
        // Mimic "PRADA 2023" with hobby name and maybe a generic year or detail
        li.textContent = `${hobby}`; // Simplified: just the hobby name
        hobbiesList.appendChild(li);
      });
    } else {
      hobbiesList.innerHTML = '<li>No hobbies listed yet.</li>';
    }
  }

  // Pre-fill edit form
  const editName = document.getElementById('edit-name');
  const editLocation = document.getElementById('edit-location');
  const editHobbies = document.getElementById('edit-hobbies');

  if (editName) editName.value = userData.name;
  if (editLocation) editLocation.value = userData.location;
  if (editHobbies)
    editHobbies.value = userData.hobbies ? userData.hobbies.join(', ') : '';

  // Background image - if user has one
  const profileBgImage = document.querySelector(
    '.profile-background-image img'
  );
  if (profileBgImage && userData.profileBackgroundImageUrl) {
    // Assuming a field for this
    profileBgImage.src = userData.profileBackgroundImageUrl;
  } else if (profileBgImage) {
    profileBgImage.src = '../assets/images/user-profile-bg-default.jpg'; // Default
  }

  // Populate profile gallery (mocked for now)
  const galleryContainer = document.querySelector('.profile-gallery');
  if (galleryContainer) {
    // Clear previous items
    // galleryContainer.innerHTML = '';
    // In a real app, userData would have an array of gallery items
    // For now, we'll keep the static HTML ones or generate placeholders
    // Example: if (userData.galleryItems) { ... }
  }
};

// --- Matches Page UI ---
export const displayMatches = (matchedUsers) => {
  const container = document.getElementById('matches-container');
  if (!container) return;
  container.innerHTML = ''; // Clear previous matches

  if (!matchedUsers || matchedUsers.length === 0) {
    container.innerHTML =
      '<p>No matches found based on your criteria. Try adjusting your filters!</p>';
    return;
  }

  matchedUsers.forEach((user) => {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.innerHTML = `
            <img src="${
              user.avatarUrl || '../assets/images/user-avatar.png'
            }" alt="${user.name}">
            <h3>${user.name}</h3>
            <p><strong>Location:</strong> ${user.location}</p>
            <p class="hobbies-list"><strong>Hobbies:</strong> ${user.hobbies
              .map((h) => `<span>${h}</span>`)
              .join(' ')}</p>
        `;
    container.appendChild(card);
  });
};

// UI Helper for navigation based on auth state
export const setupGlobalUI = () => {
  updateNavForAuthState();
  // Add other global UI setups here if needed
};
