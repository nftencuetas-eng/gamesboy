// Cyber Snake - Clean Minimalist Snake Engine
export class CyberSnakeGame {
  constructor(canvas, onGameOver, onScoreUpdate, audio) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onGameOver = onGameOver;
    this.onScoreUpdate = onScoreUpdate;
    this.audio = audio;

    this.width = canvas.width = 640;
    this.height = canvas.height = 480;

    this.gridSize = 20;
    this.cols = Math.floor(this.width / this.gridSize);
    this.rows = Math.floor(this.height / this.gridSize);

    this.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];

    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.food = { x: 18, y: 12 };
    this.specialFood = null;
    this.particles = [];

    this.score = 0;
    this.speed = 100;
    this.lastTick = 0;
    this.running = true;
    this.keys = {};

    this.spawnFood();
    this.rafId = requestAnimationFrame(this.loop.bind(this));
  }

  handleInput(action, isDown) {
    if (!isDown) return;

    if ((action === 'UP' || action === 'KeyW' || action === 'ArrowUp') && this.dir.y === 0) {
      this.nextDir = { x: 0, y: -1 };
    } else if ((action === 'DOWN' || action === 'KeyS' || action === 'ArrowDown') && this.dir.y === 0) {
      this.nextDir = { x: 0, y: 1 };
    } else if ((action === 'LEFT' || action === 'KeyA' || action === 'ArrowLeft') && this.dir.x === 0) {
      this.nextDir = { x: -1, y: 0 };
    } else if ((action === 'RIGHT' || action === 'KeyD' || action === 'ArrowRight') && this.dir.x === 0) {
      this.nextDir = { x: 1, y: 0 };
    }
  }

  spawnFood() {
    let newX, newY;
    while (true) {
      newX = Math.floor(Math.random() * this.cols);
      newY = Math.floor(Math.random() * this.rows);
      if (!this.snake.some(seg => seg.x === newX && seg.y === newY)) break;
    }
    this.food = { x: newX, y: newY };

    if (Math.random() < 0.3 && !this.specialFood) {
      this.specialFood = {
        x: Math.floor(Math.random() * this.cols),
        y: Math.floor(Math.random() * this.rows),
        expire: Date.now() + 6000
      };
    }
  }

  createExplosion(x, y, color) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x: x * this.gridSize + 10,
        y: y * this.gridSize + 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 1
      });
    }
  }

  tick() {
    this.dir = this.nextDir;
    const head = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y };

    if (head.x < 0) head.x = this.cols - 1;
    if (head.x >= this.cols) head.x = 0;
    if (head.y < 0) head.y = this.rows - 1;
    if (head.y >= this.rows) head.y = 0;

    for (let i = 0; i < this.snake.length; i++) {
      if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
        this.gameOver();
        return;
      }
    }

    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 20;
      this.onScoreUpdate(this.score);
      this.createExplosion(this.food.x, this.food.y, '#10b981');
      if (this.audio) this.audio.playCoin();
      this.spawnFood();
      this.speed = Math.max(50, 100 - Math.floor(this.score / 60) * 5);
    } else if (this.specialFood && head.x === this.specialFood.x && head.y === this.specialFood.y) {
      this.score += 100;
      this.onScoreUpdate(this.score);
      this.createExplosion(this.specialFood.x, this.specialFood.y, '#f59e0b');
      if (this.audio) this.audio.playPowerup();
      this.specialFood = null;
    } else {
      this.snake.pop();
    }

    if (this.specialFood && Date.now() > this.specialFood.expire) {
      this.specialFood = null;
    }
  }

  gameOver() {
    this.running = false;
    if (this.audio) this.audio.playGameOver();
    this.onGameOver(this.score);
  }

  update() {
    const now = Date.now();
    if (now - this.lastTick > this.speed) {
      this.tick();
      this.lastTick = now;
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#0f131a';
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle dark grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= this.width; x += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y <= this.height; y += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // Food
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(
      this.food.x * this.gridSize + this.gridSize / 2,
      this.food.y * this.gridSize + this.gridSize / 2,
      this.gridSize / 2 - 3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Special Food
    if (this.specialFood) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(
        this.specialFood.x * this.gridSize + this.gridSize / 2,
        this.specialFood.y * this.gridSize + this.gridSize / 2,
        this.gridSize / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Snake Body
    this.snake.forEach((seg, index) => {
      ctx.fillStyle = index === 0 ? '#3b82f6' : '#2563eb';
      ctx.fillRect(
        seg.x * this.gridSize + 1,
        seg.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2
      );
    });

    // Particles
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fillRect(p.x, p.y, 2.5, 2.5);
    });
    ctx.globalAlpha = 1;

    // HUD
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText(`Puntos: ${this.score}`, 20, 30);
    ctx.fillText(`Longitud: ${this.snake.length}`, this.width - 130, 30);
  }

  loop() {
    this.update();
    this.draw();
    if (this.running) {
      this.rafId = requestAnimationFrame(this.loop.bind(this));
    }
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }
}
export default CyberSnakeGame;
