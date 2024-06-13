const SPOTIFY_CLIENT_ID = "1d50e930a8b34a4998dc537704793eb2";
const SPOTIFY_CLIENT_SECRET = "b6fbf298ba2141f49f9859341ec742dc";
const PLAYLIST_ID = "3j0H3udE81fjpT2H84xype";
const container = document.querySelector('div[data-js="tracks"]');
let currentAudio = null;
let currentTrackIndex = 0;
let tracks = [];
let shuffled = false;

function fetchPlaylist(token, playlistId) {
  fetch(`https://api.spotify.com/v1/playlists/${PLAYLIST_ID}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.tracks && data.tracks.items) {
        tracks = data.tracks.items;
        addTracksToPage(tracks);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function addTracksToPage(items) {
  const ul = document.createElement("ul");

  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.classList.add("track-item");
    li.dataset.index = index;

    li.innerHTML = `
      <p>${item.track.name} by ${item.track.artists.map((artist) => artist.name).join(", ")}</p>
      ${item.track.preview_url ? `<audio src="${item.track.preview_url}"></audio>` : "<p>No preview available</p>"}
      ${item.track.album.images[0] ? `<img class="albumimg" src="${item.track.album.images[0].url}" alt="${item.track.name} Album Cover"></img>` : "<p>No preview available</p>"}
    `;

    li.addEventListener("click", () => playTrack(index));
    ul.appendChild(li);
  });
  container.appendChild(ul);
}

function playTrack(index) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  // Remove 'playing' class from previously played track
  const previousPlaying = document.querySelector('.track-item.playing');
  if (previousPlaying) {
    previousPlaying.classList.remove('playing');
  }

  currentTrackIndex = index;
  const track = tracks[index].track;
  const audioElement = new Audio(track.preview_url);
  currentAudio = audioElement;

  document.querySelector(".song_title").textContent = track.name;
  document.querySelector(".artist-title").textContent = track.artists.map((artist) => artist.name).join(", ");
  document.getElementById("album-cover-img").src = track.album.images[0].url;

  currentAudio.play();
  updateProgressBar();

  currentAudio.addEventListener("timeupdate", updateProgressBar);
  currentAudio.addEventListener("ended", () => {
    playNextTrack();
  });

  // Add 'playing' class to current track
  const currentPlaying = document.querySelector(`.track-item[data-index="${index}"]`);
  if (currentPlaying) {
    currentPlaying.classList.add('playing');
  }

  // Set the play button to pause state
  const playIcon = document.querySelector(".play-icon");
  const pauseIcon = document.querySelector(".pause-icon");
  playIcon.style.display = "none";
  pauseIcon.style.display = "block";
}

function updateProgressBar() {
  const progressBar = document.getElementById("progress-bar");
  const currentTimeElement = document.getElementById("current-time");
  const durationElement = document.getElementById("duration");

  if (currentAudio) {
    const currentTime = currentAudio.currentTime;
    const duration = currentAudio.duration;

    currentTimeElement.textContent = formatTime(currentTime);
    durationElement.textContent = formatTime(duration);

    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function fetchAccessToken() {
  fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${SPOTIFY_CLIENT_ID}&client_secret=${SPOTIFY_CLIENT_SECRET}`,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.access_token) {
        fetchPlaylist(data.access_token, PLAYLIST_ID);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function togglePlayPause() {
  const playIcon = document.querySelector(".play-icon");
  const pauseIcon = document.querySelector(".pause-icon");

  if (currentAudio) {
    if (currentAudio.paused) {
      currentAudio.play();
      playIcon.style.display = "none";
      pauseIcon.style.display = "block";
    } else {
      currentAudio.pause();
      playIcon.style.display = "block";
      pauseIcon.style.display = "none";
    }
  }
}

function playNextTrack() {
  if (shuffled) {
    currentTrackIndex = Math.floor(Math.random() * tracks.length);
  } else {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
  }
  playTrack(currentTrackIndex);
}

function playPreviousTrack() {
  if (shuffled) {
    currentTrackIndex = Math.floor(Math.random() * tracks.length);
  } else {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
  }
  playTrack(currentTrackIndex);
}

function shuffleTracks() {
  shuffled = !shuffled;
  if (shuffled) {
    playNextTrack();
  }
  toggleShuffleButtonActive(); // Call to toggle shuffle button state
}

// Function to toggle 'active' class on shuffle button
function toggleShuffleButtonActive() {
  const shuffleButton = document.querySelector(".shuffle-button");
  shuffleButton.classList.toggle("active");
}

document.addEventListener("DOMContentLoaded", () => {
  const playIcon = document.querySelector(".play-icon");
  const pauseIcon = document.querySelector(".pause-icon");
  const nextIcon = document.querySelector(".next-icon");
  const prevIcon = document.querySelector(".prev-icon");
  const shuffleButton = document.querySelector(".shuffle-button");

  playIcon.addEventListener("click", togglePlayPause);
  pauseIcon.addEventListener("click", togglePlayPause);
  nextIcon.addEventListener("click", playNextTrack);
  prevIcon.addEventListener("click", playPreviousTrack);
  shuffleButton.addEventListener("click", shuffleTracks);

  // Set the initial state of the play/pause icons
  playIcon.style.display = "block";
  pauseIcon.style.display = "none";
});

fetchAccessToken();

