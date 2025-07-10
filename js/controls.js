const brushSizeSlider = document.getElementById("brushSize");
const brushSizeVisual = document.getElementById("brushSizeVisual");
const colorBlackBtn = document.getElementById("colorBlack");
const colorWhiteBtn = document.getElementById("colorWhite");
const undoBtn = document.getElementById("undoBtn");
const clearBtn = document.getElementById("clearBtn");

const shareBtn = document.getElementById("shareBtn");
const shareOptions = document.getElementById("shareOptions");
const shareControls = document.getElementById("shareControls");
const saveAsFileBtn = document.getElementById("saveAsFileBtn");
const copyToClipboardBtn = document.getElementById("copyToClipboardBtn");
const copyBtn2 = document.getElementById("copyToClipboardBtn2");
const saveBtn2 = document.getElementById("saveAsFileBtn2");

const posButtons = document.querySelectorAll(".pos-btn");

const poseToggle = document.getElementById("poseToggle");
const poseDropdown = document.getElementById("poseDropdown");
const poseButtons = document.querySelectorAll(".pose-btn");
const currentPoseImage = document.getElementById("currentPoseImage");

const hamburgerBtn = document.getElementById("hamburgerBtn");
const hamburgerMenu = document.getElementById("hamburgerMenu");

window.brushColor = "black";
window.brushSize = 5;

posButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove .selected from all buttons
    posButtons.forEach((b) => b.classList.remove("selected"));

    // Add .selected to the clicked button
    btn.classList.add("selected");

    // Optional: Access selected position
    const selectedPosition = btn.dataset.pos;
    console.log("Selected position:", selectedPosition);

    // If you want to update a Rive input later, do it here
    // window.setRivePosition?.(selectedPosition);
  });
});

poseToggle.addEventListener("click", () => {
  poseDropdown.classList.toggle("open");
  poseToggle.setAttribute(
    "aria-expanded",
    poseDropdown.classList.contains("open")
  );

  shareControls.classList.remove("open");
  shareBtn.setAttribute("aria-expanded", "false");
});

poseButtons.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    poseButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");

    const img = btn.querySelector("img");
    if (img && currentPoseImage) {
      currentPoseImage.src = img.src;
      currentPoseImage.alt = img.alt;
    }

    // if (window.setPose) window.setPose(index);

    poseDropdown.classList.remove("open");
    poseToggle.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("click", (e) => {
  if (!poseDropdown.contains(e.target)) {
    poseDropdown.classList.remove("open");
    poseToggle.setAttribute("aria-expanded", "false");
  }

  if (!shareControls.contains(e.target) && e.target !== shareBtn) {
    shareControls.classList.remove("open");
    shareBtn.setAttribute("aria-expanded", "false");
  }
});

const sizeButtons = document.querySelectorAll(".size-btn");
sizeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    sizeButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    if (window.setSize) window.setSize(parseInt(btn.dataset.size, 10));
  });
});

function updateBrushSizeVisual() {
  const size = window.brushSize;
  const min = 8,
    max = 40;
  const scaled = min + ((size - 1) / 19) * (max - min);
  brushSizeVisual.style.width = `${scaled}px`;
  brushSizeVisual.style.height = `${scaled}px`;
  brushSizeVisual.style.backgroundColor = window.brushColor;
}

function selectColor(color) {
  window.brushColor = color;
  colorBlackBtn.classList.toggle("selected", color === "black");
  colorWhiteBtn.classList.toggle("selected", color === "white");
  updateBrushSizeVisual();
}

brushSizeSlider.addEventListener("input", (e) => {
  window.brushSize = parseInt(e.target.value, 10);
  updateBrushSizeVisual();
});

colorBlackBtn.addEventListener("click", () => selectColor("black"));
colorWhiteBtn.addEventListener("click", () => selectColor("white"));

undoBtn.addEventListener("click", () => window.undoLastStroke?.());
clearBtn.addEventListener("click", () => window.clearDrawingCanvas?.());

// --- Sharing and Clipboard ---

function getCombinedCanvasDataURL() {
  const width = window.innerWidth,
    height = window.innerHeight;
  const compositeCanvas = document.createElement("canvas");
  compositeCanvas.width = width;
  compositeCanvas.height = height;
  const ctx = compositeCanvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(
    riveCanvas,
    0,
    0,
    riveCanvas.width,
    riveCanvas.height,
    0,
    0,
    width,
    height
  );
  ctx.drawImage(
    drawCanvas,
    0,
    0,
    drawCanvas.width,
    drawCanvas.height,
    0,
    0,
    width,
    height
  );

  return compositeCanvas.toDataURL("image/png");
}

shareBtn.addEventListener("click", (e) => {
  e.preventDefault();
  shareControls.classList.toggle("open");
  shareBtn.setAttribute(
    "aria-expanded",
    shareControls.classList.contains("open")
  );
  poseDropdown.classList.remove("open");
  poseToggle.setAttribute("aria-expanded", "false");
});

function saveCanvasAsPNG() {
  const dataURL = getCombinedCanvasDataURL();
  if (dataURL) {
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = "doodlebase-creation.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    alert("Could not generate image.");
  }
}

saveAsFileBtn.addEventListener("click", saveCanvasAsPNG);

async function copyCanvasToClipboard() {
  const width = window.innerWidth,
    height = window.innerHeight;
  const compositeCanvas = document.createElement("canvas");
  compositeCanvas.width = width;
  compositeCanvas.height = height;
  const ctx = compositeCanvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(
    riveCanvas,
    0,
    0,
    riveCanvas.width,
    riveCanvas.height,
    0,
    0,
    width,
    height
  );
  ctx.drawImage(
    drawCanvas,
    0,
    0,
    drawCanvas.width,
    drawCanvas.height,
    0,
    0,
    width,
    height
  );

  try {
    const blob = await new Promise((res) =>
      compositeCanvas.toBlob(res, "image/png")
    );
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    showSnackbar("✅ Copied to clipboard!");
  } catch (err) {
    console.error("Clipboard error:", err);
    alert("Copy failed.");
  }
}

copyToClipboardBtn.addEventListener("click", copyCanvasToClipboard);
copyBtn2?.addEventListener("click", copyCanvasToClipboard);

saveBtn2?.addEventListener("click", () => {
  saveCanvasAsPNG();
});

function showSnackbar(msg = "Copied!") {
  const snackbar = document.getElementById("copySnackbar");
  if (!snackbar) return;
  snackbar.textContent = msg;
  snackbar.classList.add("show");
  setTimeout(() => snackbar.classList.remove("show"), 3000);
}

// Hamburger Menu Toggle
hamburgerBtn.addEventListener("click", () => {
  const expanded = hamburgerBtn.getAttribute("aria-expanded") === "true";
  hamburgerBtn.setAttribute("aria-expanded", String(!expanded));
  hamburgerMenu.classList.toggle("show");
  hamburgerMenu.hidden = expanded;
});

document.addEventListener("DOMContentLoaded", () => {
  const initPose = document.querySelector(".pose-btn.selected");
  if (initPose) {
    const img = initPose.querySelector("img");
    if (img && currentPoseImage) {
      currentPoseImage.src = img.src;
      currentPoseImage.alt = img.alt;
    }
  }

  if (typeof updateBrushSizeVisual === "function") updateBrushSizeVisual();
  if (typeof selectColor === "function") selectColor(window.brushColor);
});
