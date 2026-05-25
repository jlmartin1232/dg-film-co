function dgFindUserByEmail(email) {
  const users = DGData.getJson(DGData.keys.users, []);
  return users.find((user) => user.email === email.toLowerCase());
}

function dgShowMessage(element, message, type) {
  if (!element) return;
  element.textContent = message;
  element.className = `form-message ${type}`;
}

function dgClearMessage(element) {
  if (!element) return;
  element.textContent = '';
  element.className = 'form-message';
}

function dgSetAuthFieldInvalid(field, invalid) {
  if (!field) return;
  field.classList.toggle('field-invalid', Boolean(invalid));
  if (invalid) {
    field.setAttribute('aria-invalid', 'true');
  } else {
    field.removeAttribute('aria-invalid');
  }
}

function dgSetAuthFieldError(form, fieldName, message) {
  const field = form?.elements[fieldName];
  const error = form?.querySelector(`[data-auth-error="${fieldName}"]`);
  dgSetAuthFieldInvalid(field, Boolean(message));
  if (error) error.textContent = message || '';
}

function dgClearAuthFieldErrors(form) {
  if (!form) return;
  form.querySelectorAll('input').forEach((field) => dgSetAuthFieldInvalid(field, false));
  form.querySelectorAll('[data-auth-error]').forEach((error) => { error.textContent = ''; });
}

function dgIsValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function dgValidatePassword(password) {
  return password.length >= 8 &&
    password.length <= 64 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
}

function dgIsValidFullName(name) {
  return /^[A-Za-z .'-]+$/.test(name);
}

function dgIsNumbersOnly(value) {
  return /^\d+$/.test(value);
}

function dgIsValidPhilippineMobile(value) {
  return /^09\d{9}$/.test(value);
}

function dgCleanRegisterMobileNumber(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 11);
}

function dgSetupRegisterMobileNumberInput(form) {
  const mobileNumber = form.elements.mobileNumber;
  if (!mobileNumber) return;

  mobileNumber.addEventListener('input', () => {
    const cleanedValue = dgCleanRegisterMobileNumber(mobileNumber.value);
    if (mobileNumber.value !== cleanedValue) mobileNumber.value = cleanedValue;
  });

  mobileNumber.addEventListener('paste', (event) => {
    if (!event.clipboardData) return;
    event.preventDefault();

    const start = mobileNumber.selectionStart ?? mobileNumber.value.length;
    const end = mobileNumber.selectionEnd ?? start;
    const pastedDigits = dgCleanRegisterMobileNumber(event.clipboardData.getData('text'));
    const combinedValue = mobileNumber.value.slice(0, start) + pastedDigits + mobileNumber.value.slice(end);
    mobileNumber.value = dgCleanRegisterMobileNumber(combinedValue);

    const cursor = Math.min(start + pastedDigits.length, mobileNumber.value.length);
    mobileNumber.setSelectionRange(cursor, cursor);
    mobileNumber.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function dgRedirectByRole(role) {
  const destinations = {
    admin: 'admin-dashboard.html',
    staff: 'staff-dashboard.html',
    client: 'client-dashboard.html'
  };
  window.location.href = destinations[role] || 'unauthorized.html';
}

function dgSetupAuthSlider() {
  const slider = document.querySelector('[data-auth-slider]');
  if (!slider) return;
  const navSwitch = document.querySelector('.auth-nav-switch');

  const setMode = (mode, focusField) => {
    const registerActive = mode === 'register';
    slider.classList.toggle('register-active', registerActive);
    if (navSwitch) {
      navSwitch.dataset.authSwitch = registerActive ? 'login' : 'register';
      navSwitch.textContent = registerActive ? 'Log in' : 'Create Account';
    }
    if (focusField) {
      const fieldId = registerActive ? 'registerName' : 'loginEmail';
      const field = document.getElementById(fieldId);
      if (field) window.setTimeout(() => field.focus(), 360);
    }
  };

  setMode(slider.classList.contains('register-active') ? 'register' : 'login', false);
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-auth-switch]');
    if (!trigger) return;
    event.preventDefault();
    setMode(trigger.dataset.authSwitch === 'register' ? 'register' : 'login', true);
  });
}

