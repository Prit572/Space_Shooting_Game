let player;
let projectiles = [];
let enemies = [];
let particles = [];
let score = 0;
let gameState = "start";
let weaponType = 'normal';
let lastShot = 0;

function setup() {
  createCanvas(800, 600);
  resetGame();
}

function draw() {
  background(0, 0, 20); // Dark blue background
  drawStars();
  
  if (gameState === "start") {
    drawStartScreen();
  } else if (gameState === "playing") {
    gamePlay();
  } else if (gameState === "gameover") {
    drawGameOverScreen();
  }
}

function drawStars() {
  // Parallax starfield effect
  stroke(255);
  strokeWeight(1);
  for (let i = 0; i < 50; i++) {
    let x = (frameCount * (i % 3 + 1) / 10 + i * 30) % width;
    let y = (i * 20 + frameCount * (i % 3 + 1) / 5) % height;
    point(x, y);
    if (i % 3 === 0) {
      stroke(100, 200, 255);
      point(x + 1, y);
      point(x - 1, y);
    }
  }
}

function gamePlay() {
  // Update
  handlePlayerMovement();
  handleShooting();
  updateProjectiles();
  updateEnemies();
  updateParticles();
  checkCollisions();
  
  // Draw
  drawParticles();
  drawPlayer();
  drawProjectiles();
  drawEnemies();
  drawScore();
}

function resetGame() {
  player = {
    x: width / 2,
    y: height - 50,
    speed: 7,
    weaponType: 'normal',
    weaponLevel: 1
  };
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  weaponType = 'normal';
}

function keyPressed() {
  if (gameState === "start" || gameState === "gameover") {
    gameState = "playing";
    resetGame();
  }
  if (key === '1') weaponType = 'normal';
  if (key === '2') weaponType = 'spread';
  if (key === '3') weaponType = 'laser';
}

function handlePlayerMovement() {
  if (keyIsDown(LEFT_ARROW)) {
    player.x -= player.speed;
    createEngineParticle(player.x + 15, player.y + 10, 2);
  }
  if (keyIsDown(RIGHT_ARROW)) {
    player.x += player.speed;
    createEngineParticle(player.x - 15, player.y + 10, -2);
  }
  player.x = constrain(player.x, 25, width - 25);
}

function handleShooting() {
  if (keyIsDown(32) && millis() - lastShot > 200) {
    shoot();
    lastShot = millis();
  }
}

function shoot() {
  switch(weaponType) {
    case 'spread':
      for (let angle = -20; angle <= 20; angle += 20) {
        projectiles.push({
          x: player.x,
          y: player.y - 20,
          vx: sin(radians(angle)) * 8,
          vy: -10,
          type: 'spread',
          color: [255, 200, 0]
        });
      }
      break;
    case 'laser':
      projectiles.push({
        x: player.x,
        y: player.y - 30,
        vx: 0,
        vy: -15,
        type: 'laser',
        width: 4,
        length: 20,
        color: [0, 255, 255]
      });
      break;
    default:
      projectiles.push({
        x: player.x - 15,
        y: player.y,
        vx: 0,
        vy: -12,
        type: 'normal',
        color: [255, 255, 255]
      });
      projectiles.push({
        x: player.x + 15,
        y: player.y,
        vx: 0,
        vy: -12,
        type: 'normal',
        color: [255, 255, 255]
      });
  }
  createShootParticles(player.x, player.y - 20);
}

function createEngineParticle(x, y, vx) {
  particles.push({
    x: x,
    y: y,
    vx: vx + random(-1, 1),
    vy: random(2, 4),
    alpha: 255,
    color: [0, 255, 255],
    size: random(2, 4)
  });
}

function createShootParticles(x, y) {
  for (let i = 0; i < 5; i++) {
    particles.push({
      x: x,
      y: y,
      vx: random(-2, 2),
      vy: random(-1, 1),
      alpha: 255,
      color: [255, 255, 100],
      size: random(2, 4)
    });
  }
}

