const menuToggle = document.querySelector("#menuToggle");
const mainNav = document.querySelector("#mainNav");

menuToggle?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
    mainNav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

// Gallery filter: each card is tagged with the artist's name.
const kidFilter = document.querySelector("#kidFilter");
const galleryGrid = document.querySelector("#galleryGrid");
const filterCount = document.querySelector("#filterCount");

function filterDrawings() {
  const selectedArtist = kidFilter?.value || "all";
  let visible = 0;

  galleryGrid?.querySelectorAll(".art-card").forEach((card) => {
    const matches = selectedArtist === "all" || card.dataset.artist === selectedArtist;
    card.hidden = !matches;
    if (matches) visible += 1;
  });

  if (filterCount) {
    filterCount.textContent = `${visible} drawing${visible === 1 ? "" : "s"}`;
  }
}
kidFilter?.addEventListener("change", filterDrawings);

// Parent mode demo. This browser-only PIN is a usability gate, NOT real security.
// For a deployed family website, enforce parent authentication on the server.
const parentModeButton = document.querySelector("#parentModeButton");
const unlockParentButton = document.querySelector("#unlockParentButton");
const parentLockMessage = document.querySelector("#parentLockMessage");
const uploadFormWrap = document.querySelector("#uploadFormWrap");
const uploadForm = document.querySelector("#uploadForm");
const formMessage = document.querySelector("#formMessage");

function setParentMode(isUnlocked) {
  if (parentLockMessage) parentLockMessage.hidden = isUnlocked;
  if (uploadFormWrap) uploadFormWrap.hidden = !isUnlocked;
  if (parentModeButton) {
    parentModeButton.textContent = isUnlocked ? "🔓 Parent mode: unlocked" : "🔒 Parent mode: locked";
    parentModeButton.setAttribute("aria-pressed", String(isUnlocked));
  }
  if (isUnlocked) {
    document.querySelector("#uploadSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function unlockParentMode() {
  const pin = window.prompt("Parent mode demo PIN: enter 1234 to unlock.");
  if (pin === "1234") {
    setParentMode(true);
  } else if (pin !== null) {
    window.alert("That PIN didn't match. Try again.");
  }
}
parentModeButton?.addEventListener("click", () => {
  const isUnlocked = uploadFormWrap && !uploadFormWrap.hidden;
  if (isUnlocked) {
    setParentMode(false);
  } else {
    unlockParentMode();
  }
});
unlockParentButton?.addEventListener("click", unlockParentMode);

// Front-end demo only: uploaded images are added to this page in the current browser session.
// No file is sent to a server or saved permanently.
uploadForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = document.querySelector("#drawingTitle").value.trim();
  const artist = document.querySelector("#artistName").value.trim();
  const fileInput = document.querySelector("#drawingFile");
  const file = fileInput.files?.[0];

  if (!title || !artist || !file) {
    formMessage.textContent = "Please add a title, artist name, and picture.";
    return;
  }

  if (!file.type.startsWith("image/")) {
    formMessage.textContent = "Please choose an image file.";
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    formMessage.textContent = "That picture is quite large. Please choose an image under 8 MB.";
    return;
  }

  const imageUrl = URL.createObjectURL(file);
  const card = document.createElement("article");
  card.className = "art-card";
  card.dataset.artist = artist;

  const artwork = document.createElement("div");
  artwork.className = "artwork uploaded-artwork";
  const image = document.createElement("img");
  image.src = imageUrl;
  image.alt = `Drawing titled ${title}`;
  image.loading = "lazy";
  image.style.cssText = "width:100%;height:100%;object-fit:contain;position:relative;z-index:1;background:#fff;";
  artwork.appendChild(image);

  const meta = document.createElement("div");
  meta.className = "art-meta";
  const avatar = document.createElement("span");
  avatar.className = "avatar avatar-lilac";
  avatar.textContent = "🎨";
  const textWrap = document.createElement("div");
  const strong = document.createElement("strong");
  strong.textContent = title;
  const small = document.createElement("small");
  small.textContent = `${artist} · Just now`;
  textWrap.append(strong, small);
  meta.append(avatar, textWrap);
  card.append(artwork, meta);
  galleryGrid.prepend(card);

  // Add new artist to filter if not already present.
  if (kidFilter && !Array.from(kidFilter.options).some((option) => option.value === artist)) {
    const option = document.createElement("option");
    option.value = artist;
    option.textContent = artist;
    kidFilter.appendChild(option);
  }
  if (kidFilter) kidFilter.value = "all";
  filterDrawings();

  uploadForm.reset();
  formMessage.textContent = "Lovely work! Your drawing has been added to this preview.";
  card.scrollIntoView({ behavior: "smooth", block: "center" });
});

