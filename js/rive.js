const riveCanvas = document.getElementById('riveCanvas');
let r;
let pose = 0;
let size = 0;
let follow = false;

r = new rive.Rive({
    src: 'assets/doodlebase.riv',
    canvas: riveCanvas,
    layout: new rive.Layout({
      fit: rive.Fit.Layout,
    }),
    stateMachines: ["State Machine 1"],
    fitCanvasToArtboardWidth: true,
    fitCanvasToArtboardHeight: true,
    autoplay: true,
    onLoad: () => {
        r.resizeDrawingSurfaceToCanvas();
        
        // Get state machine inputs once Rive is loaded
        window.riveInputs = r.stateMachineInputs("State Machine 1");

        // Access the inputs
        pose = window.riveInputs.find(i => i.name === 'pose');
        size = window.riveInputs.find(i => i.name === 'size');
        follow = window.riveInputs.find(i => i.name === 'follow');

    
    },
});

window.addEventListener("resize", () => {
    r.resizeDrawingSurfaceToCanvas();
});

function setPose(index) {
    pose.value = index;
}

function setSize(index) {
    if (size && "value" in size) {
        size.value = index;
    }

    // Update selected button style
    const buttons = document.querySelectorAll('.size-btn');
    buttons.forEach(btn => {
        const btnSize = parseInt(btn.dataset.size, 10);
        btn.classList.toggle('selected', btnSize === index);
    });
}

