// Enhanced Canvas Cursor Effects with Connected Particles
class CursorEffect {
  constructor() {
    this.canvas = document.getElementById("cursorCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.particleCount = 50;

    this.init();
  }

  init() {
    this.resize();
    this.bindEvents();
    this.createInitialParticles();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  bindEvents() {
    window.addEventListener("resize", () => this.resize());
    document.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.addCursorParticle();
    });
  }

  createInitialParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      this.particles.push(new Particle(x, y));
    }
  }

  addCursorParticle() {
    // Add particle at cursor position
    this.particles.push(new Particle(this.mouse.x, this.mouse.y, true));
    
    // Limit particles
    if (this.particles.length > this.particleCount + 20) {
      this.particles.shift();
    }
  }

  connectParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          const opacity = 1 - (distance / 120);
          this.ctx.strokeStyle = `rgba(102, 126, 234, ${opacity * 0.3})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw particles
    this.particles.forEach((particle, index) => {
      particle.update(this.canvas);
      particle.draw(this.ctx);

      // Remove faded particles
      if (particle.life <= 0) {
        this.particles.splice(index, 1);
      }
    });

    // Connect particles with lines
    this.connectParticles();

    requestAnimationFrame(() => this.animate());
  }
}

// Particle class for the enhanced cursor effect
class Particle {
  constructor(x, y, isCursorParticle = false) {
    this.x = x;
    this.y = y;
    this.size = isCursorParticle ? Math.random() * 4 + 2 : Math.random() * 3 + 1;
    this.speedX = isCursorParticle ? (Math.random() - 0.5) * 2 : (Math.random() - 0.5) * 1;
    this.speedY = isCursorParticle ? (Math.random() - 0.5) * 2 : (Math.random() - 0.5) * 1;
    this.life = isCursorParticle ? 1 : 0.8;
    this.decay = isCursorParticle ? 0.015 : 0.005;
    this.isCursorParticle = isCursorParticle;
    this.originalLife = this.life;
  }

  update(canvas) {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.isCursorParticle) {
      // Cursor particles fade away
      this.life -= this.decay;
    } else {
      // Ambient particles wrap around screen
      if (this.x > canvas.width) this.x = 0;
      if (this.x < 0) this.x = canvas.width;
      if (this.y > canvas.height) this.y = 0;
      if (this.y < 0) this.y = canvas.height;
    }
  }

  draw(ctx) {
    ctx.save();
    
    if (this.isCursorParticle) {
      // Cursor particles with gradient effect
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
      gradient.addColorStop(0, `rgba(102, 126, 234, ${this.life})`);
      gradient.addColorStop(1, `rgba(118, 75, 162, ${this.life * 0.5})`);
      ctx.fillStyle = gradient;
      ctx.globalAlpha = this.life;
    } else {
      // Ambient particles with cyan color
      ctx.fillStyle = `rgba(0, 255, 255, ${this.life})`;
      ctx.globalAlpha = this.life;
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new CursorEffect();
});