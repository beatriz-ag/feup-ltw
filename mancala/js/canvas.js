let canvas;
let context;

function startAnimation() {
  canvas = document.getElementById('canvas');
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;
  context = canvas.getContext("2d");
  DrawCircles();
}

let circles = [
  { color: 'rgb(55, 112, 107)', x: 120, y: 120, r: 25, speed: { x: 0, y: -1.5 } },
  { color: 'darkslategray', x: 80, y: 120, r: 25, speed: { x: -0.5, y: -2.5 } },
  { color: 'rgba(218, 188, 34, 1)', x: 40, y: 120, r: 25, speed: { x: -1.5, y: -1.0 } },
  { color: 'rgb(55, 112, 107)', x: 20, y: 20, r: 25, speed: { x: 0, y: -1.5 } },
  { color: 'rgba(218, 188, 34, 1)', x: 120, y: 80, r: 25, speed: { x: -0.5, y: -2.5 } },
  { color: "grey", x: 120, y: 40, r: 25, speed: { x: -1.5, y: -1.0 } },

  { color: 'rgb(55, 112, 107)', x: 120, y: 120, r: 25, speed: { x: 0.5, y: 0 } },
  { color: 'darkslategray', x: 80, y: 120, r: 25, speed: { x: 1, y: 1.5 } },
  { color: 'rgba(218, 188, 34, 1)', x: 40, y: 120, r: 25, speed: { x: -1.0, y: 0.5 } },
  { color: 'rgb(55, 112, 107)', x: 20, y: 20, r: 25, speed: { x: 0.75, y: 0.75 } },
  { color: 'rgba(218, 188, 34, 1)', x: 120, y: 80, r: 25, speed: { x: -1.5, y: -2.5 } },
  { color: "grey", x: 120, y: 40, r: 25, speed: { x: 2, y: -1.75 } }
];

function DrawCircles() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  circles.forEach((circle) => {
    circle.x += circle.speed.x;
    circle.y += circle.speed.y;
    
    context.beginPath();
    context.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI, false);
    context.fillStyle = circle.color;
    context.fill();
    
    if (circle.x + circle.r < 0) circle.x = canvas.width + circle.r;
    if (circle.y + circle.r < 0) circle.y = canvas.height + circle.r;
  });

  window.requestAnimationFrame(DrawCircles);
}
