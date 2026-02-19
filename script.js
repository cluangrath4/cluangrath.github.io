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
    
    if (textElement) {
      if (isPlaying) {
        textElement.innerHTML = `<strong>${track.name}</strong><br><span style="color: #555;">by ${track.artist['#text']}</span>`;
      } else {
        textElement.innerHTML = `<em>Last played:</em><br>${track.name} <br><span style="color: #555;">by ${track.artist['#text']}</span>`;
      }
    }

    if (artElement && track.image && track.image.length > 0) {
      // Index 1 is usually the 'medium' sized image
      const imageUrl = track.image[1]['#text'];
      if (imageUrl) {
        artElement.src = imageUrl;
      } else {
        artElement.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='; // blank fallback
      }
    }

  } catch (err) {
    console.error('Error fetching Last.fm data:', err);
  }
}