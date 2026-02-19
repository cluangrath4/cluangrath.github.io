/**
 * Function to allow for the "Now Playing" section of the main page, from last.fm (connected to Spotify)
 */
async function fetchLastFm() {
  const username = 'Catiitaro';
  const apiKey = '484f78e76b19871360e701f315d02dc2';
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    
    const track = data.recenttracks.track[0];
    const isPlaying = track['@attr'] && track['@attr'].nowplaying;
    
    const textElement = document.getElementById('now-playing-text');
    const artElement = document.getElementById('now-playing-art');
    
    const artistName = track.artist ? track.artist['#text'] : 'Unknown Artist';
    const trackName = track.name || 'Unknown Track';

    if (textElement) {
      if (isPlaying) {
        textElement.innerHTML = `<strong>${trackName}</strong><br><span style="color: #555;">by ${artistName}</span>`;
      } else {
        textElement.innerHTML = `<em>Last played:</em><br>${trackName} <br><span style="color: #555;">by ${artistName}</span>`;
      }
    }

    if (artElement) {
      if (track.image && track.image.length > 2 && track.image[2]['#text']) {
        artElement.src = track.image[2]['#text'];
      } else {
        artElement.src = 'https://win98icons.alexmeub.com/icons/png/cd_audio_cd_a-3.png';
      }
    }
  } catch (err) {
    console.error('Error fetching Last.fm data:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Last.fm Initialization
  fetchLastFm();
  setInterval(fetchLastFm, 30000);

  // 2. Dark Mode Logic
  const themeBtn = document.getElementById('themeBtn');
  const root = document.documentElement;
  if (localStorage.getItem('xp-theme') === 'dark') {
    root.setAttribute('data-theme', 'dark');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      if (root.getAttribute('data-theme') === 'dark') {
        root.removeAttribute('data-theme');
        localStorage.setItem('xp-theme', 'light');
      } else {
        root.setAttribute('data-theme', 'dark');
        localStorage.setItem('xp-theme', 'dark');
      }
    });
  }

  // 3. Window Mode & Reset Logic
  let windowMode = localStorage.getItem('xp-window-mode') !== 'off';
  const toggle = document.getElementById('window-mode-toggle');
  
  if (toggle) {
    toggle.checked = windowMode;
    toggle.addEventListener('change', (e) => {
      windowMode = e.target.checked;
      localStorage.setItem('xp-window-mode', windowMode ? 'on' : 'off');
      if (!windowMode) resetWindows(); 
    });
  }

  function resetWindows() {
    document.querySelectorAll('.window').forEach(win => {
      win.style.visibility = 'visible';
      win.style.transform = 'none';
      win.style.zIndex = '';
      win.dataset.x = 0;
      win.dataset.y = 0;
      win.classList.remove('maximized');
    });
    const taskbar = document.getElementById('bottom-taskbar');
    if (taskbar) taskbar.innerHTML = '';
  }

  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      resetWindows();
    });
  }

  // 4. Draggable Windows Logic
  let highestZ = 100;
  const taskbar = document.getElementById('bottom-taskbar');

  document.querySelectorAll('.window').forEach(win => {
    if (win.closest('#journal')) return; // Skip Psych assignments

    const titleBar = win.querySelector('.title-bar');
    const windowTitle = titleBar ? titleBar.querySelector('span').innerText : 'Window';
    
    const minBtn = win.querySelector('.min-btn');
    const maxBtn = win.querySelector('.max-btn');
    const closeBtn = win.querySelector('.close-btn');

    win.addEventListener('mousedown', () => {
      if (!windowMode) return;
      win.style.zIndex = ++highestZ;
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        if (!windowMode) return;
        e.stopPropagation();
        win.style.visibility = 'hidden'; 
      });
    }

    if (minBtn) {
      minBtn.addEventListener('click', (e) => {
        if (!windowMode) return;
        e.stopPropagation();
        
        win.style.visibility = 'hidden';
        
        if (taskbar) {
          const taskItem = document.createElement('div');
          taskItem.className = 'taskbar-item';
          taskItem.innerText = windowTitle;
          
          taskItem.addEventListener('click', () => {
            win.style.visibility = 'visible';
            win.style.zIndex = ++highestZ;
            taskItem.remove(); 
          });
          
          taskbar.appendChild(taskItem);
        }
      });
    }

    if (maxBtn) {
      maxBtn.addEventListener('click', (e) => {
        if (!windowMode) return;
        e.stopPropagation();
        win.classList.toggle('maximized');
        win.style.transform = win.classList.contains('maximized') ? 'none' : `translate(${win.dataset.x || 0}px, ${win.dataset.y || 0}px)`;
      });
    }

    let isDragging = false;
    let startX, startY;

    if (titleBar) {
      titleBar.addEventListener('mousedown', (e) => {
        if (!windowMode || e.target.closest('.title-bar-btn')) return;
        isDragging = true;
        win.style.zIndex = ++highestZ;
        
        let currentX = parseFloat(win.dataset.x) || 0;
        let currentY = parseFloat(win.dataset.y) || 0;
        
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging || !windowMode || win.classList.contains('maximized')) return;
        e.preventDefault();
        
        let x = e.clientX - startX;
        let y = e.clientY - startY;
        
        win.dataset.x = x;
        win.dataset.y = y;
        win.style.transform = `translate(${x}px, ${y}px)`;
      });

      document.addEventListener('mouseup', () => {
        isDragging = false;
      });
    }
  });
});