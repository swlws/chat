window.StarFallModule = (function () {
  const fragments = ['🌟', '✨'];
  let intervalId = null;
  let rootEl = null;

  function injectStyles() {
    if (document.getElementById('starfall-styles')) return;

    const style = document.createElement('style');
    style.id = 'starfall-styles';
    style.textContent = `
  #starfall-root {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    pointer-events: none;
    z-index: 9999;
    font-family: "STKaiti", "KaiTi", "Songti SC", serif;
    background: linear-gradient(to bottom, #fef8f8, #fbe9e7);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    user-select: none;
  }
  .container {
    text-align: center;
    position: relative;
    z-index: 2;
    pointer-events: auto;
  }
  .text {
    font-size: 32px;
    color: #b71c1c;
    white-space: nowrap;
    overflow: hidden;
    border-right: 2px solid #b71c1c;
    animation: typing 3s steps(15), blink 0.8s step-end infinite;
  }
  @keyframes typing {
    from { width: 0 }
    to { width: 15ch }
  }
  @keyframes blink {
    50% { border-color: transparent }
  }
  .subtext {
    font-size: 16px;
    color: #6a1b1a;
    margin-top: 8px;
    animation: fadeIn 4s ease-in-out;
    opacity: 0.7;
  }
  @keyframes fadeIn {
    from {opacity:0; transform: translateY(10px);}
    to {opacity:0.7; transform: translateY(0);}
  }
  .starfall-fragment {
    position: absolute;
    pointer-events: none;
    user-select: none;
    transform-origin: center center;
    will-change: transform, opacity;
    animation-name: starfall-fall;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
    opacity: 0.8;
    font-size: 18px;
  }
  @keyframes starfall-fall {
    0% {
      transform: translateY(0) rotate(0deg) scale(1);
      opacity: 0.8;
    }
    100% {
      transform: translateY(100vh) rotate(360deg) scale(1.5);
      opacity: 0;
    }
  }
  .hint {
    position: absolute;
    bottom: 20px;
    width: 100%;
    text-align: center;
    font-size: 14px;
    color: #9e2a2b;
    opacity: 0.4;
    font-style: italic;
    user-select: none;
    pointer-events: auto;
  }
  #starfall-close-btn {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 10000;
    background: #b71c1c;
    border: none;
    border-radius: 4px;
    color: white;
    font-size: 16px;
    width: 32px;
    height: 32px;
    cursor: pointer;
    user-select: none;
    pointer-events: auto;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    transition: background 0.3s ease;
  }
  #starfall-close-btn:hover {
    background: #7f1212;
  }
`;
    document.head.appendChild(style);
  }

  function createRoot() {
    if (rootEl) return rootEl;
    rootEl = document.createElement('div');
    rootEl.id = 'starfall-root';

    const container = document.createElement('div');
    container.className = 'container';

    const mainText = document.createElement('div');
    mainText.className = 'text';
    mainText.textContent = '呦呦呦，一个小惊喜';

    const subText = document.createElement('div');
    subText.className = 'subtext';
    subText.textContent = '今天是个啥子日子呀~';

    container.appendChild(mainText);
    container.appendChild(subText);
    rootEl.appendChild(container);

    const hint = document.createElement('div');
    hint.className = 'hint';
    hint.textContent = '* 始料不及的遇见，突如其来的欢喜 *';
    rootEl.appendChild(hint);

    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.id = 'starfall-close-btn';
    closeBtn.title = '关闭动画';
    closeBtn.textContent = '×';

    closeBtn.addEventListener('click', () => {
      stop();
      removeRoot();
    });

    document.body.insertAdjacentElement('afterend', rootEl);
    document.body.insertAdjacentElement('afterend', closeBtn);

    // root及按钮 pointer-events: auto，允许点击
    rootEl.style.pointerEvents = 'auto';

    return rootEl;
  }

  function removeRoot() {
    if (rootEl) {
      rootEl.remove();
      rootEl = null;
    }
    const closeBtn = document.getElementById('starfall-close-btn');
    if (closeBtn) closeBtn.remove();
  }

  function createFragment() {
    if (!rootEl) return;

    const frag = document.createElement('div');
    frag.className = 'starfall-fragment';

    frag.textContent = fragments[Math.floor(Math.random() * fragments.length)];

    const size = Math.random() * 14 + 14;
    frag.style.fontSize = size + 'px';

    const rootWidth = rootEl.clientWidth || window.innerWidth;
    frag.style.left = Math.random() * rootWidth + 'px';

    frag.style.top = `-${size}px`;

    const duration = Math.random() * 3 + 4;
    frag.style.animationDuration = duration + 's';

    const initRotate = Math.random() * 360;
    frag.style.transform = `rotate(${initRotate}deg)`;

    frag.style.opacity = (Math.random() * 0.3 + 0.5).toFixed(2);

    rootEl.appendChild(frag);

    setTimeout(() => {
      frag.remove();
    }, duration * 1000 + 100);
  }

  let resolvePromise = null;
  function play() {
    if (resolvePromise) return Promise.resolve();

    return new Promise((resolve) => {
      injectStyles();
      createRoot();

      if (intervalId) return;
      intervalId = setInterval(createFragment, 200);

      resolvePromise = resolve;
    });
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    resolvePromise();
    resolvePromise = null;
  }

  return { play, stop };
})();
