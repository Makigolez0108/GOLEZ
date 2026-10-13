document.addEventListener("DOMContentLoaded", function () {

  const menuButton = document.getElementById("menuButton");
  const mobileMenu = document.getElementById("mobileMenu");
  const menuIcon = document.getElementById("menuIcon");

  function closeMobileMenu() {
    if (!menuButton || !mobileMenu) return;

    mobileMenu.classList.add("hidden");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");

    if (menuIcon) {
      menuIcon.classList.remove("fa-xmark");
      menuIcon.classList.add("fa-bars");
    }
  }

  function toggleMobileMenu() {
    if (!menuButton || !mobileMenu) return;

    const opening = mobileMenu.classList.contains("hidden");

    mobileMenu.classList.toggle("hidden", !opening);
    menuButton.setAttribute("aria-expanded", String(opening));
    menuButton.setAttribute(
      "aria-label",
      opening ? "Close navigation" : "Open navigation"
    );

    if (menuIcon) {
      menuIcon.classList.toggle("fa-bars", !opening);
      menuIcon.classList.toggle("fa-xmark", opening);
    }
  }

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", toggleMobileMenu);

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1280) {
        closeMobileMenu();
      }
    });
  }

  const audioTracks = [
    document.getElementById("audio1"),
    document.getElementById("audio2"),
    document.getElementById("audio3")
  ];

  const trackNames = [
    "Track 1: Island Vibes",
    "Track 2: Tropical Dreams",
    "Track 3: Fiesta Time"
  ];

  const playButton = document.getElementById("playButton");
  const playIcon = document.getElementById("playIcon");
  const previousButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");
  const trackStatus = document.getElementById("trackStatus");
  const audioMessage = document.getElementById("audioMessage");
  const trackSelect = document.getElementById("trackSelect");
  const volumeSlider = document.getElementById("volumeSlider");
  const volumeText = document.getElementById("volumeText");

  let currentTrackIndex = 0;
  let isPlaying = false;
  let playRequestId = 0;

  const initialVolume = volumeSlider
    ? Number(volumeSlider.value)
    : 0.3;

  audioTracks.forEach(function (audio) {
    if (audio) {
      audio.volume = initialVolume;
    }
  });

  function showMessage(message) {
    if (audioMessage) {
      audioMessage.textContent = message;
    }
  }

  function updatePlayerDisplay(message) {
    if (trackStatus) {
      trackStatus.textContent =
        message || trackNames[currentTrackIndex];
    }

    if (playIcon) {
      playIcon.classList.toggle("fa-play", !isPlaying);
      playIcon.classList.toggle("fa-pause", isPlaying);
    }

    if (playButton) {
      playButton.setAttribute(
        "aria-label",
        isPlaying ? "Pause music" : "Play music"
      );

      playButton.title = isPlaying ? "Pause" : "Play";
    }

    if (trackSelect) {
      trackSelect.value = String(currentTrackIndex);
    }
  }

  function stopOtherTracks(keepIndex) {
    audioTracks.forEach(function (audio, index) {
      if (!audio || index === keepIndex) return;

      audio.pause();

      try {
        audio.currentTime = 0;
      } catch (error) {
      }
    });
  }

  function pauseCurrentTrack() {
    playRequestId++;

    const audio = audioTracks[currentTrackIndex];

    if (audio) {
      audio.pause();
    }

    isPlaying = false;

    updatePlayerDisplay("Paused: " + trackNames[currentTrackIndex]);
    showMessage("Music paused.");
  }

  async function playCurrentTrack() {
    const audio = audioTracks[currentTrackIndex];

    if (!audio) {
      isPlaying = false;
      updatePlayerDisplay("Audio player unavailable");
      showMessage("Check the audio elements in index.html.");
      return;
    }

    const requestId = ++playRequestId;

    stopOtherTracks(currentTrackIndex);

    if (volumeSlider) {
      audio.volume = Number(volumeSlider.value);
    }

    try {
      await audio.play();

      if (requestId !== playRequestId) {
        audio.pause();
        return;
      }

      isPlaying = true;

      updatePlayerDisplay("Playing: " + trackNames[currentTrackIndex]);
      showMessage("Now playing! Enjoy your island music.");

    } catch (error) {
      if (requestId !== playRequestId) return;

      isPlaying = false;
      updatePlayerDisplay(trackNames[currentTrackIndex]);

      showMessage(
        "Cannot play this song. Check AUDIO/audio" +
        (currentTrackIndex + 1) +
        ".mp3 and make sure the file is a valid MP3."
      );

      console.error("Music playback error:", error);
    }
  }

  async function selectTrack(index, autoplay) {
    if (audioTracks.length === 0) return;

    playRequestId++;

    currentTrackIndex =
      (index + audioTracks.length) % audioTracks.length;

    stopOtherTracks();

    isPlaying = false;

    updatePlayerDisplay(trackNames[currentTrackIndex]);

    if (autoplay) {
      await playCurrentTrack();
    } else {
      showMessage(
        "Selected " + trackNames[currentTrackIndex] +
        ". Press play to listen."
      );
    }
  }

  if (playButton) {
    playButton.addEventListener("click", function () {
      if (isPlaying) {
        pauseCurrentTrack();
      } else {
        playCurrentTrack();
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      selectTrack(currentTrackIndex + 1, true);
    });
  }

  if (previousButton) {
    previousButton.addEventListener("click", function () {
      selectTrack(currentTrackIndex - 1, true);
    });
  }

  if (trackSelect) {
    trackSelect.addEventListener("change", function () {
      const selectedIndex = Number(trackSelect.value);

      selectTrack(selectedIndex, isPlaying);
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener("input", function () {
      const volume = Number(volumeSlider.value);

      audioTracks.forEach(function (audio) {
        if (audio) {
          audio.volume = volume;
        }
      });

      if (volumeText) {
        volumeText.textContent =
          Math.round(volume * 100) + "%";
      }
    });
  }

  audioTracks.forEach(function (audio, index) {
    if (!audio) return;

    audio.addEventListener("ended", function () {
      if (index === currentTrackIndex) {
        selectTrack(currentTrackIndex + 1, true);
      }
    });

    audio.addEventListener("error", function () {
      if (index !== currentTrackIndex) return;

      isPlaying = false;
      updatePlayerDisplay(trackNames[currentTrackIndex]);

      showMessage(
        "Audio file missing or unsupported: AUDIO/audio" +
        (index + 1) + ".mp3"
      );
    });
  });
  
  updatePlayerDisplay(trackNames[currentTrackIndex]);

  if (volumeText) {
    volumeText.textContent = Math.round(initialVolume * 100) + "%";
  }

  showMessage(
    "Ready! Add your MP3 files to the AUDIO folder and press play."
  );

});