function dgSetupRegisterForm() {
  const form = document.getElementById('registerForm');
  const message = document.getElementById('registerMessage');
  if (!form) return;
  const termsToggle = form.querySelector('[data-auth-terms-toggle]');
  const termsDetails = form.querySelector('[data-auth-terms-details]');
  dgSetupRegisterMobileNumberInput(form);

  termsToggle?.addEventListener('click', () => {
    const expanded = termsToggle.getAttribute('aria-expanded') === 'true';
    termsToggle.setAttribute('aria-expanded', String(!expanded));
    termsToggle.textContent = expanded ? 'View details' : 'Hide details';
    if (termsDetails) termsDetails.hidden = expanded;
  });

  form.querySelectorAll('input').forEach((field) => {
    field.addEventListener('input', () => {
      dgSetAuthFieldError(form, field.name, '');
      dgClearMessage(message);
    });
    field.addEventListener('change', () => {
      dgSetAuthFieldError(form, field.name, '');
      dgClearMessage(message);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    dgClearAuthFieldErrors(form);

    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const contactNumber = form.mobileNumber ? form.mobileNumber.value.trim() : '';
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const termsAgreement = Boolean(form.termsAgreement?.checked);

    let hasError = false;
    const fail = (fieldName, errorMessage) => {
      dgSetAuthFieldError(form, fieldName, errorMessage);
      hasError = true;
    };

    if (!fullName) fail('fullName', 'Full name is required.');
    else if (fullName.length < 2) fail('fullName', 'Full name must be at least 2 characters.');
    else if (fullName.length > 60) fail('fullName', 'Full name must not exceed 60 characters.');
    else if (!dgIsValidFullName(fullName)) fail('fullName', "Full name can only contain letters, spaces, dot, apostrophe, and hyphen.");

    if (!email) fail('email', 'Email address is required.');
    else if (email.length < 5 || email.length > 50) fail('email', 'Email address must be between 5 and 50 characters.');
    else if (!dgIsValidEmail(email)) fail('email', 'Please enter a valid email address.');
    else if (dgFindUserByEmail(email)) fail('email', 'Email address is already registered.');

    if (!contactNumber) fail('mobileNumber', 'Mobile number is required.');
    else if (!dgIsNumbersOnly(contactNumber)) fail('mobileNumber', 'Mobile number can contain numbers only.');
    else if (!dgIsValidPhilippineMobile(contactNumber)) fail('mobileNumber', 'Mobile number must be 11 digits and start with 09.');

    if (!password) fail('password', 'Password is required.');
    else if (password.length < 8 || password.length > 64) fail('password', 'Password must be between 8 and 64 characters.');
    else if (!dgValidatePassword(password)) fail('password', 'Password must include uppercase, lowercase, number, and special character.');

    if (!confirmPassword) fail('confirmPassword', 'Confirm password is required.');
    else if (password !== confirmPassword) fail('confirmPassword', 'Confirm password does not match.');
    if (!termsAgreement) fail('termsAgreement', 'You must agree to the terms before creating an account.');

    if (hasError) {
      dgShowMessage(message, 'Please review the highlighted fields.', 'error');
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    if (window.DGLoading) { DGLoading.show('Creating account…'); DGLoading.disableButton(submitBtn); }
    try {
      // Public registration always creates a client account.
      const users = DGData.getJson(DGData.keys.users, []);
      const newUser = DGData.createUser(fullName, email, password, 'client');
      newUser.contactNumber = contactNumber;
      users.push(newUser);
      DGData.setJson(DGData.keys.users, users);
    } finally {
      // Navigation will hide the overlay; if something fails, clean up
      setTimeout(() => { if (window.DGLoading) { DGLoading.hide(); DGLoading.enableButton(submitBtn); } }, 900);
    }
    window.location.href = 'login.html?registered=1';
  });
}

function dgSetupLoginForm() {
  const form = document.getElementById('loginForm');
  const message = document.getElementById('loginMessage');
  if (!form) return;

  form.querySelectorAll('input').forEach((field) => {
    field.addEventListener('input', () => {
      dgSetAuthFieldError(form, field.name, '');
      dgClearMessage(message);
    });
  });

  const params = new URLSearchParams(window.location.search);
  const currentUser = DGData.getJson(DGData.keys.currentUser, null);
  const slider = form.closest('[data-auth-slider]');
  const beginsOnRegistration = slider && slider.classList.contains('register-active');
  if (currentUser && params.get('registered') !== '1' && !beginsOnRegistration) {
    dgRedirectByRole(currentUser.role);
    return;
  }

  if (params.get('registered') === '1') {
    dgShowMessage(message, 'Registration successful. You can now log in.', 'success');
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    dgClearAuthFieldErrors(form);

    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;

    let hasError = false;
    const fail = (fieldName, errorMessage) => {
      dgSetAuthFieldError(form, fieldName, errorMessage);
      hasError = true;
    };

    if (!email) fail('email', 'Email address is required.');
    else if (email.length > 50) fail('email', 'Email address must not exceed 50 characters.');
    else if (!dgIsValidEmail(email)) fail('email', 'Please enter a valid email address.');
    if (!password) fail('password', 'Password is required.');

    if (hasError) {
      dgShowMessage(message, 'Please review the highlighted fields.', 'error');
      return;
    }

    const user = dgFindUserByEmail(email);
    if (!user || user.password !== password) {
      dgSetAuthFieldInvalid(form.email, true);
      dgSetAuthFieldInvalid(form.password, true);
      dgShowMessage(message, 'Invalid email or password.', 'error');
      return;
    }

    if ((user.status || 'Active') === 'Disabled') {
      dgSetAuthFieldInvalid(form.email, true);
      dgShowMessage(message, 'This account is disabled. Please contact DG Film Co. for assistance.', 'error');
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    if (window.DGLoading) { DGLoading.show('Signing in…'); DGLoading.disableButton(submitBtn); }
    // Store a safe session object without exposing role selection in the UI.
    const currentUser = {
      id: user.id,
      name: user.name || user.fullName,
      fullName: user.fullName || user.name,
      email: user.email,
      role: user.role
    };
    DGData.setJson(DGData.keys.currentUser, currentUser);
    dgRedirectByRole(user.role);
  });
}

function dgLogout() {
  if (window.DGLoading) DGLoading.show('Signing out…');
  localStorage.removeItem(DGData.keys.currentUser);
  window.location.href = 'login.html';
}

function dgEnsureLogoutModal() {
  let modal = document.getElementById('logoutConfirmModal');
  if (modal) return modal;
  modal = document.createElement('div');
  modal.id = 'logoutConfirmModal';
  modal.className = 'logout-confirm-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <section class="logout-confirm-panel" role="dialog" aria-modal="true" aria-labelledby="logoutConfirmTitle" aria-describedby="logoutConfirmMessage">
      <button class="modal-close logout-confirm-close" type="button" aria-label="Cancel logout" data-logout-cancel>&times;</button>
      <p class="eyebrow">Account session</p>
      <h2 id="logoutConfirmTitle">Log out?</h2>
      <p id="logoutConfirmMessage">Are you sure you want to log out of your DG Film Co. account?</p>
      <div class="logout-confirm-actions">
        <button class="btn ghost" type="button" data-logout-cancel>Cancel</button>
        <button class="btn primary" type="button" data-logout-confirm>Log out</button>
      </div>
    </section>
  `;
  document.body.appendChild(modal);
  return modal;
}

function dgConfirmLogout() {
  if (window.confirmAction) {
    return window.confirmAction({
      title: 'Log out?',
      message: 'Are you sure you want to log out of your DG Film Co. account?',
      confirmText: 'Log out',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: dgLogout
    });
  }

  const modal = dgEnsureLogoutModal();
  const confirmButton = modal.querySelector('[data-logout-confirm]');
  const cancelButtons = modal.querySelectorAll('[data-logout-cancel]');
  const close = () => {
    modal.hidden = true;
    modal.classList.remove('open');
    document.removeEventListener('keydown', onKeydown);
    modal.removeEventListener('click', onOverlayClick);
    cancelButtons.forEach((button) => button.removeEventListener('click', close));
    confirmButton.removeEventListener('click', confirm);
  };
  const confirm = () => {
    close();
    dgLogout();
  };
  const onKeydown = (event) => {
    if (event.key === 'Escape') close();
  };
  const onOverlayClick = (event) => {
    if (event.target === modal) close();
  };
  modal.hidden = false;
  modal.classList.add('open');
  document.addEventListener('keydown', onKeydown);
  modal.addEventListener('click', onOverlayClick);
  cancelButtons.forEach((button) => button.addEventListener('click', close));
  confirmButton.addEventListener('click', confirm);
  confirmButton.focus();
  return Promise.resolve(false);
}

function dgSetupLogoutButtons() {
  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', dgConfirmLogout);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  dgSetupAuthSlider();
  dgSetupRegisterForm();
  dgSetupLoginForm();
  dgSetupLogoutButtons();
});

window.DGAuth = {
  logout: dgLogout,
  confirmLogout: dgConfirmLogout,
  redirectByRole: dgRedirectByRole
};
