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
