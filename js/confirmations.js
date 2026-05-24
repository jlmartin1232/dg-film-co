(function () {
  let activeConfirm = null;

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function ensureModal() {
    let modal = document.getElementById('confirmationModal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'confirmationModal';
    modal.className = 'confirmation-modal-overlay';
    modal.hidden = true;
    modal.innerHTML = `
      <section class="confirmation-modal-panel" role="dialog" aria-modal="true" aria-labelledby="confirmModalTitle" aria-describedby="confirmModalMessage">
        <button class="confirmation-modal-close" type="button" aria-label="Close confirmation" data-confirm-cancel>&times;</button>
        <div class="confirmation-modal-kicker" data-confirm-variant-label>Confirm action</div>
        <h2 id="confirmModalTitle"></h2>
        <p id="confirmModalMessage"></p>
        <ul id="confirmModalDetails" class="confirmation-modal-details"></ul>
        <div class="confirmation-modal-actions">
          <button id="confirmModalCancel" class="btn ghost" type="button" data-confirm-cancel>Cancel</button>
          <button id="confirmModalConfirm" class="btn primary" type="button">Confirm</button>
        </div>
      </section>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  function closeModal() {
    if (!activeConfirm) return;
    const modal = activeConfirm.modal;
    modal.hidden = true;
    modal.className = 'confirmation-modal-overlay';
    activeConfirm = null;
  }

  function confirmAction(options) {
    if (!options || typeof options.onConfirm !== 'function') return Promise.resolve(false);
    const modal = ensureModal();
    const panel = modal.querySelector('.confirmation-modal-panel');
    const title = modal.querySelector('#confirmModalTitle');
    const message = modal.querySelector('#confirmModalMessage');
    const details = modal.querySelector('#confirmModalDetails');
    const cancelButton = modal.querySelector('#confirmModalCancel');
    const confirmButton = modal.querySelector('#confirmModalConfirm');
    const variantLabel = modal.querySelector('[data-confirm-variant-label]');
    const variant = ['warning', 'danger', 'success'].includes(options.variant) ? options.variant : 'default';
    const detailItems = Array.isArray(options.details) ? options.details.filter(Boolean) : [];

    if (activeConfirm) closeModal();

    modal.className = `confirmation-modal-overlay confirmation-${variant}`;
    title.textContent = options.title || 'Confirm this action?';
    message.textContent = options.message || 'Please confirm before continuing.';
    cancelButton.hidden = options.cancelText === null;
    cancelButton.textContent = options.cancelText || 'Cancel';
    confirmButton.textContent = options.confirmText || 'Confirm';
    confirmButton.disabled = false;
    variantLabel.textContent = variant === 'danger' ? 'Careful action' : variant === 'success' ? 'Ready to continue' : 'Confirm action';
    details.innerHTML = detailItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    details.hidden = !detailItems.length;
    modal.hidden = false;
    confirmButton.focus();

    return new Promise((resolve) => {
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        document.removeEventListener('keydown', onKeydown);
        modal.removeEventListener('click', onModalClick);
        cancelButton.removeEventListener('click', onCancel);
        modal.querySelectorAll('[data-confirm-cancel]').forEach((button) => button.removeEventListener('click', onCancel));
        confirmButton.removeEventListener('click', onConfirmClick);
        closeModal();
        resolve(value);
      };
      const onCancel = () => finish(false);
      const onConfirmClick = async () => {
        if (confirmButton.disabled) return;
        confirmButton.disabled = true;
        try {
          await options.onConfirm();
          finish(true);
        } catch (error) {
          confirmButton.disabled = false;
          throw error;
        }
      };
      const onKeydown = (event) => {
        if (event.key === 'Escape') finish(false);
      };
      const onModalClick = (event) => {
        if (event.target === modal && variant !== 'danger') finish(false);
      };
      activeConfirm = { modal };
      document.addEventListener('keydown', onKeydown);
      modal.addEventListener('click', onModalClick);
      modal.querySelectorAll('[data-confirm-cancel]').forEach((button) => button.addEventListener('click', onCancel));
      confirmButton.addEventListener('click', onConfirmClick);
      panel.addEventListener('click', (event) => event.stopPropagation(), { once: true });
    });
  }

  window.confirmAction = confirmAction;
  window.DGConfirm = { confirmAction, close: closeModal };
}());
