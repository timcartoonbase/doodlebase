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
// We need a reference to the parent div for share options: #shareControls
const shareControls = document.getElementById("shareControls"); // <--- NEW REFERENCE

// Global variables for drawingCanvas.js to access
window.brushColor = "black";
window.brushSize = 5;

// --- Pose Dropdown Controls ---
poseToggle.addEventListener("click", () => {
  poseDropdown.classList.toggle("open");
  const isExpanded = poseDropdown.classList.contains("open");
  poseToggle.setAttribute("aria-expanded", isExpanded);

  // Close other dropdowns if open
  shareControls.classList.remove("open"); // <--- USE shareControls HERE
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

// Close dropdowns when clicking outside
document.addEventListener("click", (e) => {
  if (!poseDropdown.contains(e.target)) {
    poseDropdown.classList.remove("open");
    poseToggle.setAttribute("aria-expanded", "false");
  }
  // This needs to check the parent shareControls, not the child shareOptions
  if (!shareControls.contains(e.target) && e.target !== shareBtn) { // <--- USE shareControls HERE
    shareControls.classList.remove("open"); // <--- USE shareControls HERE
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

// --- Undo and Clear Buttons ---

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

// Helper function to combine canvases and get data URL
function getCombinedCanvasDataURL() {
    const riveCanvas = document.getElementById("riveCanvas");
    const drawingCanvas = document.getElementById("drawingCanvas");

    if (!riveCanvas || !drawingCanvas) {
        console.error("Canvases not found for sharing.");
        return null;
    }

    // Use window.innerWidth/Height for the composite canvas,
    // as both riveCanvas and drawingCanvas should now be set to these dimensions internally.
    const width = window.innerWidth;
    const height = window.innerHeight;

    const compositeCanvas = document.createElement("canvas");
    compositeCanvas.width = width;
    compositeCanvas.height = height;
    const compositeCtx = compositeCanvas.getContext("2d");

    // Diagnostic logs (KEEP THESE FOR TESTING!)
    console.log("--- Combining Canvases ---");
    console.log("Window Dimensions:", width, height);
    console.log("Rive Canvas Internal:", riveCanvas.width, riveCanvas.height);
    console.log("Drawing Canvas Internal:", drawingCanvas.width, drawingCanvas.height);
    console.log("--------------------------");

    compositeCtx.drawImage(
        riveCanvas,
        0, 0, riveCanvas.width, riveCanvas.height, // Source rectangle (entire Rive internal canvas)
        0, 0, width, height // Destination rectangle (entire composite canvas)
    );

    compositeCtx.drawImage(
        drawingCanvas,
        0, 0, drawingCanvas.width, drawingCanvas.height, // Source rectangle (entire Drawing internal canvas)
        0, 0, width, height // Destination rectangle (entire composite canvas)
    );

    return compositeCanvas.toDataURL("image/png");
}


// Share button toggle (opens the dropdown with "Save as PNG")
shareBtn.addEventListener("click", (e) => {
    e.preventDefault();

    shareControls.classList.toggle("open"); // <--- USE shareControls HERE
    const isExpanded = shareControls.classList.contains("open"); // <--- USE shareControls HERE
    shareBtn.setAttribute("aria-expanded", isExpanded);

    // Close other dropdowns if open
    poseDropdown.classList.remove("open");
    poseToggle.setAttribute("aria-expanded", "false");
});

// Save as File Button (initiates the download)
saveAsFileBtn.addEventListener("click", () => {
    shareControls.classList.remove("open"); // <--- USE shareControls HERE
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


// Initial setup when the page loads
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