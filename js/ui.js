const poseToggle = document.getElementById("poseToggle");
const poseDropdown = document.getElementById("poseDropdown");
const poseButtons = document.querySelectorAll(".pose-btn");
const currentPoseImage = document.getElementById("currentPoseImage");

const brushSizeSlider = document.getElementById("brushSize");
const brushSizeVisual = document.getElementById("brushSizeVisual");
const colorBlackBtn = document.getElementById("colorBlack");
const colorWhiteBtn = document.getElementById("colorWhite");
const undoBtn = document.getElementById("undoBtn");
const clearBtn = document.getElementById("clearBtn");

// Share Button Elements
const shareBtn = document.getElementById("shareBtn");
const shareOptions = document.getElementById("shareOptions");
const saveAsFileBtn = document.getElementById("saveAsFileBtn");
const shareControls = document.getElementById("shareControls"); // Reference to dropdown parent

// Global drawing state
window.brushColor = "black";
window.brushSize = 5;

// --- Pose Dropdown Controls ---
poseToggle.addEventListener("click", () => {
  poseDropdown.classList.toggle("open");
  const isExpanded = poseDropdown.classList.contains("open");
  poseToggle.setAttribute("aria-expanded", isExpanded);

  // Close share dropdown
  shareControls.classList.remove("open");
  shareBtn.setAttribute("aria-expanded", "false");
});

poseButtons.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    poseButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    const imgElement = btn.querySelector('img');
    if (imgElement && currentPoseImage) {
      currentPoseImage.src = imgElement.src;
      currentPoseImage.alt = imgElement.alt;
    }

    if (window.setPose) {
      window.setPose(index);
    }

    poseDropdown.classList.remove("open");
    poseToggle.setAttribute("aria-expanded", "false");
  });
});

const sizeButtons = document.querySelectorAll(".size-btn");

sizeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    sizeButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    const sizeValue = parseInt(btn.dataset.size, 10);
    if (window.setSize) {
      window.setSize(sizeValue);
    }
  });
});

// Close dropdowns on outside click
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

// --- Brush Size Control ---
function updateBrushSizeVisual() {
  const minVisualSize = 8;
  const maxVisualSize = 40;
  const minBrushRange = 1;
  const maxBrushRange = 20;

  const scaledSize = minVisualSize +
    ((window.brushSize - minBrushRange) / (maxBrushRange - minBrushRange)) * (maxVisualSize - minVisualSize);

  brushSizeVisual.style.width = `${scaledSize}px`;
  brushSizeVisual.style.height = `${scaledSize}px`;
  brushSizeVisual.style.backgroundColor = window.brushColor;
}

brushSizeSlider.addEventListener("input", (e) => {
  window.brushSize = parseInt(e.target.value, 10);
  updateBrushSizeVisual();
});

// --- Color Picker ---
function selectColor(color) {
  window.brushColor = color;

  colorBlackBtn.classList.remove("selected");
  colorWhiteBtn.classList.remove("selected");

  if (color === "black") {
    colorBlackBtn.classList.add("selected");
  } else if (color === "white") {
    colorWhiteBtn.classList.add("selected");
  }

  updateBrushSizeVisual();
}

colorBlackBtn.addEventListener("click", () => selectColor("black"));
colorWhiteBtn.addEventListener("click", () => selectColor("white"));

// --- Undo and Clear ---
undoBtn.addEventListener("click", () => {
  if (window.undoLastStroke) {
    window.undoLastStroke();
  }
});

clearBtn.addEventListener("click", () => {
  if (window.clearDrawingCanvas) {
    window.clearDrawingCanvas();
  }
});

// --- Share Functionality ---
function getCombinedCanvasDataURL() {
  const riveCanvas = document.getElementById("riveCanvas");
  const drawingCanvas = document.getElementById("drawingCanvas");

  if (!riveCanvas || !drawingCanvas) {
    console.error("Canvases not found for sharing.");
    return null;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;

  const compositeCanvas = document.createElement("canvas");
  compositeCanvas.width = width;
  compositeCanvas.height = height;
  const compositeCtx = compositeCanvas.getContext("2d");

  compositeCtx.drawImage(
    riveCanvas,
    0, 0, riveCanvas.width, riveCanvas.height,
    0, 0, width, height
  );

  compositeCtx.drawImage(
    drawingCanvas,
    0, 0, drawingCanvas.width, drawingCanvas.height,
    0, 0, width, height
  );

  return compositeCanvas.toDataURL("image/png");
}

shareBtn.addEventListener("click", (e) => {
  e.preventDefault();

  shareControls.classList.toggle("open");
  const isExpanded = shareControls.classList.contains("open");
  shareBtn.setAttribute("aria-expanded", isExpanded);

  poseDropdown.classList.remove("open");
  poseToggle.setAttribute("aria-expanded", "false");
});

saveAsFileBtn.addEventListener("click", () => {
  shareControls.classList.remove("open");
  shareBtn.setAttribute("aria-expanded", "false");

  const dataURL = getCombinedCanvasDataURL();
  if (dataURL) {
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = "doodlebase-creation.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    alert("Could not generate image for download. Please try again.");
  }
});

// --- Snackbar for Clipboard Feedback ---
function showSnackbar(message = "Copied to clipboard!") {
  const snackbar = document.getElementById("copySnackbar");
  if (!snackbar) return;

  snackbar.textContent = message;
  snackbar.classList.add("show");

  setTimeout(() => {
    snackbar.classList.remove("show");
  }, 3000);
}

// --- Copy to Clipboard ---
const copyToClipboardBtn = document.getElementById("copyToClipboardBtn");

copyToClipboardBtn.addEventListener("click", async () => {
  const riveCanvas = document.getElementById("riveCanvas");
  const drawingCanvas = document.getElementById("drawingCanvas");

  if (!riveCanvas || !drawingCanvas) {
    alert("Canvases not found for copying.");
    return;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;

  const compositeCanvas = document.createElement("canvas");
  compositeCanvas.width = width;
  compositeCanvas.height = height;
  const compositeCtx = compositeCanvas.getContext("2d");

  compositeCtx.fillStyle = "#ffffff";
  compositeCtx.fillRect(0, 0, width, height);

  compositeCtx.drawImage(riveCanvas, 0, 0, riveCanvas.width, riveCanvas.height, 0, 0, width, height);
  compositeCtx.drawImage(drawingCanvas, 0, 0, drawingCanvas.width, drawingCanvas.height, 0, 0, width, height);

  try {
    const blob = await new Promise(resolve => compositeCanvas.toBlob(resolve, "image/png"));
    if (!blob) {
      alert("Failed to generate image from canvas.");
      return;
    }

    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob })
    ]);

    showSnackbar("✅ Copied to clipboard!");
  } catch (err) {
    console.error("Copy to clipboard failed:", err);
    alert("Copy failed. Your browser may not support copying images.");
  }
});

// --- Initial Page Setup ---
document.addEventListener("DOMContentLoaded", () => {
  const initialPoseBtn = document.querySelector('.pose-btn.selected');
  if (initialPoseBtn) {
    const imgElement = initialPoseBtn.querySelector('img');
    if (imgElement && currentPoseImage) {
      currentPoseImage.src = imgElement.src;
      currentPoseImage.alt = imgElement.alt;
    }
  }

  updateBrushSizeVisual();
  selectColor(window.brushColor);
});
