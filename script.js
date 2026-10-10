(() => {
  'use strict';
  const key = document.body.dataset.storage;
  const checks = [...document.querySelectorAll('[data-check]')];
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch {}
  const refresh = () => {
    const done = checks.filter(input => input.checked).length;
    document.querySelector('[data-status-meta]').textContent = `準備 ${done}/${checks.length}`;
    document.querySelector('[data-status-bar]').style.width = `${100 * done / checks.length}%`;
  };
  checks.forEach(input => {
    input.checked = saved[input.dataset.check] === true;
    input.addEventListener('change', () => {
      const state = Object.fromEntries(checks.map(item => [item.dataset.check, item.checked]));
      try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
      refresh();
    });
  });
  document.querySelector('[data-reset]').addEventListener('click', () => {
    checks.forEach(input => { input.checked = false; });
    try { localStorage.removeItem(key); } catch {}
    refresh();
  });
  refresh();
  const updateTime = () => {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23' }).formatToParts(new Date());
    const value = type => parts.find(part => part.type === type).value;
    const date = `${value('year')}-${value('month')}-${value('day')}`;
    const title = document.querySelector('[data-status-title]');
    if (date < document.body.dataset.tripDate) title.textContent = '明日：ZONO12時受取・営業と道路を確認';
    else if (date > document.body.dataset.tripDate) title.textContent = '10/11の旅程・準備記録';
    else {
      const now = Number(value('hour')) * 60 + Number(value('minute'));
      const plans = [...document.querySelectorAll('[data-plan-time]')];
      const current = plans.filter(plan => {
        const [h,m] = plan.dataset.planTime.split(':').map(Number);
        return h * 60 + m <= now;
      }).at(-1);
      title.textContent = `予定：${(current || plans[0]).dataset.planLabel}`;
    }
  };
  updateTime(); setInterval(updateTime, 60000);
  let imageFailures = 0;
  document.body.dataset.imageFailures = '0';
  const removeImage = img => {
    if (!img.isConnected) return;
    const figure = img.closest('figure');
    const gallery = figure?.closest('.gallery');
    (figure || img).remove();
    if (gallery && !gallery.querySelector('figure')) gallery.remove();
    document.body.dataset.imageFailures = String(++imageFailures);
  };
  document.querySelectorAll('img[data-external]').forEach(img => {
    img.addEventListener('error', () => removeImage(img), { once: true });
    if (img.complete && !img.naturalWidth) removeImage(img);
  });
  const top = document.querySelector('[data-top]');
  addEventListener('scroll', () => top.classList.toggle('show', scrollY > 700), { passive: true });
  top.addEventListener('click', () => scrollTo({ top:0, behavior:'smooth' }));
  document.body.dataset.ready = 'true';
})();
