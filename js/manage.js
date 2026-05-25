function dgManageAdmin() {
  return DGRbac.requireRoles(['admin']);
}

function dgMGet(key, fallback) {
  return DGData.getJson(key, fallback);
}

function dgMSave(key, value) {
  DGData.setJson(key, value);
}

function dgMEscape(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function dgMBadge(status) {
  return `<span class="badge status-${String(status || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}">${dgMEscape(status || 'Active')}</span>`;
}

function dgMRoleLabel(role) {
  const label = String(role || '');
  return label ? `${label.charAt(0).toUpperCase()}${label.slice(1)}` : '-';
}

function dgMDate(value) {
  return value ? new Date(value).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Seeded Account';
}

function dgMMoney(value) {
  return `PHP ${Number(value || 0).toLocaleString('en-PH')}`;
}

function dgMMessage(text, type = 'success') {
  const element = document.getElementById('manageMessage') || document.getElementById('reportMessage');
  if (element) {
    element.textContent = text;
    element.className = `form-message ${type}`;
  }
}

function dgMConfirmAction(options) {
  if (window.confirmAction) return window.confirmAction(options);
  return Promise.resolve().then(() => options.onConfirm());
}

function dgMValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function dgMValidPassword(password) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
}

function dgMNextId(prefix, records) {
  const nums = records.map((item) => Number(String(item.id || '').replace(`${prefix}-`, '').replace(prefix, ''))).filter(Number.isFinite);
  const sep = prefix.endsWith('-') ? '' : '';
  const width = prefix === 'U' ? 3 : 3;
  return `${prefix}${sep}${String(Math.max(0, ...nums) + 1).padStart(width, '0')}`;
}

function dgMUsers() { return dgMGet(DGData.keys.users, []); }
function dgMServices() { return dgMGet(DGData.keys.services, []); }
function dgMPricing() { return dgMGet(DGData.keys.pricing, []); }
function dgMBookings() { return dgMGet(DGData.keys.bookings, []); }
function dgMPayments() { return dgMGet(DGData.keys.payments, []); }

const DG_PAYMENT_SETTINGS_KEY = 'dgPaymentSettings';
const DG_PAYMENT_METHOD_OPTIONS = ['GCash', 'Bank Transfer', 'Cash / On-site Payment', 'Other'];
const DG_PHOTO_HIGHLIGHT_SETTINGS_KEY = 'dgPhotoHighlightSettings';
const DG_PHOTO_HIGHLIGHT_CATEGORIES = [
  'Wedding Photo/Video',
  'Debut / Birthday Coverage',
  'Corporate / Commercial Video',
  'Restaurant / Food Promo',
  'Nightlife / Club Events',
  'Graduation / Event Coverage',
  'Pageant / Event Coverage',
  'Creative Film / Documentary',
  'Product / Brand Event'
];
const DG_PHOTO_HIGHLIGHT_IMAGES = {
  'Wedding Photo/Video': 'assets/images/photo-highlights/wedding-photo-video.jpg',
  'Debut / Birthday Coverage': 'assets/images/photo-highlights/debut-birthday-coverage.jpg',
  'Corporate / Commercial Video': 'assets/images/photo-highlights/corporate-commercial-video.jpg',
  'Restaurant / Food Promo': 'assets/images/photo-highlights/restaurant-food-promo.jpg',
  'Nightlife / Club Events': 'assets/images/photo-highlights/nightlife-club-events.jpg',
  'Graduation / Event Coverage': 'assets/images/photo-highlights/graduation-event-coverage.jpg',
  'Pageant / Event Coverage': 'assets/images/photo-highlights/pageant-event-coverage.jpg',
  'Creative Film / Documentary': 'assets/images/photo-highlights/creative-film-documentary.jpg',
  'Product / Brand Event': 'assets/images/photo-highlights/product-brand-event.jpg'
};
const DG_PHOTO_HIGHLIGHT_DEFAULTS = {
  'Wedding Photo/Video': { x: 50, y: 35 },
  'Debut / Birthday Coverage': { x: 50, y: 35 },
  'Corporate / Commercial Video': { x: 50, y: 45 },
  'Restaurant / Food Promo': { x: 50, y: 45 },
  'Nightlife / Club Events': { x: 50, y: 50 },
  'Graduation / Event Coverage': { x: 50, y: 28 },
  'Pageant / Event Coverage': { x: 50, y: 35 },
  'Creative Film / Documentary': { x: 50, y: 50 },
  'Product / Brand Event': { x: 50, y: 45 }
};

function dgMPaymentMethodId(type) {
  return ({
    GCash: 'gcash',
    'Bank Transfer': 'bank-transfer',
    'Cash / On-site Payment': 'cash-onsite',
    Other: 'other'
  })[type] || '';
}

function dgMNormalizePaymentSettings(settings) {
  const saved = settings && typeof settings === 'object' ? settings : {};
  const records = Array.isArray(saved.methods) && saved.methods.some((method) => method && typeof method === 'object')
    ? saved.methods
    : [];
  const enabledTypes = records.length
    ? records.map((method) => method.type)
    : (Array.isArray(saved.methods) ? saved.methods : Array.isArray(saved.acceptedMethods) ? saved.acceptedMethods : []);
  const legacyReminder = String(saved.reminder || saved.paymentInstructions || '').trim();
  const methods = DG_PAYMENT_METHOD_OPTIONS.filter((type) => enabledTypes.includes(type)).map((type) => {
    const record = records.find((method) => method.type === type) || {};
    if (type === 'GCash') {
      return {
        id: 'gcash',
        type,
        accountName: String(record.accountName || saved.gcash?.accountName || saved.gcashAccountName || '').trim(),
        number: String(record.number || saved.gcash?.number || saved.gcashNumber || '').trim(),
        instructions: String(record.instructions || saved.gcash?.instructions || saved.gcashInstructions || legacyReminder).trim()
      };
    }
    if (type === 'Bank Transfer') {
      return {
        id: 'bank-transfer',
        type,
        bankName: String(record.bankName || saved.bank?.bankName || saved.bankName || '').trim(),
        accountName: String(record.accountName || saved.bank?.accountName || saved.bankAccountName || '').trim(),
        accountNumber: String(record.accountNumber || saved.bank?.accountNumber || saved.bankAccountNumber || '').trim(),
        instructions: String(record.instructions || saved.bank?.instructions || saved.bankInstructions || legacyReminder).trim()
      };
    }
    if (type === 'Cash / On-site Payment') {
      return {
        id: 'cash-onsite',
        type,
        instructions: String(record.instructions || saved.cash?.instructions || saved.cashInstructions || legacyReminder).trim()
      };
    }
    return {
      id: 'other',
      type,
      methodName: String(record.methodName || saved.other?.name || saved.otherMethodName || '').trim(),
      instructions: String(record.instructions || saved.other?.instructions || saved.otherInstructions || legacyReminder).trim()
    };
  });
  return { methods };
}

