(() => {
  const queue = [];
  let playing = false;

  /**
   * 添加动画
   * @param {*} animation
   */
  function addAnimation(animation) {
    console.log('addAnimation', animation);
    queue.push(animation);

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

    console.log('emitAnimation');
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
    console.log('dispatchAnimation', message, /^烟花$/.test(message));
    if (!message) return;

    if (/^烟花$/.test(message)) {
      addAnimation({ cb: window.FireworkModule.play, params: { time: 5000 } });
    }

    if (/520/.test(message)) {
      addAnimation({ cb: window.StarFallModule.play });
    }
  };
})();
