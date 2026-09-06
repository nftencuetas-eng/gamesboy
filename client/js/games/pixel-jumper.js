// Pixel Jumper - Clean Minimalist 2D Platformer Engine
export class PixelJumperGame {
  constructor(canvas, onGameOver, onScoreUpdate, audio) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onGameOver = onGameOver;
    this.onScoreUpdate = onScoreUpdate;
    this.audio = audio;

    this.width = canvas.width = 640;
    this.height = canvas.height = 480;

    this.player = {
      x: 50,
      y: 350,
      width: 22,
      height: 28,
      vx: 0,
      vy: 0,
      speed: 4.5,
      jumpForce: -11,
      grounded: false,
      lives: 3
    };

    this.gravity = 0.55;
    this.platforms = [];
    this.coins = [];
    this.enemies = [];
    this.particles = [];

    this.score = 0;
    this.cameraX = 0;
    this.running = true;
    this.keys = {};

    this.initLevel();
    this.rafId = requestAnimationFrame(this.loop.bind(this));
  }

  initLevel() {
    this.platforms = [
      { x: 0, y: 420, width: 2500, height: 60 },
      { x: 180, y: 340, width: 120, height: 14 },
      { x: 360, y: 280, width: 140, height: 14 },
      { x: 580, y: 220, width: 120, height: 14 },
      { x: 780, y: 310, width: 140, height: 14 },
      { x: 1000, y: 250, width: 160, height: 14 },
      { x: 1250, y: 320, width: 130, height: 14 },
      { x: 1450, y: 230, width: 150, height: 14 },
      { x: 1700, y: 290, width: 160, height: 14 },
      { x: 1950, y: 210, width: 180, height: 14 }
    ];

    for (let i = 0; i < 25; i++) {
      this.coins.push({
        x: 150 + i * 90 + Math.random() * 30,
        y: 200 + Math.sin(i) * 120,
        collected: false
      });
    }

    for (let i = 0; i < 8; i++) {
      this.enemies.push({
        x: 400 + i * 240,
        y: 396,
        width: 24,
        height: 24,
        vx: 1.5,
        startX: 400 + i * 240,
        range: 120
      });
    }
  }

  handleInput(action, isDown) {
    this.keys[action] = isDown;
  }

  jump() {
    if (this.player.grounded) {
      this.player.vy = this.player.jumpForce;
      this.player.grounded = false;
      if (this.audio) this.audio.playJump();
    }
  }

  createExplosion(x, y, color = '#f43f5e') {
    for (let i = 0; i < 8; i++) {
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
      this.player.vx = -this.player.speed;
    } else if (this.keys['RIGHT'] || this.keys['KeyD'] || this.keys['ArrowRight']) {
      this.player.vx = this.player.speed;
    } else {
      this.player.vx = 0;
    }

    if (this.keys['UP'] || this.keys['KeyW'] || this.keys['ArrowUp'] || this.keys['Space'] || this.keys['FIRE']) {
      this.jump();
    }

    this.player.vy += this.gravity;
    this.player.x += this.player.vx;
    this.player.y += this.player.vy;

    this.player.grounded = false;
    for (let plat of this.platforms) {
      if (
        this.player.x + this.player.width > plat.x &&
        this.player.x < plat.x + plat.width &&
        this.player.y + this.player.height >= plat.y &&
        this.player.y + this.player.height <= plat.y + 18 &&
        this.player.vy >= 0
      ) {
        this.player.grounded = true;
        this.player.vy = 0;
        this.player.y = plat.y - this.player.height;
      }
    }

    this.cameraX = this.player.x - 180;

    this.coins.forEach(c => {
      if (!c.collected && Math.hypot(this.player.x - c.x, this.player.y - c.y) < 22) {
        c.collected = true;
        this.score += 100;
        this.onScoreUpdate(this.score);
        this.createExplosion(c.x, c.y, '#eab308');
        if (this.audio) this.audio.playCoin();
      }
    });

    for (let e of this.enemies) {
      e.x += e.vx;
      if (e.x > e.startX + e.range || e.x < e.startX - e.range) {
        e.vx = -e.vx;
      }

      if (
        this.player.x + this.player.width > e.x &&
        this.player.x < e.x + e.width &&
        this.player.y + this.player.height > e.y &&
        this.player.y < e.y + e.height
      ) {
        if (this.player.vy > 0 && this.player.y + this.player.height - this.player.vy <= e.y + 8) {
          this.createExplosion(e.x, e.y, '#f43f5e');
          e.x = -9999;
          this.player.vy = this.player.jumpForce * 0.8;
          this.score += 250;
          this.onScoreUpdate(this.score);
          if (this.audio) this.audio.playHit();
        } else {
          this.player.lives--;
          this.createExplosion(this.player.x, this.player.y, '#f43f5e');
          if (this.audio) this.audio.playHit();
          this.player.x -= 40;
          this.player.vy = -6;

          if (this.player.lives <= 0) {
            this.gameOver();
            return;
          }
        }
      }
    }

    if (this.player.y > this.height + 50) {
      this.gameOver();
      return;
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  gameOver() {
    this.running = false;
    if (this.audio) this.audio.playGameOver();
    this.onGameOver(this.score);
  }

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#0f131a';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(-this.cameraX, 0);

    // Platforms
    this.platforms.forEach(p => {
      ctx.fillStyle = '#1e2433';
      ctx.fillRect(p.x, p.y, p.width, p.height);

      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(p.x, p.y, p.width, 2);
    });

    // Coins
    this.coins.forEach(c => {
      if (!c.collected) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(c.x, c.y, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Enemies
    this.enemies.forEach(e => {
      if (e.x > -100) {
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(e.x, e.y, e.width, e.height);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(e.x + 3, e.y + 4, 3, 3);
        ctx.fillRect(e.x + 13, e.y + 4, 3, 3);
      }
    });

    // Particles
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fillRect(p.x, p.y, 2.5, 2.5);
    });
    ctx.globalAlpha = 1;

    // Player
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.player.x + 8, this.player.y + 4, 6, 5);

    ctx.restore();

    // HUD
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText(`Puntos: ${this.score}`, 20, 30);
    ctx.fillText(`Vidas: ${'❤️ '.repeat(Math.max(0, this.player.lives))}`, this.width - 130, 30);
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
export default PixelJumperGame;
