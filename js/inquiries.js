const DG_INQUIRY_STATUSES = ['New', 'Contacted', 'Ready to Book', 'Converted', 'Archived'];

function dgInquiryNotify(notification) {
  if (window.DGNotifications) DGNotifications.addNotification(notification);
}

function dgInquiryConfirmAction(options) {
  if (window.confirmAction) return window.confirmAction(options);
  return Promise.resolve().then(() => options.onConfirm());
}

function dgInquiryConfirmOptions(action, inquiryId) {
  const inquiry = dgInquiryRecords().find((item) => item.id === inquiryId) || {};
  const details = [`Lead ID: ${inquiryId}`];
  if (inquiry.fullName) details.push(`Client: ${inquiry.fullName}`);
  const configs = {
    convert: {
      title: 'Convert this lead to a booking?',
      message: 'This will create a booking record using the client inquiry details.',
      confirmText: 'Convert to Booking',
      cancelText: 'Review Lead',
      variant: 'warning'
    },
    archive: {
      title: 'Archive this lead?',
      message: 'This lead will be removed from the active lead list but can remain available for reference.',
      confirmText: 'Archive Lead',
      cancelText: 'Keep Lead',
      variant: 'danger'
    },
    restore: {
      title: 'Restore this lead?',
      message: 'This lead will return to the active lead workflow.',
      confirmText: 'Restore Lead',
      cancelText: 'Cancel',
      variant: 'warning'
    }
  };
  return { ...(configs[action] || configs.archive), details };
}

function dgInquiryAdminUser() {
  return DGRbac.requireRoles(['admin']);
}

