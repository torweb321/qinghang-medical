document.addEventListener('DOMContentLoaded', function () {
  var mobileToggle = document.getElementById('mobileToggle');
  var nav = document.getElementById('nav');

  if (mobileToggle && nav) {
    mobileToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });

    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !mobileToggle.contains(e.target)) {
        nav.classList.remove('open');
      }
    });
  }

  // WeChat modal
  var wechatBtn = document.getElementById('wechatBtn');
  var wechatModal = document.getElementById('wechatModal');
  var wechatModalClose = document.getElementById('wechatModalClose');

  if (wechatBtn && wechatModal) {
    wechatBtn.addEventListener('click', function () {
      wechatModal.classList.add('show');
    });
  }

  if (wechatModalClose && wechatModal) {
    wechatModalClose.addEventListener('click', function () {
      wechatModal.classList.remove('show');
    });

    wechatModal.addEventListener('click', function (e) {
      if (e.target === wechatModal) {
        wechatModal.classList.remove('show');
      }
    });
  }

  // FAQ accordion
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');
        faqItems.forEach(function (i) { i.classList.remove('open'); });
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });

  // Form submission — Cloudflare Worker (prod) or localStorage (dev)
  var forms = document.querySelectorAll('form[id$="Form"]');
  forms.forEach(function (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var submitBtn = form.querySelector('.form-submit, button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '提交中...';
      }

      var formData = new FormData(form);
      var data = {};
      formData.forEach(function (value, key) {
        if (key === 'service') {
          if (!data[key]) data[key] = [];
          data[key].push(value);
        } else {
          data[key] = value;
        }
      });

      var ok = false;
      try {
        var resp = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        ok = resp.ok;
      } catch (_) {}

      if (ok) {
        form.style.display = 'none';
        var success = form.nextElementSibling;
        if (success && success.classList.contains('form-success')) {
          success.classList.add('show');
        }
        if (typeof gtag !== 'undefined') {
          gtag('event', 'form_submit', { 'event_category': 'contact', 'event_label': form.id });
        }
      } else {
        // Fallback: save locally (dev preview or worker unavailable)
        try {
          var history = JSON.parse(localStorage.getItem('qihang_contacts') || '[]');
          history.push({ ...data, _time: new Date().toISOString() });
          localStorage.setItem('qihang_contacts', JSON.stringify(history));
        } catch (_) {}
        form.style.display = 'none';
        var success = form.nextElementSibling;
        if (success && success.classList.contains('form-success')) {
          success.classList.add('show');
        }
      }
    });
  });

  // Active nav highlight
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  var navLinks = document.querySelectorAll('.nav a:not(.nav-cta)');
  navLinks.forEach(function (link) {
    link.classList.remove('active');
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
});
