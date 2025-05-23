let gameState;
let player;
let projectiles = [];
let enemies = [];
let explosions = [];
let stars = [];
let score;
let lastShotFrame;

function setup() {
  createCanvas(800, 600);
  for (let i = 0; i < 100; i++) {
    stars.push({ x: random(width), y: random(height) });
  }
  gameState = "start";
}

function draw() {
  background(0);
  drawStars();
  if (gameState == "start") {
    drawStartScreen();
  } else if (gameState == "playing") {
    handlePlayerMovement();
    handleShooting();
    updateProjectiles();
    updateEnemies();
    checkCollisions();
    updateExplosions();
    drawPlayer();
    drawProjectiles();
    drawEnemies();
    drawExplosions();
    drawScore();
  } else if (gameState == "gameover") {
    drawGameOverScreen();
  }
}

function keyPressed() {
  if (gameState == "start" || gameState == "gameover") {
    resetGame();
    gameState = "playing";
  }
}

function resetGame() {
  player = { x: width / 2, y: height - 50 };
  projectiles = [];
  enemies = [];
  explosions = [];
  score = 0;
  lastShotFrame = -10;
}

function drawStars() {
  stroke(255);
  for (let star of stars) {
    point(star.x, star.y);
    star.y += 0.5;
    if (star.y > height) {
      star.y = 0;
      star.x = random(width);
    }
  }
}

function drawStartScreen() {
  textAlign(CENTER);
  textSize(32);
  fill(255);
  text("Space Shooter", width / 2, height / 2 - 50);
  textSize(16);
  text("Press any key to start", width / 2, height / 2);
}

function drawGameOverScreen() {
  textAlign(CENTER);
  textSize(32);
  fill(255, 0, 0);
  text("Game Over", width / 2, height / 2 - 50);
  textSize(16);
  text("Score: " + score, width / 2, height / 2);
  text("Press any key to restart", width / 2, height / 2 + 30);
}

function handlePlayerMovement() {
  if (keyIsDown(LEFT_ARROW)) {
    player.x -= 5;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    player.x += 5;
  }
  player.x = constrain(player.x, 10, width - 10);
}

function handleShooting() {
  if (keyIsDown(32) && frameCount - lastShotFrame > 10) {
    projectiles.push({ x: player.x, y: player.y - 10 });
    lastShotFrame = frameCount;
    let osc = new p5.Oscillator('sine');
    osc.freq(880);
    osc.amp(0.1);
    osc.start();
    setTimeout(() => osc.stop(), 100);
  }
}

function updateProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].y -= 10;
    if (projectiles[i].y < 0) {
      projectiles.splice(i, 1);
    }
  }
}

function updateEnemies() {
  for (let enemy of enemies) {
    enemy.y += 2;
  }
  if (frameCount % 60 == 0) {
    enemies.push({ x: random(20, width - 20), y: 0 });
  }
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].y > height) {
      enemies.splice(i, 1);
      gameState = "gameover";
    }
  }
}

function checkCollisions() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    for (let j = enemies.length - 1; j >= 0; j--) {
      let p = projectiles[i];
      let e = enemies[j];
      if (dist(p.x, p.y, e.x, e.y) < 15) {
        projectiles.splice(i, 1);
        enemies.splice(j, 1);
        score += 10;
        explosions.push({ x: e.x, y: e.y, timer: 0 });
        let osc = new p5.Oscillator('sine');
        osc.freq(220);
        osc.amp(0.2);
        osc.start();
        setTimeout(() => osc.stop(), 200);
        break;
      }
    }
  }
  for (let enemy of enemies) {
    if (dist(player.x, player.y, enemy.x, enemy.y) < 20) {
      gameState = "gameover";
    }
  }
}

function updateExplosions() {
  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].timer++;
    if (explosions[i].timer > 20) {
      explosions.splice(i, 1);
    }
  }
}

function drawPlayer() {
  fill(0, 255, 0);
  beginShape();
  vertex(player.x, player.y - 10);
  vertex(player.x - 10, player.y + 10);
  vertex(player.x + 10, player.y + 10);
  endShape(CLOSE);
}

function drawProjectiles() {
  fill(255);
  for (let p of projectiles) {
    rect(p.x - 1, p.y - 5, 2, 10);
  }
}

function drawEnemies() {
  fill(255, 0, 0);
  for (let e of enemies) {
    ellipse(e.x, e.y, 20, 20);
  }
}

function drawExplosions() {
  noStroke();
  for (let exp of explosions) {
    let alpha = 255 - (exp.timer / 20) * 255;
    fill(255, 255, 0, alpha);
    let radius = exp.timer * 2;
    ellipse(exp.x, exp.y, radius, radius);
  }
  stroke(255);
}

function drawScore() {
  textAlign(LEFT);
  textSize(16);
  fill(255);
  text("Score: " + score, 10, 20);
}