function createExplosion(x, y, color) {
  for (let i = 0; i < 20; i++) {
    particles.push({
      x: x,
      y: y,
      vx: random(-3, 3),
      vy: random(-3, 3),
      alpha: 255,
      color: color,
      size: random(2, 6)
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 5;
    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles() {
  noStroke();
  for (let p of particles) {
    fill(p.color[0], p.color[1], p.color[2], p.alpha);
    circle(p.x, p.y, p.size);
  }
}

function updateProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.type === 'laser') {
      p.length += 2;
    }
    if (p.y < -50) {
      projectiles.splice(i, 1);
    }
  }
}

function updateEnemies() {
  if (frameCount % 45 === 0) {
    spawnEnemy();
  }
  
  for (let enemy of enemies) {
    enemy.y += enemy.speed;
    if (enemy.type === 'zigzag') {
      enemy.x += Math.sin(frameCount * 0.1) * 3;
    }
  }
  
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].y > height) {
      enemies.splice(i, 1);
      gameState = "gameover";
    }
  }
}

function spawnEnemy() {
  let types = ['basic', 'zigzag', 'tank'];
  let type = random(types);
  let enemy = {
    x: random(50, width - 50),
    y: -20,
    type: type,
    health: type === 'tank' ? 3 : 1,
    speed: type === 'tank' ? 1.5 : 3,
    fireIntensity: random(0.8, 1.2),  // Random fire intensity
    fireOffset: 0  // For animating fire
  };
  enemies.push(enemy);
}

function drawPlayer() {
  push();
  translate(player.x, player.y);
  
  // Engine glow
  noStroke();
  for (let i = 0; i < 3; i++) {
    fill(0, 255, 255, 50 - i * 15);
    ellipse(-15, 10, 8 + i * 4);
    ellipse(15, 10, 8 + i * 4);
  }
  
  // Ship body
  fill(50, 150, 255);
  stroke(0, 255, 255);
  strokeWeight(2);
  
  // Main hull
  beginShape();
  vertex(0, -30);  // Nose
  vertex(-20, 0);  // Left wing
  vertex(-15, 10); // Left engine
  vertex(15, 10);  // Right engine
  vertex(20, 0);   // Right wing
  endShape(CLOSE);
  
  // Cockpit
  fill(100, 200, 255, 150);
  noStroke();
  ellipse(0, -10, 10, 20);
  
  // Wing details
  stroke(0, 255, 255);
  line(-15, 0, -10, 10);
  line(15, 0, 10, 10);
  
  pop();
}

function drawProjectiles() {
  for (let p of projectiles) {
    if (p.type === 'laser') {
      // Laser beam
      stroke(p.color[0], p.color[1], p.color[2], 150);
      strokeWeight(p.width);
      line(p.x, p.y, p.x, p.y - p.length);
      // Laser glow
      noStroke();
      fill(p.color[0], p.color[1], p.color[2], 50);
      rect(p.x - p.width * 2, p.y - p.length, p.width * 4, p.length);
    } else {
      // Normal and spread shots
      noStroke();
      fill(p.color[0], p.color[1], p.color[2]);
      ellipse(p.x, p.y, 4, 12);
      // Projectile glow
      fill(p.color[0], p.color[1], p.color[2], 100);
      ellipse(p.x, p.y, 6, 16);
    }
  }
}

function drawEnemies() {
  for (let enemy of enemies) {
    push();
    translate(enemy.x, enemy.y);
    
    // Update fire animation offset
    enemy.fireOffset = (enemy.fireOffset + 0.1) % TWO_PI;
    
    if (enemy.type === 'tank') {
      drawTankEnemy(enemy);
    } else if (enemy.type === 'zigzag') {
      drawZigzagEnemy(enemy);
    } else {
      drawBasicEnemy(enemy);
    }
    
    pop();
  }
}

function drawFireEffect(x, y, baseWidth, height, color1, color2) {
  noStroke();
  // Engine thrust effect
  for (let i = 0; i < 5; i++) {
    let alpha = map(i, 0, 4, 180, 0);
    let width = baseWidth * (1 - i/5);
    let offset = sin(frameCount * 0.15 + i) * 2;
    
    // Outer engine glow
    fill(color1[0], color1[1], color1[2], alpha);
    beginShape();
    for (let j = 0; j <= 8; j++) {
      let px = map(j, 0, 8, -width/2, width/2);
      let py = map(j, 0, 8, 0, height);
      let noiseVal = noise(px * 0.1, py * 0.1, frameCount * 0.08);
      px += noiseVal * 3 * sin(frameCount * 0.1) - 1.5;
      vertex(x + px, y + py + offset);
    }
    endShape(CLOSE);
    
    // Inner engine core
    fill(color2[0], color2[1], color2[2], alpha * 1.2);
    beginShape();
    for (let j = 0; j <= 8; j++) {
      let px = map(j, 0, 8, -width/4, width/4);
      let py = map(j, 0, 8, height/4, height * 0.8);
      let noiseVal = noise(px * 0.1, py * 0.1, frameCount * 0.08);
      px += noiseVal * 2 * sin(frameCount * 0.1) - 1;
      vertex(x + px, y + py + offset);
    }
    endShape(CLOSE);
  }
}

