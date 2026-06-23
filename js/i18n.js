(function () {
  var STORAGE_KEY = 'qihang_lang';
  var translations = {
    'zh-CN': {},
    'en': {},
    'zh-HK': {}
  };

  function getBrowserLang() {
    var lang = (navigator.language || '').toLowerCase();
    if (lang.startsWith('zh')) {
      if (lang === 'zh-hk' || lang === 'zh-tw' || lang === 'zh-mo') return 'zh-HK';
      return 'zh-CN';
    }
    return 'en';
  }

  function getCurrentLang() {
    return localStorage.getItem(STORAGE_KEY) || getBrowserLang();
  }

  function applyLanguage(lang) {
    if (lang === 'zh-CN') {
      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var key = el.dataset.i18n;
        if (translations['zh-CN'][key]) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = translations['zh-CN'][key];
          } else if (el.tagName === 'IMG') {
            el.alt = translations['zh-CN'][key];
          } else {
            el.innerHTML = translations['zh-CN'][key];
          }
        }
      });
      document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
        var key = el.dataset.i18nAlt;
        if (translations['zh-CN'][key]) {
          el.alt = translations['zh-CN'][key];
        }
      });
    } else {
      var t = translations[lang];
      if (!t) return;
      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var key = el.dataset.i18n;
        if (t[key]) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = t[key];
          } else if (el.tagName === 'IMG') {
            el.alt = t[key];
          } else {
            el.innerHTML = t[key];
          }
        }
      });
      document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
        var key = el.dataset.i18nAlt;
        if (t[key]) {
          el.alt = t[key];
        }
      });
    }
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  window.i18n = {
    apply: applyLanguage,
    getCurrent: getCurrentLang,
    switchTo: function (lang) {
      applyLanguage(lang);
    },
    addTranslations: function (lang, data) {
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          translations[lang][key] = data[key];
        }
      }
    },
    init: function () {
      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var key = el.dataset.i18n;
        if (translations['zh-CN'][key]) return;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          translations['zh-CN'][key] = el.placeholder;
        } else if (el.tagName === 'IMG') {
          translations['zh-CN'][key] = el.alt;
        } else {
          translations['zh-CN'][key] = el.innerHTML;
        }
      });
      document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
        var key = el.dataset.i18nAlt;
        if (translations['zh-CN'][key]) return;
        translations['zh-CN'][key] = el.alt;
      });
      applyLanguage(getCurrentLang());
    }
  };
})();
