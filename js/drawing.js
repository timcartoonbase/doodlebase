const drawCanvas = document.getElementById("drawingCanvas");
const ctx = drawCanvas.getContext("2d");

let drawing = false;
let paths = [];
let currentPath = [];

// Public API for other modules
window.undoLastStroke = () => {
  paths.pop();
  redraw();
};

window.clearDrawingCanvas = () => {
  ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  paths = [];
  currentPath = [];
};

function draw(e) {
  if (!drawing) return;

  const x = e.offsetX;
  const y = e.offsetY;
  currentPath.push({ x, y, color: window.brushColor, size: window.brushSize });

  ctx.strokeStyle = window.brushColor;
  ctx.lineWidth = window.brushSize;
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

function redraw() {
  ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  for (const path of paths) {
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1];
      const b = path[i];
      ctx.strokeStyle = a.color;
      ctx.lineWidth = a.size;
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
    riveCanvas.width = width;
    riveCanvas.height = height;
    if (window.r) window.r.resizeDrawingSurfaceToCanvas();
    riveCanvas.style.width = width + "px";
    riveCanvas.style.height = height + "px";
  }

  drawCanvas.width = width;
  drawCanvas.height = height;
  drawCanvas.style.width = width + "px";
  drawCanvas.style.height = height + "px";

  redraw();
}

drawCanvas.addEventListener("mousedown", (e) => {
  drawing = true;
  currentPath = [];
  draw(e);
  if (window.follow?.value !== undefined) window.follow.value = true;
});

drawCanvas.addEventListener("mousemove", draw);

["mouseup", "mouseleave"].forEach((event) => {
  drawCanvas.addEventListener(event, () => {
    if (drawing) {
      drawing = false;
      paths.push([...currentPath]);
      currentPath = [];
      if (window.follow?.value !== undefined) window.follow.value = false;
    }
  });
});

window.addEventListener("resize", resizeCanvases);
resizeCanvases();
