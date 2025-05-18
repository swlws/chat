window.FireworkModule = (function () {
  // 动态创建 canvas 元素
  const canvas = document.createElement('canvas');
  canvas.id = 'fireworks';
  Object.assign(canvas.style, {
    display: 'block',
    opacity: 0, // 初始透明度为 0
    transition: 'opacity 1s ease', // 添加透明度过渡效果，时长 1 秒
    'pointer-events': 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  class Firework {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height;
      this.targetY = Math.random() * canvas.height * 0.3;
      this.speed = Math.random() * 6 + 4; // 增加速度范围
      this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    }

    update() {
      this.y -= this.speed;
      if (this.y <= this.targetY) {
        explode(this.x, this.y, this.color);
        return true;
      }
      return false;
    }

    draw() {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.speed = {
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 8,
      };
      this.alpha = 1;
      this.fade = 0.01;
    }

    update() {
      this.x += this.speed.x;
      this.y += this.speed.y;
      this.alpha -= this.fade;
    }

    draw() {
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  const fireworks = [];
  const particles = [];
  let shouldStop = false;
  let animationId;

  function explode(x, y, color) {
    for (let i = 0; i < 100; i++) {
      particles.push(new Particle(x, y, color));
    }
  }

  function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!shouldStop && Math.random() < 0.02) {
      fireworks.push(new Firework());
    }

    for (let i = fireworks.length - 1; i >= 0; i--) {
      if (fireworks[i].update()) {
        fireworks.splice(i, 1);
      } else {
        fireworks[i].draw();
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      if (particles[i].alpha <= 0) {
        particles.splice(i, 1);
      } else {
        particles[i].draw();
      }
    }

    if (shouldStop && fireworks.length === 0 && particles.length === 0) {
      cancelAnimationFrame(animationId);
      canvas.style.opacity = 0; // 烟花结束，画布淡出

      // 结束后，将 resolvePromise 调用
      resolvePromise();
      resolvePromise = null;

      return;
    }

    animationId = requestAnimationFrame(animate);
  }

  // 抽离状态重置逻辑到单独的函数
  function resetState() {
    // 清空烟花和粒子数组
    fireworks.length = 0;
    particles.length = 0;
    // 重置停止标记
    shouldStop = false;
    // 清除动画帧
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  }

  let resolvePromise;
  function play({ time = 5000 } = {}) {
    if (resolvePromise) return Promise.resolve();

    return new Promise((resolve) => {
      // 调用重置状态函数
      resetState();
      // 显示画布
      canvas.style.opacity = 1;
      // 启动新动画
      animate();
      // 设置停止时间
      setTimeout(() => {
        shouldStop = true;
      }, time);

      resolvePromise = resolve;
    });
  }

  return {
    play,
  };
})();