function dgMSetupPaymentSettings() {
  const form = document.getElementById('paymentSettingsForm');
  if (!form) return;
  if (!dgManageAdmin()) return;
  const panel = document.getElementById('paymentSettingsPanel');
  const openButton = document.getElementById('openPaymentSettingsBtn');
  const addButton = document.getElementById('addPaymentSettingsBtn');
  const closeButtons = [document.getElementById('closePaymentSettingsBtn'), document.getElementById('cancelPaymentSettingsBtn')].filter(Boolean);
  const summary = document.getElementById('paymentSettingsSummary');
  const list = document.getElementById('paymentSettingsList');
  const message = document.getElementById('paymentSettingsMessage');
  const modalTitle = document.getElementById('paymentSettingsFormTitle');
  const saveButton = document.getElementById('savePaymentSettingsBtn');
  let editingType = '';

  function renderSummary(settings) {
    const methods = dgMNormalizePaymentSettings(settings).methods;
    if (summary) summary.textContent = methods.length ? `Accepted methods: ${methods.map((method) => method.type).join(', ')}` : 'No payment details set yet.';
    if (!list) return;
    list.innerHTML = methods.length ? methods.map((method) => {
      let details = '';
      if (method.type === 'GCash') details = `${method.accountName ? `<span>Account Name: ${dgMEscape(method.accountName)}</span>` : ''}${method.number ? `<span>Number: ${dgMEscape(method.number)}</span>` : ''}`;
      if (method.type === 'Bank Transfer') details = `${method.bankName ? `<span>Bank: ${dgMEscape(method.bankName)}</span>` : ''}${method.accountName ? `<span>Account Name: ${dgMEscape(method.accountName)}</span>` : ''}${method.accountNumber ? `<span>Account Number: ${dgMEscape(method.accountNumber)}</span>` : ''}`;
      if (method.type === 'Cash / On-site Payment') details = method.instructions ? `<span>${dgMEscape(method.instructions)}</span>` : '';
      if (method.type === 'Other') details = method.methodName ? `<span>${dgMEscape(method.methodName)}</span>` : '';
      return `
        <article class="payment-settings-item">
          <div><strong>${dgMEscape(method.type)}</strong>${details}</div>
          <div class="payment-settings-actions">
            <button class="btn ghost small" type="button" data-payment-method-edit="${dgMEscape(method.type)}">Edit</button>
            <button class="btn danger small" type="button" data-payment-method-remove="${dgMEscape(method.type)}">Remove</button>
          </div>
        </article>
      `;
    }).join('') : '<p class="payment-settings-empty">No payment methods added yet.</p>';
  }

  function showMessage(text) {
    if (!message) return;
    message.textContent = text;
    message.className = text ? 'form-message success' : 'form-message';
  }

  function updateDynamicFields() {
    const selected = form.elements.methodType.value;
    form.querySelectorAll('[data-payment-fields]').forEach((section) => {
      section.hidden = selected !== section.dataset.paymentFields;
    });
  }

  function clearForm() {
    form.reset();
    form.querySelector('[data-error-for="methodType"]').textContent = '';
    form.elements.methodType.disabled = false;
    editingType = '';
    updateDynamicFields();
  }

  function loadMethod(method) {
    clearForm();
    if (!method) return;
    editingType = method.type;
    form.elements.methodType.value = method.type;
    form.elements.methodType.disabled = true;
    if (method.type === 'GCash') {
      form.elements.gcashAccountName.value = method.accountName;
      form.elements.gcashNumber.value = method.number;
      form.elements.gcashInstructions.value = method.instructions;
    }
    if (method.type === 'Bank Transfer') {
      form.elements.bankName.value = method.bankName;
      form.elements.bankAccountName.value = method.accountName;
      form.elements.bankAccountNumber.value = method.accountNumber;
      form.elements.bankInstructions.value = method.instructions;
    }
    if (method.type === 'Cash / On-site Payment') form.elements.cashInstructions.value = method.instructions;
    if (method.type === 'Other') {
      form.elements.otherMethodName.value = method.methodName;
      form.elements.otherInstructions.value = method.instructions;
    }
    updateDynamicFields();
  }

  function openPanel(method = null) {
    loadMethod(method);
    if (modalTitle) modalTitle.textContent = method ? 'Edit Payment Method' : 'Add Payment Method';
    if (saveButton) saveButton.textContent = method ? 'Save Changes' : 'Save Payment Method';
    if (panel) panel.hidden = false;
    form.hidden = false;
    (method ? form.querySelector('[data-payment-fields]:not([hidden]) input, [data-payment-fields]:not([hidden]) textarea') : form.elements.methodType)?.focus();
  }

  function closePanel() {
    if (panel) panel.hidden = true;
    form.hidden = true;
    clearForm();
  }

  openButton?.addEventListener('click', () => {
    clearForm();
    form.hidden = true;
    if (panel) panel.hidden = false;
  });
  addButton?.addEventListener('click', () => openPanel());
  closeButtons.forEach((button) => button.addEventListener('click', closePanel));
  panel?.addEventListener('click', (event) => {
    if (event.target === panel) closePanel();
  });
  form.elements.methodType.addEventListener('change', updateDynamicFields);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const type = editingType || form.elements.methodType.value;
    const error = form.querySelector('[data-error-for="methodType"]');
    if (!DG_PAYMENT_METHOD_OPTIONS.includes(type)) {
      error.textContent = 'Choose a payment method.';
      return;
    }
    const settings = dgMNormalizePaymentSettings(dgMGet(DG_PAYMENT_SETTINGS_KEY, null));
    if (!editingType && settings.methods.some((method) => method.type === type)) {
      error.textContent = `${type} is already added. Use Edit to update it.`;
      return;
    }
    let method = { id: dgMPaymentMethodId(type), type };
    if (type === 'GCash') method = { ...method, accountName: form.elements.gcashAccountName.value.trim(), number: form.elements.gcashNumber.value.trim(), instructions: form.elements.gcashInstructions.value.trim() };
    if (type === 'Bank Transfer') method = { ...method, bankName: form.elements.bankName.value.trim(), accountName: form.elements.bankAccountName.value.trim(), accountNumber: form.elements.bankAccountNumber.value.trim(), instructions: form.elements.bankInstructions.value.trim() };
    if (type === 'Cash / On-site Payment') method = { ...method, instructions: form.elements.cashInstructions.value.trim() };
    if (type === 'Other') method = { ...method, methodName: form.elements.otherMethodName.value.trim(), instructions: form.elements.otherInstructions.value.trim() };
    const existingIndex = settings.methods.findIndex((item) => item.type === type);
    if (existingIndex >= 0) settings.methods[existingIndex] = method;
    else settings.methods.push(method);
    settings.methods.sort((first, second) => DG_PAYMENT_METHOD_OPTIONS.indexOf(first.type) - DG_PAYMENT_METHOD_OPTIONS.indexOf(second.type));
    settings.updatedAt = new Date().toISOString();
    dgMSave(DG_PAYMENT_SETTINGS_KEY, settings);
    renderSummary(settings);
    form.hidden = true;
    showMessage('Payment method saved.');
    clearForm();
  });

  list?.addEventListener('click', (event) => {
    const editButton = event.target.closest('[data-payment-method-edit]');
    if (editButton) {
      const method = dgMNormalizePaymentSettings(dgMGet(DG_PAYMENT_SETTINGS_KEY, null)).methods.find((item) => item.type === editButton.dataset.paymentMethodEdit);
      if (method) openPanel(method);
      return;
    }
    const removeButton = event.target.closest('[data-payment-method-remove]');
    if (!removeButton) return;
    const type = removeButton.dataset.paymentMethodRemove;
    dgMConfirmAction({
      title: 'Remove this payment method?',
      message: `${type} will no longer be shown to clients as an accepted payment method.`,
      confirmText: 'Remove',
      variant: 'danger',
      onConfirm: () => {
        const settings = dgMNormalizePaymentSettings(dgMGet(DG_PAYMENT_SETTINGS_KEY, null));
        settings.methods = settings.methods.filter((method) => method.type !== type);
        settings.updatedAt = new Date().toISOString();
        dgMSave(DG_PAYMENT_SETTINGS_KEY, settings);
        renderSummary(settings);
        showMessage('Payment method removed.');
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel && !panel.hidden) closePanel();
  });
  renderSummary(dgMGet(DG_PAYMENT_SETTINGS_KEY, null));
}

function dgMWorkflowStatuses() {
  return [
    'Pending Review',
    'Approved for Meeting',
    'Meeting Scheduled',
    'Confirmed',
    'Scheduled',
    'On Shoot',
    'Editing',
    'Ready for Delivery',
    'Completed',
    'Rejected',
    'Cancelled'
  ];
}

function dgMSetupUsers() {
  const body = document.getElementById('usersBody');
  const form = document.getElementById('userForm');
  if (!body || !form) return;
  const admin = dgManageAdmin();
  if (!admin) return;

  const search = document.getElementById('userSearch');
  const roleFilter = document.getElementById('roleFilter');
  const statusFilter = document.getElementById('userStatusFilter');
  const addUserBtn = document.getElementById('addUserBtn');
  const userFormPanel = document.getElementById('userFormPanel');
  const userFormTitle = document.getElementById('userFormTitle');
  const userPasswordHelp = document.getElementById('userPasswordHelp');
  const adminRoleWarning = document.getElementById('adminRoleWarning');
  const cancelUserFormBtns = [document.getElementById('cancelUserFormBtn'), document.getElementById('cancelUserFormBtnSecondary')].filter(Boolean);
  const resetPasswordPanel = document.getElementById('resetPasswordPanel');
  const resetPasswordUserMeta = document.getElementById('resetPasswordUserMeta');
  const cancelResetBtns = [document.getElementById('cancelResetPasswordBtn'), document.getElementById('cancelResetPasswordBtnSecondary')].filter(Boolean);
  const resetForm = document.getElementById('resetPasswordForm');

  function clearErrors(targetForm) {
    targetForm.querySelectorAll('[data-error-for]').forEach((el) => { el.textContent = ''; });
  }

  function updateRoleWarning() {
    if (adminRoleWarning) adminRoleWarning.hidden = form.role.value !== 'admin';
  }

  function updateSummary(users) {
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    setText('userTotalCount', users.length);
    setText('adminUserCount', users.filter((user) => user.role === 'admin').length);
    setText('staffUserCount', users.filter((user) => user.role === 'staff').length);
    setText('clientUserCount', users.filter((user) => user.role === 'client').length);
    setText('disabledUserCount', users.filter((user) => (user.status || 'Active') === 'Disabled').length);
  }

  function closeUserForm() {
    if (userFormPanel) userFormPanel.hidden = true;
    form.reset();
    form.editingId.value = '';
    form.email.disabled = false;
    clearErrors(form);
    updateRoleWarning();
  }

  function openUserForm(user) {
    closeResetForm();
    clearErrors(form);
    form.reset();
    form.email.disabled = false;
    if (user) {
      form.editingId.value = user.id;
      form.fullName.value = user.name || user.fullName || '';
      form.email.value = user.email || '';
      form.email.disabled = true;
      form.role.value = user.role || '';
      form.status.value = user.status || 'Active';
      form.password.value = '';
      form.confirmPassword.value = '';
      if (userFormTitle) userFormTitle.textContent = 'Edit User';
      if (userPasswordHelp) userPasswordHelp.textContent = 'Leave password fields blank to keep the current password, or set a new temporary password.';
    } else {
      form.editingId.value = '';
      form.status.value = 'Active';
      if (userFormTitle) userFormTitle.textContent = 'Add User';
      if (userPasswordHelp) userPasswordHelp.textContent = 'Set a temporary password for the new account.';
    }
    updateRoleWarning();
    if (userFormPanel) userFormPanel.hidden = false;
    form.fullName.focus();
  }

  function closeResetForm() {
    if (resetPasswordPanel) resetPasswordPanel.hidden = true;
    if (resetPasswordUserMeta) resetPasswordUserMeta.textContent = '';
    resetForm.reset();
    clearErrors(resetForm);
  }

  function openResetForm(user) {
    closeUserForm();
    resetForm.reset();
    clearErrors(resetForm);
    resetForm.resetUserId.value = user.id;
    if (resetPasswordUserMeta) resetPasswordUserMeta.textContent = `${user.name || user.fullName || 'User'} - ${user.email || 'No email saved'}`;
    if (resetPasswordPanel) resetPasswordPanel.hidden = false;
    resetForm.newPassword.focus();
  }

  function render() {
    const query = (search?.value || '').toLowerCase();
    const role = roleFilter?.value || 'All';
    const status = statusFilter?.value || 'All';
    const allUsers = dgMUsers();
    updateSummary(allUsers);
    const users = allUsers
      .filter((user) => role === 'All' || user.role === role)
      .filter((user) => status === 'All' || (user.status || 'Active') === status)
      .filter((user) => `${user.name || user.fullName} ${user.email} ${user.role}`.toLowerCase().includes(query));
    body.innerHTML = users.length ? users.map((user) => `
      <tr>
        <td>${dgMEscape(user.id)}</td>
        <td>${dgMEscape(user.name || user.fullName)}</td>
        <td>${dgMEscape(user.email)}</td>
        <td>${dgMEscape(dgMRoleLabel(user.role))}</td>
        <td>${dgMBadge(user.status || 'Active')}</td>
        <td>${dgMDate(user.createdAt)}</td>
        <td><div class="table-actions">
          <button class="btn ghost small" data-user-edit="${dgMEscape(user.id)}" type="button">Edit</button>
          <button class="btn ghost small" data-user-reset="${dgMEscape(user.id)}" type="button">Reset Password</button>
          <button class="btn ${(user.status || 'Active') === 'Disabled' ? 'ghost' : 'danger'} small" data-user-toggle="${dgMEscape(user.id)}" type="button">${(user.status || 'Active') === 'Disabled' ? 'Enable' : 'Disable'}</button>
        </div></td>
      </tr>
    `).join('') : '<tr><td colspan="7"><div class="empty-state admin-table-empty"><strong>No users found.</strong><span>Adjust your filters or add a user account.</span></div></td></tr>';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearErrors(form);
    const users = dgMUsers();
    const editingId = form.editingId.value;
    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const role = form.role.value;
    const status = form.status.value || 'Active';
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const existingUser = users.find((item) => item.id === editingId);
    const isChangingPassword = Boolean(password || confirmPassword);
    const needsRoleConfirmation = !editingId || (existingUser && existingUser.role !== role);
    let valid = true;
    const err = (field, msg) => { form.querySelector(`[data-error-for="${field}"]`).textContent = msg; valid = false; };

    if (!fullName) err('fullName', 'Full name is required.');
    if (!email || !dgMValidEmail(email)) err('email', 'Valid email is required.');
    if (!editingId && users.some((user) => user.email === email)) err('email', 'Email already exists.');
    if (!role) err('role', 'Role is required.');
    if ((!editingId || isChangingPassword) && !dgMValidPassword(password)) err('password', 'Password needs 8 chars, uppercase, lowercase, and number.');
    if ((!editingId || isChangingPassword) && password !== confirmPassword) err('confirmPassword', 'Passwords must match.');
    if (needsRoleConfirmation && !form.adminConfirm.checked) err('adminConfirm', 'Confirm access based on the selected role.');
    if (!valid) return;

    const userSubmitBtn = form.querySelector('[type="submit"]');
    if (window.DGLoading) { DGLoading.show('Saving user…'); DGLoading.disableButton(userSubmitBtn); }
    try {
      if (editingId) {
        const user = existingUser;
        user.name = fullName;
        user.fullName = fullName;
        user.role = role;
        user.status = status;
        if (isChangingPassword) user.password = password;
        dgMMessage('User updated.');
      } else {
        users.push({ id: dgMNextId('U', users), name: fullName, fullName, email, password, role, status, createdAt: new Date().toISOString() });
        dgMMessage('User added.');
      }
      dgMSave(DGData.keys.users, users);
      closeUserForm();
      render();
    } finally {
      if (window.DGLoading) { DGLoading.hide(); DGLoading.enableButton(userSubmitBtn); }
    }
  });

  resetForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearErrors(resetForm);
    const users = dgMUsers();
    const user = users.find((item) => item.id === resetForm.resetUserId.value);
    const password = resetForm.newPassword.value;
    let valid = true;
    if (!user) valid = false;
    if (!dgMValidPassword(password)) { resetForm.querySelector('[data-error-for="newPassword"]').textContent = 'Password needs 8 chars, uppercase, lowercase, and number.'; valid = false; }
    if (password !== resetForm.confirmNewPassword.value) { resetForm.querySelector('[data-error-for="confirmNewPassword"]').textContent = 'Passwords must match.'; valid = false; }
    if (!valid) return;
    dgMConfirmAction({
      title: 'Update temporary password?',
      message: 'The user will need to use the new temporary password for their next login.',
      confirmText: 'Update Password',
      cancelText: 'Cancel',
      variant: 'warning',
      details: [`User: ${user.name || user.fullName || user.email}`],
      onConfirm: () => {
        const resetSubmitBtn = resetForm.querySelector('[type="submit"]');
        if (window.DGLoading) { DGLoading.show('Resetting password…'); DGLoading.disableButton(resetSubmitBtn); }
        try {
          user.password = password;
          dgMSave(DGData.keys.users, users);
          closeResetForm();
          dgMMessage('Temporary password updated.');
        } finally {
          if (window.DGLoading) { DGLoading.hide(); DGLoading.enableButton(resetSubmitBtn); }
        }
      }
    });
  });

  body.addEventListener('click', (event) => {
    const edit = event.target.closest('[data-user-edit]');
    const toggle = event.target.closest('[data-user-toggle]');
    const reset = event.target.closest('[data-user-reset]');
    const users = dgMUsers();
    if (edit) {
      const user = users.find((item) => item.id === edit.dataset.userEdit);
      if (!user) return;
      openUserForm(user);
      dgMMessage('Editing selected user.');
    }
    if (toggle) {
      const user = users.find((item) => item.id === toggle.dataset.userToggle);
      if (!user) return;
      if (user.id === admin.id) {
        dgMMessage('Admin cannot disable their own account.', 'error');
        return;
      }
      const activating = (user.status || 'Active') === 'Disabled';
      dgMConfirmAction({
        title: activating ? 'Activate this user?' : 'Disable this user?',
        message: activating ? 'This user will regain access based on their assigned role.' : 'This user will no longer be able to access the system until reactivated.',
        confirmText: activating ? 'Enable' : 'Disable',
        cancelText: activating ? 'Cancel' : 'Keep Active',
        variant: activating ? 'warning' : 'danger',
        details: [`User: ${user.name || user.fullName || user.email}`, `Role: ${user.role}`],
        onConfirm: () => {
          user.status = activating ? 'Active' : 'Disabled';
          dgMSave(DGData.keys.users, users);
          dgMMessage(`User ${user.status === 'Disabled' ? 'disabled' : 'enabled'}.`);
          render();
        }
      });
    }
    if (reset) {
      const user = users.find((item) => item.id === reset.dataset.userReset);
      if (!user) return;
      openResetForm(user);
      dgMMessage('Enter a new temporary password.');
    }
  });

  addUserBtn?.addEventListener('click', () => {
    openUserForm();
    dgMMessage('');
  });
  cancelUserFormBtns.forEach((button) => button.addEventListener('click', closeUserForm));
  cancelResetBtns.forEach((button) => button.addEventListener('click', closeResetForm));
  userFormPanel?.addEventListener('click', (event) => {
    if (event.target === userFormPanel) closeUserForm();
  });
  resetPasswordPanel?.addEventListener('click', (event) => {
    if (event.target === resetPasswordPanel) closeResetForm();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (resetPasswordPanel && !resetPasswordPanel.hidden) closeResetForm();
    else if (userFormPanel && !userFormPanel.hidden) closeUserForm();
  });
  form.role.addEventListener('change', updateRoleWarning);
  search?.addEventListener('input', render);
  roleFilter?.addEventListener('change', render);
  statusFilter?.addEventListener('change', render);
  render();
}

