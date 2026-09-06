// Neon Flap - Clean Minimalist Precision Flyer Engine
export class NeonFlapGame {
  constructor(canvas, onGameOver, onScoreUpdate, audio) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onGameOver = onGameOver;
    this.onScoreUpdate = onScoreUpdate;
    this.audio = audio;

    this.width = canvas.width = 640;
    this.height = canvas.height = 480;

    this.bird = {
      x: 120,
      y: this.height / 2,
      radius: 12,
      vy: 0,
      gravity: 0.38,
      jump: -7.5,
      rotation: 0
    };

    this.pipes = [];
    this.particles = [];
    this.score = 0;
    this.running = true;
    this.lastPipeSpawn = 0;
    this.keys = {};

    this.rafId = requestAnimationFrame(this.loop.bind(this));
  }

  handleInput(action, isDown) {
    if (isDown && (action === 'UP' || action === 'KeyW' || action === 'Space' || action === 'FIRE' || action === 'ArrowUp')) {
      this.flap();
    }
  }

  flap() {
    this.bird.vy = this.bird.jump;
    this.bird.rotation = -0.4;
    if (this.audio) this.audio.playJump();

    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: this.bird.x - 8,
        y: this.bird.y + (Math.random() - 0.5) * 8,
        vx: -Math.random() * 2 - 1,
        vy: (Math.random() - 0.5) * 2,
        life: 1,
        color: '#38bdf8'
      });
    }
  }

  spawnPipe() {
    const gap = 140;
    const minHeight = 50;
    const topHeight = Math.floor(Math.random() * (this.height - gap - minHeight * 2)) + minHeight;

    this.pipes.push({
      x: this.width + 20,
      topHeight,
      bottomY: topHeight + gap,
      width: 50,
      passed: false
    });
  }

  createExplosion(x, y, color = '#f43f5e') {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
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

    this.bird.vy += this.bird.gravity;
    this.bird.y += this.bird.vy;
    this.bird.rotation = Math.min(Math.PI / 3, this.bird.rotation + 0.03);

    if (this.bird.y - this.bird.radius < 0) {
      this.bird.y = this.bird.radius;
      this.bird.vy = 0;
    }

    if (this.bird.y + this.bird.radius > this.height - 20) {
      this.gameOver();
      return;
    }

    const now = Date.now();
    if (now - this.lastPipeSpawn > 1600) {
      this.spawnPipe();
      this.lastPipeSpawn = now;
    }

    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const p = this.pipes[i];
      p.x -= 3;

      if (!p.passed && p.x + p.width < this.bird.x) {
        p.passed = true;
        this.score++;
        this.onScoreUpdate(this.score);
        if (this.audio) this.audio.playCoin();
      }

      if (
        this.bird.x + this.bird.radius > p.x &&
        this.bird.x - this.bird.radius < p.x + p.width
      ) {
        if (
          this.bird.y - this.bird.radius < p.topHeight ||
          this.bird.y + this.bird.radius > p.bottomY
        ) {
          this.gameOver();
          return;
        }
      }

      if (p.x + p.width < -20) {
        this.pipes.splice(i, 1);
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
    this.createExplosion(this.bird.x, this.bird.y, '#f43f5e');
    if (this.audio) this.audio.playGameOver();
    this.onGameOver(this.score);
  }

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#0f131a';
    ctx.fillRect(0, 0, this.width, this.height);

    // Pipes
    this.pipes.forEach(p => {
      ctx.fillStyle = '#1e2433';
      ctx.fillRect(p.x, 0, p.width, p.topHeight);
      ctx.fillRect(p.x - 2, p.topHeight - 14, p.width + 4, 14);

      ctx.fillRect(p.x, p.bottomY, p.width, this.height - p.bottomY);
      ctx.fillRect(p.x - 2, p.bottomY, p.width + 4, 14);

      // Edge accents
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(p.x - 2, p.topHeight - 2, p.width + 4, 2);
      ctx.fillRect(p.x - 2, p.bottomY, p.width + 4, 2);
    });

    // Floor
    ctx.fillStyle = '#111622';
    ctx.fillRect(0, this.height - 20, this.width, 20);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(0, this.height - 20, this.width, 1);

    // Particles
    this.particles.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.life;
      ctx.fillRect(pt.x, pt.y, 2.5, 2.5);
    });
    ctx.globalAlpha = 1;

    // Bird
    ctx.save();
    ctx.translate(this.bird.x, this.bird.y);
    ctx.rotate(this.bird.rotation);

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(4, -3, 3, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(16, 2);
    ctx.lineTo(8, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // HUD
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 22px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.score}`, this.width / 2, 45);
    ctx.textAlign = 'left';
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
export default NeonFlapGame;
