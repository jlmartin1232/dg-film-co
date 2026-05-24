const DG_STAFF_FLOW = {
  Scheduled: 'On Shoot',
  'On Shoot': 'Editing',
  Editing: 'Ready for Delivery',
  'Ready for Delivery': 'Completed'
};

const DG_STAFF_PHASES = ['Scheduled', 'On Shoot', 'Editing', 'Ready for Delivery', 'Completed'];

function dgStaffProductionStatuses() {
  return DG_STAFF_PHASES;
}

function dgStaffStepTargetId(status) {
  const targets = {
    Scheduled: 'staff-step-scheduled',
    'On Shoot': 'staff-step-on-shoot',
    Editing: 'staff-step-editing',
    'Ready for Delivery': 'staff-step-delivery',
    Completed: 'staff-step-completed',
    Cancelled: 'staff-step-summary',
    Rejected: 'staff-step-summary'
  };
  return targets[status] || 'staff-step-summary';
}

function dgStaffFocusCurrentStep(booking, params) {
  if (params.get('scroll') !== 'current-step') return;
  const target = document.getElementById(dgStaffStepTargetId(booking.status));
  if (!target) return;

  window.requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target.classList.add('staff-step-focus');
    window.setTimeout(() => target.classList.remove('staff-step-focus'), 2000);
  });
}

function dgStaffCurrentUser() {
  return DGRbac.requireRoles(DGRbac.staffWorkflowRoles());
}

function dgStaffBookings() {
  return DGData.getJson(DGData.keys.bookings, []);
}

function dgStaffSaveBookings(bookings) {
  DGData.setJson(DGData.keys.bookings, bookings);
}

function dgStaffNotify(notification) {
  if (window.DGNotifications) DGNotifications.addNotification(notification);
}

function dgStaffNotifyClient(booking, title, message, type) {
  if (!booking || !booking.clientId) return;
  dgStaffNotify({
    role: 'client',
    userId: booking.clientId,
    bookingId: booking.id,
    title,
    message,
    type
  });
}

function dgStaffNotifyAdmin(title, message, type, bookingId) {
  dgStaffNotify({ role: 'admin', title, message, type, bookingId });
}

function dgStaffNotifyAssigned(booking, title, message, type) {
  if (!booking || !booking.assignedStaffId) return;
  dgStaffNotify({
    role: 'staff',
    userId: booking.assignedStaffId,
    bookingId: booking.id,
    title,
    message,
    type
  });
}

function dgStaffUsers() {
  return DGData.getJson(DGData.keys.users, []);
}

