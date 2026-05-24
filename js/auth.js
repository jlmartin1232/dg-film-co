function dgFindUserByEmail(email) {
  const users = DGData.getJson(DGData.keys.users, []);
  return users.find((user) => user.email === email.toLowerCase());
}

function dgShowMessage(element, message, type) {
  if (!element) return;
  element.textContent = message;
  element.className = `form-message ${type}`;
}

function dgIsValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function dgValidatePassword(password) {
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);
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

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (!fullName) {
      dgShowMessage(message, 'Full name is required.', 'error');
      return;
    }

    if (!email || !dgIsValidEmail(email)) {
      dgShowMessage(message, 'Please enter a valid email address.', 'error');
      return;
    }

    if (dgFindUserByEmail(email)) {
      dgShowMessage(message, 'An account with this email already exists.', 'error');
      return;
    }

    if (!password || !dgValidatePassword(password)) {
      dgShowMessage(message, 'Password must be at least 8 characters and include uppercase, lowercase, and a number.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      dgShowMessage(message, 'Confirm password must match password.', 'error');
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    if (window.DGLoading) { DGLoading.show('Creating account…'); DGLoading.disableButton(submitBtn); }
    try {
      // Public registration always creates a client account.
      const users = DGData.getJson(DGData.keys.users, []);
      users.push(DGData.createUser(fullName, email, password, 'client'));
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

    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;

    if (!email || !password) {
      dgShowMessage(message, 'Email and password are required.', 'error');
      return;
    }

    const user = dgFindUserByEmail(email);
    if (!user || user.password !== password) {
      dgShowMessage(message, 'Invalid email or password.', 'error');
      return;
    }

    if ((user.status || 'Active') === 'Disabled') {
      dgShowMessage(message, 'This account has been disabled. Please contact the administrator.', 'error');
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

function dgSetupLogoutButtons() {
  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', dgLogout);
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
  redirectByRole: dgRedirectByRole
};
