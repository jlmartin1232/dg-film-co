/**
 * DG Film Co. — Global Loading Overlay System
 * Provides showLoading(message) / hideLoading() used across all pages.
 * Also intercepts internal <a> link clicks for page-transition loading.
 */

(function () {
  'use strict';

  /* ─── State ─────────────────────────────────────────────────── */
  let _overlay = null;
  let _messageEl = null;
  let _hideTimer = null;
  let _isVisible = false;
  // Safety auto-hide: clears overlay if a page error leaves it stuck
  const SAFETY_TIMEOUT_MS = 8000;

  /* ─── DOM bootstrap ─────────────────────────────────────────── */
  function _build() {
    if (_overlay) return;

    _overlay = document.createElement('div');
    _overlay.id = 'dg-loading-overlay';
    _overlay.setAttribute('role', 'status');
    _overlay.setAttribute('aria-live', 'polite');
    _overlay.setAttribute('aria-label', 'Loading');
    _overlay.innerHTML = `
      <div class="dg-loading-card" aria-hidden="true">
        <div class="dg-loading-logo">DG Film Co.</div>
        <div class="dg-loading-spinner" aria-hidden="true">
          <div class="dg-loading-ring"></div>
        </div>
        <p class="dg-loading-message" id="dg-loading-message">Loading&hellip;</p>
      </div>
    `;
    document.body.appendChild(_overlay);
    _messageEl = _overlay.querySelector('#dg-loading-message');
  }

  /* ─── Public API ─────────────────────────────────────────────── */
  function showLoading(message) {
    _build();
    if (_hideTimer) { clearTimeout(_hideTimer); _hideTimer = null; }

    if (_messageEl) {
      _messageEl.textContent = message || 'Loading…';
    }

    _overlay.classList.remove('dg-loading-hide');
    _overlay.classList.add('dg-loading-show');
    _isVisible = true;

    // Safety net: always auto-hide after SAFETY_TIMEOUT_MS
    _hideTimer = setTimeout(function () {
      hideLoading();
    }, SAFETY_TIMEOUT_MS);
  }

  function hideLoading() {
    if (!_overlay) return;
    if (_hideTimer) { clearTimeout(_hideTimer); _hideTimer = null; }
    _overlay.classList.remove('dg-loading-show');
    _overlay.classList.add('dg-loading-hide');
    _isVisible = false;
  }

  function isLoading() {
    return _isVisible;
  }

  /* ─── Page-transition intercept ─────────────────────────────── */
  // Only fires on internal .html links (not anchors, mailto, external, downloads)
  function _isInternalPageLink(anchor) {
    const href = anchor.getAttribute('href') || '';

    // Skip empty, hash-only, javascript:, mailto:, tel:, data:
    if (!href || /^(#|javascript:|mailto:|tel:|data:)/i.test(href)) return false;

    // Skip external links (different origin)
    try {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return false;
      // Skip same-page hash navigation
      if (url.pathname === window.location.pathname && url.hash) return false;
      // Only intercept .html pages
      if (!/\.html(\?.*)?$/.test(url.pathname)) return false;
    } catch (e) {
      return false;
    }

    // Skip download links
    if (anchor.hasAttribute('download')) return false;
    // Skip links that open in new tab/window
    if (anchor.target && anchor.target !== '_self') return false;

    return true;
  }

  function _setupPageTransitions() {
    document.addEventListener('click', function (e) {
      const anchor = e.target.closest('a');
      if (!anchor) return;

      // Skip if modifier key held (user wants to open in new tab etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      if (!_isInternalPageLink(anchor)) return;

      e.preventDefault();
      const dest = anchor.href;
      showLoading('Loading…');

      setTimeout(function () {
        window.location.href = dest;
      }, 300);
    }, true);
  }

  /* ─── Disable / re-enable submit buttons ────────────────────── */
  function disableButton(btn) {
    if (!btn) return;
    btn.disabled = true;
    btn.dataset.dgLoadingOrigText = btn.textContent;
    // Don't change text — loader message already communicates state
  }

  function enableButton(btn) {
    if (!btn) return;
    btn.disabled = false;
    if (btn.dataset.dgLoadingOrigText) {
      btn.textContent = btn.dataset.dgLoadingOrigText;
      delete btn.dataset.dgLoadingOrigText;
    }
  }

  /* ─── Init ───────────────────────────────────────────────────── */
  function _init() {
    _build();
    _setupPageTransitions();

    // Hide overlay on browser back/forward cache restore
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) hideLoading();
    });

    // Expose the global API
    window.DGLoading = {
      show: showLoading,
      hide: hideLoading,
      isLoading: isLoading,
      disableButton: disableButton,
      enableButton: enableButton
    };

    // Convenience globals matching the brief spec
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }
})();
