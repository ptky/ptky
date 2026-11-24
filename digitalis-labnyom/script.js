(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  const dots = document.getElementById('dots');
  const dialog = document.getElementById('sources');
  let index = 0;
  const buttons = slides.map((slide, i) => {
    slide.querySelectorAll('.reveal').forEach((el, j) => el.style.setProperty('--i', j));
    const button = document.createElement('button');
    button.setAttribute('aria-label', `${i + 1}. dia – ${slide.dataset.title}`);
    button.addEventListener('click', () => go(i));
    dots.appendChild(button);
    return button;
  });
  function go(next, updateHash = true) {
    index = Math.min(slides.length - 1, Math.max(0, next));
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
      slide.inert = i !== index;
      slide.setAttribute('aria-hidden', String(i !== index));
      if (i === index) slide.scrollTop = 0;
      buttons[i].classList.toggle('selected', i === index);
      buttons[i].setAttribute('aria-current', i === index ? 'step' : 'false');
    });
    document.getElementById('counter').textContent = String(index + 1).padStart(2, '0');
    document.getElementById('chapter').textContent = slides[index].dataset.title;
    document.getElementById('progress-fill').style.width = `${(index + 1) / slides.length * 100}%`;
    document.getElementById('prev').disabled = index === 0;
    document.getElementById('next').disabled = index === slides.length - 1;
    if (updateHash) history.replaceState(null, '', `#${index + 1}`);
  }
  function fromHash() {
    const value = Number(location.hash.slice(1));
    go(Number.isInteger(value) && value > 0 ? value - 1 : 0, false);
  }
  document.getElementById('prev').addEventListener('click', () => go(index - 1));
  document.getElementById('next').addEventListener('click', () => go(index + 1));
  document.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => go(index + 1)));
  document.querySelector('.brand').addEventListener('click', () => go(0));
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    } catch (_) { /* A böngésző teljes képernyős korlátozása mellett is használható. */ }
  }
  document.getElementById('fullscreen').addEventListener('click', fullscreen);
  document.addEventListener('keydown', e => {
    if (dialog.open || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest('button,a,input,textarea,select')) return;
    if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); go(index + 1); }
    if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(index - 1); }
    if (e.key === 'Home') { e.preventDefault(); go(0); }
    if (e.key === 'End') { e.preventDefault(); go(slides.length - 1); }
    if (e.key.toLowerCase() === 'f') fullscreen();
  });
  let touch = null;
  document.getElementById('deck').addEventListener('touchstart', e => {
    if (e.target.closest('button,a')) return;
    touch = {x:e.touches[0].clientX,y:e.touches[0].clientY};
  }, {passive:true});
  document.getElementById('deck').addEventListener('touchend', e => {
    if (!touch) return;
    const dx=e.changedTouches[0].clientX-touch.x, dy=e.changedTouches[0].clientY-touch.y;
    if (Math.abs(dx)>65 && Math.abs(dx)>Math.abs(dy)*1.5) go(index + (dx<0?1:-1));
    touch=null;
  }, {passive:true});
  document.querySelectorAll('.toggle').forEach(b => b.addEventListener('click', () => {
    const on = b.classList.toggle('on'); b.setAttribute('aria-pressed', String(on));
  }));
  document.getElementById('sources-open').addEventListener('click', () => dialog.showModal());
  document.getElementById('sources-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) {const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();} });
  const timer = document.getElementById('timer');
  let remaining=300, interval=null, deadline=0;
  function renderTimer(){timer.textContent=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;}
  timer.addEventListener('click', () => {
    if(interval){clearInterval(interval);interval=null;timer.classList.remove('running');timer.title='Időmérő folytatása';return;}
    if(remaining<=0){remaining=300;timer.classList.remove('expired');}
    deadline=Date.now()+remaining*1000;timer.classList.add('running');timer.title='Időmérő megállítása';
    interval=setInterval(()=>{remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));renderTimer();if(remaining===0){clearInterval(interval);interval=null;timer.classList.remove('running');timer.classList.add('expired');timer.title='Új 5 perces időmérő';}},250);
  });
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