function dgMSetupServices() {
  const body = document.getElementById('servicesBody');
  const form = document.getElementById('serviceForm');
  if (!body || !form) return;
  if (!dgManageAdmin()) return;
  const search = document.getElementById('serviceSearch');
  const categoryFilter = document.getElementById('serviceCategoryFilter');
  const statusFilter = document.getElementById('serviceStatusFilter');
  const addServiceBtn = document.getElementById('addServiceBtn');
  const serviceFormPanel = document.getElementById('serviceFormPanel');
  const serviceFormTitle = document.getElementById('serviceFormTitle');
  const serviceFormSubmitBtn = document.getElementById('serviceFormSubmitBtn');
  const cancelServiceBtns = [document.getElementById('cancelServiceFormBtn'), document.getElementById('cancelServiceFormBtnSecondary')].filter(Boolean);
  const approvedServiceNames = [
    'Wedding Photo/Video',
    'Debut / Birthday Coverage',
    'Corporate / Commercial Video',
    'Restaurant / Food Promo',
    'Nightlife / Club Events',
    'Graduation / Event Coverage',
    'Pageant / Event Coverage',
    'Creative Film / Documentary',
    'Product / Brand Event'
  ];

  function clearErrors() {
    form.querySelectorAll('[data-error-for]').forEach((el) => { el.textContent = ''; });
  }

  function canonicalServiceName(name) {
    return typeof dgCanonicalServiceName === 'function' ? dgCanonicalServiceName(name) : name;
  }

  function isApprovedActiveService(name) {
    const canonicalName = canonicalServiceName(name);
    return approvedServiceNames.includes(canonicalName);
  }

  function isRetiredServiceName(name) {
    return canonicalServiceName(name) !== name
      || (typeof dgIsRetiredServiceLabel === 'function' && dgIsRetiredServiceLabel(name));
  }

  function updateSummary(services) {
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    setText('totalServicesCount', services.length);
    setText('activeServicesCount', services.filter((svc) => svc.status === 'Active').length);
    setText('inactiveServicesCount', services.filter((svc) => svc.status === 'Inactive').length);
    setText('eventServicesCount', services.filter((svc) => svc.category === 'Event').length);
    setText('commercialServicesCount', services.filter((svc) => ['Commercial', 'Food / Hospitality', 'Brand'].includes(svc.category)).length);
  }

  function alignActiveServices() {
    const services = dgMServices();
    let changed = false;
    services.forEach((service) => {
      if (service.status === 'Active' && isRetiredServiceName(service.name)) {
        service.status = 'Inactive';
        changed = true;
      }
    });
    if (changed) dgMSave(DGData.keys.services, services);
  }

  function closeServiceForm() {
    if (serviceFormPanel) serviceFormPanel.hidden = true;
    form.reset();
    form.editingId.value = '';
    clearErrors();
  }

  function selectServiceCategory(category) {
    const select = form.category;
    if (category && !Array.from(select.options).some((option) => option.value === category)) {
      select.add(new Option(category, category));
    }
    select.value = category || '';
  }

  function openServiceForm(service) {
    clearErrors();
    form.reset();
    if (service) {
      form.editingId.value = service.id;
      form.serviceName.value = service.name;
      selectServiceCategory(service.category);
      form.description.value = service.description;
      form.startingPrice.value = service.startingPrice;
      form.status.value = service.status;
      if (serviceFormTitle) serviceFormTitle.textContent = 'Edit Service';
      if (serviceFormSubmitBtn) serviceFormSubmitBtn.textContent = 'Save Service';
    } else {
      form.editingId.value = '';
      form.status.value = 'Active';
      if (serviceFormTitle) serviceFormTitle.textContent = 'Add Service';
      if (serviceFormSubmitBtn) serviceFormSubmitBtn.textContent = 'Save Service';
    }
    if (serviceFormPanel) serviceFormPanel.hidden = false;
    form.serviceName.focus();
  }

  function render() {
    const query = (search?.value || '').toLowerCase();
    const category = categoryFilter?.value || 'All';
    const status = statusFilter?.value || 'All';
    const allServices = dgMServices();
    updateSummary(allServices);
    const services = allServices
      .filter((svc) => status === 'All' || svc.status === status)
      .filter((svc) => category === 'All' || svc.category === category)
      .filter((svc) => `${svc.name} ${svc.category} ${svc.description}`.toLowerCase().includes(query));
    body.innerHTML = services.length ? services.map((svc) => `
      <tr>
        <td>${dgMEscape(svc.id)}</td>
        <td><div class="service-name-cell"><strong>${dgMEscape(svc.name)}</strong><span>${dgMEscape(svc.description)}</span></div></td>
        <td>${dgMEscape(svc.category)}</td>
        <td>${dgMMoney(svc.startingPrice)}</td>
        <td>${dgMBadge(svc.status)}</td>
        <td><div class="table-actions"><button class="btn ghost small" data-service-edit="${dgMEscape(svc.id)}" type="button">Edit</button><button class="btn ${svc.status === 'Inactive' ? 'ghost' : 'danger'} small" data-service-toggle="${dgMEscape(svc.id)}" type="button">${svc.status === 'Inactive' ? 'Activate' : 'Deactivate'}</button></div></td>
      </tr>
    `).join('') : '<tr><td colspan="6"><div class="empty-state admin-table-empty"><strong>No services found.</strong><span>Adjust your filters or add a service.</span></div></td></tr>';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearErrors();
    const services = dgMServices();
    const editingId = form.editingId.value;
    const name = form.serviceName.value.trim();
    const category = form.category.value.trim();
    const description = form.description.value.trim();
    const startingPrice = Number(form.startingPrice.value);
    const status = form.status.value;
    let valid = true;
    const err = (field, msg) => { form.querySelector(`[data-error-for="${field}"]`).textContent = msg; valid = false; };
    if (!name) err('serviceName', 'Service name is required.');
    if (services.some((svc) => svc.name.toLowerCase() === name.toLowerCase() && svc.id !== editingId)) err('serviceName', 'Service name must be unique.');
    if (!category) err('category', 'Category is required.');
    if (description.length < 20) err('description', 'Description must be at least 20 characters.');
    if (form.startingPrice.value === '' || startingPrice < 0) err('startingPrice', 'Starting price must be 0 or greater.');
    if (!status) err('status', 'Status is required.');
    if (isRetiredServiceName(name)) err('serviceName', 'Retired service labels cannot be used for new DG Film Co. bookings.');
    if (!valid) return;
    const serviceSubmitBtn = form.querySelector('[type="submit"]');
    if (window.DGLoading) { DGLoading.show('Saving service…'); DGLoading.disableButton(serviceSubmitBtn); }
    try {
      if (editingId) {
        Object.assign(services.find((svc) => svc.id === editingId), { name, category, description, startingPrice, status });
        dgMMessage('Service updated.');
      } else {
        services.push({ id: dgMNextId('SVC-', services), name, category, description, startingPrice, status, createdAt: new Date().toISOString() });
        dgMMessage('Service added.');
      }
      dgMSave(DGData.keys.services, services);
      closeServiceForm();
      render();
    } finally {
      if (window.DGLoading) { DGLoading.hide(); DGLoading.enableButton(serviceSubmitBtn); }
    }
  });

  body.addEventListener('click', (event) => {
    const edit = event.target.closest('[data-service-edit]');
    const toggle = event.target.closest('[data-service-toggle]');
    const services = dgMServices();
    if (edit) {
      const svc = services.find((item) => item.id === edit.dataset.serviceEdit);
      if (!svc) return;
      openServiceForm(svc);
      dgMMessage('Editing selected service.');
    }
    if (toggle) {
      const svc = services.find((item) => item.id === toggle.dataset.serviceToggle);
      if (!svc) return;
      if (svc.status === 'Inactive' && isRetiredServiceName(svc.name)) {
        dgMMessage('Retired service labels cannot be activated for new bookings.', 'error');
        return;
      }
      const activating = svc.status === 'Inactive';
      dgMConfirmAction({
        title: activating ? 'Activate this service?' : 'Deactivate this service?',
        message: activating ? 'This service will become available for new bookings.' : 'This service will no longer be available for new bookings, but existing bookings will not be affected.',
        confirmText: activating ? 'Activate Service' : 'Deactivate Service',
        cancelText: activating ? 'Cancel' : 'Keep Active',
        variant: activating ? 'warning' : 'danger',
        details: [`Service: ${svc.name}`],
        onConfirm: () => {
          svc.status = activating ? 'Active' : 'Inactive';
          dgMSave(DGData.keys.services, services);
          dgMMessage('Service status updated.');
          render();
        }
      });
    }
  });

  addServiceBtn?.addEventListener('click', () => {
    openServiceForm();
    dgMMessage('');
  });
  cancelServiceBtns.forEach((button) => button.addEventListener('click', closeServiceForm));
  serviceFormPanel?.addEventListener('click', (event) => {
    if (event.target === serviceFormPanel) closeServiceForm();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && serviceFormPanel && !serviceFormPanel.hidden) closeServiceForm();
  });
  search?.addEventListener('input', render);
  categoryFilter?.addEventListener('change', render);
  statusFilter?.addEventListener('change', render);
  alignActiveServices();
  render();
}