filterDrawings();


const galleryCards = [
  ...document.querySelectorAll("#galleryGrid .art-card")
];

const artViewer = document.getElementById("artViewer");
const viewerImage = document.getElementById("viewerImage");
const viewerArtist = document.getElementById("viewerArtist");
const viewerDate = document.getElementById("viewerDate");
const viewerCounter = document.getElementById("viewerCounter");

const viewerClose = document.getElementById("viewerClose");
const viewerPrev = document.getElementById("viewerPrev");
const viewerNext = document.getElementById("viewerNext");

let currentArtworkIndex = 0;
let previouslyFocusedElement = null;

function displayArtwork(index) {
  if (!galleryCards.length) return;

  // Wrap around at the beginning and end
  currentArtworkIndex =
    (index + galleryCards.length) % galleryCards.length;

  const card = galleryCards[currentArtworkIndex];
  const image = card.querySelector(".artwork-image");

  if (!image) return;

  viewerImage.src = image.src;
  viewerImage.alt = image.alt || "Children's artwork";

  viewerArtist.textContent =
    card.dataset.artist ||
    card.querySelector(".art-meta strong")?.textContent ||
    "Little Artist";

  viewerDate.textContent =
    card.dataset.date ||
    card.querySelector(".art-meta small")?.textContent ||
    "";

  viewerCounter.textContent =
    `${currentArtworkIndex + 1} / ${galleryCards.length}`;

  const hasMultipleImages = galleryCards.length > 1;
  viewerPrev.hidden = !hasMultipleImages;
  viewerNext.hidden = !hasMultipleImages;
}

function openArtViewer(index) {
  previouslyFocusedElement = document.activeElement;

  displayArtwork(index);

  artViewer.classList.add("active");
  artViewer.setAttribute("aria-hidden", "false");
  document.body.classList.add("viewer-open");

  viewerClose.focus();
}

function closeArtViewer() {
  artViewer.classList.remove("active");
  artViewer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("viewer-open");

  viewerImage.removeAttribute("src");

  if (previouslyFocusedElement?.isConnected) {
    previouslyFocusedElement.focus();
  }
}

// Click any artwork to open it
galleryCards.forEach((card, index) => {
  card.addEventListener("click", () => openArtViewer(index));
});

// Navigate between drawings
viewerPrev.addEventListener("click", () => {
  displayArtwork(currentArtworkIndex - 1);
});

viewerNext.addEventListener("click", () => {
  displayArtwork(currentArtworkIndex + 1);
});

// Close button
viewerClose.addEventListener("click", closeArtViewer);

// Close when clicking the dark background
artViewer.addEventListener("click", event => {
  if (event.target === artViewer) {
    closeArtViewer();
  }
});

// Keyboard controls
document.addEventListener("keydown", event => {
  if (!artViewer.classList.contains("active")) return;

  if (event.key === "Escape") {
    closeArtViewer();
  } else if (event.key === "ArrowLeft") {
    displayArtwork(currentArtworkIndex - 1);
  } else if (event.key === "ArrowRight") {
    displayArtwork(currentArtworkIndex + 1);
  }
});
