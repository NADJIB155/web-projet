/* ============================
   LearniX - Global Script
   - Dark mode
   - Sidebar
   - Header search
   - User authentication
   - Profile management
============================ */

// ============================
// 1. DARK MODE
// ============================
let toggleBtn = document.getElementById('toggle-btn');
let body = document.body;
let darkMode = localStorage.getItem('dark-mode');

const enableDarkMode = () => {
  if(toggleBtn) toggleBtn.classList.replace('fa-sun', 'fa-moon');
  body.classList.add('dark');
  localStorage.setItem('dark-mode', 'enabled');
}

const disableDarkMode = () => {
  if(toggleBtn) toggleBtn.classList.replace('fa-moon', 'fa-sun');
  body.classList.remove('dark');
  localStorage.setItem('dark-mode', 'disabled');
}

// Apply saved preference
if(darkMode === 'enabled'){ 
  enableDarkMode(); 
}

// Toggle on click
if(toggleBtn){
  toggleBtn.onclick = () => {
    darkMode = localStorage.getItem('dark-mode');
    if(darkMode === 'disabled'){
      enableDarkMode();
    }else{
      disableDarkMode();
    }
  }
}

// ============================
// 2. SIDEBAR
// ============================
let sideBar = document.querySelector('.side-bar');
let menuBtn = document.querySelector('#menu-btn');
let closeBtn = document.querySelector('#close-btn');

if(menuBtn){
  menuBtn.onclick = () => {
    if(sideBar) sideBar.classList.toggle('active');
    body.classList.toggle('active');
  }
}

if(closeBtn){
  closeBtn.onclick = () => {
    if(sideBar) sideBar.classList.remove('active');
    body.classList.remove('active');
  }
}

// ============================
// 3. MOBILE SEARCH TOGGLE
// ============================
let search = document.querySelector('.header .flex .search-form');
let searchBtn = document.querySelector('#search-btn');

if(searchBtn){
  searchBtn.onclick = () => {
    if(search) search.classList.toggle('active');
  }
}

// ============================
// 4. USER PROFILE DROPDOWN
// ============================
let userBtn = document.querySelector('#user-btn');
let profileDropdown = document.querySelector('.header .flex .profile');

if(userBtn && profileDropdown){
  userBtn.onclick = (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('active');
  }
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if(!profileDropdown.contains(e.target) && e.target !== userBtn){
      profileDropdown.classList.remove('active');
    }
  });
}

// ============================
// 5. GLOBAL SEARCH
// ============================
const setupGlobalSearch = () => {
  const forms = document.querySelectorAll('form.search-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[name="search"]') || form.querySelector('input[name="search_box"]');
      const q = (input?.value || '').trim();
      if(!q) return;
      window.location.href = `courses.html?search=${encodeURIComponent(q)}`;
    });
  });
};
setupGlobalSearch();

// ============================
// 6. SCROLL BEHAVIOR
// ============================
window.onscroll = () => {
  if(search) search.classList.remove('active');
  if(profileDropdown) profileDropdown.classList.remove('active');

  if(window.innerWidth < 1200){
    if(sideBar) sideBar.classList.remove('active');
    body.classList.remove('active');
  }
}

// ============================
// 7. AUTHENTICATION & USER STATE
// ============================
const API_URL = 'https://localhost/api';

// Check login status on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Select Elements
    const profileName = document.querySelectorAll('.name');
    const profileRole = document.querySelectorAll('.role');
    const profileImages = document.querySelectorAll('.profile .image');
    const headerGuestBtns = document.getElementById('headerGuestBtns');
    const headerUserBtns = document.getElementById('headerUserBtns');
    const headerViewProfile = document.getElementById('headerViewProfile');
    
    // New Sidebar Elements
    const sideGuestOptions = document.querySelector('.guest-options');
    const sideUserOptions = document.querySelector('.user-options');
    const sideViewProfile = document.querySelector('.view-profile-btn');

    if (token && user) {
        // --- USER IS LOGGED IN ---
        
        // 1. Update Name & Role everywhere
        profileName.forEach(el => el.textContent = user.nom + ' ' + (user.prenom || ''));
        profileRole.forEach(el => el.textContent = user.role === 'etudiant' ? 'Student' : 'Teacher');

        // 2. Update profile images if user has one
        if(user.image) {
            profileImages.forEach(img => img.src = `${API_URL.replace('/api', '')}/${user.image}`);
        }

        // 3. Show Logout / Hide Login
        if(headerGuestBtns) headerGuestBtns.style.display = 'none';
        if(headerUserBtns) headerUserBtns.style.display = 'block';
        
        if(sideGuestOptions) sideGuestOptions.style.display = 'none';
        if(sideUserOptions) sideUserOptions.style.display = 'block';

        // 4. Show "View Profile"
        if(headerViewProfile) headerViewProfile.style.display = 'inline-block';
        if(sideViewProfile) sideViewProfile.style.display = 'inline-block';

    } else {
        // --- GUEST MODE ---
        profileName.forEach(el => el.textContent = "Guest");
        profileRole.forEach(el => el.textContent = "Student");
        
        // Show Login / Hide Logout
        if(headerGuestBtns) headerGuestBtns.style.display = 'flex';
        if(headerUserBtns) headerUserBtns.style.display = 'none';

        if(sideGuestOptions) sideGuestOptions.style.display = 'block';
        if(sideUserOptions) sideUserOptions.style.display = 'none';

        // Hide "View Profile"
        if(headerViewProfile) headerViewProfile.style.display = 'none';
        if(sideViewProfile) sideViewProfile.style.display = 'none';
    }
});

// ============================
// 8. LOGOUT FUNCTION
// ============================
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast("Logged out successfully!");
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 1000);
}

// ============================
// 9. UTILITY FUNCTIONS
// ============================

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('active'), 100);
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// API call helper
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, mergedOptions);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Show loading state
function showLoading(element) {
    if(element) {
        element.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; padding: 5rem; width: 100%; grid-column: 1 / -1;">
                <div class="loader"></div>
            </div>
        `;
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Get URL parameter
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Check if user is authenticated
function isAuthenticated() {
    return !!localStorage.getItem('token');
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Redirect if not authenticated
function requireAuth(redirectTo = 'login.html') {
    if (!isAuthenticated()) {
        window.location.href = redirectTo;
        return false;
    }
    return true;
}