function dgStaffEscape(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function dgStaffBadge(status) {
  const slug = String(status || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const productionClass = dgStaffProductionClass(status, 'badge');
  return `<span class="badge status-${slug} ${productionClass}">${dgStaffEscape(status || 'Not Set')}</span>`;
}

function dgStaffProductionClass(status, prefix = 'status') {
  const classMap = {
    Scheduled: 'scheduled',
    'On Shoot': 'on-shoot',
    Editing: 'editing',
    'Ready for Delivery': 'ready',
    Completed: 'completed',
    Rejected: 'rejected',
    Cancelled: 'cancelled'
  };
  const suffix = classMap[status] || String(status || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${prefix}-${suffix}`;
}

function dgStaffProductionMeaning(status) {
  const meanings = {
    Scheduled: 'Shoot has been scheduled.',
    'On Shoot': 'Coverage is currently active or in progress.',
    Editing: 'Footage and photos are in post-production.',
    'Ready for Delivery': 'Outputs are ready for release or review.',
    Completed: 'Final outputs have been delivered.',
    Rejected: 'Project is not active.',
    Cancelled: 'Project is not active.'
  };
  return meanings[status] || 'Production status is being tracked.';
}

function dgStaffProductionHelper(status) {
  const helpers = {
    Scheduled: 'Production is scheduled. Move to On Shoot once the team begins coverage.',
    'On Shoot': 'Coverage is currently active. Move to Editing after the shoot is completed and files are ready for post-production.',
    Editing: 'Post-production is in progress. Move to Ready for Delivery once editing and review are complete.',
    'Ready for Delivery': 'Final outputs are prepared. Completion and delivery require the balance payment to be fully verified.',
    Completed: 'This project has been completed. No further status updates are required.'
  };
  return helpers[status] || 'Status update is not available for this booking.';
}

function dgStaffIsFullyPaid(booking) {
  if (!booking.invoice) return false;
  return booking.invoice.downPaymentStatus === 'Verified' &&
    booking.invoice.balanceStatus === 'Verified' &&
    booking.invoice.invoiceStatus === 'Paid';
}

function dgStaffMoney(value) {
  return `PHP ${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function dgStaffBillingRequiredCard(booking, currentUser) {
  const invoice = booking.invoice;
  const isAdmin = currentUser && currentUser.role === 'admin';
  const balStatus = invoice ? invoice.balanceStatus : 'Unpaid';
  const isPending = balStatus === 'Pending Verification';

  const roleMessage = isAdmin
    ? `<a class="btn ghost small" href="admin-booking-details.html?id=${dgStaffEscape(booking.id)}">View Billing / Verify Payment</a>`
    : `<p class="table-helper">Please notify Admin that the client must settle the remaining balance before delivery can proceed.</p>`;

  const pendingNote = isPending
    ? `<div class="balance-warning">Balance payment is pending admin verification. Completion is locked until verification is complete.</div>`
    : `<div class="balance-warning urgent">The final output is ready, but it cannot be released until the remaining balance is settled and verified by Admin.</div>`;

  return `
    <div class="billing-required-card">
      <div class="billing-required-header">
        <div>
          <p class="eyebrow">Payment required</p>
          <h3>Balance Payment Required</h3>
        </div>
        <span class="badge status-payment-rejected" style="background:rgba(255,90,72,0.12);color:#ffb4a8;border-color:rgba(255,180,168,0.34);">Delivery Locked</span>
      </div>
      ${pendingNote}
      ${invoice ? `
        <dl class="details-grid compact-details" style="margin-top:12px;">
          <div><dt>Invoice ID</dt><dd>${dgStaffEscape(invoice.invoiceId)}</dd></div>
          <div><dt>Total Amount</dt><dd>${dgStaffMoney(invoice.totalAmount)}</dd></div>
          <div><dt>Down Payment Status</dt><dd>${dgStaffBadge(invoice.downPaymentStatus)}</dd></div>
          <div><dt>Balance Amount</dt><dd>${dgStaffMoney(invoice.balanceAmount)}</dd></div>
          <div><dt>Balance Status</dt><dd>${dgStaffBadge(invoice.balanceStatus)}</dd></div>
          <div><dt>Invoice Status</dt><dd>${dgStaffBadge(invoice.invoiceStatus)}</dd></div>
        </dl>
      ` : '<p class="table-helper">No invoice found for this booking.</p>'}
      <div class="hero-actions" style="margin-top:12px;">
        ${roleMessage}
      </div>
    </div>
  `;
}

function dgStaffProductionStepState(booking, phase) {
  const currentIndex = DG_STAFF_PHASES.indexOf(booking.status);
  const phaseIndex = DG_STAFF_PHASES.indexOf(phase);
  if (currentIndex === -1 || phaseIndex === -1) return 'upcoming';
  if (phaseIndex < currentIndex) return 'completed';
  if (phaseIndex === currentIndex) return 'current';
  return 'upcoming';
}

function dgStaffProductionTracker(booking) {
  return `
    <nav class="production-tracker" aria-label="Production progress">
      ${DG_STAFF_PHASES.map((phase) => {
        const state = dgStaffProductionStepState(booking, phase);
        return `
          <article class="production-step ${state} ${dgStaffProductionClass(phase)}">
            <span class="production-marker">${state === 'completed' ? '✓' : state === 'current' ? '●' : '○'}</span>
            <div>
              <h3>${dgStaffEscape(phase)}</h3>
              <span class="state-badge">${state === 'completed' ? 'Completed' : state === 'current' ? 'Current Phase' : 'Upcoming'}</span>
              <p>${dgStaffEscape(dgStaffProductionMeaning(phase))}</p>
            </div>
          </article>
        `;
      }).join('')}
    </nav>
  `;
}

function dgStaffFormatDate(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? dgStaffEscape(value)
    : date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function dgStaffFormatDateTime(value) {
  if (!value) return 'Not set';
  return new Date(value).toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function dgStaffFormatFileSize(bytes) {
  const size = Number(bytes || 0);
  if (!size) return 'Not set';
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  return `${(size / 1024).toFixed(2)} KB`;
}

function dgStaffValidUrl(value) {
  return /^https?:\/\/\S+\.\S+/.test(value);
}

function dgStaffCompletionFields() {
  return `
    <section class="delivery-output-section">
      <h3>Final Output / Deliverables</h3>
      <div class="form-grid">
        <label>Output Link <span class="optional">Google Drive, Dropbox, gallery, Vimeo, etc.</span>
          <input type="url" name="deliveryOutputLink" placeholder="Paste Google Drive, Dropbox, online gallery, Vimeo, or final output link" />
          <span class="field-error" data-error-for="deliveryOutputLink"></span>
        </label>
        <label>ZIP File Upload <span class="optional">Optional archive file</span>
          <input type="file" name="deliveryFile" accept=".zip,.rar,.7z" />
          <span class="field-error" data-error-for="deliveryFile"></span>
        </label>
      </div>
      <label>Delivery Notes
        <textarea name="deliveryNotes" rows="4" placeholder="Describe what files were delivered to the client."></textarea>
        <span class="field-error" data-error-for="deliveryNotes"></span>
      </label>
      <p class="muted-text">Attach the final delivery link or archive details for project tracking.</p>
    </section>
  `;
}

function dgStaffDeliverySummary(booking) {
  const hasDelivery = booking.deliveryOutputLink || booking.deliveryFileName || booking.deliveryNotes || booking.deliveredAt;
  if (!hasDelivery) {
    return '<div class="empty-state">Project completed. Final deliverables have been released to the client.</div>';
  }
  return `
    <section class="delivery-output-section">
      <h3>Final Output / Deliverables</h3>
      <div class="delivery-card">
        ${booking.deliveryOutputLink ? `<p><strong>Output Link:</strong> <a class="text-link" href="${dgStaffEscape(booking.deliveryOutputLink)}" target="_blank" rel="noopener">Open final output</a></p>` : ''}
        ${booking.deliveryFileName ? `
          <div class="file-meta-card">
            <strong>ZIP File Details</strong>
            <p>File Name: ${dgStaffEscape(booking.deliveryFileName)}</p>
            <p>File Type: ${dgStaffEscape(booking.deliveryFileType || 'Not set')}</p>
            <p>File Size: ${dgStaffFormatFileSize(booking.deliveryFileSize)}</p>
            <p>Uploaded At: ${dgStaffFormatDateTime(booking.deliveryFileUploadedAt)}</p>
          </div>
        ` : ''}
        <p class="delivery-note"><strong>Delivery Notes:</strong> ${dgStaffEscape(booking.deliveryNotes || 'None')}</p>
        <p><strong>Delivered At:</strong> ${dgStaffFormatDateTime(booking.deliveredAt)}</p>
      </div>
    </section>
  `;
}

function dgStaffSetInlineError(form, fieldName, message) {
  const element = form.querySelector(`[data-error-for="${fieldName}"]`);
  if (element) element.textContent = message || '';
}

function dgStaffSetText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function dgStaffShowMessage(message, type = 'success') {
  const element = document.getElementById('staffMessage');
  if (!element) return;
  element.textContent = message;
  element.className = `form-message ${type}`;
}

function dgStaffConfirmAction(options) {
  if (window.confirmAction) return window.confirmAction(options);
  return Promise.resolve().then(() => options.onConfirm());
}

function dgStaffStatusConfirmOptions(nextStatus, booking) {
  const details = [`Booking ID: ${booking.id}`];
  if (booking.clientName) details.push(`Client: ${booking.clientName}`);
  const configs = {
    'On Shoot': {
      title: 'Start shoot progress?',
      message: 'This will move the project to the on-shoot stage. Continue only if the shoot is starting or currently in progress.',
      confirmText: 'Move to On Shoot',
      cancelText: 'Cancel',
      variant: 'warning'
    },
    Editing: {
      title: 'Move project to editing?',
      message: 'This will mark the shoot stage as done and move the project to editing.',
      confirmText: 'Move to Editing',
      cancelText: 'Cancel',
      variant: 'warning'
    },
    'Ready for Delivery': {
      title: 'Mark project ready for delivery?',
      message: 'Continue only if the final files are prepared and ready to be shared with the client.',
      confirmText: 'Mark Ready for Delivery',
      cancelText: 'Not Yet',
      variant: 'warning'
    },
    Completed: {
      title: 'Mark project as completed?',
      message: 'Only continue if final deliverables have been provided and the client required balance has been settled.',
      confirmText: 'Mark Completed',
      cancelText: 'Not Yet',
      variant: 'success'
    }
  };
  return { ...(configs[nextStatus] || configs['On Shoot']), details };
}

function dgStaffIsActiveProject(booking) {
  return booking.status !== 'Rejected' && booking.status !== 'Cancelled';
}

function dgStaffAssignedProjects(currentUser) {
  return dgStaffBookings().filter((booking) => {
    if (!dgStaffIsActiveProject(booking)) return false;
    if (!dgStaffProductionStatuses().includes(booking.status)) return false;
    if (currentUser.role === 'admin') return true;
    return booking.assignedStaffId === currentUser.id;
  });
}

function dgStaffCanAccessBooking(booking, currentUser) {
  if (!booking || !dgStaffProductionStatuses().includes(booking.status)) return false;
  if (currentUser.role === 'admin') return true;
  return booking.assignedStaffId === currentUser.id;
}

function dgStaffName(booking) {
  if (booking.assignedStaffName) return booking.assignedStaffName;
  const staff = dgStaffUsers().find((user) => user.id === booking.assignedStaffId);
  return staff ? staff.fullName : 'Not assigned';
}

function dgStaffProductionTimeline(booking) {
  const notes = Array.isArray(booking.productionNotes) ? booking.productionNotes : [];
  if (!notes.length) return '<div class="empty-state">No production updates yet.</div>';
  return `<div class="history-list">${notes.slice().reverse().map((item) => `
    <article class="history-item">
      <strong>${dgStaffEscape(item.statusFrom)} to ${dgStaffEscape(item.statusTo)}</strong>
      <span>${dgStaffFormatDateTime(item.date)} by ${dgStaffEscape(item.by)} (${dgStaffEscape(item.byRole)})</span>
      <p>${dgStaffEscape(item.note)}</p>
    </article>
  `).join('')}</div>`;
}

function dgStaffShowAdminLinks(currentUser) {
  document.querySelectorAll('[data-admin-only]').forEach((element) => {
    element.style.display = currentUser && currentUser.role === 'admin' ? '' : 'none';
  });
}

function dgStaffRenderDashboard() {
  const body = document.getElementById('recentAssignedProjectsBody');
  if (!body) return;
  const currentUser = dgStaffCurrentUser();
  if (!currentUser) return;
  dgStaffShowAdminLinks(currentUser);

  const projects = dgStaffAssignedProjects(currentUser);
  dgStaffSetText('welcomeName', currentUser.name || currentUser.fullName || 'Staff');
  dgStaffSetText('staffDashboardEyebrow', currentUser.role === 'admin' ? 'Production workflow' : 'Staff dashboard');
  dgStaffSetText('staffDashboardTitle', currentUser.role === 'admin' ? 'Production Workflow Overview' : 'Staff Dashboard');
  dgStaffSetText(
    'staffDashboardCopy',
    currentUser.role === 'admin'
      ? 'Review every scheduled production and update project progress when staff support is needed.'
      : 'Review assignments, shoots, editing tasks, and completed productions.'
  );
  dgStaffSetText('staffProjectsLabel', currentUser.role === 'admin' ? 'Production Projects' : 'Assigned Projects');
  dgStaffSetText('staffToolsEyebrow', currentUser.role === 'admin' ? 'Admin fallback tools' : 'Staff tools');
  dgStaffSetText(
    'staffToolsTitle',
    currentUser.role === 'admin'
      ? 'Open production projects and update progress as Admin.'
      : 'Open assigned projects and update production progress.'
  );
  dgStaffSetText('recentProjectsEyebrow', currentUser.role === 'admin' ? 'Production projects' : 'Assigned projects');
  dgStaffSetText('recentProjectsTitle', currentUser.role === 'admin' ? 'Recent production projects.' : 'Recent assigned projects.');
  dgStaffSetText('assignedProjects', projects.length);
  dgStaffSetText('scheduledShoots', projects.filter((booking) => booking.status === 'Scheduled').length);
  dgStaffSetText('onShootProjects', projects.filter((booking) => booking.status === 'On Shoot').length);
  dgStaffSetText('editingTasks', projects.filter((booking) => booking.status === 'Editing').length);
  dgStaffSetText('readyForDelivery', projects.filter((booking) => booking.status === 'Ready for Delivery').length);
  dgStaffSetText('completedProjects', projects.filter((booking) => booking.status === 'Completed').length);

  const latest = projects.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);
  body.innerHTML = latest.length ? latest.map((booking) => `
    <tr class="project-row ${dgStaffProductionClass(booking.status)}">
      <td>${dgStaffEscape(booking.id)}</td>
      <td>${dgStaffEscape(booking.clientName)}</td>
      <td>${dgStaffEscape(booking.serviceType)}</td>
      <td>${dgStaffFormatDate(booking.eventDate)}</td>
      <td>${dgStaffBadge(booking.status)}</td>
      <td>${dgStaffBadge(booking.paymentStatus)}</td>
      <td><a class="btn ghost small" href="project-progress.html?id=${dgStaffEscape(booking.id)}&amp;scroll=current-step">Update</a></td>
    </tr>
  `).join('') : `<tr><td colspan="7">${currentUser.role === 'admin' ? 'No production projects yet.' : 'No assigned projects yet.'}</td></tr>`;
}

function dgStaffRenderAssignedProjects() {
  const body = document.getElementById('assignedProjectsBody');
  if (!body) return;
  const currentUser = dgStaffCurrentUser();
  if (!currentUser) return;
  dgStaffShowAdminLinks(currentUser);
  dgStaffSetText('assignedProjectsEyebrow', currentUser.role === 'admin' ? 'Production workflow' : 'Staff projects');
  dgStaffSetText('assignedProjectsTitle', currentUser.role === 'admin' ? 'Production workflow projects.' : 'Assigned projects.');
  dgStaffSetText(
    'assignedProjectsCopy',
    currentUser.role === 'admin'
      ? 'Review all production projects and open any record to update progress as Admin.'
      : 'Review assigned work and open each project to update production progress.'
  );

  const search = document.getElementById('projectSearch');
  const statusFilter = document.getElementById('projectStatusFilter');
  const statusLabel = document.getElementById('projectStatusLabel');
  const requestedStatus = new URLSearchParams(window.location.search).get('status');
  if (DG_STAFF_PHASES.includes(requestedStatus)) {
    statusFilter.value = requestedStatus;
  }

  const render = () => {
    const query = (search.value || '').toLowerCase();
    const status = statusFilter.value;
    if (statusLabel) {
      statusLabel.textContent = `Showing: ${status === 'All' ? 'All Assigned Projects' : status}`;
    }
    const projects = dgStaffAssignedProjects(currentUser)
      .filter((booking) => status === 'All' || booking.status === status)
      .filter((booking) => `${booking.id} ${booking.clientName} ${booking.serviceType} ${booking.location}`.toLowerCase().includes(query))
      .sort((a, b) => new Date(a.eventDate || 0) - new Date(b.eventDate || 0));

    body.innerHTML = projects.length ? projects.map((booking) => `
      <tr class="project-row ${dgStaffProductionClass(booking.status)}">
        <td>${dgStaffEscape(booking.id)}</td>
        <td>${dgStaffEscape(booking.clientName)}</td>
        <td>${dgStaffEscape(booking.serviceType)}</td>
        <td>${dgStaffEscape(booking.packageName)}</td>
        <td>${dgStaffFormatDate(booking.eventDate)}</td>
        <td>${dgStaffEscape(booking.eventTime)}</td>
        <td>${dgStaffEscape(booking.location)}</td>
        <td>${dgStaffBadge(booking.status)}<p class="table-helper">${dgStaffEscape(dgStaffProductionMeaning(booking.status))}</p></td>
        <td>${dgStaffEscape(dgStaffName(booking))}</td>
        <td><a class="btn ghost small" href="project-progress.html?id=${dgStaffEscape(booking.id)}&amp;scroll=current-step">Update</a></td>
      </tr>
    `).join('') : status !== 'All'
      ? `<tr><td colspan="10" class="staff-empty-cell"><div class="staff-project-empty"><strong>No projects found for this status.</strong><a class="btn ghost small" href="assigned-projects.html">View all assigned projects</a></div></td></tr>`
      : `<tr><td colspan="10">${currentUser.role === 'admin' ? 'No production projects yet.' : 'No assigned projects yet.'}</td></tr>`;
  };

  search.addEventListener('input', render);
  statusFilter.addEventListener('change', () => {
    const url = new URL(window.location.href);
    if (statusFilter.value === 'All') {
      url.searchParams.delete('status');
    } else {
      url.searchParams.set('status', statusFilter.value);
    }
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    render();
  });
  render();
}

function dgStaffNextStatus(booking) {
  return DG_STAFF_FLOW[booking.status] || null;
}

function dgStaffCanUpdateStatus(booking) {
  if (!dgStaffNextStatus(booking) || !dgStaffIsActiveProject(booking)) return false;
  if (dgStaffNextStatus(booking) === 'Completed' && !dgStaffIsFullyPaid(booking)) return false;
  return true;
}

function dgStaffDeliveryLocked(booking) {
  return booking.status === 'Ready for Delivery' && !dgStaffIsFullyPaid(booking);
}

function dgStaffRenderProgress() {
  const panel = document.getElementById('projectProgressPanel');
  if (!panel) return;
  const currentUser = dgStaffCurrentUser();
  if (!currentUser) return;
  dgStaffShowAdminLinks(currentUser);

  const params = new URLSearchParams(window.location.search);
  const bookings = dgStaffBookings();
  const booking = bookings.find((item) => item.id === params.get('id'));
  if (!booking) {
    panel.innerHTML = '<div class="empty-state">Project not found. Return to Assigned Projects and choose another record.</div>';
    return;
  }

  if (!dgStaffCanAccessBooking(booking, currentUser)) {
    window.location.href = 'unauthorized.html';
    return;
  }

  const nextStatus = dgStaffNextStatus(booking);
  const canUpdate = dgStaffCanUpdateStatus(booking);
  const deliveryLocked = dgStaffDeliveryLocked(booking);
  const updaterName = currentUser.role === 'admin' ? 'Admin' : 'Staff';
  const updaterMessage = currentUser.role === 'admin'
    ? 'You are updating this project as Admin.'
    : 'You are updating this assigned project as Staff.';
  const updateStepId = dgStaffStepTargetId(booking.status);
  const updateStepAttribute = updateStepId === 'staff-step-summary' ? '' : ` id="${updateStepId}"`;

  let statusUpdateSection = '';
  if (booking.status === 'Completed') {
    statusUpdateSection = dgStaffDeliverySummary(booking);
  } else if (deliveryLocked) {
    statusUpdateSection = `
      ${dgStaffBillingRequiredCard(booking, currentUser)}
      <div class="empty-state" style="margin-top:12px;">Waiting for balance payment verification before final output can be released.</div>
    `;
  } else if (canUpdate) {
    statusUpdateSection = `
      <form class="inquiry-form progress-form" id="progressForm" novalidate>
        <p class="auth-copy next-status-line">Next status: <strong>${dgStaffEscape(nextStatus)}</strong> ${dgStaffBadge(nextStatus)}</p>
        <label>Production note / update note
          <textarea name="note" rows="4" placeholder="Describe what changed in production."></textarea>
          <span class="field-error" data-error-for="note"></span>
        </label>
        ${nextStatus === 'Completed' ? dgStaffCompletionFields() : ''}
        <div class="form-message error" id="completionBlockError" style="display:none;"></div>
        <button class="btn primary full" type="submit">Move to ${dgStaffEscape(nextStatus)}</button>
      </form>
    `;
  } else {
    statusUpdateSection = '<div class="empty-state">Status update is not available for this booking.</div>';
  }

  panel.innerHTML = `
    <section class="staff-progress-summary" id="staff-step-summary">
      <div class="details-header">
        <div><p class="eyebrow">${dgStaffEscape(booking.id)}</p><h1>${dgStaffEscape(booking.serviceType)}</h1></div>
        <div class="badge-row">${dgStaffBadge(booking.status)} ${dgStaffBadge(booking.paymentStatus)}</div>
      </div>
      <div class="role-context-note ${currentUser.role === 'admin' ? 'admin-context' : 'staff-context'}">
        <span>${dgStaffEscape(updaterMessage)}</span>
        <strong>${dgStaffEscape(updaterName)} workflow access</strong>
      </div>
      <dl class="details-grid">
        <div><dt>Client Name</dt><dd>${dgStaffEscape(booking.clientName)}</dd></div>
        <div><dt>Package</dt><dd>${dgStaffEscape(booking.packageName)}</dd></div>
        <div><dt>Event Date</dt><dd>${dgStaffFormatDate(booking.eventDate)}</dd></div>
        <div><dt>Event Time</dt><dd>${dgStaffEscape(booking.eventTime)}</dd></div>
        <div><dt>Location</dt><dd>${dgStaffEscape(booking.location)}</dd></div>
        <div><dt>Contact Number</dt><dd>${dgStaffEscape(booking.contactNumber)}</dd></div>
        <div><dt>Assigned Staff</dt><dd>${dgStaffEscape(dgStaffName(booking))}</dd></div>
        <div><dt>Created Date</dt><dd>${dgStaffFormatDateTime(booking.createdAt)}</dd></div>
        <div class="wide"><dt>Event Details</dt><dd>${dgStaffEscape(booking.details)}</dd></div>
      </dl>
    </section>
    <section class="detail-block">
      <h2>Production Progress</h2>
      <div class="current-production-phase ${dgStaffProductionClass(booking.status)}">
        <div>
          <p class="eyebrow">Current Production Phase</p>
          <h3>${dgStaffEscape(booking.status)}</h3>
          <p>${dgStaffEscape(dgStaffProductionHelper(booking.status))}</p>
        </div>
        ${dgStaffBadge(booking.status)}
      </div>
      ${dgStaffProductionTracker(booking)}
    </section>
    <section class="detail-block">
      <h2>Production Notes</h2>
      ${dgStaffProductionTimeline(booking)}
    </section>
    <section class="detail-block staff-status-update-section"${updateStepAttribute}>
      <h2>${booking.status === 'Ready for Delivery' ? 'Final Delivery' : 'Status Update'}</h2>
      ${statusUpdateSection}
      <div class="hero-actions">
        <a class="btn ghost" href="assigned-projects.html">Back to Assigned Projects</a>
      </div>
    </section>
  `;

  dgStaffFocusCurrentStep(booking, params);

  const form = document.getElementById('progressForm');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const error = form.querySelector('[data-error-for="note"]');
    const note = form.note.value.trim();
    error.textContent = '';
    ['deliveryOutputLink', 'deliveryFile', 'deliveryNotes'].forEach((field) => dgStaffSetInlineError(form, field, ''));

    if (!note) {
      error.textContent = 'Production note is required.';
      return;
    }

    if (note.length < 10) {
      error.textContent = 'Production note must be at least 10 characters.';
      return;
    }

    const freshBookings = dgStaffBookings();
    const freshBooking = freshBookings.find((item) => item.id === booking.id);
    const freshNextStatus = dgStaffNextStatus(freshBooking);
    if (!freshNextStatus || !dgStaffCanAccessBooking(freshBooking, currentUser)) {
      dgStaffShowMessage('This project can no longer be updated.', 'error');
      return;
    }

    if (['Ready for Delivery', 'Completed'].includes(freshNextStatus) && !dgStaffIsFullyPaid(freshBooking)) {
      dgStaffConfirmAction({
        title: 'Balance payment required',
        message: 'This project cannot be delivered or completed until the remaining balance is verified.',
        confirmText: 'Okay',
        cancelText: null,
        variant: 'warning',
        details: [`Booking ID: ${freshBooking.id}`],
        onConfirm: () => {}
      });
      const blockError = document.getElementById('completionBlockError');
      if (blockError) {
        blockError.textContent = 'Remaining balance must be verified before delivery or completion.';
        blockError.style.display = '';
      }
      return;
    }

    const completingProject = freshNextStatus === 'Completed';
    let deliveryOutputLink = '';
    let deliveryNotes = '';
    let deliveryFile = null;
    if (completingProject) {
      deliveryOutputLink = form.deliveryOutputLink.value.trim();
      deliveryNotes = form.deliveryNotes.value.trim();
      deliveryFile = form.deliveryFile.files[0] || null;
      const extension = deliveryFile ? deliveryFile.name.split('.').pop().toLowerCase() : '';
      const allowedExtensions = ['zip', 'rar', '7z'];
      let deliveryValid = true;

      if (!deliveryOutputLink && !deliveryFile) {
        dgStaffSetInlineError(form, 'deliveryOutputLink', 'Add an output link or upload a ZIP/RAR/7Z file.');
        dgStaffSetInlineError(form, 'deliveryFile', 'Add a ZIP/RAR/7Z file or provide an output link.');
        deliveryValid = false;
      }
      if (deliveryOutputLink && !dgStaffValidUrl(deliveryOutputLink)) {
        dgStaffSetInlineError(form, 'deliveryOutputLink', 'Output link must start with http:// or https:// and look like a valid URL.');
        deliveryValid = false;
      }
      if (deliveryFile && !allowedExtensions.includes(extension)) {
        dgStaffSetInlineError(form, 'deliveryFile', 'Allowed file types are zip, rar, or 7z.');
        deliveryValid = false;
      }
      if (deliveryFile && deliveryFile.size > 50 * 1024 * 1024) {
        dgStaffSetInlineError(form, 'deliveryFile', 'Files must be 50MB or smaller.');
        deliveryValid = false;
      }
      if (!deliveryNotes) {
        dgStaffSetInlineError(form, 'deliveryNotes', 'Delivery notes are required.');
        deliveryValid = false;
      }
      if (deliveryNotes && deliveryNotes.length < 10) {
        dgStaffSetInlineError(form, 'deliveryNotes', 'Delivery notes must be at least 10 characters.');
        deliveryValid = false;
      }
      if (!deliveryValid) return;
    }

    const runStatusUpdate = () => {
      const staffSubmitBtn = form.querySelector('[type="submit"]');
      const staffLoadMsg = completingProject ? 'Uploading deliverables…' : `Updating to ${freshNextStatus}…`;
      if (window.DGLoading) { DGLoading.show(staffLoadMsg); DGLoading.disableButton(staffSubmitBtn); }
      const previousStatus = freshBooking.status;
      const now = new Date().toISOString();
      const actorName = currentUser.name || currentUser.fullName || currentUser.email || 'User';
      const actorWithRole = `${actorName} (${currentUser.role})`;
      freshBooking.status = freshNextStatus;
      if (completingProject) {
        freshBooking.deliveryOutputLink = deliveryOutputLink;
        freshBooking.deliveryNotes = deliveryNotes;
        freshBooking.deliveredAt = now;
        if (deliveryFile) {
          const extension = deliveryFile.name.split('.').pop().toLowerCase();
          freshBooking.deliveryFileName = deliveryFile.name;
          freshBooking.deliveryFileType = extension;
          freshBooking.deliveryFileSize = deliveryFile.size;
          freshBooking.deliveryFileUploadedAt = now;
        }
      }
      freshBooking.productionNotes = Array.isArray(freshBooking.productionNotes) ? freshBooking.productionNotes : [];
      const productionNote = {
        date: now,
        statusFrom: previousStatus,
        statusTo: freshNextStatus,
        note,
        by: actorName,
        byRole: currentUser.role
      };
      if (completingProject) {
        productionNote.deliveryOutputLink = deliveryOutputLink;
        productionNote.deliveryFileName = deliveryFile ? deliveryFile.name : '';
        productionNote.deliveryNotes = deliveryNotes;
      }
      freshBooking.productionNotes.push(productionNote);
      freshBooking.history = Array.isArray(freshBooking.history) ? freshBooking.history : [];
      freshBooking.history.push({
        date: now,
        action: `Status updated from ${previousStatus} to ${freshNextStatus}`,
        by: actorWithRole
      });
      if (completingProject) {
        freshBooking.history.push({
          date: now,
          action: 'Final output delivered',
          by: actorWithRole
        });
      }
      dgStaffSaveBookings(freshBookings);
      dgStaffNotifyClient(freshBooking, 'Production update', `Your project ${freshBooking.id} has moved to ${freshNextStatus}.`, 'production');
      dgStaffNotifyAdmin('Production status updated', `${freshBooking.id} moved from ${previousStatus} to ${freshNextStatus} by ${actorName}.`, 'production', freshBooking.id);
      if (freshNextStatus === 'Ready for Delivery') {
        dgStaffNotifyClient(freshBooking, 'Balance payment requested', `Your project ${freshBooking.id} is ready for delivery. Please settle the remaining balance before final files are released.`, 'payment');
        dgStaffNotifyAssigned(freshBooking, 'Ready for delivery', `${freshBooking.id} has reached final delivery preparation.`, 'delivery');
        if (!dgStaffIsFullyPaid(freshBooking)) {
          dgStaffNotifyAssigned(freshBooking, 'Delivery blocked', `${freshBooking.id} cannot be completed until the client settles the remaining balance.`, 'delivery');
          dgStaffNotifyAdmin('Delivery blocked', `${freshBooking.id} is ready for delivery but requires verified balance payment before completion.`, 'delivery', freshBooking.id);
        }
      }
      if (completingProject) {
        dgStaffNotifyClient(freshBooking, 'Final deliverables ready', `Your final files for ${freshBooking.id} are ready to view.`, 'delivery');
        dgStaffNotifyClient(freshBooking, 'Booking completed', `Your project ${freshBooking.id} has been completed.`, 'production');
        dgStaffNotifyAdmin('Final deliverables uploaded', `Final deliverables have been uploaded for ${freshBooking.id}.`, 'delivery', freshBooking.id);
        dgStaffNotifyAdmin('Project completed', `${freshBooking.id} has been completed and delivered.`, 'production', freshBooking.id);
        dgStaffNotifyAssigned(freshBooking, 'Project completed', `${freshBooking.id} has been completed successfully.`, 'production');
      }
      if (window.DGLoading) { DGLoading.hide(); DGLoading.enableButton(staffSubmitBtn); }
      dgStaffShowMessage(`Project moved to ${freshNextStatus}.`);
      dgStaffRenderProgress();
    };
    dgStaffConfirmAction({ ...dgStaffStatusConfirmOptions(freshNextStatus, freshBooking), onConfirm: runStatusUpdate });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = DGData.getJson(DGData.keys.currentUser, null);
  dgStaffShowAdminLinks(currentUser);
  dgStaffRenderDashboard();
  dgStaffRenderAssignedProjects();
  dgStaffRenderProgress();
});