function dgMClampPercent(value, fallback = 50) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(100, Math.max(0, Math.round(number)));
}

function dgMPhotoHighlightSettings(source = dgMGet(DG_PHOTO_HIGHLIGHT_SETTINGS_KEY, {})) {
  return DG_PHOTO_HIGHLIGHT_CATEGORIES.reduce((settings, category) => {
    const fallback = DG_PHOTO_HIGHLIGHT_DEFAULTS[category] || { x: 50, y: 50 };
    const saved = source && source[category] ? source[category] : {};
    settings[category] = {
      x: dgMClampPercent(saved.x, fallback.x),
      y: dgMClampPercent(saved.y, fallback.y)
    };
    return settings;
  }, {});
}

function dgMSetupPhotoHighlightSettings() {
  const grid = document.getElementById('photoHighlightSettingsGrid');
  if (!grid) return;
  if (!dgManageAdmin()) return;
  const saveButton = document.getElementById('savePhotoHighlightSettingsBtn');
  const resetButton = document.getElementById('resetPhotoHighlightSettingsBtn');
  let settings = dgMPhotoHighlightSettings();

  const showSuccessModal = (title, message) => {
    if (window.confirmAction) {
      window.confirmAction({
        title,
        message,
        confirmText: 'Done',
        cancelText: null,
        variant: 'success',
        onConfirm: () => {}
      });
      return;
    }
    window.alert(title);
  };

  const updateCardPreview = (card) => {
    if (!card) return;
    const xInput = card.querySelector('[data-photo-highlight-x]');
    const yInput = card.querySelector('[data-photo-highlight-y]');
    const xValue = card.querySelector('[data-photo-highlight-x-value]');
    const yValue = card.querySelector('[data-photo-highlight-y-value]');
    const image = card.querySelector('img');
    const x = dgMClampPercent(xInput?.value);
    const y = dgMClampPercent(yInput?.value);
    if (xValue) xValue.textContent = `${x}%`;
    if (yValue) yValue.textContent = `${y}%`;
    if (image) image.style.objectPosition = `${x}% ${y}%`;
  };

  const render = () => {
    grid.innerHTML = DG_PHOTO_HIGHLIGHT_CATEGORIES.map((category) => {
      const position = settings[category] || DG_PHOTO_HIGHLIGHT_DEFAULTS[category] || { x: 50, y: 50 };
      const image = DG_PHOTO_HIGHLIGHT_IMAGES[category];
      return `
        <article class="photo-highlight-admin-card" data-photo-highlight-admin-card data-photo-highlight-category="${dgMEscape(category)}">
          <div class="photo-highlight-admin-preview">
            <img src="${dgMEscape(image)}" alt="${dgMEscape(category)} thumbnail preview" style="object-position: ${position.x}% ${position.y}%;" loading="lazy" />
          </div>
          <div class="photo-highlight-admin-copy">
            <h3>${dgMEscape(category)}</h3>
            <label>
              <span>Horizontal Position <strong data-photo-highlight-x-value>${position.x}%</strong></span>
              <input type="range" min="0" max="100" value="${position.x}" data-photo-highlight-x />
            </label>
            <label>
              <span>Vertical Position <strong data-photo-highlight-y-value>${position.y}%</strong></span>
              <input type="range" min="0" max="100" value="${position.y}" data-photo-highlight-y />
            </label>
          </div>
        </article>
      `;
    }).join('');
  };

  grid.addEventListener('input', (event) => {
    const slider = event.target.closest('[data-photo-highlight-x], [data-photo-highlight-y]');
    if (!slider) return;
    updateCardPreview(slider.closest('[data-photo-highlight-admin-card]'));
  });

  saveButton?.addEventListener('click', () => {
    const next = {};
    grid.querySelectorAll('[data-photo-highlight-admin-card]').forEach((card) => {
      const category = card.dataset.photoHighlightCategory;
      next[category] = {
        x: dgMClampPercent(card.querySelector('[data-photo-highlight-x]')?.value),
        y: dgMClampPercent(card.querySelector('[data-photo-highlight-y]')?.value)
      };
    });
    dgMSave(DG_PHOTO_HIGHLIGHT_SETTINGS_KEY, next);
    settings = dgMPhotoHighlightSettings(next);
    render();
    showSuccessModal('Thumbnail positions saved.', 'Your Photo Highlight thumbnail focal points have been saved.');
  });

  resetButton?.addEventListener('click', () => {
    dgMSave(DG_PHOTO_HIGHLIGHT_SETTINGS_KEY, DG_PHOTO_HIGHLIGHT_DEFAULTS);
    settings = dgMPhotoHighlightSettings(DG_PHOTO_HIGHLIGHT_DEFAULTS);
    render();
    showSuccessModal('Thumbnail positions reset to defaults.', 'The Photo Highlight thumbnail focal points are back to the default positions.');
  });

  render();
}

