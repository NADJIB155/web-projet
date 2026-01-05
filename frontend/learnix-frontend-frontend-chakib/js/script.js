/* ============================
   LearniX - Global Script
   - Dark mode
   - Sidebar
   - Header search works everywhere
   - User icon redirects to login
   - Courses/Playlist/Watch pages are consistent
============================ */

let toggleBtn = document.getElementById('toggle-btn');
let body = document.body;
let darkMode = localStorage.getItem('dark-mode');

const enableDarkMode = () =>{
  if(toggleBtn) toggleBtn.classList.replace('fa-sun', 'fa-moon');
  body.classList.add('dark');
  localStorage.setItem('dark-mode', 'enabled');
}

const disableDarkMode = () =>{
  if(toggleBtn) toggleBtn.classList.replace('fa-moon', 'fa-sun');
  body.classList.remove('dark');
  localStorage.setItem('dark-mode', 'disabled');
}

if(darkMode === 'enabled'){ enableDarkMode(); }

if(toggleBtn){
  toggleBtn.onclick = () =>{
    darkMode = localStorage.getItem('dark-mode');
    if(darkMode === 'disabled'){
      enableDarkMode();
    }else{
      disableDarkMode();
    }
  }
}

/* ============================
   Sidebar
============================ */
let sideBar = document.querySelector('.side-bar');
let menuBtn = document.querySelector('#menu-btn');
let closeBtn = document.querySelector('#close-btn');

if(menuBtn){
  menuBtn.onclick = () =>{
    if(sideBar) sideBar.classList.toggle('active');
    body.classList.toggle('active');
  }
}
if(closeBtn){
  closeBtn.onclick = () =>{
    if(sideBar) sideBar.classList.remove('active');
    body.classList.remove('active');
  }
}

/* ============================
   Mobile search toggle
============================ */
let search = document.querySelector('.header .flex .search-form');
let searchBtn = document.querySelector('#search-btn');

if(searchBtn){
  searchBtn.onclick = () =>{
    if(search) search.classList.toggle('active');
  }
}

/* ============================
   USER ICON => login.html
============================ */
let userBtn = document.querySelector('#user-btn');
if(userBtn){
  userBtn.addEventListener('click', (e) => {
    // If it's already a link <a href="login.html">, let it go naturally.
    // If it's a div, force redirect.
    if(userBtn.tagName.toLowerCase() !== 'a'){
      e.preventDefault();
      window.location.href = 'login.html';
    }
  });
}

/* ============================
   GLOBAL SEARCH (header form)
   Redirect to: courses.html?search=...
============================ */
const setupGlobalSearch = () => {
  const forms = document.querySelectorAll('form.search-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[name="search_box"]');
      const q = (input?.value || '').trim();
      if(!q) return;
      window.location.href = `courses.html?search=${encodeURIComponent(q)}`;
    });
  });
};
setupGlobalSearch();

