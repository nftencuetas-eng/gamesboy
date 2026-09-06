// Brick Breaker - Clean Minimalist Arkanoid Engine
export class NeonBrickBreakerGame {
  constructor(canvas, onGameOver, onScoreUpdate, audio) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onGameOver = onGameOver;
    this.onScoreUpdate = onScoreUpdate;
    this.audio = audio;

    this.width = canvas.width = 640;
    this.height = canvas.height = 480;

    this.paddle = {
      x: this.width / 2 - 45,
      y: this.height - 35,
      width: 90,
      height: 12,
      speed: 8
    };

    this.balls = [
      { x: this.width / 2, y: this.height - 55, vx: 4, vy: -5, radius: 6 }
    ];

    this.bricks = [];
    this.particles = [];
    this.powerups = [];

    this.score = 0;
    this.lives = 3;
    this.combo = 0;
    this.running = true;
    this.keys = {};

    this.initBricks();
    this.rafId = requestAnimationFrame(this.loop.bind(this));
  }

  initBricks() {
    const rows = 6;
    const cols = 9;
    const brickWidth = 58;
    const brickHeight = 18;
    const padding = 8;
    const offsetTop = 50;
    const offsetLeft = 26;

    const colors = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#64748b'];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.bricks.push({
          x: offsetLeft + c * (brickWidth + padding),
          y: offsetTop + r * (brickHeight + padding),
          width: brickWidth,
          height: brickHeight,
          color: colors[r % colors.length],
          hp: r === 0 ? 2 : 1,
          points: (rows - r) * 100
        });
      }
    }
  }

  handleInput(action, isDown) {
    this.keys[action] = isDown;
  }

  createExplosion(x, y, color) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 1
      });
    }
  }

  update() {
    if (!this.running) return;

    if (this.keys['LEFT'] || this.keys['KeyA'] || this.keys['ArrowLeft']) {
      this.paddle.x -= this.paddle.speed;
    }
    if (this.keys['RIGHT'] || this.keys['KeyD'] || this.keys['ArrowRight']) {
      this.paddle.x += this.paddle.speed;
    }

    this.paddle.x = Math.max(10, Math.min(this.width - this.paddle.width - 10, this.paddle.x));

    for (let i = this.balls.length - 1; i >= 0; i--) {
      const b = this.balls[i];
      b.x += b.vx;
      b.y += b.vy;

      if (b.x - b.radius < 0) {
        b.x = b.radius;
        b.vx = Math.abs(b.vx);
        if (this.audio) this.audio.playHit();
      } else if (b.x + b.radius > this.width) {
        b.x = this.width - b.radius;
        b.vx = -Math.abs(b.vx);
        if (this.audio) this.audio.playHit();
      }

      if (b.y - b.radius < 0) {
        b.y = b.radius;
        b.vy = Math.abs(b.vy);
        if (this.audio) this.audio.playHit();
      }

      if (
        b.y + b.radius >= this.paddle.y &&
        b.y - b.radius <= this.paddle.y + this.paddle.height &&
        b.x >= this.paddle.x &&
        b.x <= this.paddle.x + this.paddle.width
      ) {
        b.vy = -Math.abs(b.vy);
        const hitPoint = (b.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2);
        b.vx = hitPoint * 6;
        this.combo = 0;
        if (this.audio) this.audio.playJump();
      }

      for (let j = this.bricks.length - 1; j >= 0; j--) {
        const br = this.bricks[j];
        if (
          b.x + b.radius > br.x &&
          b.x - b.radius < br.x + br.width &&
          b.y + b.radius > br.y &&
          b.y - b.radius < br.y + br.height
        ) {
          b.vy = -b.vy;
          br.hp--;
          this.combo++;
          this.score += br.points * Math.min(5, this.combo);
          this.onScoreUpdate(this.score);

          if (this.audio) this.audio.playCoin();
          this.createExplosion(br.x + br.width / 2, br.y + br.height / 2, br.color);

          if (br.hp <= 0) {
            if (Math.random() < 0.25) {
              const types = ['multiball', 'expand'];
              this.powerups.push({
                x: br.x + br.width / 2,
                y: br.y,
                type: types[Math.floor(Math.random() * types.length)]
              });
            }
            this.bricks.splice(j, 1);
          }
          break;
        }
      }

      if (b.y > this.height + 20) {
        this.balls.splice(i, 1);
      }
    }

    if (this.balls.length === 0) {
      this.lives--;
      if (this.lives <= 0) {
        this.gameOver();
        return;
      } else {
        this.balls.push({
          x: this.paddle.x + this.paddle.width / 2,
          y: this.height - 55,
          vx: (Math.random() - 0.5) * 6,
          vy: -5,
          radius: 6
        });
      }
    }

    if (this.bricks.length === 0) {
      this.initBricks();
      if (this.audio) this.audio.playPowerup();
    }

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.y += 2.2;

      if (
        p.y >= this.paddle.y &&
        p.y <= this.paddle.y + this.paddle.height &&
        p.x >= this.paddle.x &&
        p.x <= this.paddle.x + this.paddle.width
      ) {
        if (p.type === 'multiball') {
          this.balls.push(
            { x: this.paddle.x + 20, y: this.paddle.y - 10, vx: -3, vy: -5, radius: 6 },
            { x: this.paddle.x + 70, y: this.paddle.y - 10, vx: 3, vy: -5, radius: 6 }
          );
        } else if (p.type === 'expand') {
          this.paddle.width = Math.min(160, this.paddle.width + 25);
        }
        if (this.audio) this.audio.playPowerup();
        this.score += 200;
        this.powerups.splice(i, 1);
      } else if (p.y > this.height) {
        this.powerups.splice(i, 1);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= 0.04;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }
  }

  gameOver() {
    this.running = false;
    if (this.audio) this.audio.playGameOver();
    this.onGameOver(this.score);
  }

  draw() {
    const ctx = this.ctx;
    // Dark matte slate background
    ctx.fillStyle = '#0f131a';
    ctx.fillRect(0, 0, this.width, this.height);

    // Bricks
    this.bricks.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.width, b.height);
    });

    // Paddle
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

    // Balls
    this.balls.forEach(b => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Powerups
    this.powerups.forEach(p => {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('P', p.x - 3, p.y + 3);
    });

    // Particles
    this.particles.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.life;
      ctx.fillRect(pt.x, pt.y, 2.5, 2.5);
    });
    ctx.globalAlpha = 1;

    // HUD
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText(`Puntos: ${this.score}`, 20, 30);
    ctx.fillText(`Bolas: ${'⚪ '.repeat(this.lives)}`, this.width - 130, 30);
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
export default NeonBrickBreakerGame;
