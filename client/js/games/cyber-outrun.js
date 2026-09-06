// Cyber Outrun Turbo - Clean Minimalist 3D Racing Engine
export class CyberOutrunGame {
  constructor(canvas, onGameOver, onScoreUpdate, audio) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onGameOver = onGameOver;
    this.onScoreUpdate = onScoreUpdate;
    this.audio = audio;

    this.width = canvas.width = 640;
    this.height = canvas.height = 480;

    this.playerX = 0;
    this.speed = 0;
    this.maxSpeed = 220;
    this.nitro = 100;
    this.score = 0;
    this.distance = 0;
    this.running = true;
    this.keys = {};

    this.cars = [];
    this.roadCurve = 0;
    this.targetCurve = 0;

    this.initCars();
    this.rafId = requestAnimationFrame(this.loop.bind(this));
  }

  initCars() {
    this.cars = [
      { x: -0.5, y: 300, speed: 80, color: '#e11d48' },
      { x: 0.4, y: 600, speed: 90, color: '#2563eb' },
      { x: -0.2, y: 900, speed: 70, color: '#d97706' },
      { x: 0.6, y: 1200, speed: 85, color: '#059669' }
    ];
  }

  handleInput(action, isDown) {
    this.keys[action] = isDown;
  }

  update() {
    if (!this.running) return;

    if (this.keys['UP'] || this.keys['KeyW'] || this.keys['ArrowUp'] || this.keys['FIRE']) {
      let accel = 1.8;
      if (this.keys['FIRE'] && this.nitro > 0) {
        accel = 3.5;
        this.nitro = Math.max(0, this.nitro - 0.4);
      }
      this.speed = Math.min(this.maxSpeed, this.speed + accel);
    } else if (this.keys['DOWN'] || this.keys['KeyS'] || this.keys['ArrowDown']) {
      this.speed = Math.max(0, this.speed - 3.5);
    } else {
      this.speed = Math.max(0, this.speed - 0.8);
    }

    const steerSpeed = (this.speed / this.maxSpeed) * 0.035;
    if (this.keys['LEFT'] || this.keys['KeyA'] || this.keys['ArrowLeft']) {
      this.playerX -= steerSpeed;
    }
    if (this.keys['RIGHT'] || this.keys['KeyD'] || this.keys['ArrowRight']) {
      this.playerX += steerSpeed;
    }

    this.playerX -= this.roadCurve * (this.speed / this.maxSpeed) * 0.02;

    if (Math.random() < 0.02) {
      this.targetCurve = (Math.random() - 0.5) * 2.5;
    }
    this.roadCurve += (this.targetCurve - this.roadCurve) * 0.02;

    this.distance += this.speed * 0.05;
    this.score = Math.floor(this.distance * 10);
    this.onScoreUpdate(this.score);

    if (this.speed > 50 && this.nitro < 100) {
      this.nitro = Math.min(100, this.nitro + 0.08);
    }

    if (Math.abs(this.playerX) > 1.1) {
      this.speed = Math.max(0, this.speed - 2);
    }

    for (let car of this.cars) {
      car.y -= (this.speed - car.speed) * 0.2;

      if (car.y < 10) {
        if (Math.abs(this.playerX - car.x) < 0.28 && this.speed > 40) {
          this.gameOver();
          return;
        }
      }

      if (car.y < -50) {
        car.y = 1200 + Math.random() * 400;
        car.x = (Math.random() - 0.5) * 1.6;
        if (this.audio) this.audio.playCoin();
      }
    }
  }

  gameOver() {
    this.running = false;
    if (this.audio) {
      this.audio.playExplosion();
      this.audio.playGameOver();
    }
    this.onGameOver(this.score);
  }

  draw() {
    const ctx = this.ctx;
    // Dark matte slate horizon
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, this.width, this.height);

    const horizon = 220;

    // Horizon line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(this.width, horizon);
    ctx.stroke();

    // 3D Road Segments
    const numSegments = 50;
    for (let i = numSegments; i >= 1; i--) {
      const z = i;
      const y = horizon + Math.pow(z / numSegments, 1.8) * (this.height - horizon);
      const nextY = horizon + Math.pow((z - 1) / numSegments, 1.8) * (this.height - horizon);
      
      const widthAtZ = ((this.height - y) / (this.height - horizon)) * (this.width * 0.95);
      const curveOffset = Math.sin((this.distance * 0.05 + (numSegments - z) * 0.1)) * this.roadCurve * 60;
      const centerX = this.width / 2 + curveOffset;

      const isEven = (Math.floor(this.distance * 0.2 + z) % 2) === 0;

      // Roadside / Dark terrain
      ctx.fillStyle = isEven ? '#111622' : '#0e121d';
      ctx.fillRect(0, y, this.width, nextY - y);

      // Asphalt
      ctx.fillStyle = isEven ? '#1e2433' : '#181d2a';
      ctx.fillRect(centerX - widthAtZ / 2, y, widthAtZ, nextY - y);

      // Curbs
      const curbWidth = widthAtZ * 0.04;
      ctx.fillStyle = isEven ? '#3b82f6' : '#ffffff';
      ctx.fillRect(centerX - widthAtZ / 2, y, curbWidth, nextY - y);
      ctx.fillRect(centerX + widthAtZ / 2 - curbWidth, y, curbWidth, nextY - y);

      // Lane line
      if (isEven) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(centerX - 2, y, 4, nextY - y);
      }
    }

    // Traffic Cars
    this.cars.forEach(car => {
      if (car.y > 0 && car.y < 1200) {
        const carZ = car.y / 1200;
        const screenY = horizon + (1 - carZ) * (this.height - horizon - 50);
        const scale = 1 - carZ;
        const carW = 56 * scale;
        const carH = 28 * scale;
        const carScreenX = this.width / 2 + car.x * (this.width * 0.35 * scale);

        ctx.fillStyle = car.color;
        ctx.fillRect(carScreenX - carW / 2, screenY, carW, carH);
        
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(carScreenX - carW / 2 + 4 * scale, screenY + carH - 5 * scale, 6 * scale, 3 * scale);
        ctx.fillRect(carScreenX + carW / 2 - 10 * scale, screenY + carH - 5 * scale, 6 * scale, 3 * scale);
      }
    });

    // Player Car
    const playerScreenX = this.width / 2 + this.playerX * (this.width * 0.35);
    const playerScreenY = this.height - 65;

    // Body
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(playerScreenX - 30, playerScreenY, 60, 28);

    // Roof
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(playerScreenX - 20, playerScreenY - 10, 40, 12);

    // Taillights
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(playerScreenX - 26, playerScreenY + 16, 12, 5);
    ctx.fillRect(playerScreenX + 14, playerScreenY + 16, 12, 5);

    // Clean Minimalist HUD
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText(`Velocidad: ${Math.floor(this.speed)} km/h`, 20, 30);
    ctx.fillText(`Distancia: ${this.score} m`, 20, 52);

    // Nitro indicator
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(this.width - 150, 18, 130, 12);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(this.width - 150, 18, (this.nitro / 100) * 130, 12);
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
export default CyberOutrunGame;