function dgMPopulateServiceSelect(select) {
  select.innerHTML = '<option value="">Choose a service</option>' + dgMServices().map((svc) => `<option value="${dgMEscape(svc.id)}">${dgMEscape(svc.name)}</option>`).join('');
}

function dgMSetupPricing() {
  const list = document.getElementById('pricingList');
  const form = document.getElementById('pricingForm');
  if (!list || !form) return;
  if (!dgManageAdmin()) return;
  const serviceFilter = document.getElementById('pricingServiceFilter');
  const statusFilter = document.getElementById('pricingStatusFilter');
  const search = document.getElementById('pricingSearch');
  const addPackageBtn = document.getElementById('addPackageBtn');
  const pricingFormPanel = document.getElementById('pricingFormPanel');
  const pricingFormTitle = document.getElementById('pricingFormTitle');
  const pricingFormSubmitBtn = document.getElementById('pricingFormSubmitBtn');
  const cancelPricingBtns = [document.getElementById('cancelPricingFormBtn'), document.getElementById('cancelPricingFormBtnSecondary')].filter(Boolean);
  const packageDetailsPanel = document.getElementById('packageDetailsPanel');
  const packageDetailsTitle = document.getElementById('packageDetailsTitle');
  const packageDetailsService = document.getElementById('packageDetailsService');
  const packageDetailsContent = document.getElementById('packageDetailsContent');
  const editPackageDetailsBtn = document.getElementById('editPackageDetailsBtn');
  const cancelPackageDetailsBtns = [document.getElementById('cancelPackageDetailsBtn'), document.getElementById('cancelPackageDetailsBtnSecondary')].filter(Boolean);
  let detailPackageId = '';
  let expandedServiceKey = '';
  const serviceOrder = [
    'Wedding Photo/Video',
    'Debut / Birthday Coverage',
    'Corporate / Commercial Video',
    'Restaurant / Food Promo',
    'Nightlife / Club Events',
    'Graduation / Event Coverage',
    'Pageant / Event Coverage',
    'Creative Film / Documentary',
    'Product / Brand Event'
  ];
  dgMPopulateServiceSelect(form.serviceId);
  dgMPopulateServiceSelect(serviceFilter);
  serviceFilter.options[0].textContent = 'All services';

  function clearErrors() {
    form.querySelectorAll('[data-error-for]').forEach((el) => { el.textContent = ''; });
  }

  function updateSummary(packages) {
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    setText('totalPackagesCount', packages.length);
    setText('activePackagesCount', packages.filter((pkg) => pkg.status === 'Active').length);
    setText('inactivePackagesCount', packages.filter((pkg) => pkg.status === 'Inactive').length);
    setText('servicesWithPackagesCount', new Set(packages.map((pkg) => pkg.serviceId || pkg.serviceName)).size);
  }

  function closePricingForm() {
    if (pricingFormPanel) pricingFormPanel.hidden = true;
    form.reset();
    form.editingId.value = '';
    clearErrors();
  }

  function closePackageDetails() {
    if (packageDetailsPanel) packageDetailsPanel.hidden = true;
    detailPackageId = '';
  }

  function openPricingForm(pkg, selectedServiceId = '') {
    closePackageDetails();
    clearErrors();
    form.reset();
    if (pkg) {
      form.editingId.value = pkg.id;
      form.serviceId.value = pkg.serviceId;
      form.packageName.value = pkg.packageName;
      form.price.value = pkg.price;
      form.deliverables.value = (pkg.deliverables || []).join('\n');
      form.status.value = pkg.status;
      if (pricingFormTitle) pricingFormTitle.textContent = 'Edit Package';
      if (pricingFormSubmitBtn) pricingFormSubmitBtn.textContent = 'Save Package';
    } else {
      form.editingId.value = '';
      form.serviceId.value = selectedServiceId;
      form.status.value = 'Active';
      if (pricingFormTitle) pricingFormTitle.textContent = 'Add Package';
      if (pricingFormSubmitBtn) pricingFormSubmitBtn.textContent = 'Save Package';
    }
    if (pricingFormPanel) pricingFormPanel.hidden = false;
    form.serviceId.focus();
  }

  function openPackageDetails(pkg) {
    if (!pkg || !packageDetailsPanel || !packageDetailsContent) return;
    detailPackageId = pkg.id;
    if (packageDetailsTitle) packageDetailsTitle.textContent = pkg.packageName;
    if (packageDetailsService) packageDetailsService.textContent = pkg.serviceName;
    packageDetailsContent.innerHTML = `
      <div class="pricing-package-detail-summary">
        <div><span>Service</span><strong>${dgMEscape(pkg.serviceName)}</strong></div>
        <div><span>Price</span><strong>${dgMMoney(pkg.price)}</strong></div>
        <div><span>Status</span>${dgMBadge(pkg.status)}</div>
      </div>
      <div class="pricing-deliverables">
        <strong>Deliverables</strong>
        <ul>${(pkg.deliverables || []).map((item) => `<li>${dgMEscape(item)}</li>`).join('') || '<li>No deliverables listed.</li>'}</ul>
      </div>
    `;
    packageDetailsPanel.hidden = false;
  }

  function serviceSortIndex(name) {
    const index = serviceOrder.indexOf(name);
    return index === -1 ? serviceOrder.length + 1 : index;
  }

  function render() {
    const services = dgMServices();
    const query = (search?.value || '').toLowerCase();
    const serviceId = serviceFilter?.value || '';
    const status = statusFilter?.value || 'All';
    const allPackages = dgMPricing().filter((pkg) => pkg.serviceName !== 'Real Estate Shoot');
    updateSummary(allPackages);
    const selectedService = services.find((svc) => svc.id === serviceId);
    const extraServiceNames = services
      .map((svc) => svc.name)
      .concat(allPackages.map((pkg) => pkg.serviceName))
      .filter((name) => name && name !== 'Real Estate Shoot' && !serviceOrder.includes(name));
    const groupNames = serviceOrder.concat([...new Set(extraServiceNames)]);
    const groups = groupNames
      .map((serviceName) => {
        const service = services.find((svc) => svc.name === serviceName);
        const serviceMatch = `${serviceName} ${service?.category || ''} ${service?.description || ''}`.toLowerCase().includes(query);
        const catalogPackages = allPackages
          .filter((pkg) => pkg.serviceName === serviceName || (service && pkg.serviceId === service.id));
        const servicePackages = catalogPackages
          .filter((pkg) => status === 'All' || pkg.status === status)
          .filter((pkg) => !query || serviceMatch || `${pkg.serviceName} ${pkg.packageName}`.toLowerCase().includes(query))
          .sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        return { service, serviceName, serviceMatch, catalogPackageCount: catalogPackages.length, packages: servicePackages };
      })
      .filter((group) => {
        if (serviceId) return group.service?.id === serviceId || group.serviceName === selectedService?.name;
        if (query) return group.serviceMatch || group.packages.length;
        if (status !== 'All') return group.packages.length;
        return Boolean(group.service) || group.packages.length;
      })
      .sort((a, b) => serviceSortIndex(a.serviceName) - serviceSortIndex(b.serviceName));

    list.innerHTML = groups.length ? groups.map((group) => {
      const serviceKey = group.service?.id || group.serviceName;
      const isOpen = expandedServiceKey === serviceKey;
      const prices = group.packages.map((pkg) => Number(pkg.price || 0)).filter(Number.isFinite);
      const startsAt = prices.length ? `Starts at ${dgMMoney(Math.min(...prices))}` : 'Pricing not set';
      const packageLabel = `${group.packages.length} ${group.packages.length === 1 ? 'package' : 'packages'}`;
      return `
        <article class="pricing-service-group${isOpen ? ' is-open' : ''}">
          <button class="pricing-service-header" type="button" data-pricing-service-toggle="${dgMEscape(serviceKey)}" aria-expanded="${isOpen ? 'true' : 'false'}">
            <div class="pricing-service-copy">
              <p class="eyebrow">${dgMEscape(group.service?.category || 'Service')}</p>
              <h2>${dgMEscape(group.serviceName)}</h2>
              ${group.service?.description ? `<p class="pricing-service-description">${dgMEscape(group.service.description)}</p>` : ''}
            </div>
            <div class="pricing-service-meta">
              <p><span>${packageLabel}</span><strong>${startsAt}</strong></p>
              <span class="pricing-manage-button">${isOpen ? 'Collapse' : 'Expand'} <i aria-hidden="true">${isOpen ? '&#8593;' : '&#8595;'}</i></span>
            </div>
          </button>
          ${isOpen ? `
            <div class="pricing-package-list">
              ${group.packages.length ? group.packages.map((pkg) => `
                  <article class="pricing-package-row">
                    <div class="pricing-package-main">
                      <div class="pricing-package-copy">
                        <h3>${dgMEscape(pkg.packageName)}</h3>
                        <p>${dgMMoney(pkg.price)}</p>
                      </div>
                      <div class="badge-row">${dgMBadge(pkg.status)}</div>
                      <div class="pricing-package-actions">
                        <button class="btn ghost small" data-package-view="${dgMEscape(pkg.id)}" type="button">View Details</button>
                        <button class="btn ghost small" data-package-edit="${dgMEscape(pkg.id)}" type="button">Edit</button>
                        <button class="btn ${pkg.status === 'Inactive' ? 'ghost' : 'danger'} small" data-package-toggle="${dgMEscape(pkg.id)}" type="button">${pkg.status === 'Inactive' ? 'Activate' : 'Deactivate'}</button>
                      </div>
                    </div>
                  </article>
                `).join('') : `
                <div class="empty-state pricing-service-empty">
                  <strong>${group.catalogPackageCount ? 'No packages match the selected filters.' : 'No packages added for this service yet.'}</strong>
                  ${!group.catalogPackageCount && group.service ? `<button class="btn primary small" data-package-add-service="${dgMEscape(group.service.id)}" type="button">+ Add Package</button>` : ''}
                </div>
              `}
            </div>
          ` : ''}
        </article>
      `;
    }).join('') : '<div class="empty-state admin-catalog-empty"><strong>No packages found.</strong><span>Adjust your filters or add a package.</span></div>';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearErrors();
    const packages = dgMPricing();
    const services = dgMServices();
    const editingId = form.editingId.value;
    const service = services.find((svc) => svc.id === form.serviceId.value);
    const packageName = form.packageName.value.trim();
    const price = Number(form.price.value);
    const deliverables = form.deliverables.value.split('\n').map((item) => item.trim()).filter(Boolean);
    const status = form.status.value;
    let valid = true;
    const err = (field, msg) => { form.querySelector(`[data-error-for="${field}"]`).textContent = msg; valid = false; };
    if (!service) err('serviceId', 'Service is required.');
    if (!packageName) err('packageName', 'Package name is required.');
    if (service && packages.some((pkg) => pkg.serviceId === service.id && pkg.packageName.toLowerCase() === packageName.toLowerCase() && pkg.id !== editingId)) err('packageName', 'Package name must be unique under this service.');
    if (form.price.value === '' || price < 0) err('price', 'Price must be 0 or greater.');
    if (!deliverables.length) err('deliverables', 'Enter at least one deliverable.');
    if (!status) err('status', 'Status is required.');
    if (!valid) return;
    const pkgSubmitBtn = form.querySelector('[type="submit"]');
    if (window.DGLoading) { DGLoading.show('Saving package…'); DGLoading.disableButton(pkgSubmitBtn); }
    try {
      const payload = { serviceId: service.id, serviceName: service.name, packageName, price, deliverables, status };
      if (editingId) {
        Object.assign(packages.find((pkg) => pkg.id === editingId), payload);
        dgMMessage('Package updated.');
      } else {
        packages.push({ id: dgMNextId('PKG-', packages), ...payload, createdAt: new Date().toISOString() });
        dgMMessage('Package added.');
      }
      dgMSave(DGData.keys.pricing, packages);
      closePricingForm();
      render();
    } finally {
      if (window.DGLoading) { DGLoading.hide(); DGLoading.enableButton(pkgSubmitBtn); }
    }
  });

  list.addEventListener('click', (event) => {
    const groupToggle = event.target.closest('[data-pricing-service-toggle]');
    const serviceAdd = event.target.closest('[data-package-add-service]');
    const view = event.target.closest('[data-package-view]');
    const edit = event.target.closest('[data-package-edit]');
    const toggle = event.target.closest('[data-package-toggle]');
    const packages = dgMPricing();
    if (groupToggle) {
      const key = groupToggle.dataset.pricingServiceToggle;
      expandedServiceKey = expandedServiceKey === key ? '' : key;
      render();
      return;
    }
    if (serviceAdd) {
      openPricingForm(null, serviceAdd.dataset.packageAddService);
      dgMMessage('');
      return;
    }
    if (view) {
      const pkg = packages.find((item) => item.id === view.dataset.packageView);
      if (!pkg) return;
      openPackageDetails(pkg);
      return;
    }
    if (edit) {
      const pkg = packages.find((item) => item.id === edit.dataset.packageEdit);
      if (!pkg) return;
      openPricingForm(pkg);
      dgMMessage('Editing selected package.');
    }
    if (toggle) {
      const pkg = packages.find((item) => item.id === toggle.dataset.packageToggle);
      if (!pkg) return;
      const activating = pkg.status === 'Inactive';
      dgMConfirmAction({
        title: activating ? 'Activate this package?' : 'Deactivate this package?',
        message: activating ? 'This package will become available for new bookings.' : 'This package will no longer appear for new bookings, but existing booking records will remain unchanged.',
        confirmText: activating ? 'Activate Package' : 'Deactivate Package',
        cancelText: activating ? 'Cancel' : 'Keep Active',
        variant: activating ? 'warning' : 'danger',
        details: [`Package: ${pkg.packageName}`, `Service: ${pkg.serviceName}`],
        onConfirm: () => {
          pkg.status = activating ? 'Active' : 'Inactive';
          dgMSave(DGData.keys.pricing, packages);
          dgMMessage('Package status updated.');
          render();
        }
      });
    }
  });
  addPackageBtn?.addEventListener('click', () => {
    openPricingForm();
    dgMMessage('');
  });
  cancelPricingBtns.forEach((button) => button.addEventListener('click', closePricingForm));
  cancelPackageDetailsBtns.forEach((button) => button.addEventListener('click', closePackageDetails));
  editPackageDetailsBtn?.addEventListener('click', () => {
    const pkg = dgMPricing().find((item) => item.id === detailPackageId);
    if (pkg) openPricingForm(pkg);
  });
  pricingFormPanel?.addEventListener('click', (event) => {
    if (event.target === pricingFormPanel) closePricingForm();
  });
  packageDetailsPanel?.addEventListener('click', (event) => {
    if (event.target === packageDetailsPanel) closePackageDetails();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (packageDetailsPanel && !packageDetailsPanel.hidden) closePackageDetails();
    else if (pricingFormPanel && !pricingFormPanel.hidden) closePricingForm();
  });
  [search, serviceFilter, statusFilter].filter(Boolean).forEach((el) => el.addEventListener('input', render));
  render();
}

