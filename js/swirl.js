'use strict';

const particleCount = 700;
const particlePropCount = 9;
const particlePropsLength = particleCount * particlePropCount;
const rangeY = 800;
const baseTTL = 50;
const rangeTTL = 150;
const baseSpeed = 1;
const rangeSpeed = 1;
const baseRadius = 1;
const rangeRadius = 4;
const baseHue = 220;
const rangeHue = 100;
const noiseSteps = 8;
let xOff = 0.5;
let yOff = 0.5;
let zOff = 0.5;
// const xOff = 0.00125;
// const yOff = 0.00125;
// const zOff = 0.0005;
const backgroundColor = 'hsla(220,40%,5%,1)';

let container;
let canvas;
let ctx;
let center;
let gradient;
let tick;
let simplex;
let particleProps;
let positions;
let velocities;
let lifeSpans;
let speeds;
let sizes;
let hues;

// 1
function setup() {
	createCanvas();
  resize();
  initParticles();
	draw();
}

// 4 - this particle has 9 props.
// particleProps is a 9*700 long typed array
function initParticles() {
  tick = 0;
  simplex = new SimplexNoise();
  particleProps = new Float32Array(particlePropsLength);

  let i;
  
  // create initial particles
  for (i = 0; i < particlePropsLength; i += particlePropCount) {
    initParticle(i);
  }
}

// 5
function initParticle(i) {
  let x, y, vx, vy, life, ttl, speed, radius, hue;

  // randomize x position
  x = rand(canvas.a.width);
  // randomize y position within range from center
  y = center[1] + randRange(rangeY);
  // no initial velocity
  vx = 0;
  vy = 0;
  // no initial life
  life = 0;
  ttl = baseTTL + rand(rangeTTL);
  speed = baseSpeed + rand(rangeSpeed);
  radius = baseRadius + rand(rangeRadius);
  hue = baseHue + rand(rangeHue);

  // // Copy the values into the array starting at index i
  particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);
}

// 7 Bit misleading: first update particles, then draw
function drawParticles() {
  let i;

  // loop the particles array in step 9
  for (i = 0; i < particlePropsLength; i += particlePropCount) {
    updateParticle(i);
  }
}

// 8
function updateParticle(i) {
  let i2=1+i, i3=2+i, i4=3+i, i5=4+i, i6=5+i, i7=6+i, i8=7+i, i9=8+i;
  let n, x, y, vx, vy, life, ttl, speed, x2, y2, radius, hue;

  // get current x,y position
  x = particleProps[i];
  y = particleProps[i2];
  // calculate velocity, and use some kind of noise generator
  n = simplex.noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * TAU;
  vx = lerp(particleProps[i3], cos(n), 0.5);
  vy = lerp(particleProps[i4], sin(n), 0.5);
  // get current life, ttl???, speed
  life = particleProps[i5];
  ttl = particleProps[i6];
  speed = particleProps[i7];
  // calculate new x,y position using velocity and speed
  x2 = x + vx * speed;
  y2 = y + vy * speed;

  // radius will be line width
  radius = particleProps[i8];
  // angle on the color circle
  hue = particleProps[i9];

  drawParticle(x, y, x2, y2, life, ttl, radius, hue);

  // increase life, so alpha will be decreased next time
  life++;

  // manipulate the movement of the particles
  xOff > 0.00125 ? xOff -= 0.000001 : xOff;
  yOff > 0.00125 ? yOff -= 0.00001 : yOff;
  zOff > 0.0005 ? zOff -= 0.000005 : zOff;

  // set the new values in the particleProps array
  particleProps[i] = x2;
  particleProps[i2] = y2;
  particleProps[i3] = vx;
  particleProps[i4] = vy;
  particleProps[i5] = life;

  // create new particles if older ones decay
  // init new particles with the index of the current one (if this one decayed)
  // decay happens in two ways. either the particle leaves the bounds, or it's life and this misterious ttl relates somehow
  (checkBounds(x, y) || life > ttl) && initParticle(i);
}

