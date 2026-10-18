(() => {
  const query = matchMedia('(orientation:portrait) and (max-width:1024px) and (hover:none) and (pointer:coarse)');
  const overlay = document.getElementById('tiny-landscape-guard');
  let savedFocus = null;
  function update() {
    window.tinyPortraitBlocked = query.matches;
    overlay.setAttribute('aria-hidden', String(!query.matches));
    if (query.matches) {
      savedFocus = document.activeElement;
      overlay.focus({preventScroll:true});
    } else if (savedFocus && savedFocus.isConnected) {
      savedFocus.focus({preventScroll:true});
      savedFocus = null;
    }
  }
  // Prevent a hardware keyboard from entering the passcode behind the prompt.
  document.addEventListener('keydown', e => {
    if (!query.matches) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  }, true);
  if (query.addEventListener) query.addEventListener('change', update);
  else query.addListener(update);
  update();
})();