function dgMSetupReports() {
  const cards = document.getElementById('reportCards');
  if (!cards) return;
  if (!dgManageAdmin()) return;
  const from = document.getElementById('reportFrom');
  const to = document.getElementById('reportTo');
  const service = document.getElementById('reportService');
  const status = document.getElementById('reportStatus');
  dgMPopulateServiceSelect(service);
  service.options[0].textContent = 'All services';
  const tabs = document.querySelectorAll('[data-report-tab]');
  const panels = document.querySelectorAll('[data-report-panel]');

  function filteredBookings() {
    return dgMBookings().filter((booking) => {
      const created = (booking.createdAt || '').slice(0, 10);
      return (!from.value || created >= from.value) && (!to.value || created <= to.value) && (!service.value || booking.serviceId === service.value || booking.serviceType === service.selectedOptions[0]?.textContent) && (status.value === 'All' || booking.status === status.value);
    });
  }
  const countBy = (items, getter) => items.reduce((acc, item) => { const key = getter(item) || 'Not Set'; acc[key] = (acc[key] || 0) + 1; return acc; }, {});
  const table = (id, rows, headers) => {
    const target = document.getElementById(id);
    if (!target) return;
    target.innerHTML = rows.length
      ? rows.map((row) => `<tr>${row.map((cell) => `<td>${dgMEscape(cell)}</td>`).join('')}</tr>`).join('')
      : `<tr><td colspan="${headers}">No records for the selected filters.</td></tr>`;
  };

  function setActiveTab(tabName) {
    tabs.forEach((tab) => {
      const active = tab.dataset.reportTab === tabName;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.dataset.reportPanel === tabName;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });
  }

  function render() {
    const bookings = filteredBookings();
    const bookingIds = new Set(bookings.map((b) => b.id));
    const allPayments = dgMPayments();
    const payments = allPayments.filter((p) => bookingIds.has(p.bookingId));
    const users = dgMUsers();
    const verified = payments.filter((payment) => payment.status === 'Verified');
    const verifiedDownPayments = verified.filter((payment) => (payment.paymentType || 'Down Payment').trim() === 'Down Payment');
    const verifiedBalancePayments = verified.filter((payment) => (payment.paymentType || '').trim() === 'Balance Payment');
    const totalCollected = verified.reduce((sum, p) => sum + Number(p.amountPaid || 0), 0);
    const outstandingBalance = bookings.reduce((sum, booking) => {
      const invoice = booking.invoice;
      if (!invoice || invoice.balanceStatus === 'Verified') return sum;
      return sum + Number(invoice.balanceAmount || 0);
    }, 0);
    const completedWithDelivery = bookings.filter((b) => b.status === 'Completed' && (b.deliveryOutputLink || b.deliveryFileName));
    const bookingsWithFeedback = bookings.filter((b) => b.feedback);
    const ratingValues = bookingsWithFeedback.map((b) => Number(b.feedback.rating)).filter((rating) => Number.isFinite(rating) && rating > 0);
    const averageRating = ratingValues.length ? (ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length).toFixed(1) : 'No client ratings yet.';
    const activeClients = new Set(bookings.map((booking) => booking.clientId || booking.clientEmail || booking.clientName).filter(Boolean)).size;
    const stats = [
      ['Total Bookings', bookings.length],
      ['Confirmed Bookings', bookings.filter((b) => b.status === 'Confirmed').length],
      ['Completed Projects', bookings.filter((b) => b.status === 'Completed').length],
      ['Total Collected', dgMMoney(totalCollected)],
      ['Outstanding Balance', dgMMoney(outstandingBalance)],
      ['Active Clients', activeClients]
    ];
    cards.innerHTML = stats.map(([label, value]) => `<article class="dashboard-card report-metric-card"><span>${label}</span><strong>${value}</strong></article>`).join('');
    const bookingsByService = Object.entries(countBy(bookings, (b) => b.serviceName || b.serviceType)).sort((a, b) => b[1] - a[1]);
    table('bookingsByService', bookingsByService, 2);
    table('serviceBookingsByService', bookingsByService, 2);
    table('bookingsByStatus', dgMWorkflowStatuses().map((item) => [item, bookings.filter((b) => b.status === item).length]), 2);
    const paySummary = [
      ['Verified Down Payments', verifiedDownPayments.length, dgMMoney(verifiedDownPayments.reduce((sum, p) => sum + Number(p.amountPaid || 0), 0))],
      ['Verified Balance Payments', verifiedBalancePayments.length, dgMMoney(verifiedBalancePayments.reduce((sum, p) => sum + Number(p.amountPaid || 0), 0))],
      ['Total Collected', verified.length, dgMMoney(totalCollected)],
      ['Outstanding Balance', '-', dgMMoney(outstandingBalance)],
      ['Estimated Revenue', verified.length, dgMMoney(totalCollected)]
    ];
    table('paymentSummary', paySummary, 3);
    table('monthlyBookings', Object.entries(countBy(bookings, (b) => (b.createdAt || '').slice(0, 7) || 'Unknown')), 2);
    table('cancelledBookings', [['Cancelled Bookings', bookings.filter((b) => b.status === 'Cancelled').length]], 2);
    const staffRows = users.filter((u) => u.role === 'staff').map((u) => {
      const assigned = bookings.filter((b) => b.assignedStaffId === u.id);
      return [u.name || u.fullName, assigned.length, assigned.filter((b) => b.status === 'Completed').length, assigned.filter((b) => !['Completed', 'Cancelled', 'Rejected'].includes(b.status)).length];
    });
    table('staffWorkload', staffRows, 4);
    table('topServices', bookingsByService.slice(0, 8), 2);
    table('servicePerformance', bookingsByService.map(([serviceName, count]) => {
      const related = bookings.filter((booking) => (booking.serviceName || booking.serviceType) === serviceName);
      return [serviceName, count, related.filter((booking) => booking.status === 'Completed').length, related.filter((booking) => booking.status === 'Cancelled').length];
    }), 4);
  }
  tabs.forEach((tab) => tab.addEventListener('click', () => setActiveTab(tab.dataset.reportTab)));
  document.getElementById('applyReports')?.addEventListener('click', render);
  document.getElementById('resetReports').addEventListener('click', () => { from.value = ''; to.value = ''; service.value = ''; status.value = 'All'; render(); });
  document.getElementById('printReports').addEventListener('click', () => window.print());
  document.getElementById('exportReports').addEventListener('click', () => {
    const rows = filteredBookings().map((b) => [b.id, b.clientName, b.serviceName || b.serviceType, b.status, b.paymentStatus, b.createdAt]);
    const csv = 'Booking ID,Client,Service,Status,Payment Status,Created At\n' + rows.map((r) => r.map((v) => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = 'dg-film-bookings-report.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  });
  [from, to, service, status].forEach((el) => el.addEventListener('input', render));
  setActiveTab('overview');
  render();
}

document.addEventListener('DOMContentLoaded', () => {
  dgMSetupUsers();
  dgMSetupServices();
  dgMSetupPhotoHighlightSettings();
  dgMSetupPricing();
  dgMSetupPaymentSettings();
  dgMSetupReports();
});