function drawParticle(x, y, x2, y2, life, ttl, radius, hue) {
  // Save the context and restore after drawing each article - NOTICE the save - restore loop
  ctx.a.save();
  ctx.a.lineCap = 'round';
  ctx.a.lineWidth = radius;
  // set color and decrease alpha
  ctx.a.strokeStyle = `hsla(${hue},100%,60%,${fadeInOut(life, ttl)})`;
  // Starts a new path by emptying the list of sub-paths. Call this method when you want to create a new path.
  ctx.a.beginPath();
  // Moves the starting point of a new sub-path to the (x, y) coordinates.
  ctx.a.moveTo(x, y);
  // Connects the last point in the current sub-path to the specified (x, y) coordinates with a straight line.
  ctx.a.lineTo(x2, y2);
  // Strokes the current sub-paths with the current stroke style.
  ctx.a.stroke();
  // Causes the point of the pen to move back to the start of the current sub-path. It tries to draw a straight line from the current point to the start. If the shape has already been closed or has only one point, this function does nothing.
  ctx.a.closePath();
  // Restores the drawing style state to the last element on the 'state stack' saved by save().
  ctx.a.restore();
}

function checkBounds(x, y) {
	return(
		x > canvas.a.width ||
		x < 0 ||
		y > canvas.a.height ||
		y < 0
	);
}

// 2
// create 2 canvases. 1 for drawing and updating, the other to render
function createCanvas() {
  container = document.querySelector('.content--canvas');
	canvas = {
		a: document.createElement('canvas'),
		b: document.createElement('canvas')
	};
	canvas.b.style = `
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
  `;
  // append the rendering canvas to the container
  container.appendChild(canvas.b);
  // get the drawing context for both canvases
	ctx = {
		a: canvas.a.getContext('2d'),
		b: canvas.b.getContext('2d')
  };
  center = [];
}

// 3
function resize() {
	const { innerWidth, innerHeight } = window;
  
  //set both canvases width and height to window size
	canvas.a.width = innerWidth;
  canvas.a.height = innerHeight;

  // draw canvas b on context a
  ctx.a.drawImage(canvas.b, 0, 0);

	canvas.b.width = innerWidth;
  canvas.b.height = innerHeight;
  
  // draw canvas a on context b
  ctx.b.drawImage(canvas.a, 0, 0);

  center[0] = 0.5 * canvas.a.width;
  center[1] = 0.5 * canvas.a.height;
}

function renderGlow() {
  // all effects are applied on canvas b (the render canvas)
  ctx.b.save();
  ctx.b.filter = 'blur(8px) brightness(200%)';
  ctx.b.globalCompositeOperation = 'lighter';
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();

  ctx.b.save();
  ctx.b.filter = 'blur(4px) brightness(200%)';
  ctx.b.globalCompositeOperation = 'lighter';
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();
}

function renderToScreen() {
  ctx.b.save();
  ctx.b.globalCompositeOperation = 'lighter';
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();
}

// 6 - Following initial setup update article position and draw on canvas
function draw() {
  tick++;

  // Sets all pixels in the rectangle defined by starting point (x, y) and size (width, height) to transparent black, erasing any previously drawn content.
  ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height);

  //Color or style to use inside shapes. Default #000 (black).
  ctx.b.fillStyle = backgroundColor;
  // Draws a filled rectangle at (x, y) position whose size is determined by width and height.
  ctx.b.fillRect(0, 0, canvas.a.width, canvas.a.height);

  drawParticles();
  renderGlow();
  renderToScreen();

	window.requestAnimationFrame(draw);
}

window.addEventListener('load', setup);
window.addEventListener('resize', resize);
/**
 * Understand HSLA
 * 
 * Functional notation: hsl(H, S, L[, A]) or hsla(H, S, L, A)
H (hue) is an <angle> of the color circle given in degs, rads, grads, or turns in CSS Color Module Level 4. When written as a unitless <number>, it is interpreted as degrees, as specified in CSS Color Module Level 3. By definition, red=0deg=360deg, with the other colors spread around the circle, so green=120deg, blue=240deg, etc. As an <angle>, it implicitly wraps around such that -120deg=240deg, 480deg=120deg, -1turn=1turn, etc.
S (saturation) and L (lightness) are percentages. 100% saturation is completely saturated, while 0% is completely unsaturated (gray). 100% lightness is white, 0% lightness is black, and 50% lightness is “normal.”
A (alpha) can be a <number> between 0 and 1, or a <percentage>, where the number 1 corresponds to 100% (full opacity).
 */