/* ============================
   DATA: Courses + Teachers (ONE teacher per course)
============================ */
const COURSE_DATA = {
  html: {
    key: "html",
    title: "Complete HTML Tutorial",
    desc: "Learn modern HTML from scratch: structure, semantic tags, forms, accessibility, and real-world page layouts.",
    teacher: { name: "Mahlous Chakib", role: "Front-End Developer", img: "images/pic-2.jpg" },
    thumb: "images/thumb-1.png",
    videosCount: 10,
    parts: [
      { part: 1, title: "HTML Basics & Structure", img: "images/post-1-1.png" },
      { part: 2, title: "Text, Links & Media", img: "images/post-1-2.png" },
      { part: 3, title: "Lists, Tables & Best Practices", img: "images/post-1-3.png" },
      { part: 4, title: "Forms (Inputs, Validation)", img: "images/post-1-4.png" },
      { part: 5, title: "Semantic HTML & Accessibility", img: "images/post-1-5.png" },
      { part: 6, title: "Mini Project: Landing Page", img: "images/post-1-6.png" }
    ]
  },
  css: {
    key: "css",
    title: "Complete CSS Tutorial",
    desc: "Master modern CSS: Flexbox, Grid, responsive design, animations, and clean UI patterns used in real products.",
    teacher: { name: "Hammoum Najib", role: "UI / CSS Specialist", img: "images/pic-3.jpg" },
    thumb: "images/thumb-2.png",
    videosCount: 12,
    parts: [
      { part: 1, title: "Selectors & Box Model", img: "images/post-2-1.png" },
      { part: 2, title: "Flexbox Layouts", img: "images/post-2-2.png" },
      { part: 3, title: "CSS Grid", img: "images/post-2-3.png" },
      { part: 4, title: "Responsive UI", img: "images/post-2-4.png" },
      { part: 5, title: "Transitions & Animations", img: "images/post-2-5.png" },
      { part: 6, title: "Mini Project: Dashboard UI", img: "images/post-2-6.png" }
    ]
  },
  javascript: {
    key: "javascript",
    title: "Complete JavaScript Tutorial",
    desc: "Build solid JS fundamentals: DOM, events, async, APIs, and practical mini-projects for real web apps.",
    teacher: { name: "Yassine Amine", role: "JavaScript Engineer", img: "images/pic-4.jpg" },
    thumb: "images/thumb-3.png",
    videosCount: 14,
    parts: [
      { part: 1, title: "Variables, Types, Functions", img: "images/post-3-1.png" },
      { part: 2, title: "DOM & Events", img: "images/post-3-2.png" },
      { part: 3, title: "Arrays & Objects", img: "images/post-3-3.png" },
      { part: 4, title: "Async JS (Promises, Fetch)", img: "images/post-3-4.png" },
      { part: 5, title: "APIs + Practical Example", img: "images/post-3-5.png" },
      { part: 6, title: "Mini Project: Search & Filter", img: "images/post-3-6.png" }
    ]
  },
  bootstrap: {
    key: "bootstrap",
    title: "Bootstrap Crash Course",
    desc: "Create responsive layouts fast with Bootstrap: grid system, components, utilities, and production-ready UI.",
    teacher: { name: "Sara Bensaid", role: "Web Designer", img: "images/pic-5.jpg" },
    thumb: "images/thumb-4.png",
    videosCount: 8,
    parts: [
      { part: 1, title: "Grid System", img: "images/post-4-1.png" },
      { part: 2, title: "Components", img: "images/post-4-2.png" },
      { part: 3, title: "Utilities", img: "images/post-4-3.png" },
      { part: 4, title: "Mini Project: Landing Page", img: "images/post-4-4.png" }
    ]
  },
  jquery: {
    key: "jquery",
    title: "jQuery Essentials",
    desc: "Understand jQuery quickly: selectors, events, DOM manipulation, animations, and legacy code integration.",
    teacher: { name: "Nadir Belkacem", role: "Full-Stack Developer", img: "images/pic-6.jpg" },
    thumb: "images/thumb-5.png",
    videosCount: 7,
    parts: [
      { part: 1, title: "Selectors & DOM", img: "images/post-5-1.png" },
      { part: 2, title: "Events & Effects", img: "images/post-5-2.png" },
      { part: 3, title: "AJAX Basics", img: "images/post-5-3.png" }
    ]
  },
  sass: {
    key: "sass",
    title: "SASS Mastery",
    desc: "Write scalable CSS with SASS: variables, nesting, mixins, modules, and professional organization.",
    teacher: { name: "Lina Khellaf", role: "Front-End Engineer", img: "images/pic-7.jpg" },
    thumb: "images/thumb-6.png",
    videosCount: 9,
    parts: [
      { part: 1, title: "SASS Basics", img: "images/post-6-1.png" },
      { part: 2, title: "Mixins & Functions", img: "images/post-6-2.png" },
      { part: 3, title: "Structure & Best Practices", img: "images/post-6-3.png" }
    ]
  },
  php: {
    key: "php",
    title: "Complete PHP Tutorial",
    desc: "Learn PHP for web backends: variables, forms, sessions, CRUD concepts, and real login flows.",
    teacher: { name: "Riad Benali", role: "Backend Developer", img: "images/pic-8.jpg" },
    thumb: "images/thumb-7.png",
    videosCount: 11,
    parts: [
      { part: 1, title: "PHP Basics", img: "images/post-7-1.png" },
      { part: 2, title: "Forms & Validation", img: "images/post-7-2.png" },
      { part: 3, title: "Sessions & Auth", img: "images/post-7-3.png" }
    ]
  },
  mysql: {
    key: "mysql",
    title: "Complete MySQL Tutorial",
    desc: "Master MySQL: tables, queries, joins, indexes, and practical database design for web apps.",
    teacher: { name: "Samir Meziani", role: "Database Engineer", img: "images/pic-9.jpg" },
    thumb: "images/thumb-8.png",
    videosCount: 10,
    parts: [
      { part: 1, title: "Tables & Keys", img: "images/post-8-1.png" },
      { part: 2, title: "SELECT + WHERE + ORDER", img: "images/post-8-2.png" },
      { part: 3, title: "JOINs & Relations", img: "images/post-8-3.png" }
    ]
  },
  react: {
    key: "react",
    title: "Complete React Tutorial",
    desc: "Learn React fundamentals: components, props, state, hooks, routing basics, and building real UI.",
    teacher: { name: "Amina Cherif", role: "React Developer", img: "images/pic-1.jpg" },
    thumb: "images/thumb-9.png",
    videosCount: 12,
    parts: [
      { part: 1, title: "Components & JSX", img: "images/post-9-1.png" },
      { part: 2, title: "State & Props", img: "images/post-9-2.png" },
      { part: 3, title: "Hooks (useEffect/useState)", img: "images/post-9-3.png" }
    ]
  }
};

