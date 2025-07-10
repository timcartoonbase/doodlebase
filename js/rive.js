const riveCanvas = document.getElementById("riveCanvas");
let r, pose, follow;
let position = 5; // Default position

r = new rive.Rive({
  src: "assets/doodlebase.riv",
  canvas: riveCanvas,
  layout: new rive.Layout({ fit: rive.Fit.Layout }),
  stateMachines: ["State Machine 1"],
  autoplay: true,
  fitCanvasToArtboardWidth: true,
  fitCanvasToArtboardHeight: true,
  onLoad: () => {
    r.resizeDrawingSurfaceToCanvas();
    window.riveInputs = r.stateMachineInputs("State Machine 1");
    pose = window.riveInputs.find((i) => i.name === "pose");
    size = window.riveInputs.find((i) => i.name === "size");
    position = window.riveInputs.find((i) => i.name === "position");
    follow = window.riveInputs.find((i) => i.name === "follow");
    window.setPose = (i) => {
      pose.value = i;
    };
    window.setSize = (i) => {
      size.value = i;
      document.querySelectorAll(".size-btn").forEach((btn) => {
        const btnSize = parseInt(btn.dataset.size, 10);
        btn.classList.toggle("selected", btnSize === i);
      });
    };
    window.setPosition = (i) => {
      position.value = i;
    };
    window.follow = follow;
  },
});

window.addEventListener("resize", () => {
  r.resizeDrawingSurfaceToCanvas();
});
