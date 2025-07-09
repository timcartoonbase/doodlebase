const drawCanvas = document.getElementById("drawingCanvas");
const ctx = drawCanvas.getContext("2d");

let drawing = false;
let paths = []; // stack for undo
let currentPath = [];

// Expose undo and clear functions globally for ui.js to call
window.undoLastStroke = () => {
    paths.pop();
    redraw();
};

window.clearDrawingCanvas = () => {
    ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height); // Clear visually
    paths = []; // Clear stored paths
    currentPath = []; // Clear current path if any
};

drawCanvas.addEventListener("mousedown", (e) => {
  drawing = true;
  currentPath = [];
  draw(e); // Draw the very first point

  // Enable follow mode in Rive
  // 'follow' is expected to be a global variable from rive.js
  if (window.follow && "value" in window.follow) {
    window.follow.value = true;
  }
});

drawCanvas.addEventListener("mousemove", (e) => {
    // Only draw if 'drawing' flag is true
    draw(e);
});

drawCanvas.addEventListener("mouseup", () => {
  if (drawing) {
    drawing = false;
    paths.push([...currentPath]);
    currentPath = [];
  }

  // Disable follow mode in Rive
  if (window.follow && "value" in window.follow) {
    window.follow.value = false;
  }
});

// In case user moves off-canvas
drawCanvas.addEventListener("mouseleave", () => {
  if (drawing) {
    drawing = false;
    paths.push([...currentPath]);
    currentPath = [];

    if (window.follow && "value" in window.follow) {
      window.follow.value = false;
    }
  }
});

function draw(e) {
  if (!drawing) return;

  const x = e.offsetX;
  const y = e.offsetY;
  currentPath.push({ x, y, color: window.brushColor, size: window.brushSize }); // Use global variables

  ctx.strokeStyle = window.brushColor; // Use global variable
  ctx.lineWidth = window.brushSize;    // Use global variable
  ctx.lineCap = "round";

  ctx.beginPath();
  if (currentPath.length > 1) {
    const prev = currentPath[currentPath.length - 2];
    ctx.moveTo(prev.x, prev.y);
  } else {
    ctx.moveTo(x, y);
  }
  ctx.lineTo(x, y);
  ctx.stroke();
}

// redraw function remains the same, but uses global brushColor/brushSize
function redraw() {
  ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  for (const path of paths) {
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1];
      const b = path[i];

      ctx.strokeStyle = a.color; // Path stores its own color
      ctx.lineWidth = a.size;    // Path stores its own size
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }
}

function resizeCanvases() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const riveCanvas = document.getElementById("riveCanvas");
  if (riveCanvas) {
      // Set Rive canvas's internal dimensions explicitly to match viewport
      riveCanvas.width = width;
      riveCanvas.height = height;
      // Rive's resizeDrawingSurfaceToCanvas should then adapt to these new internal dimensions.
      // Call it here to make sure Rive updates its rendering based on new canvas size.
      if (window.r) { // Check if Rive instance is loaded
          window.r.resizeDrawingSurfaceToCanvas();
      }
      // CSS width/height (100vw/100vh) handle the display size
      riveCanvas.style.width = width + "px"; // Or just "100vw"
      riveCanvas.style.height = height + "px"; // Or just "100vh"
  }

  // Set drawing canvas's internal dimensions explicitly to match viewport
  drawCanvas.width = width;
  drawCanvas.height = height;
  // CSS width/height (100vw/100vh) handle the display size
  drawCanvas.style.width = width + "px"; // Or just "100vw"
  drawCanvas.style.height = height + "px"; // Or just "100vh"


  // Redraw existing paths on the drawing canvas to adapt to the new resolution
  redraw();
}

window.addEventListener("resize", resizeCanvases);
// Ensure initial setup calls resizeCanvases
// window.addEventListener("load", () => { resizeCanvases(); ... }); // This should already be in ui.js or at the end
resizeCanvases(); // Initial call