/* ============================
   Helpers
============================ */
const qs = (k) => new URLSearchParams(window.location.search).get(k);

const normalize = (s) => (s || "").toLowerCase().trim();

const filterCoursesPage = () => {
  const q = normalize(qs('search'));
  if(!q) return;

  const boxes = document.querySelectorAll('.courses .box-container .box');
  boxes.forEach(box => {
    const t = normalize(box.dataset.title);
    const teacher = normalize(box.dataset.teacher);
    const match = t.includes(q) || teacher.includes(q) || normalize(box.innerText).includes(q);
    box.style.display = match ? '' : 'none';
  });

  const heading = document.querySelector('.courses .heading');
  if(heading){
    heading.textContent = `Search results for "${qs('search')}"`;
  }
};

const renderPlaylistPage = () => {
  const courseKey = normalize(qs('course')) || 'html';
  const course = COURSE_DATA[courseKey] || COURSE_DATA.html;

  // Fill playlist top content
  const thumbImg = document.querySelector('#pl-thumb-img');
  const thumbCount = document.querySelector('#pl-thumb-count');
  const teacherImg = document.querySelector('#pl-teacher-img');
  const teacherName = document.querySelector('#pl-teacher-name');
  const teacherDate = document.querySelector('#pl-teacher-date');
  const title = document.querySelector('#pl-title');
  const desc = document.querySelector('#pl-desc');
  const teacherLink = document.querySelector('#pl-teacher-link');

  if(thumbImg) thumbImg.src = course.thumb;
  if(thumbCount) thumbCount.textContent = `${course.videosCount} videos`;
  if(teacherImg) teacherImg.src = course.teacher.img;
  if(teacherName) teacherName.textContent = course.teacher.name;
  if(teacherDate) teacherDate.textContent = "Updated recently";
  if(title) title.textContent = course.title;
  if(desc) desc.textContent = course.desc;
  if(teacherLink) teacherLink.href = `teacher_profile.html?teacher=${encodeURIComponent(course.teacher.name)}`;

  // Render parts
  const container = document.querySelector('#pl-videos');
  if(container){
    container.innerHTML = '';
    course.parts.forEach(p => {
      const a = document.createElement('a');
      a.className = 'box';
      a.href = `watch-video.html?course=${encodeURIComponent(course.key)}&part=${p.part}`;
      a.innerHTML = `
        <i class="fas fa-play"></i>
        <img src="${p.img}" alt="">
        <h3>${course.title} (Part ${String(p.part).padStart(2,'0')}): ${p.title}</h3>
      `;
      container.appendChild(a);
    });
  }
};

