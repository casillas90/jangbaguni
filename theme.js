// 화면 테마: 기본은 라이트, 상단 해/달 버튼으로 다크를 고르면 이 기기에 기억
// (<head>에서 불러서 깜빡임 없이 바로 적용)
(function () {
  const KEY = 'cartTheme';
  const root = document.documentElement;
  try { if (localStorage.getItem(KEY) === 'dark') root.dataset.theme = 'dark'; } catch (e) {}

  function updateThemeUI() {
    const dark = root.dataset.theme === 'dark';
    const btn = document.getElementById('btnTheme');
    if (btn) {
      const label = dark ? '라이트 모드' : '다크 모드';
      btn.title = label;
      btn.setAttribute('aria-label', label);
    }
    document.getElementById('themeColorMeta')?.setAttribute('content', dark ? '#17171c' : '#f4f5f7');
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateThemeUI();
    document.getElementById('btnTheme')?.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem(KEY, next); } catch (e) {}
      updateThemeUI();
    });
  });
})();
