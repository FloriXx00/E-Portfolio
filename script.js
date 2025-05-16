// Rotacja kostki 3D
let currentRotation = 0;
const cube = document.getElementById("cube");

const rotateCube = (direction) => {
  currentRotation += direction * 120;
  cube.style.transform = `rotateY(${currentRotation}deg)`;
};

document.querySelectorAll('[id^="prevBtn"]').forEach(btn =>
  btn.addEventListener("click", () => rotateCube(1))
);
document.querySelectorAll('[id^="nextBtn"]').forEach(btn =>
  btn.addEventListener("click", () => rotateCube(-1))
);

// Akordeony
document.querySelectorAll('.accordion').forEach(acc => {
  const header = acc.querySelector('.accordion-header');
  header.addEventListener('click', () => {
    acc.classList.toggle('active');
  });
});

// Easter egg toggle panel
const toggleBtn = document.getElementById('toggle-panel');
const controlsPanel = document.getElementById('network-controls');

toggleBtn.addEventListener('click', () => {
  controlsPanel.classList.toggle('hidden');
});

// Canvas setup
const canvas = document.getElementById('bg-network');
let ctx;
let width, height;
let mouse = { x: null, y: null };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  width = canvas.width;
  height = canvas.height;
  ctx = canvas.getContext('2d');
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Sieć
let POINTS = 90;
let MAX_DIST = 140;
let HOVER_PULL = 15;
let HOVER_RADIUS = 120;
let nodes = [];

function rebuildNodes() {
  nodes = Array.from({ length: POINTS }, () => {
    const baseX = Math.random() * width;
    const baseY = Math.random() * height;
    return {
      baseX,
      baseY,
      x: baseX,
      y: baseY,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,      
    };
  });
}
rebuildNodes();

// Suwaki
document.getElementById("nodeCount").addEventListener("input", e => {
  POINTS = parseInt(e.target.value);
  rebuildNodes();
});
document.getElementById("linkDistance").addEventListener("input", e => {
  MAX_DIST = parseInt(e.target.value);
});
document.getElementById("hoverPull").addEventListener("input", e => {
  HOVER_PULL = parseInt(e.target.value);
});

// Mouse tracking z poprawką na pozycję canvasu
document.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  

canvas.addEventListener("mouseleave", () => {
  mouse.x = null;
  mouse.y = null;
});

// ANIMACJA
function drawNetwork() {
    if (!ctx) {
      ctx = canvas.getContext('2d');
      if (!ctx) return;
    }
  
    ctx.clearRect(0, 0, width, height);
  
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
  
      // Reakcja na myszkę (wpływa na prędkość)
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < HOVER_RADIUS) {
            

            const strength = (1 - dist / HOVER_RADIUS);
            const angle = Math.atan2(dy, dx) + Math.PI / 2; // +90° do kierunku
            const curvePower = HOVER_PULL * strength * 0.02;
          
            // "Zakrzywiamy" prędkość
            n.vx += Math.cos(angle) * curvePower;
            n.vy += Math.sin(angle) * curvePower;
          }
          
      }
  
      // Ruch bez tłumienia
      n.x += n.vx;
      n.y += n.vy;
  
      // Odbicie od ścian
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
  
      // Punkt
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#00ffe1';
      ctx.fill();
  
      // Linie
      for (let j = i + 1; j < nodes.length; j++) {
        const m = nodes[j];
        const dist = Math.hypot(n.x - m.x, n.y - m.y);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = `rgba(0, 255, 225, ${1 - dist / MAX_DIST})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  
    requestAnimationFrame(drawNetwork);
  }
  
requestAnimationFrame(drawNetwork);