function drawBasicEnemy(enemy) {
  // Engine effects
  drawFireEffect(0, 15, 15, 20, [0, 200, 255], [100, 255, 255]);
  
  // Ship body
  fill(40, 40, 50);
  stroke(100, 100, 120);
  strokeWeight(2);
  
  // Main hull - Fighter plane style
  beginShape();
  vertex(0, -25);     // Nose
  vertex(-15, -15);   // Left front wing
  vertex(-25, 0);     // Left wing tip
  vertex(-15, 10);    // Left back wing
  vertex(-5, 15);     // Left engine
  vertex(5, 15);      // Right engine
  vertex(15, 10);     // Right back wing
  vertex(25, 0);      // Right wing tip
  vertex(15, -15);    // Right front wing
  endShape(CLOSE);
  
  // Cockpit
  fill(150, 200, 255, 180);
  noStroke();
  beginShape();
  vertex(0, -20);
  vertex(-5, -15);
  vertex(-3, -10);
  vertex(3, -10);
  vertex(5, -15);
  endShape(CLOSE);
  
  // Wing details
  stroke(150, 150, 170);
  strokeWeight(1.5);
  line(-15, -10, -20, 5);
  line(15, -10, 20, 5);
  
  // Energy core
  drawEnergyCore(0, 0, enemy.fireIntensity);
}

function drawZigzagEnemy(enemy) {
  // Engine effects
  drawFireEffect(-10, 20, 12, 18, [255, 50, 50], [255, 150, 150]);
  drawFireEffect(10, 20, 12, 18, [255, 50, 50], [255, 150, 150]);
  
  // Ship body
  fill(60, 20, 20);
  stroke(200, 50, 50);
  strokeWeight(2);
  
  // Main hull - Stealth fighter style
  beginShape();
  vertex(0, -30);     // Nose
  vertex(-20, -20);   // Left front
  vertex(-30, -5);    // Left wing
  vertex(-25, 10);    // Left back
  vertex(-15, 15);    // Left engine
  vertex(-5, 20);     // Left tail
  vertex(5, 20);      // Right tail
  vertex(15, 15);     // Right engine
  vertex(25, 10);     // Right back
  vertex(30, -5);     // Right wing
  vertex(20, -20);    // Right front
  endShape(CLOSE);
  
  // Cockpit
  fill(255, 100, 100, 150);
  noStroke();
  beginShape();
  vertex(0, -25);
  vertex(-8, -20);
  vertex(-5, -15);
  vertex(5, -15);
  vertex(8, -20);
  endShape(CLOSE);
  
  // Wing details
  stroke(255, 50, 50, 150);
  strokeWeight(2);
  line(-20, -15, -25, 0);
  line(20, -15, 25, 0);
  
  // Energy core
  drawEnergyCore(0, 0, enemy.fireIntensity);
}

