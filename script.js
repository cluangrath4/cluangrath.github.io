document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('themeBtn');
  const root = document.documentElement;
  const saved = localStorage.getItem('xp-theme');
  
  if (saved === 'dark') {
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
});

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
    
    // Return currently playing song
    const track = data.recenttracks.track[0];
    const isPlaying = track['@attr'] && track['@attr'].nowplaying;
    
    const textElement = document.getElementById('now-playing-text');
    const artElement = document.getElementById('now-playing-art');
    
    // Safely get artist and track name
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
      // Check if the image array exists and has links
      if (track.image && track.image.length > 2 && track.image[2]['#text']) {
        artElement.src = track.image[2]['#text']; // size: large
      } else {
        // Fallback icon
        artElement.src = 'https://win98icons.alexmeub.com/icons/png/cd_audio_cd_a-3.png';
      }
    }

  } catch (err) {
    console.error('Error fetching Last.fm data:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchLastFm();
  setInterval(fetchLastFm, 30000);
});

//Testing Windows-like functionality
document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle (Keep your existing theme code here)
  const themeBtn = document.getElementById('themeBtn');
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('xp-theme');
  if (savedTheme === 'dark') root.setAttribute('data-theme', 'dark');
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

  // Window Mode State
  let windowMode = localStorage.getItem('xp-window-mode') !== 'off';
  const toggle = document.getElementById('window-mode-toggle');
  
  if (toggle) {
    toggle.checked = windowMode;
    toggle.addEventListener('change', (e) => {
      windowMode = e.target.checked;
      localStorage.setItem('xp-window-mode', windowMode ? 'on' : 'off');
      if (!windowMode) resetWindows(); // Snap back to grid if turned off
    });
  }

  function resetWindows() {
    document.querySelectorAll('.window').forEach(win => {
      win.style.display = '';
      win.style.transform = 'none';
      win.style.zIndex = '';
      win.dataset.x = 0;
      win.dataset.y = 0;
      win.classList.remove('maximized');
      const content = win.querySelector('.window-content');
      if (content) content.style.display = '';
    });
  }

  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      resetWindows();
    });
  }

  // Dragging and buttons logic
  let highestZ = 100;
  document.querySelectorAll('.window').forEach(win => {
    if (win.closest('#journal')) return;

    const titleBar = win.querySelector('.title-bar');
    const content = win.querySelector('.window-content');
    const btns = win.querySelectorAll('.title-bar-btn');
    const minBtn = btns[0];
    const maxBtn = btns[1];
    const closeBtn = btns[2];

    win.addEventListener('mousedown', () => {
      if (!windowMode) return;
      win.style.zIndex = ++highestZ;
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        if (!windowMode) return;
        e.stopPropagation();
        win.style.display = 'none';
      });
    }

    if (minBtn) {
      minBtn.innerHTML = '<span style="position:relative; top:-3px; color:black;">_</span>';
      minBtn.addEventListener('click', (e) => {
        if (!windowMode) return;
        e.stopPropagation();
        content.style.display = content.style.display === 'none' ? '' : 'none';
      });
    }

    if (maxBtn) {
      maxBtn.innerHTML = '<span style="color:black;">□</span>';
      maxBtn.style.fontSize = '12px';
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