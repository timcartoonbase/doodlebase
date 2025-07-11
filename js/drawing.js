const drawCanvas = document.getElementById("drawingCanvas");
const ctx = drawCanvas.getContext("2d");

let drawing = false;
let paths = [];
let currentPath = [];

let isTextToolActive = false;
let isDraggingText = false;
let textData = null;
let selectedHandle = null;

const TEXT_BOX_PADDING = 10;

window.brushColor = "black";
window.brushSize = 5;

// HiDPI + Resize
function resizeCanvases() {
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  drawCanvas.style.width = width + "px";
  drawCanvas.style.height = height + "px";

  drawCanvas.width = width * dpr;
  drawCanvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  redraw();
}

// Redraw everything
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

  if (textData) {
    drawText(textData);
    if (isTextToolActive) drawBoundingBox(textData);
  }
}

// === Mouse Events ===
drawCanvas.addEventListener("mousedown", (e) => {
  const { offsetX: x, offsetY: y } = e;

  if (isTextToolActive) {
    const handle = getHandleAt(x, y);
    if (handle) {
      selectedHandle = handle;
      isDraggingText = true;
      return;
    }

    if (textData && isInsideBox(x, y, textData)) {
      isDraggingText = true;
      textData.offsetX = x - textData.x;
      textData.offsetY = y - textData.y;
    } else {
      const text = prompt("Enter text:");
      if (text) {
        const height = 40;
        const padding = TEXT_BOX_PADDING * 2;
        const fontSize = height - padding;

        ctx.font = `${fontSize}px sans-serif`;
        const textWidth = ctx.measureText(text).width + padding;

        textData = {
          text,
          x,
          y,
          width: textWidth,
          height,
          fontSize,
        };
        redraw(); // show immediately
      }
    }
  } else {
    drawing = true;
    currentPath = [];
    paths.push(currentPath);
    draw({ offsetX: x, offsetY: y });
  }
});

drawCanvas.addEventListener("mousemove", (e) => {
  const { offsetX: x, offsetY: y } = e;

  if (drawing) {
    draw(e);
  }

  if (isDraggingText && textData) {
    if (selectedHandle) {
      textData.width = Math.max(30, x - textData.x);
      textData.height = Math.max(20, y - textData.y);
      textData.fontSize = textData.height - TEXT_BOX_PADDING * 2;
    } else {
      textData.x = x - textData.offsetX;
      textData.y = y - textData.offsetY;
    }
    redraw();
  }
});

drawCanvas.addEventListener("mouseup", () => {
  drawing = false;
  isDraggingText = false;
  selectedHandle = null;
});

// Drawing line segments
function draw(e) {
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

function drawText({ text, x, y, width, height, fontSize }) {
  fontSize = height - TEXT_BOX_PADDING * 2;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = "black";
  ctx.textBaseline = "top";
  ctx.fillText(text, x + TEXT_BOX_PADDING, y + TEXT_BOX_PADDING);
}

function drawBoundingBox({ x, y, width, height }) {
  ctx.strokeStyle = "#666";
  ctx.setLineDash([4, 2]);
  ctx.strokeRect(x, y, width, height);
  ctx.setLineDash([]);

  ctx.fillStyle = "#000";
  ctx.fillRect(x + width - 6, y + height - 6, 10, 10);
}

function isInsideBox(x, y, box) {
  return (
    x >= box.x &&
    y >= box.y &&
    x <= box.x + box.width &&
    y <= box.y + box.height
  );
}

function getHandleAt(x, y) {
  if (!textData) return null;
  const handleX = textData.x + textData.width - 6;
  const handleY = textData.y + textData.height - 6;
  if (x >= handleX && y >= handleY && x <= handleX + 10 && y <= handleY + 10) {
    return "resize";
  }
  return null;
}

// Tool UI
document.querySelector("#textToolBtn").addEventListener("click", () => {
  isTextToolActive = true;
  drawCanvas.style.cursor = "text";
});

document.querySelectorAll(".color-circle").forEach((btn) => {
  btn.addEventListener("click", () => {
    isTextToolActive = false;
    drawCanvas.style.cursor = "crosshair";
    window.brushColor = btn.dataset.color;
    document
      .querySelectorAll(".color-circle")
      .forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");

    if (textData) textData = { ...textData }; // finalize
    redraw();
  });
});

document.querySelector("#brushSize").addEventListener("input", (e) => {
  window.brushSize = parseInt(e.target.value, 10);
  document.querySelector("#brushSizeVisual").style.width =
    window.brushSize + "px";
  document.querySelector("#brushSizeVisual").style.height =
    window.brushSize + "px";
});

// Public functions
window.undoLastStroke = () => {
  paths.pop();
  redraw();
};

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
    window.undoLastStroke();
    e.preventDefault();
  }
});

window.clearDrawingCanvas = () => {
  ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  paths = [];
  textData = null;
  redraw();
};

// Init
window.addEventListener("resize", resizeCanvases);
resizeCanvases();
