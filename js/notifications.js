(function () {
  const STORAGE_KEY = 'dg_notifications';
  const MAX_VISIBLE = 10;
  const DUPLICATE_WINDOW_MS = 5000;

  function getNotifications() {
    try {
      const notifications = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(notifications) ? notifications : [];
    } catch (error) {
      return [];
    }
  }

  function saveNotifications(notifications) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(notifications) ? notifications : []));
  }

  function currentUser() {
    return window.DGData ? DGData.getJson(DGData.keys.currentUser, null) : null;
  }

  function nextId(notifications) {
    const lastNumber = notifications.reduce((largest, notification) => {
      const number = Number(String(notification.id || '').replace('NOTIF-', ''));
      return Number.isFinite(number) ? Math.max(largest, number) : largest;
    }, 1000);
    return `NOTIF-${lastNumber + 1}`;
  }

  function isVisibleToUser(notification, user) {
    if (!notification || !user || notification.role !== user.role) return false;
    if (user.role === 'admin') return true;
    return Boolean(notification.userId && user.id && notification.userId === user.id);
  }

  function getCurrentUserNotifications() {
    const user = currentUser();
    return getNotifications()
      .filter((notification) => isVisibleToUser(notification, user))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  function getUnreadNotificationCountForCurrentUser() {
    return getCurrentUserNotifications().filter((notification) => !notification.isRead).length;
  }

  function addNotification(notification) {
    if (!notification || !notification.role || !notification.title || !notification.message) return null;
    if (notification.role !== 'admin' && !notification.userId) return null;
    const notifications = getNotifications();
    const now = new Date();
    const duplicate = notifications.find((item) => (
      item.role === notification.role &&
      (item.userId || '') === (notification.userId || '') &&
      (item.bookingId || '') === (notification.bookingId || '') &&
      (item.inquiryId || '') === (notification.inquiryId || '') &&
      item.type === notification.type &&
      item.title === notification.title &&
      item.message === notification.message &&
      now - new Date(item.createdAt || 0) < DUPLICATE_WINDOW_MS
    ));
    if (duplicate) return duplicate;
    const record = {
      id: nextId(notifications),
      role: notification.role,
      userId: notification.userId || '',
      title: notification.title,
      message: notification.message,
      type: notification.type || 'system',
      bookingId: notification.bookingId || '',
      inquiryId: notification.inquiryId || '',
      isRead: false,
      createdAt: notification.createdAt || now.toISOString()
    };
    notifications.push(record);
    saveNotifications(notifications);
    renderNavbarNotifications();
    return record;
  }

  function markNotificationAsRead(notificationId) {
    const user = currentUser();
    const notifications = getNotifications();
    const notification = notifications.find((item) => item.id === notificationId && isVisibleToUser(item, user));
    if (!notification) return;
    notification.isRead = true;
    saveNotifications(notifications);
    renderNavbarNotifications();
  }

  function markAllNotificationsAsReadForCurrentUser() {
    const user = currentUser();
    const notifications = getNotifications();
    notifications.forEach((notification) => {
      if (isVisibleToUser(notification, user)) notification.isRead = true;
    });
    saveNotifications(notifications);
    renderNavbarNotifications();
  }

  function showDropdownMessage(message) {
    const messageElement = document.querySelector('.notification-feedback');
    if (!messageElement) return;
    messageElement.textContent = message || '';
    messageElement.hidden = !message;
    window.clearTimeout(showDropdownMessage.timeoutId);
    if (message) {
      showDropdownMessage.timeoutId = window.setTimeout(() => {
        messageElement.textContent = '';
        messageElement.hidden = true;
      }, 2200);
    }
  }

  function clearReadNotificationsForCurrentUser() {
    const user = currentUser();
    const notifications = getNotifications();
    const nextNotifications = notifications.filter((notification) => (
      !isVisibleToUser(notification, user) || !notification.isRead
    ));
    if (nextNotifications.length === notifications.length) {
      showDropdownMessage('No read notifications to clear.');
      return false;
    }
    saveNotifications(nextNotifications);
    renderNavbarNotifications();
    showDropdownMessage('Read notifications cleared.');
    return true;
  }

  function buildNotificationLink(notification) {
    if (notification.role === 'client' && notification.bookingId) {
      return `booking-details.html?id=${encodeURIComponent(notification.bookingId)}&scroll=current-step`;
    }
    if (notification.role === 'staff' && notification.bookingId) {
      return `project-progress.html?id=${encodeURIComponent(notification.bookingId)}&scroll=current-step`;
    }
    if (notification.role === 'admin' && notification.bookingId) {
      const text = `${notification.type || ''} ${notification.title || ''} ${notification.message || ''}`.toLowerCase();
      let scroll = 'actions';
      if (text.includes('payment') || text.includes('receipt')) {
        scroll = 'payments';
      } else if (text.includes('meeting')) {
        scroll = 'meeting';
      } else if (text.includes('booking request') || text.includes('new booking')) {
        scroll = 'actions';
      }
      return `admin-booking-details.html?id=${encodeURIComponent(notification.bookingId)}&scroll=${encodeURIComponent(scroll)}`;
    }
    if (notification.role === 'admin' && notification.inquiryId) {
      return `manage-inquiries.html?inquiry=${encodeURIComponent(notification.inquiryId)}`;
    }
    return '';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function notificationMarkup(notification) {
    const link = buildNotificationLink(notification);
    return `
      <article class="notification-item${notification.isRead ? ' is-read' : ' is-unread'}" data-notification-id="${escapeHtml(notification.id)}">
        <div class="notification-item-heading">
          <span class="notification-dot" aria-hidden="true"></span>
          <strong>${escapeHtml(notification.title)}</strong>
        </div>
        <p>${escapeHtml(notification.message)}</p>
        <div class="notification-item-meta">
          <time>${escapeHtml(formatTime(notification.createdAt))}</time>
          ${link ? `<a href="${escapeHtml(link)}" data-notification-link="${escapeHtml(notification.id)}">View</a>` : ''}
        </div>
      </article>
    `;
  }

  function ensureNavbarShell() {
    const user = currentUser();
    const nav = document.querySelector('.dashboard-header .nav-links');
    if (!user || !nav) return null;
    let shell = nav.querySelector('.notification-shell');
    if (shell) return shell;
    shell = document.createElement('div');
    shell.className = 'notification-shell';
    shell.innerHTML = `
      <button class="notification-toggle" type="button" aria-expanded="false" aria-label="Notifications">
        <span>Notifications</span>
        <strong class="notification-count" hidden>0</strong>
      </button>
      <section class="notification-dropdown" hidden>
        <header class="notification-dropdown-header">
          <h2>Notifications</h2>
          <div class="notification-header-actions">
            <button type="button" data-notifications-read-all>Mark all as read</button>
            <button class="notification-clear-read" type="button" data-notifications-clear-read>Clear read</button>
          </div>
        </header>
        <p class="notification-feedback" role="status" hidden></p>
        <div class="notification-list"></div>
      </section>
    `;
    const logout = nav.querySelector('[data-logout]');
    nav.insertBefore(shell, logout || null);
    shell.querySelector('.notification-toggle').addEventListener('click', () => {
      const dropdown = shell.querySelector('.notification-dropdown');
      const open = dropdown.hidden;
      dropdown.hidden = !open;
      shell.querySelector('.notification-toggle').setAttribute('aria-expanded', String(open));
    });
    shell.querySelector('[data-notifications-read-all]').addEventListener('click', markAllNotificationsAsReadForCurrentUser);
    shell.querySelector('[data-notifications-clear-read]').addEventListener('click', clearReadNotificationsForCurrentUser);
    shell.addEventListener('click', (event) => {
      const itemLink = event.target.closest('[data-notification-link]');
      const item = event.target.closest('[data-notification-id]');
      if (!item) return;
      const link = buildNotificationLink(getNotifications().find((notification) => notification.id === item.dataset.notificationId) || {});
      if (itemLink) event.preventDefault();
      markNotificationAsRead(item.dataset.notificationId);
      if (link) window.location.href = link;
    });
    document.addEventListener('click', (event) => {
      if (shell.contains(event.target)) return;
      shell.querySelector('.notification-dropdown').hidden = true;
      shell.querySelector('.notification-toggle').setAttribute('aria-expanded', 'false');
    });
    return shell;
  }

  function renderNavbarNotifications() {
    const shell = ensureNavbarShell();
    if (!shell) return;
    const notifications = getCurrentUserNotifications();
    const unread = notifications.filter((notification) => !notification.isRead).length;
    const badge = shell.querySelector('.notification-count');
    badge.textContent = unread > 99 ? '99+' : String(unread);
    badge.hidden = unread === 0;
    const list = shell.querySelector('.notification-list');
    list.innerHTML = notifications.length
      ? notifications.slice(0, MAX_VISIBLE).map(notificationMarkup).join('')
      : '<div class="notification-empty">No notifications yet.</div>';
  }

  document.addEventListener('DOMContentLoaded', renderNavbarNotifications);
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) renderNavbarNotifications();
  });

  window.DGNotifications = {
    getNotifications,
    saveNotifications,
    addNotification,
    getCurrentUserNotifications,
    getUnreadNotificationCountForCurrentUser,
    markNotificationAsRead,
    markAllNotificationsAsReadForCurrentUser,
    clearReadNotificationsForCurrentUser,
    buildNotificationLink,
    render: renderNavbarNotifications
  };
}());
