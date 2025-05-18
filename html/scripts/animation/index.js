(() => {
  const queue = [];
  let playing = false;

  /**
   * 添加动画
   * @param {*} animation
   */
  function addAnimation(animation) {
    queue.push(animation);

    if (document.hidden) return;
    emitAnimation();
  }

  /**
   * 执行动画
   * @returns
   */
  async function emitAnimation() {
    if (queue.length === 0) return;

    if (playing) return;
    playing = true;

    while (queue.length) {
      const { cb, params } = queue.shift();
      await cb(params);
      console.log('play end, will next');
    }

    playing = false;
  }

  /**
   * 分发动画
   * @param {*} message
   * @returns
   */
  window.dispatchAnimation = (message) => {
    if (!message) return;

    if (/烟花/.test(message)) {
      addAnimation({ cb: window.FireworkModule.play, params: { time: 5000 } });
    }

    if (/520/.test(message)) {
      addAnimation({ cb: window.StarFallModule.play });
    }
  };

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      emitAnimation();
    }
  });
})();
