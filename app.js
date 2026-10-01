'use strict';
(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  function closeMenu(restoreFocus = false) {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.header')) closeMenu();
  });
  matchMedia('(min-width: 821px)').addEventListener('change', e => { if (e.matches) closeMenu(); });
  document.querySelectorAll('[data-participation]').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('type').value = link.dataset.participation;
    });
  });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduced) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.section-heading, .intro-layout, .results-grid article').forEach(el => observer.observe(el));
  }
  const form = document.querySelector('.application-form');
  const feedback = form.querySelector('.form-feedback');
  const button = form.querySelector('[type="submit"]');
  const phone = document.getElementById('phone');
  phone.addEventListener('input', () => phone.setCustomValidity(''));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (form.elements._honey.value) return;
    const digitCount = phone.value.replace(/\D/g, '').length;
    phone.setCustomValidity(digitCount >= 7 && digitCount <= 15 ? '' : 'Укажите телефон: от 7 до 15 цифр.');
    if (!form.reportValidity()) return;
    button.disabled = true;
    button.textContent = 'Отправляем…';
    feedback.hidden = true;
    feedback.classList.remove('error');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const payload = Object.fromEntries(new FormData(form));
      delete payload._next;
      const response = await fetch('https://formsubmit.co/ajax/Slachevina@yandex.ru', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || !(result.success === true || result.success === 'true')) throw new Error('Not accepted');
      feedback.textContent = 'Сервис принял заявку. Если редакция не свяжется с вами, напишите напрямую на Slachevina@yandex.ru.';
      form.reset();
    } catch {
      feedback.classList.add('error');
      feedback.textContent = 'Не удалось подтвердить отправку. Ваши данные сохранены в форме. Попробуйте ещё раз или напишите на Slachevina@yandex.ru.';
    } finally {
      clearTimeout(timeout);
      button.disabled = false;
      button.textContent = 'Отправить заявку';
      feedback.hidden = false;
    }
  });
})();
