// Galaxy Vanguard - Minimalist Space Arcade Shooter
export class GalaxyVanguardGame {
  constructor(canvas, onGameOver, onScoreUpdate, audio) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onGameOver = onGameOver;
    this.onScoreUpdate = onScoreUpdate;
    this.audio = audio;

    this.width = canvas.width = 640;
    this.height = canvas.height = 480;

    this.player = {
      x: this.width / 2,
      y: this.height - 60,
      width: 28,
      height: 28,
      speed: 6,
      health: 3,
      shield: false,
      tripleShot: false,
      lastShot: 0
    };

    this.lasers = [];
    this.enemies = [];
    this.particles = [];
    this.powerups = [];
    this.stars = [];

    this.score = 0;
    this.running = true;
    this.keys = {};

    this.initStars();
    this.lastEnemySpawn = 0;
    this.rafId = requestAnimationFrame(this.loop.bind(this));
  }

  initStars() {
    for (let i = 0; i < 50; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 1.5 + 0.5
      });
    }
  }

  handleInput(action, isDown) {
    this.keys[action] = isDown;
  }

  shoot() {
    const now = Date.now();
    if (now - this.player.lastShot < 180) return;
    this.player.lastShot = now;

    if (this.player.tripleShot) {
      this.lasers.push(
        { x: this.player.x, y: this.player.y, vx: 0, vy: -10, color: '#38bdf8' },
        { x: this.player.x, y: this.player.y, vx: -3, vy: -9, color: '#f43f5e' },
        { x: this.player.x, y: this.player.y, vx: 3, vy: -9, color: '#f43f5e' }
      );
    } else {
      this.lasers.push({
        x: this.player.x,
        y: this.player.y - 10,
        vx: 0,
        vy: -10,
        color: '#38bdf8'
      });
    }
    if (this.audio) this.audio.playLaser();
  }

  spawnEnemy() {
    const types = ['scout', 'fighter', 'tank'];
    const type = types[Math.floor(Math.random() * types.length)];
    let hp = 1;
    let size = 22;
    let color = '#f43f5e';
    let speed = 2 + Math.random() * 1.8;

    if (type === 'fighter') {
      hp = 2;
      size = 26;
      color = '#a855f7';
    } else if (type === 'tank') {
      hp = 4;
      size = 34;
      color = '#eab308';
      speed = 1.2;
    }

    this.enemies.push({
      x: Math.random() * (this.width - 60) + 30,
      y: -40,
      width: size,
      height: size,
      hp,
      maxHp: hp,
      speed,
      color,
      type,
      time: 0
    });
  }

  createExplosion(x, y, color = '#f43f5e', count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color
      });
    }
    if (this.audio) this.audio.playExplosion();
  }

  update() {
    if (!this.running) return;

    if (this.keys['LEFT'] || this.keys['KeyA'] || this.keys['ArrowLeft']) this.player.x -= this.player.speed;
    if (this.keys['RIGHT'] || this.keys['KeyD'] || this.keys['ArrowRight']) this.player.x += this.player.speed;
    if (this.keys['UP'] || this.keys['KeyW'] || this.keys['ArrowUp']) this.player.y -= this.player.speed;
    if (this.keys['DOWN'] || this.keys['KeyS'] || this.keys['ArrowDown']) this.player.y += this.player.speed;
    if (this.keys['FIRE'] || this.keys['Space'] || this.keys['KeyJ']) this.shoot();

    this.player.x = Math.max(20, Math.min(this.width - 20, this.player.x));
    this.player.y = Math.max(50, Math.min(this.height - 20, this.player.y));

    this.stars.forEach(s => {
      s.y += s.speed;
      if (s.y > this.height) {
        s.y = 0;
        s.x = Math.random() * this.width;
      }
    });

    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const l = this.lasers[i];
      l.x += l.vx;
      l.y += l.vy;
      if (l.y < -10 || l.x < 0 || l.x > this.width) {
        this.lasers.splice(i, 1);
      }
    }

    const now = Date.now();
    if (now - this.lastEnemySpawn > Math.max(600, 1500 - this.score * 0.1)) {
      this.spawnEnemy();
      this.lastEnemySpawn = now;
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.time += 0.05;
      e.y += e.speed;
      if (e.type === 'scout') {
        e.x += Math.sin(e.time) * 2;
      }

      for (let j = this.lasers.length - 1; j >= 0; j--) {
        const l = this.lasers[j];
        const dist = Math.hypot(e.x - l.x, e.y - l.y);
        if (dist < e.width / 2 + 5) {
          e.hp--;
          this.lasers.splice(j, 1);
          if (this.audio) this.audio.playHit();
          if (e.hp <= 0) {
            this.createExplosion(e.x, e.y, e.color);
            this.score += e.maxHp * 100;
            this.onScoreUpdate(this.score);
            this.enemies.splice(i, 1);

            if (Math.random() < 0.2) {
              this.powerups.push({
                x: e.x,
                y: e.y,
                type: Math.random() > 0.5 ? 'triple' : 'shield'
              });
            }
            break;
          }
        }
      }

      if (Math.hypot(e.x - this.player.x, e.y - this.player.y) < e.width / 2 + 14) {
        this.createExplosion(e.x, e.y, '#f43f5e');
        this.enemies.splice(i, 1);

        if (this.player.shield) {
          this.player.shield = false;
        } else {
          this.player.health--;
          if (this.player.health <= 0) {
            this.gameOver();
            return;
          }
        }
      }

      if (e.y > this.height + 50) {
        this.enemies.splice(i, 1);
      }
    }

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.y += 2;
      if (Math.hypot(p.x - this.player.x, p.y - this.player.y) < 22) {
        if (p.type === 'triple') this.player.tripleShot = true;
        if (p.type === 'shield') this.player.shield = true;
        if (this.audio) this.audio.playPowerup();
        this.score += 250;
        this.onScoreUpdate(this.score);
        this.powerups.splice(i, 1);
      } else if (p.y > this.height) {
        this.powerups.splice(i, 1);
      }
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
    // Matte dark slate background
    ctx.fillStyle = '#0f131a';
    ctx.fillRect(0, 0, this.width, this.height);

    // Stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    this.stars.forEach(s => {
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });

    // Lasers (Clean geometric rectangles)
    this.lasers.forEach(l => {
      ctx.fillStyle = l.color;
      ctx.fillRect(l.x - 2, l.y - 8, 4, 16);
    });

    // Enemies (Clean geometric shapes)
    this.enemies.forEach(e => {
      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.width / 2, 0, Math.PI * 2);
      ctx.fill();

      // Flat eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(e.x - 4, e.y - 3, 2, 2);
      ctx.fillRect(e.x + 2, e.y - 3, 2, 2);
    });

    // Powerups
    this.powerups.forEach(p => {
      ctx.fillStyle = p.type === 'triple' ? '#10b981' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(p.type === 'triple' ? '3X' : 'S', p.x - 5, p.y + 3);
    });

    // Particles
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fillRect(p.x, p.y, 2.5, 2.5);
    });
    ctx.globalAlpha = 1;

    // Player Ship (Clean minimalist geometry)
    if (this.running) {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(this.player.x, this.player.y - 14);
      ctx.lineTo(this.player.x - 12, this.player.y + 12);
      ctx.lineTo(this.player.x + 12, this.player.y + 12);
      ctx.closePath();
      ctx.fill();

      // Cockpit
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.player.x - 2, this.player.y - 2, 4, 6);

      // Shield ring
      if (this.player.shield) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, 20, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Clean Minimalist HUD
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText(`Puntos: ${this.score}`, 20, 30);
    ctx.fillText(`Vidas: ${'❤️ '.repeat(Math.max(0, this.player.health))}`, this.width - 130, 30);
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
export default GalaxyVanguardGame;
