let player;
let obstacles = [];
let smallStars = [];
let crows = [];
let orangeBalls = [];
let gameOver = false;
let spawnRate = 240; // 每隔240幀產生一個障礙物
let smallStarRate = 120; // 每隔120幀產生一個小星星
let crowRate = 300; // 每隔300幀產生一個小烏鴉
let score = 0;
let obstacleSpeed = 4; // 障礙物移動速度
let jumpSound;
let playerImg;
let obstacleImg;
let smallStarImg;
let crowImg; // 小烏鴉圖片
let bgColor;
let orangeBallCount = 0; // 累積的橘色小球數量

function preload() {
  jumpSound = loadSound('01-500audio.com.mp3', () => console.log('Sound loaded'), () => console.error('Failed to load sound'));
  playerImg = loadImage('fish_11zon.png', () => console.log('Player image loaded'), () => console.error('Failed to load player image'));
  obstacleImg = loadImage('tree_11zon.png', () => console.log('Obstacle image loaded'), () => console.error('Failed to load obstacle image'));
  smallStarImg = loadImage('volleyball-_11zon.png', () => console.log('Small star image loaded'), () => console.error('Failed to load small star image'));
  crowImg = loadImage('638506917972611241.png', () => console.log('Crow image loaded'), () => console.error('Failed to load crow image'));
}

function setup() {
  createCanvas(800, 400);
  player = new Player();
  bgColor = color(240, 248, 255); // 初始背景顏色
}

function draw() {
  background(bgColor); // 設定背景顏色

  if (gameOver) {
    textSize(32);
    textAlign(CENTER, CENTER);
    fill(255, 105, 97); // 柔和的紅色
    text('Game Over', width / 2, height / 2);
    textSize(24);
    text('Score: ' + score, width / 2, height / 2 + 40); // 顯示成績數字
    noLoop();
    return;
  }

  player.update();
  player.show();

  // 隨機產生地面障礙物
  if (frameCount % spawnRate === 0) {
    obstacles.push(new Obstacle());
    spawnRate = int(random(180, 300)); // 每次產生後隨機改變間隔
  }

  // 隨機產生小星星
  if (frameCount % smallStarRate === 0) {
    smallStars.push(new SmallStar());
  }

  // 隨機產生小烏鴉
  if (frameCount % crowRate === 0) {
    crows.push(new Crow());
    crowRate = int(random(300, 450)); // 每次產生後隨機改變間隔
  }

  // 更新障礙物和檢查碰撞
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.update();
    obs.show();

    if (player.hits(obs)) {
      gameOver = true;
    } else if (obs.passed(player)) {
      score++;
      obs.passedPlayer = true; // 確保每個障礙物只計分一次

      if (score % 20 === 0) {
        obstacleSpeed += 1; // 每得20分增加障礙物速度
        bgColor = color(random(100, 255), random(100, 255), random(100, 255)); // 隨機變換背景顏色
      }
    }

    // 檢查橘色小球和障礙物的碰撞
    for (let j = orangeBalls.length - 1; j >= 0; j--) {
      let ball = orangeBalls[j];
      if (obs.hits(ball)) {
        obstacles.splice(i, 1);
        orangeBalls.splice(j, 1);
        break;
      }
    }
  }

  // 更新小星星和檢查碰撞
  for (let i = smallStars.length - 1; i >= 0; i--) {
    let star = smallStars[i];
    star.update();
    star.show();

    if (player.hits(star)) {
      player.maxJump++; // 碰到小星星增加一次連續跳躍次數
      star.collected = true;
      smallStars.splice(i, 1);
    }
  }

  // 更新小烏鴉和檢查碰撞
  for (let i = crows.length - 1; i >= 0; i--) {
    let crow = crows[i];
    crow.update();
    crow.show();

    if (player.hits(crow)) {
      orangeBallCount++; // 碰到小烏鴉增加一個橘色小球
      crow.collected = true;
      crows.splice(i, 1);
    }
  }

  // 更新橘色小球
  for (let ball of orangeBalls) {
    ball.update();
    ball.show();
  }
  orangeBalls = orangeBalls.filter(ball => !ball.offscreen());

  // 移除已經消失的障礙物和被收集的小星星及小烏鴉
  obstacles = obstacles.filter(obs => !obs.offscreen());
  smallStars = smallStars.filter(star => !star.offscreen() && !star.collected);
  crows = crows.filter(crow => !crow.offscreen() && !crow.collected);

  // 顯示分數
  textSize(24);
  fill(30, 144, 255); // 柔和的藍色
  text('Score: ' + score, 10, 25);

  // 顯示可跳躍次數和橘色小球數量
  text('Jumps: ' + player.maxJump, width - 150, 25); // 在右上角顯示累積的空白鍵可跳躍次數
  text('Balls: ' + orangeBallCount, width - 150, 50); // 在右上角顯示橘色小球數量
}

