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
  
  // Step 1: Get the current track
  const recentTracksUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`;

  try {
    const res = await fetch(recentTracksUrl);
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

    // Step 2: Use album.getinfo for the image
    const artist = track.artist['#text'];
    const album = track.album['#text'];
    
    if (artist && album && artElement) {
      const albumInfoUrl = `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${apiKey}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&format=json`;
      
      const albumRes = await fetch(albumInfoUrl);
      const albumData = await albumRes.json();
      
      if (albumData.album && albumData.album.image) {
        // Grab the 'large' or 'medium' image
        const imageUrl = albumData.album.image[2]['#text'] || albumData.album.image[1]['#text'];
        
        if (imageUrl && imageUrl.startsWith('http')) {
          artElement.src = imageUrl;
        } else {
          artElement.src = 'https://win98icons.alexmeub.com/icons/png/cd_audio_cd_a-3.png';
        }
      } else {
        artElement.src = 'https://win98icons.alexmeub.com/icons/png/cd_audio_cd_a-3.png';
      }
    } else if (artElement) {
       artElement.src = 'https://win98icons.alexmeub.com/icons/png/cd_audio_cd_a-3.png';
    }

  } catch (err) {
    console.error('Error fetching Last.fm data:', err);
  }
}