function drawTankEnemy(enemy) {
  // Main engine effect
  drawFireEffect(0, 25, 25, 30, [255, 100, 0], [255, 200, 0]);
  
  // Ship body
  fill(50, 50, 60);
  stroke(150, 150, 170);
  strokeWeight(2);
  
  // Main hull - Heavy bomber style
  beginShape();
  vertex(-35, -15);   // Left front
  vertex(35, -15);    // Right front
  vertex(40, 0);      // Right middle
  vertex(35, 15);     // Right back
  vertex(25, 20);     // Right engine
  vertex(15, 25);     // Right tail
  vertex(-15, 25);    // Left tail
  vertex(-25, 20);    // Left engine
  vertex(-35, 15);    // Left back
  vertex(-40, 0);     // Left middle
  endShape(CLOSE);
  
  // Cockpit
  fill(200, 200, 220, 180);
  noStroke();
  beginShape();
  vertex(-15, -15);
  vertex(15, -15);
  vertex(10, -5);
  vertex(-10, -5);
  endShape(CLOSE);
  
  // Wing details
  stroke(150, 150, 170);
  strokeWeight(2);
  line(-30, -10, -35, 5);
  line(30, -10, 35, 5);
  
  // Weapon pods
  fill(60, 60, 70);
  noStroke();
  rect(-20, 0, 8, 20);
  rect(12, 0, 8, 20);
  
  // Weapon glow
  fill(255, 100, 0, 100);
  rect(-21, 15, 10, 5);
  rect(11, 15, 10, 5);
  
  // Shield effect
  drawShieldEffect(enemy);
  
  // Enhanced energy core
  drawEnergyCore(0, 0, enemy.fireIntensity * 1.5);
}

function drawShieldEffect(enemy) {
  noFill();
  for (let i = 0; i < 3; i++) {
    let alpha = map(sin(frameCount * 0.1 + i), -1, 1, 20, 80);
    stroke(150, 150, 170, alpha);
    strokeWeight(2 - i * 0.5);
    let size = 80 + i * 10 + sin(enemy.fireOffset * 2 + i) * 5;
    ellipse(0, 0, size, size * 0.7);
  }
}

function drawEnergyCore(x, y, intensity) {
  noStroke();
  // Outer glow
  for (let i = 4; i > 0; i--) {
    let size = 10 + sin(frameCount * 0.1) * 2;
    let alpha = map(i, 4, 0, 20, 120);
    fill(200, 200, 220, alpha * intensity);
    ellipse(x, y, size * i, size * i);
  }
  
  // Inner core
  fill(255, 255, 255);
  ellipse(x, y, 5, 5);
  
  // Energy pulses
  stroke(200, 200, 220, 30 * intensity);
  noFill();
  let pulseSize = 12 + sin(frameCount * 0.2) * 4;
  ellipse(x, y, pulseSize, pulseSize);
}

function checkCollisions() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    for (let j = enemies.length - 1; j >= 0; j--) {
      let p = projectiles[i];
      let e = enemies[j];
      if (dist(p.x, p.y, e.x, e.y) < 25) {
        e.health--;
        if (p.type !== 'laser') {
          projectiles.splice(i, 1);
        }
        createExplosion(e.x, e.y, [255, 200, 0]);
        if (e.health <= 0) {
          enemies.splice(j, 1);
          score += 10;
          createExplosion(e.x, e.y, [255, 0, 0]);
        }
        break;
      }
    }
  }
  
  for (let enemy of enemies) {
    if (dist(player.x, player.y, enemy.x, enemy.y) < 25) {
      gameState = "gameover";
      createExplosion(player.x, player.y, [255, 255, 255]);
    }
  }
}

function drawScore() {
  fill(255);
  noStroke();
  textSize(24);
  textAlign(LEFT);
  text('Score: ' + score, 10, 30);
  text('Weapon: ' + weaponType, 10, 60);
  textSize(16);
  text('Press 1-3 to change weapons', 10, 85);
}

function drawStartScreen() {
  textAlign(CENTER);
  noStroke();
  
  // Title with glow effect
  for (let i = 3; i > 0; i--) {
    fill(0, 255, 255, 255/i);
    textSize(64 + i);
    text('SPACE SHOOTER', width/2, height/2 - 50);
  }
  
  fill(255);
  textSize(24);
  text('Press any key to start', width/2, height/2 + 50);
  textSize(16);
  text('Arrow keys to move, SPACE to shoot', width/2, height/2 + 90);
  text('1-3 keys to change weapons', width/2, height/2 + 120);
}

function drawGameOverScreen() {
  textAlign(CENTER);
  noStroke();
  
  // Game Over text with glow
  for (let i = 3; i > 0; i--) {
    fill(255, 0, 0, 255/i);
    textSize(64 + i);
    text('GAME OVER', width/2, height/2 - 50);
  }
  
  fill(255);
  textSize(32);
  text('Score: ' + score, width/2, height/2 + 20);
  textSize(20);
  text('Press any key to restart', width/2, height/2 + 60);
}