function keyPressed() {
  if (key === ' ') {
    player.jump();
    jumpSound.play();
  }
}

function mousePressed() {
  if (orangeBallCount > 0) {
    orangeBalls.push(new OrangeBall(player.x + player.r, player.y + player.r / 2));
    orangeBallCount--;
  }
}

class Player {
  constructor() {
    this.r = 30; // 調整星星大小
    this.x = 50;
    this.y = height - this.r;
    this.vy = 0;
    this.gravity = 1;
    this.jumpStrength = -15; // 調整跳躍速度
    this.maxJump = 3; // 最大連續跳躍次數
    this.jumpCount = 0;
  }

  jump() {
    if (this.jumpCount < this.maxJump) {
      this.vy = this.jumpStrength; // 使用 jumpStrength 作為跳躍速度
      this.jumpCount++;
    }
  }

  hits(obj) {
    return (
      this.x < obj.x + obj.r &&
      this.x + this.r > obj.x &&
      this.y < obj.y + obj.r &&
      this.y + this.r > obj.y
    );
  }

  update() {
    this.y += this.vy;
    this.vy += this.gravity;
    if (this.y >= height - this.r) {
      this.y = height - this.r;
      this.jumpCount = 0; // 重置跳躍次數
    }
  }

  show() {
    image(playerImg, this.x, this.y, this.r, this.r); // 使用圖片顯示玩家
  }
}

class Obstacle {
  constructor() {
    this.r = int(random(20, 60)); // 障礙物大小隨機變換
    this.x = width;
    this.y = height - this.r;
    this.passedPlayer = false; // 確保障礙物只計分一次
  }

  update() {
    this.x -= obstacleSpeed; // 障礙物速度
  }

  offscreen() {
    return this.x < -this.r;
  }

  show() {
    image(obstacleImg, this.x, this.y, this.r, this.r); // 使用圖片顯示障礙物
  }

  passed(player) {
    return !this.passedPlayer && this.x + this.r < player.x;
  }

  hits(ball) {
    return (
      ball.x > this.x &&
      ball.x < this.x + this.r &&
      ball.y > this.y &&
      ball.y < this.y + this.r
    );
  }
}

class Crow {
  constructor() {
    this.r = 30; // 小烏鴉大小
    this.x = random(width, width * 2);
    this.y = random(50, height - 100);
    this.collected = false; // 是否被收集
  }

  update() {
    this.x -= obstacleSpeed; // 小烏鴉的速度和障礙物相同
  }

  offscreen() {
    return this.x < -this.r;
  }

  show() {
    image(crowImg, this.x, this.y, this.r, this.r); // 使用圖片顯示小烏鴉
  }
}

class SmallStar {
  constructor() {
    this.r = 15; // 小星星大小
    this.x = random(width, width * 2);
    this.y = random(50, height - 100);
    this.collected = false; // 是否被收集
  }

  update() {
    this.x -= obstacleSpeed; // 小星星的速度和障礙物相同
  }

  offscreen() {
    return this.x < -this.r;
  }

  show() {
    image(smallStarImg, this.x, this.y, this.r, this.r); // 使用圖片顯示小星星
  }
}

class OrangeBall {
  constructor(x, y) {
    this.r = 10; // 橘色小球大小
    this.x = x;
    this.y = y;
    this.speed = 6; // 橘色小球速度
  }

  update() {
    this.x += this.speed; // 小球向右移動
  }

  offscreen() {
    return this.x > width; // 判斷是否移出畫面
  }

  show() {
    fill(255, 165, 0); // 橘色
    noStroke();
    ellipse(this.x, this.y, this.r * 2);
  }
}
