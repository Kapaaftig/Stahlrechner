"use strict";
(() => {
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const calculator = document.getElementById('panel-rechner');
  const guide = document.getElementById('panel-wuchten');
  const settingsButton = document.getElementById('settingsBtn');
  const guideIds = ['method-a','method-b','no-run','measurement-basics','diagram-comparison','sources'];
  function activateTab(id, updateHash = true, focus = false) {
    const knowledge = id === 'tab-wuchten';
    calculator.hidden = knowledge;
    guide.hidden = !knowledge;
    settingsButton.hidden = knowledge;
    tabs.forEach(tab => {
      const selected = tab.id === id;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    if (updateHash) history.replaceState(null, '', knowledge ? '#wuchten' : '#rechner');
  }
  function routeFromHash() {
    const hash = location.hash.slice(1);
    activateTab(hash === 'wuchten' || guideIds.includes(hash) ? 'tab-wuchten' : 'tab-rechner', false);
    if (guideIds.includes(hash)) {
      const section = document.getElementById(hash);
      section.open = true;
      section.scrollIntoView({ block: 'start' });
    }
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateTab(tab.id));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (i + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); activateTab(tabs[next].id, true, true); }
    });
  });
  document.querySelectorAll('[data-open]').forEach(button => {
    button.addEventListener('click', () => {
      const section = document.getElementById(button.dataset.open);
      section.open = true;
      section.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      section.querySelector('summary').focus({ preventScroll: true });
    });
  });
  document.querySelectorAll('[data-calculator]').forEach(button => {
    button.addEventListener('click', () => {
      activateTab('tab-rechner');
      window.scrollTo({ top: 0 });
      document.getElementById('mass').focus({ preventScroll: true });
    });
  });
  const dialog = document.getElementById('image-dialog');
  document.querySelectorAll('[data-image]').forEach(button => {
    button.addEventListener('click', () => {
      const img = document.getElementById('dialog-image');
      img.src = button.dataset.image;
      img.alt = button.querySelector('img').alt;
      document.getElementById('image-dialog-title').textContent = button.dataset.caption;
      dialog.showModal();
    });
  });
  document.getElementById('image-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if(event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  window.addEventListener('hashchange', routeFromHash);
  routeFromHash();
})();