const renderWatchVideoPage = () => {
  const courseKey = normalize(qs('course')) || 'html';
  const part = parseInt(qs('part') || '1', 10);
  const course = COURSE_DATA[courseKey] || COURSE_DATA.html;
  const p = course.parts.find(x => x.part === part) || course.parts[0];

  const pageTitle = document.querySelector('#wv-title');
  const tutorImg = document.querySelector('#wv-tutor-img');
  const tutorName = document.querySelector('#wv-tutor-name');
  const tutorRole = document.querySelector('#wv-tutor-role');
  const description = document.querySelector('#wv-desc');
  const backLink = document.querySelector('#wv-back');

  if(pageTitle) pageTitle.textContent = `${course.title} — Part ${String(part).padStart(2,'0')}: ${p.title}`;
  if(tutorImg) tutorImg.src = course.teacher.img;
  if(tutorName) tutorName.textContent = course.teacher.name;
  if(tutorRole) tutorRole.textContent = course.teacher.role;
  if(description) description.textContent = `In this lesson: ${p.title}. ${course.desc}`;
  if(backLink) backLink.href = `playlist.html?course=${encodeURIComponent(course.key)}`;
};

const renderTeacherProfile = () => {
  const t = qs('teacher');
  if(!t) return;

  // Find teacher in course data
  const courses = Object.values(COURSE_DATA);
  const course = courses.find(c => c.teacher.name.toLowerCase() === t.toLowerCase());
  if(!course) return;

  const name = document.querySelector('#tp-name');
  const role = document.querySelector('#tp-role');
  const img = document.querySelector('#tp-img');
  const totalPlaylists = document.querySelector('#tp-playlists');
  const totalVideos = document.querySelector('#tp-videos');
  const courseBox = document.querySelector('#tp-course');

  if(name) name.textContent = course.teacher.name;
  if(role) role.textContent = course.teacher.role;
  if(img) img.src = course.teacher.img;
  if(totalPlaylists) totalPlaylists.textContent = "1";
  if(totalVideos) totalVideos.textContent = String(course.videosCount);

  if(courseBox){
    courseBox.innerHTML = `
      <div class="thumb">
        <img src="${course.thumb}" alt="">
        <span>${course.videosCount} videos</span>
      </div>
      <h3 class="title">${course.title}</h3>
      <p class="course-desc">${course.desc}</p>
      <a class="inline-btn" href="playlist.html?course=${encodeURIComponent(course.key)}">View playlist</a>
    `;
  }
};

window.onscroll = () =>{
  if(search) search.classList.remove('active');

  if(window.innerWidth < 1200){
    if(sideBar) sideBar.classList.remove('active');
    body.classList.remove('active');
  }
}

/* ============================
   Page routers
============================ */
const path = (window.location.pathname || '').toLowerCase();

if(path.includes('courses.html')) filterCoursesPage();
if(path.includes('playlist.html')) renderPlaylistPage();
if(path.includes('watch-video.html')) renderWatchVideoPage();
if(path.includes('teacher_profile.html')) renderTeacherProfile();
// Function to update the Header based on Login Status
function checkLoginStatus() {
   const token = localStorage.getItem('token');
   const user = JSON.parse(localStorage.getItem('user')); // Get user data (name, role)

   const profileSection = document.querySelector('.header .flex .profile');
   const sidebarProfile = document.querySelector('.side-bar .profile');
   const flexBtn = document.querySelector('.flex-btn'); // The container for Login/Register buttons

   if (token && user) {
      // USER IS LOGGED IN
      
      // 1. Update Header Name and Image
      if(profileSection) {
         profileSection.querySelector('.name').textContent = user.nom + ' ' + user.prenom;
         profileSection.querySelector('.role').textContent = user.role;
         // Hide the "Login/Register" buttons in the profile dropdown
         if(flexBtn) flexBtn.style.display = 'none'; 
      }

      // 2. Update Sidebar Name and Image
      if(sidebarProfile) {
         sidebarProfile.querySelector('.name').textContent = user.nom + ' ' + user.prenom;
         sidebarProfile.querySelector('.role').textContent = user.role;
      }

   } else {
      // USER IS NOT LOGGED IN
      // (Optional) You could hide the profile section entirely or show default "Guest"
   }
}

// Run this immediately when any page loads
document.addEventListener('DOMContentLoaded', checkLoginStatus);

// Add a Logout Function (You can attach this to a logout button later)
function logout() {
   localStorage.removeItem('token');
   localStorage.removeItem('user');
   window.location.href = 'home.html';
}