function dgInquiryEscape(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function dgInquiryNormalize(inquiry) {
  if (!inquiry.status || inquiry.status === 'Reviewed') inquiry.status = inquiry.status === 'Reviewed' ? 'Contacted' : 'New';
  if (!DG_INQUIRY_STATUSES.includes(inquiry.status)) inquiry.status = 'New';
  return inquiry;
}

function dgInquiryRecords() {
  const inquiries = DGData.getJson(DGData.keys.inquiries, []);
  let changed = false;
  inquiries.forEach((inquiry) => {
    const before = inquiry.status;
    dgInquiryNormalize(inquiry);
    if (before !== inquiry.status) changed = true;
  });
  if (changed) DGData.setJson(DGData.keys.inquiries, inquiries);
  return inquiries;
}

function dgInquiryBadge(status) {
  const normalized = status || 'New';
  const className = normalized.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `<span class="badge status-${className}">${dgInquiryEscape(normalized)}</span>`;
}

function dgInquiryDisplayDate(value) {
  if (!value) return 'Not provided';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return dgInquiryEscape(value);
  return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function dgInquiryDisplayDateTime(value) {
  if (!value) return 'Not provided';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return dgInquiryEscape(value);
  return date.toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function dgInquiryNextId(prefix, records) {
  const values = records
    .map((record) => Number(String(record.id || '').replace(`${prefix}-`, '')))
    .filter(Number.isFinite);
  return `${prefix}-${Math.max(1000, ...values) + 1}`;
}

function dgInquirySetMessage(message, type = 'success') {
  const element = document.getElementById('inquiryAdminMessage');
  if (!element) return;
  element.textContent = message || '';
  element.className = message ? `form-message ${type}` : 'form-message';
}

function dgInquiryAdminName(currentUser) {
  return currentUser.name || currentUser.fullName || currentUser.email;
}

function dgInquiryValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function dgInquiryValidPassword(password) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
}

function dgInquiryMailtoLink(inquiry) {
  const email = String(inquiry.email || '').trim();
  if (!email) return '';
  const subject = 'DG Film Co. Inquiry';
  const body = `Hi ${inquiry.fullName || 'there'},

Thank you for reaching out to DG Film Co. We reviewed your inquiry about ${inquiry.serviceType || 'your project'}.

We would like to discuss your preferred date, coverage needs, budget, and next steps.

Best,
DG Film Co.`;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function dgInquiryReplyAction(inquiry) {
  const mailto = dgInquiryMailtoLink(inquiry);
  if (mailto) return `<a class="btn ghost small" href="${dgInquiryEscape(mailto)}">Reply by Email</a>`;
  return '<button class="btn ghost small inquiry-disabled-action" type="button" data-inquiry-action="noEmail" aria-disabled="true">Reply by Email</button>';
}

function dgInquirySaveStatus(inquiryId, status) {
  const currentUser = dgInquiryAdminUser();
  if (!currentUser || !DG_INQUIRY_STATUSES.includes(status)) return false;
  const inquiries = dgInquiryRecords();
  const inquiry = inquiries.find((item) => item.id === inquiryId);
  if (!inquiry || inquiry.status === 'Converted' && status !== 'Archived' || inquiry.status === 'Archived' && status !== 'New') return false;
  if (status === 'Archived') inquiry.statusBeforeArchive = inquiry.status;
  const resultingStatus = status === 'New' && DG_INQUIRY_STATUSES.includes(inquiry.statusBeforeArchive)
    ? inquiry.statusBeforeArchive
    : status;
  inquiry.status = resultingStatus;
  const prefix = status.toLowerCase().replace(/\s+/g, '');
  inquiry[`${prefix}At`] = new Date().toISOString();
  inquiry[`${prefix}By`] = dgInquiryAdminName(currentUser);
  DGData.setJson(DGData.keys.inquiries, inquiries);
  if (resultingStatus === 'Ready to Book') {
    dgInquiryNotify({
      role: 'admin',
      title: 'Lead ready to book',
      message: `${inquiry.fullName || inquiry.id} is qualified and ready to convert into a booking.`,
      type: 'inquiry',
      inquiryId: inquiry.id
    });
  }
  const messages = {
    Contacted: `Lead ${inquiryId} marked as contacted.`,
    'Ready to Book': `Lead ${inquiryId} is ready to book.`,
    Archived: `Lead ${inquiryId} archived.`,
    New: `Lead ${inquiryId} restored.`
  };
  dgInquirySetMessage(messages[status] || `Lead ${inquiryId} updated.`);
  return true;
}

function dgInquiryFindClient(email) {
  const normalized = String(email || '').trim().toLowerCase();
  return DGData.getJson(DGData.keys.users, [])
    .find((user) => user.role === 'client' && String(user.email || '').toLowerCase() === normalized) || null;
}

function dgInquiryConvertWithClient(inquiryId, client) {
  const currentUser = dgInquiryAdminUser();
  if (!currentUser || !client) return false;
  const inquiries = dgInquiryRecords();
  const inquiry = inquiries.find((item) => item.id === inquiryId);
  if (!inquiry || !['New', 'Contacted', 'Ready to Book'].includes(inquiry.status)) return false;
  const bookings = DGData.getJson(DGData.keys.bookings, []);
  const services = DGData.getJson(DGData.keys.services, []);
  const service = services.find((item) => item.name === inquiry.serviceType);
  const now = new Date().toISOString();
  const booking = {
    id: dgInquiryNextId('BKG', bookings),
    clientId: client.id,
    clientName: inquiry.fullName || client.fullName,
    clientEmail: client.email,
    serviceId: service ? service.id : '',
    serviceName: inquiry.serviceType,
    serviceType: inquiry.serviceType,
    packageId: '',
    packageName: 'To be confirmed',
    eventDate: inquiry.preferredDate || (inquiry.isDateFlexible ? 'Flexible' : ''),
    isDateFlexible: Boolean(inquiry.isDateFlexible),
    eventTime: '',
    location: inquiry.locationCity || '',
    budget: inquiry.budgetRange || '',
    budgetRange: inquiry.budgetRange || '',
    contactNumber: inquiry.mobileNumber || '',
    preferredMeetingMode: '',
    preferredMeetingNotes: '',
    details: inquiry.message || inquiry.celebrationMoments || 'Inquiry converted for booking review.',
    eventDetails: inquiry.message || inquiry.celebrationMoments || 'Inquiry converted for booking review.',
    notes: inquiry.celebrationMoments ? `Inquiry project detail: ${inquiry.celebrationMoments}` : '',
    status: 'Pending Review',
    meetingStatus: 'Not Scheduled',
    paymentStatus: 'Not Required Yet',
    meetingDate: '',
    meetingTime: '',
    meetingMode: '',
    meetingLocation: '',
    meetingNotes: '',
    assignedStaffId: null,
    assignedStaff: '',
    createdAt: now,
    source: 'Inquiry Converted',
    sourceInquiryId: inquiry.id,
    history: [{
      date: now,
      action: 'Booking created from inquiry',
      by: dgInquiryAdminName(currentUser)
    }]
  };
  bookings.push(booking);
  inquiry.email = inquiry.email || client.email;
  inquiry.status = 'Converted';
  inquiry.convertedBookingId = booking.id;
  inquiry.convertedAt = now;
  inquiry.convertedBy = dgInquiryAdminName(currentUser);
  DGData.setJson(DGData.keys.bookings, bookings);
  DGData.setJson(DGData.keys.inquiries, inquiries);
  dgInquiryNotify({
    role: 'admin',
    title: 'Inquiry converted to booking',
    message: `${inquiry.fullName || inquiry.id} was converted to booking ${booking.id}.`,
    type: 'booking',
    bookingId: booking.id,
    inquiryId: inquiry.id
  });
  dgInquiryNotify({
    role: 'client',
    userId: booking.clientId,
    title: 'Booking created',
    message: `Your inquiry has been converted to booking ${booking.id} for review.`,
    type: 'booking',
    bookingId: booking.id
  });
  dgInquirySetMessage(`Lead ${inquiryId} converted to booking ${booking.id}.`);
  return true;
}

function dgInquiryActionMenu(inquiry) {
  const id = dgInquiryEscape(inquiry.id);
  const normal = [];
  const danger = [];
  const action = (label, name) => `<button class="btn ghost small" type="button" data-inquiry-action="${name}" data-id="${id}">${label}</button>`;
  const dangerous = (label, name) => `<button class="btn danger small" type="button" data-inquiry-action="${name}" data-id="${id}">${label}</button>`;
  const reply = dgInquiryReplyAction(inquiry);

  if (inquiry.status === 'New') {
    normal.push(reply, action('Mark as Contacted', 'contact'), action('Mark as Ready to Book', 'ready'), action('Convert to Booking', 'convert'));
    danger.push(dangerous('Archive', 'archive'));
  } else if (inquiry.status === 'Contacted') {
    normal.push(reply, action('Mark as Ready to Book', 'ready'), action('Convert to Booking', 'convert'));
    danger.push(dangerous('Archive', 'archive'));
  } else if (inquiry.status === 'Ready to Book') {
    normal.push(action('Convert to Booking', 'convert'), reply);
    danger.push(dangerous('Archive', 'archive'));
  } else if (inquiry.status === 'Converted') {
    normal.push(`<a class="btn ghost small" href="admin-booking-details.html?id=${dgInquiryEscape(inquiry.convertedBookingId)}">View Booking</a>`);
    danger.push(dangerous('Archive', 'archive'));
  } else {
    normal.push(action('View Lead', 'view'), action('Restore', 'restore'));
  }
  return `
    <details class="lead-more-actions">
      <summary class="lead-more-toggle" aria-label="More actions for ${id}" title="More actions">&#8942;</summary>
      <div class="lead-actions-menu">
        ${normal.join('')}
        ${danger.length ? `<div class="lead-danger-actions">${danger.join('')}</div>` : ''}
      </div>
    </details>
  `;
}

function dgInquiryModalActions(inquiry) {
  const id = dgInquiryEscape(inquiry.id);
  const controls = [];
  if (!['Converted', 'Archived'].includes(inquiry.status)) controls.push(dgInquiryReplyAction(inquiry));
  if (inquiry.status === 'New') controls.push(`<button class="btn ghost small" type="button" data-inquiry-action="contact" data-id="${id}">Mark as Contacted</button>`);
  if (['New', 'Contacted'].includes(inquiry.status)) controls.push(`<button class="btn ghost small" type="button" data-inquiry-action="ready" data-id="${id}">Mark as Ready to Book</button>`);
  if (['New', 'Contacted', 'Ready to Book'].includes(inquiry.status)) controls.push(`<button class="btn primary small" type="button" data-inquiry-action="convert" data-id="${id}">Convert to Booking</button>`);
  if (inquiry.status === 'Converted') controls.push(`<a class="btn primary small" href="admin-booking-details.html?id=${dgInquiryEscape(inquiry.convertedBookingId)}">View Booking</a>`);
  if (inquiry.status !== 'Archived') controls.push(`<button class="btn danger small" type="button" data-inquiry-action="archive" data-id="${id}">Archive</button>`);
  if (inquiry.status === 'Archived') controls.push(`<button class="btn ghost small" type="button" data-inquiry-action="restore" data-id="${id}">Restore</button>`);
  return controls.join('');
}

function dgRenderInquiries() {
  const body = document.getElementById('inquiriesBody');
  if (!body || !dgInquiryAdminUser()) return;
  const search = document.getElementById('inquirySearch');
  const statusFilter = document.getElementById('inquiryStatusFilter');
  const serviceFilter = document.getElementById('inquiryServiceFilter');
  const leadModal = document.getElementById('leadDetailsModal');
  const leadContent = document.getElementById('leadDetailsContent');
  const leadActions = document.getElementById('leadDetailsActions');
  const accountModal = document.getElementById('leadAccountModal');
  const accountForm = document.getElementById('leadAccountForm');
  const accountMessage = document.getElementById('leadAccountMessage');
  const requestedInquiryId = new URLSearchParams(window.location.search).get('inquiry');
  let requestedInquiryOpened = false;
  let activeLeadId = '';

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  const setAccountError = (field, message) => {
    const target = accountForm.querySelector(`[data-error-for="${field}"]`);
    if (target) target.textContent = message || '';
  };

  const populateServices = (inquiries) => {
    const selected = serviceFilter.value;
    const services = [...new Set(inquiries.map((inquiry) => inquiry.serviceType).filter(Boolean))].sort();
    serviceFilter.innerHTML = '<option value="All">All services</option>' + services
      .map((service) => `<option value="${dgInquiryEscape(service)}">${dgInquiryEscape(service)}</option>`)
      .join('');
    if (services.includes(selected)) serviceFilter.value = selected;
  };

  const openLead = (inquiryId) => {
    const inquiry = dgInquiryRecords().find((item) => item.id === inquiryId);
    if (!inquiry) return;
    activeLeadId = inquiry.id;
    leadContent.innerHTML = `
      <div class="lead-details-heading">
        <div><p class="eyebrow">${dgInquiryEscape(inquiry.id)}</p><h3>${dgInquiryEscape(inquiry.fullName || 'Unnamed lead')}</h3></div>
        ${dgInquiryBadge(inquiry.status)}
      </div>
      <dl class="lead-details-grid">
        <div><dt>Inquiry ID</dt><dd>${dgInquiryEscape(inquiry.id)}</dd></div>
        <div><dt>Name</dt><dd>${dgInquiryEscape(inquiry.fullName || 'Not provided')}</dd></div>
        <div><dt>Email</dt><dd>${dgInquiryEscape(inquiry.email || 'Not provided')}</dd></div>
        <div><dt>Mobile Number</dt><dd>${dgInquiryEscape(inquiry.mobileNumber || 'Not provided')}</dd></div>
        <div><dt>Service Type</dt><dd>${dgInquiryEscape(inquiry.serviceType || 'Not provided')}</dd></div>
        <div><dt>Preferred Date</dt><dd>${dgInquiryDisplayDate(inquiry.preferredDate)}</dd></div>
        <div><dt>Flexible Date</dt><dd>${inquiry.isDateFlexible ? 'Yes' : 'No'}</dd></div>
        <div><dt>Location</dt><dd>${dgInquiryEscape(inquiry.locationCity || 'Not provided')}</dd></div>
        <div><dt>Budget</dt><dd>${dgInquiryEscape(inquiry.budgetRange || 'Not provided')}</dd></div>
        <div><dt>Referral Source</dt><dd>${dgInquiryEscape(inquiry.referralSource || 'Not provided')}</dd></div>
        <div><dt>Submitted Date</dt><dd>${dgInquiryDisplayDateTime(inquiry.createdAt)}</dd></div>
        <div><dt>Status</dt><dd>${dgInquiryBadge(inquiry.status)}</dd></div>
        <div class="wide"><dt>Project Details</dt><dd>${dgInquiryEscape(inquiry.celebrationMoments || 'Not provided')}</dd></div>
        <div class="wide"><dt>Message / Notes</dt><dd>${dgInquiryEscape(inquiry.message || 'Not provided')}</dd></div>
      </dl>
    `;
    leadActions.innerHTML = dgInquiryModalActions(inquiry);
    leadModal.hidden = false;
  };

  const closeLead = () => {
    leadModal.hidden = true;
    activeLeadId = '';
  };

  const openAccountSetup = (inquiry) => {
    accountForm.reset();
    accountForm.inquiryId.value = inquiry.id;
    accountForm.email.value = inquiry.email || '';
    ['email', 'temporaryPassword', 'confirmTemporaryPassword'].forEach((field) => setAccountError(field, ''));
    accountMessage.textContent = '';
    accountMessage.className = 'form-message';
    accountModal.hidden = false;
    accountForm.email.focus();
  };

  const closeAccountSetup = () => {
    accountModal.hidden = true;
    accountForm.reset();
  };

  const closeActionMenus = () => {
    body.querySelectorAll('.lead-more-actions[open]').forEach((menu) => {
      menu.open = false;
      menu.classList.remove('menu-positioned');
    });
  };

  const positionActionMenu = (menu) => {
    const toggle = menu.querySelector('.lead-more-toggle');
    const popup = menu.querySelector('.lead-actions-menu');
    if (!toggle || !popup || !menu.open) return;
    const toggleRect = toggle.getBoundingClientRect();
    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;
    const margin = 12;
    const top = toggleRect.top > popupHeight + margin
      ? toggleRect.top - popupHeight - 7
      : toggleRect.bottom + 7;
    const left = Math.min(
      Math.max(margin, toggleRect.right - popupWidth),
      window.innerWidth - popupWidth - margin
    );
    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
    menu.classList.add('menu-positioned');
  };

  const beginConvert = (inquiryId) => {
    const inquiry = dgInquiryRecords().find((item) => item.id === inquiryId);
    if (!inquiry) return false;
    const client = dgInquiryFindClient(inquiry.email);
    if (client) return dgInquiryConvertWithClient(inquiryId, client);
    const email = String(inquiry.email || '').trim().toLowerCase();
    const existingUser = DGData.getJson(DGData.keys.users, []).find((user) => String(user.email || '').toLowerCase() === email);
    if (existingUser) {
      dgInquirySetMessage('This email belongs to a non-client account and cannot be linked to a client booking.', 'error');
      return false;
    }
    openAccountSetup(inquiry);
    return false;
  };

  const render = () => {
    const allInquiries = dgInquiryRecords();
    populateServices(allInquiries);
    setText('newLeadCount', allInquiries.filter((inquiry) => inquiry.status === 'New').length);
    setText('contactedLeadCount', allInquiries.filter((inquiry) => inquiry.status === 'Contacted').length);
    setText('readyLeadCount', allInquiries.filter((inquiry) => inquiry.status === 'Ready to Book').length);
    setText('convertedLeadCount', allInquiries.filter((inquiry) => inquiry.status === 'Converted').length);
    setText('archivedLeadCount', allInquiries.filter((inquiry) => inquiry.status === 'Archived').length);
    const query = String(search.value || '').toLowerCase();
    const status = statusFilter.value;
    const service = serviceFilter.value;
    const inquiries = allInquiries
      .filter((inquiry) => status === 'All' || inquiry.status === status)
      .filter((inquiry) => service === 'All' || inquiry.serviceType === service)
      .filter((inquiry) => `${inquiry.id} ${inquiry.fullName} ${inquiry.email} ${inquiry.mobileNumber} ${inquiry.serviceType} ${inquiry.locationCity}`.toLowerCase().includes(query))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const emptyMessage = allInquiries.length
      ? '<strong>No leads match your filters.</strong><span>Adjust your search or filters to view other inquiries.</span>'
      : '<strong>No client leads yet.</strong><span>Public inquiries will appear here once submitted.</span>';
    body.innerHTML = inquiries.length ? inquiries.map((inquiry) => `
      <tr>
        <td>${dgInquiryEscape(inquiry.id)}</td>
        <td><strong class="lead-name">${dgInquiryEscape(inquiry.fullName || 'Unnamed lead')}</strong><span class="lead-subtext">${dgInquiryEscape(inquiry.email || 'No email address')}</span></td>
        <td>${dgInquiryEscape(inquiry.mobileNumber || 'Not provided')}</td>
        <td>${dgInquiryEscape(inquiry.serviceType || 'Not provided')}</td>
        <td>${inquiry.isDateFlexible ? 'Flexible' : dgInquiryDisplayDate(inquiry.preferredDate)}</td>
        <td>${dgInquiryEscape(inquiry.locationCity || 'Not provided')}</td>
        <td>${dgInquiryBadge(inquiry.status)}</td>
        <td>
          <div class="lead-row-actions">
            <button class="btn primary small" type="button" data-inquiry-action="view" data-id="${dgInquiryEscape(inquiry.id)}">View Lead</button>
            ${dgInquiryActionMenu(inquiry)}
          </div>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="8"><div class="empty-state admin-table-empty">${emptyMessage}</div></td></tr>`;
    if (!requestedInquiryOpened && requestedInquiryId && allInquiries.some((inquiry) => inquiry.id === requestedInquiryId)) {
      requestedInquiryOpened = true;
      openLead(requestedInquiryId);
    }
    if (!leadModal.hidden && activeLeadId) openLead(activeLeadId);
  };

  const performAction = (action, inquiryId, triggerBtn) => {
    let changed = false;
    if (action === 'view') {
      openLead(inquiryId);
      return;
    }
    if (action === 'noEmail') {
      dgInquirySetMessage('No email address provided for this lead.', 'error');
      return;
    }
    const runAction = () => {
      const loadingMsgs = { contact: 'Updating lead...', ready: 'Updating lead...', archive: 'Archiving lead...', restore: 'Restoring lead...', convert: 'Converting to booking...' };
      const msg = loadingMsgs[action];
      if (msg && window.DGLoading) { DGLoading.show(msg); if (triggerBtn) DGLoading.disableButton(triggerBtn); }
      try {
        if (action === 'contact') changed = dgInquirySaveStatus(inquiryId, 'Contacted');
        if (action === 'ready') changed = dgInquirySaveStatus(inquiryId, 'Ready to Book');
        if (action === 'archive') changed = dgInquirySaveStatus(inquiryId, 'Archived');
        if (action === 'restore') changed = dgInquirySaveStatus(inquiryId, 'New');
        if (action === 'convert') changed = beginConvert(inquiryId);
      } finally {
        if (msg && window.DGLoading) { DGLoading.hide(); if (triggerBtn) DGLoading.enableButton(triggerBtn); }
      }
      if (changed) render();
    };
    if (['archive', 'restore', 'convert'].includes(action)) {
      dgInquiryConfirmAction({ ...dgInquiryConfirmOptions(action, inquiryId), onConfirm: runAction });
    } else {
      runAction();
    }
  };

  [search, statusFilter, serviceFilter].forEach((control) => control.addEventListener('input', render));
  body.addEventListener('click', (event) => {
    const moreToggle = event.target.closest('.lead-more-toggle');
    if (moreToggle) {
      body.querySelectorAll('.lead-more-actions[open]').forEach((menu) => {
        if (menu !== moreToggle.parentElement) {
          menu.open = false;
          menu.classList.remove('menu-positioned');
        }
      });
      const menu = moreToggle.parentElement;
      menu.classList.remove('menu-positioned');
      window.requestAnimationFrame(() => positionActionMenu(menu));
      return;
    }
    if (event.target.closest('.lead-actions-menu a')) {
      closeActionMenus();
      return;
    }
    const button = event.target.closest('[data-inquiry-action]');
    if (button) {
      closeActionMenus();
      performAction(button.dataset.inquiryAction, button.dataset.id, button);
    }
  });
  leadActions.addEventListener('click', (event) => {
    const button = event.target.closest('[data-inquiry-action]');
    if (button) performAction(button.dataset.inquiryAction, button.dataset.id, button);
  });
  document.querySelectorAll('[data-close-lead-modal]').forEach((button) => button.addEventListener('click', closeLead));
  document.querySelectorAll('[data-close-lead-account]').forEach((button) => button.addEventListener('click', closeAccountSetup));
  [leadModal, accountModal].forEach((modal) => modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      if (modal === leadModal) closeLead();
      else closeAccountSetup();
    }
  }));
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!accountModal.hidden) closeAccountSetup();
    else if (!leadModal.hidden) closeLead();
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.lead-more-actions')) closeActionMenus();
  });
  window.addEventListener('resize', closeActionMenus);
  window.addEventListener('scroll', closeActionMenus, true);
  accountForm.addEventListener('submit', (event) => {
    event.preventDefault();
    ['email', 'temporaryPassword', 'confirmTemporaryPassword'].forEach((field) => setAccountError(field, ''));
    const inquiries = dgInquiryRecords();
    const inquiry = inquiries.find((item) => item.id === accountForm.inquiryId.value);
    if (!inquiry) return;
    const email = accountForm.email.value.trim().toLowerCase();
    const password = accountForm.temporaryPassword.value;
    const confirmation = accountForm.confirmTemporaryPassword.value;
    let valid = true;
    const fail = (field, message) => { setAccountError(field, message); valid = false; };
    if (!dgInquiryValidEmail(email)) fail('email', 'Valid email is required.');
    const users = DGData.getJson(DGData.keys.users, []);
    const existing = users.find((user) => String(user.email || '').toLowerCase() === email);
    if (existing && existing.role !== 'client') fail('email', 'This email is assigned to a non-client account.');
    if (!existing && !dgInquiryValidPassword(password)) fail('temporaryPassword', 'Password needs 8 chars, uppercase, lowercase, and number.');
    if (!existing && password !== confirmation) fail('confirmTemporaryPassword', 'Passwords must match.');
    if (!valid) return;
    const client = existing || DGData.createUser(inquiry.fullName || 'Client', email, password, 'client');
    if (!existing) {
      users.push(client);
      DGData.setJson(DGData.keys.users, users);
    }
    inquiry.email = email;
    DGData.setJson(DGData.keys.inquiries, inquiries);
    closeAccountSetup();
    if (dgInquiryConvertWithClient(inquiry.id, client)) render();
  });
  render();
}

document.addEventListener('DOMContentLoaded', dgRenderInquiries);
