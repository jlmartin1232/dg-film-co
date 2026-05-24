const DG_SERVICE_PACKAGES = {
  'Wedding Photo/Video': ['Essential Wedding Coverage', 'Cinematic Wedding Premium', 'Full Wedding Story'],
  'Debut / Birthday Coverage': ['Birthday Essentials', 'Debut Cinematic Coverage', 'Full Debut Celebration'],
  'Corporate / Commercial Video': ['Business Highlight', 'Brand Campaign', 'Full Commercial Production'],
  'Restaurant / Food Promo': ['Food Promo Reel', 'Restaurant Feature', 'Full Brand Dining Story'],
  'Nightlife / Club Events': ['Event Recap', 'Nightlife Highlight Film', 'Full Nightlife Coverage'],
  'Graduation / Event Coverage': ['Event Highlights', 'Graduation Ball Coverage', 'Full Event Story'],
  'Pageant / Event Coverage': ['Pageant Highlights', 'Full Pageant Coverage', 'Premium Pageant Story'],
  'Creative Film / Documentary': ['Creative Visuals', 'Documentary Story Film', 'Full Creative Direction'],
  'Product / Brand Event': ['Product Reel', 'Brand Event Coverage', 'Full Product Campaign']
};

const DG_SERVICE_ALIASES = {
  Wedding: 'Wedding Photo/Video',
  Debut: 'Debut / Birthday Coverage',
  Corporate: 'Corporate / Commercial Video',
  Product: 'Product / Brand Event',
  Nightlife: 'Nightlife / Club Events',
  Graduation: 'Graduation / Event Coverage',
  Pageant: 'Pageant / Event Coverage',
  'Music Video': 'Creative Film / Documentary',
  'Music & Film': 'Creative Film / Documentary',
  'Music Video / Creative Film': 'Creative Film / Documentary',
  'Corporate Events': 'Corporate / Commercial Video',
  'Nightlife/Club Events': 'Nightlife / Club Events',
  'Product Shoot': 'Product / Brand Event',
  'Graduation Shoot': 'Graduation / Event Coverage'
};

const DG_VISUAL_STYLE_ALIASES = {
  Cinematic: 'Cinematic and emotional',
  Elegant: 'Elegant and classy',
  Documentary: 'Documentary style',
  Moody: 'Dark and moody',
  Minimal: 'Clean commercial style',
  'High-energy': 'Fast-paced social media style'
};

const DG_STATUS_LIST = [
  'Pending Review',
  'Approved for Meeting',
  'Meeting Scheduled',
  'Confirmed',
  'Rejected',
  'Scheduled',
  'On Shoot',
  'Editing',
  'Ready for Delivery',
  'Completed',
  'Cancelled'
];

function dgCurrentClient() {
  return DGRbac.requireRoles(['client']);
}

function dgBookings() {
  return DGData.getJson(DGData.keys.bookings, []);
}

function dgPayments() {
  return DGData.getJson(DGData.keys.payments, []);
}

function dgSaveBookings(bookings) {
  DGData.setJson(DGData.keys.bookings, bookings);
}

function dgSavePayments(payments) {
  DGData.setJson(DGData.keys.payments, payments);
}

function dgClientNotification(notification) {
  if (window.DGNotifications) DGNotifications.addNotification(notification);
}

function dgNotifyClient(booking, title, message, type) {
  if (!booking || !booking.clientId) return;
  dgClientNotification({
    role: 'client',
    userId: booking.clientId,
    bookingId: booking.id,
    title,
    message,
    type
  });
}

function dgNotifyAdmin(title, message, type, bookingId) {
  dgClientNotification({
    role: 'admin',
    bookingId: bookingId || '',
    title,
    message,
    type
  });
}

function dgClientConfirmAction(options) {
  if (window.confirmAction) return window.confirmAction(options);
  return Promise.resolve().then(() => options.onConfirm());
}

function dgNextId(prefix, records) {
  const numbers = records
    .map((record) => Number(String(record.id || '').replace(`${prefix}-`, '')))
    .filter((number) => Number.isFinite(number));
  return `${prefix}-${Math.max(1000, ...numbers) + 1}`;
}

function dgSetFlash(message) {
  localStorage.setItem('dg_flash_message', message);
}

function dgShowFlash() {
  const element = document.getElementById('flashMessage');
  const message = localStorage.getItem('dg_flash_message');
  if (element && message) {
    element.textContent = message;
    element.className = 'form-message success';
    localStorage.removeItem('dg_flash_message');
  }
}

function dgSetFieldError(form, fieldName, message) {
  const element = form.querySelector(`[data-error-for="${fieldName}"]`);
  if (element) {
    element.textContent = message || '';
  }
}

function dgClearFieldErrors(form) {
  form.querySelectorAll('[data-error-for]').forEach((element) => {
    element.textContent = '';
  });
}

function dgToday() {
  return new Date().toISOString().slice(0, 10);
}

function dgIsPastDate(value) {
  return value < dgToday();
}

function dgIsFutureDate(value) {
  return value > dgToday();
}

function dgValidPhone(value) {
  return /^(09\d{9}|\+639\d{9})$/.test(value);
}

function dgBadgeClass(status) {
  return `badge status-${String(status || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function dgDisplayStatus(status) {
  const labels = {
    Confirmed: 'Booking Confirmed',
    Scheduled: 'Scheduled for Shoot',
    'On Shoot': 'In Production',
    'Confirmed by Client': 'Meeting Confirmed',
    'Meeting Confirmed by Client': 'Meeting Confirmed',
    'Ready for Staff Assignment': 'Down Payment Verified',
    'Not Required Yet': 'Payment not yet available',
    'Awaiting Payment': 'Awaiting Down Payment',
    'Pending Verification': 'Down Payment for Review',
    'Down Payment Pending Verification': 'Down Payment for Review',
    'Balance Pending Verification': 'Balance Payment for Review',
    Verified: 'Payment Verified',
    'Down Payment Verified': 'Down Payment Verified',
    'Balance Verified': 'Balance Verified',
    Unpaid: 'Payment Due',
    Rejected: 'Rejected',
    'Payment Rejected': 'Payment Needs Review'
  };
  return labels[status] || status || 'Not set';
}

function dgBadge(status) {
  return `<span class="${dgBadgeClass(status)}">${dgEscape(dgDisplayStatus(status))}</span>`;
}

function dgEscape(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function dgFormatDate(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? dgEscape(value)
    : date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function dgFormatDateTime(value) {
  if (!value) return 'Not set';
  return new Date(value).toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

function dgFormatTime(value) {
  if (!value) return 'Not set';
  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return String(value);
  const hour = Number(match[1]);
  const minute = match[2];
  if (hour > 23) return String(value);
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function dgFormatFileSize(bytes) {
  const size = Number(bytes || 0);
  if (!size) return 'Not set';
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  return `${(size / 1024).toFixed(2)} KB`;
}

function dgNormalizeBookingDefaults(booking) {
  if (!booking) return booking;
  if (booking.status === 'Approved') booking.status = 'Confirmed';
  booking.meetingStatus = booking.meetingStatus || 'Not Scheduled';
  booking.preferredMeetingMode = booking.preferredMeetingMode || '';
  booking.preferredMeetingNotes = booking.preferredMeetingNotes || '';
  booking.meetingLocation = booking.meetingLocation || '';
  booking.rescheduleRequest = booking.rescheduleRequest || null;
  booking.meetingClientConfirmation = booking.meetingClientConfirmation || null;
  booking.postMeetingNotes = booking.postMeetingNotes || '';
  booking.postMeetingConfirmedAt = booking.postMeetingConfirmedAt || '';
  booking.finalAgreedAmount = Number(booking.finalAgreedAmount || booking.invoice?.totalAmount || 0);
  if (booking.invoice) {
    booking.invoice.totalAmount = Number(booking.invoice.totalAmount || 0);
    booking.invoice.downPaymentRate = Number(booking.invoice.downPaymentRate || 50);
    booking.invoice.downPaymentAmount = Number(booking.invoice.downPaymentAmount || booking.invoice.totalAmount * 0.5);
    booking.invoice.balanceAmount = Number(booking.invoice.balanceAmount || Math.max(booking.invoice.totalAmount - booking.invoice.downPaymentAmount, 0));
    booking.invoice.downPaymentStatus = booking.invoice.downPaymentStatus || 'Unpaid';
    booking.invoice.balanceStatus = booking.invoice.balanceStatus || 'Unpaid';
    booking.invoice.invoiceStatus = booking.invoice.invoiceStatus || (booking.invoice.downPaymentStatus === 'Verified' && booking.invoice.balanceStatus === 'Verified' ? 'Paid' : 'Open');
    booking.paymentStatus = booking.paymentStatus === 'Awaiting Payment' ? 'Awaiting Down Payment' : booking.paymentStatus;
    booking.paymentStatus = booking.paymentStatus === 'Pending Verification' ? 'Down Payment Pending Verification' : booking.paymentStatus;
    booking.paymentStatus = booking.paymentStatus === 'Verified' ? 'Down Payment Verified' : booking.paymentStatus;
  }
  if (!booking.paymentStatus || booking.paymentStatus === 'Not Submitted') {
    booking.paymentStatus = booking.status === 'Confirmed' ? 'Awaiting Down Payment' : 'Not Required Yet';
  }
  booking.history = Array.isArray(booking.history) ? booking.history : [];
  return booking;
}

function dgMeetingSummary(booking) {
  dgNormalizeBookingDefaults(booking);
  const preferenceHtml = dgMeetingPreferenceSummary(booking);
  const confirmationHtml = dgMeetingConfirmationPanel(booking);
  const rescheduleHtml = dgRescheduleRequestPanel(booking);
  const postMeetingHtml = dgPostMeetingSummary(booking);
  const hasOfficialSchedule = Boolean(booking.meetingDate) && ['Scheduled', 'Confirmed by Client'].includes(booking.meetingStatus);
  if (!hasOfficialSchedule) {
    return `
      ${preferenceHtml}
      <div class="empty-state">Your meeting schedule will appear here once DG Film Co. confirms it.</div>
      ${rescheduleHtml}
      ${postMeetingHtml}
    `;
  }
  return `
    ${preferenceHtml}
    <dl class="details-grid compact-details">
      <div><dt>Meeting Status</dt><dd>${dgBadge(booking.meetingStatus)}</dd></div>
      <div><dt>Meeting Date</dt><dd>${dgFormatDate(booking.meetingDate)}</dd></div>
      <div><dt>Meeting Time</dt><dd>${dgEscape(dgFormatTime(booking.meetingTime))}</dd></div>
      <div><dt>Meeting Mode</dt><dd>${dgEscape(booking.meetingMode || 'Not set')}</dd></div>
      <div class="wide"><dt>Meeting Location / Link</dt><dd>${dgEscape(booking.meetingLocation || 'Details will be shared through your registered email or mobile number.')}</dd></div>
      <div><dt>You Will Meet With</dt><dd>${dgEscape(booking.meetingContactName || 'DG Film Co. Coordinator')}</dd></div>
      <div><dt>Role</dt><dd>${dgEscape(booking.meetingContactRole || 'Project Coordinator')}</dd></div>
      <div class="wide"><dt>Contact</dt><dd>${dgEscape(booking.meetingContactDetail || 'Contact details will be shared through your registered email or mobile number.')}</dd></div>
      <div class="wide"><dt>Meeting Notes</dt><dd>${dgEscape(booking.meetingNotes || 'None')}</dd></div>
    </dl>
    ${confirmationHtml}
    ${rescheduleHtml}
    ${postMeetingHtml}
  `;
}

function dgMeetingPreferenceSummary(booking) {
  dgNormalizeBookingDefaults(booking);
  const mode = booking.preferredMeetingMode || 'No preference';
  const notes = booking.preferredMeetingNotes || 'None provided';
  return `
    <div class="meeting-preference-card">
      <p class="eyebrow">Client meeting preference</p>
      <dl class="details-grid compact-details">
        <div><dt>Preferred Meeting Mode</dt><dd>${dgEscape(mode)}</dd></div>
        <div class="wide"><dt>Preferred Meeting Notes</dt><dd>${dgEscape(notes)}</dd></div>
      </dl>
      <p class="table-helper">Client preferences are suggestions only. DG Film Co. confirms the final meeting schedule based on availability.</p>
    </div>
  `;
}

function dgPostMeetingSummary(booking) {
  dgNormalizeBookingDefaults(booking);
  if (!booking.postMeetingNotes || !['Confirmed', 'Scheduled', 'On Shoot', 'Editing', 'Ready for Delivery', 'Completed'].includes(booking.status)) {
    return '';
  }
  return `
    <div class="post-meeting-summary-card">
      <p class="eyebrow">Meeting Summary</p>
      <p>DG Film Co. has recorded the meeting summary and confirmed your booking. Please proceed with the next step.</p>
      <dl class="details-grid compact-details">
        <div class="wide"><dt>Post-Meeting Notes</dt><dd>${dgEscape(booking.postMeetingNotes)}</dd></div>
        <div><dt>Confirmation Date</dt><dd>${dgFormatDateTime(booking.postMeetingConfirmedAt)}</dd></div>
      </dl>
    </div>
  `;
}

function dgMeetingConfirmationPanel(booking) {
  dgNormalizeBookingDefaults(booking);
  if (booking.status !== 'Meeting Scheduled') return '';
  const request = booking.rescheduleRequest;
  const confirmation = booking.meetingClientConfirmation;
  if (request && request.status === 'Pending') return '';

  if (confirmation && confirmation.status === 'Confirmed') {
    return `
      <div class="meeting-confirmation-card meeting-confirmed-card">
        <div class="meeting-confirmation-header">
          <div>
            <p class="eyebrow">Meeting confirmation</p>
            <h3>Meeting Confirmed by Client</h3>
          </div>
          ${dgBadge('Meeting Confirmed by Client')}
        </div>
        <p>You confirmed this meeting schedule.</p>
        <dl class="details-grid compact-details">
          <div><dt>Confirmed At</dt><dd>${dgFormatDateTime(confirmation.confirmedAt)}</dd></div>
          <div><dt>Confirmed By</dt><dd>${dgEscape(confirmation.confirmedBy || 'Client')}</dd></div>
        </dl>
      </div>
    `;
  }

  return `
    <div class="meeting-confirmation-card">
      <p class="eyebrow">Meeting confirmation</p>
      <h3>Your consultation has been scheduled.</h3>
      <p>Please confirm if the date and time work for you. If not, you may request a new meeting schedule.</p>
      <div class="meeting-confirmation-actions">
        <button class="btn primary" type="button" data-confirm-meeting>Confirm Meeting</button>
        <button class="btn ghost" type="button" data-open-reschedule>Request Reschedule</button>
      </div>
    </div>
  `;
}

function dgCanRequestReschedule(booking) {
  dgNormalizeBookingDefaults(booking);
  const confirmation = booking.meetingClientConfirmation;
  return booking.status === 'Meeting Scheduled'
    && booking.meetingStatus === 'Scheduled'
    && !(confirmation && confirmation.status === 'Confirmed');
}

function dgRescheduleRequestPanel(booking) {
  dgNormalizeBookingDefaults(booking);
  const request = booking.rescheduleRequest;

  if (request && request.status === 'Pending') {
    return `
      <div class="reschedule-card reschedule-pending">
        <div class="reschedule-card-header">
          <div>
            <p class="eyebrow">Meeting reschedule</p>
            <h3>Reschedule request pending approval.</h3>
          </div>
          ${dgBadge('Reschedule Pending')}
        </div>
        <dl class="details-grid compact-details">
          <div><dt>Requested New Date</dt><dd>${dgFormatDate(request.requestedDate)}</dd></div>
          <div><dt>Requested New Time</dt><dd>${dgEscape(dgFormatTime(request.requestedTime))}</dd></div>
          <div class="wide"><dt>Reason / Message</dt><dd>${dgEscape(request.reason)}</dd></div>
        </dl>
      </div>
    `;
  }

  if (request && request.status === 'Approved') {
    return `
      <div class="reschedule-card reschedule-approved">
        <div class="reschedule-card-header">
          <div>
            <p class="eyebrow">Meeting reschedule</p>
            <h3>Your reschedule request was approved. Please review the updated meeting schedule.</h3>
          </div>
          ${dgBadge('Reschedule Approved')}
        </div>
      </div>
      ${dgCanRequestReschedule(booking) ? dgRescheduleRequestFormMarkup() : ''}
    `;
  }

  if (request && request.status === 'Rejected') {
    return `
      <div class="reschedule-card reschedule-rejected">
        <div class="reschedule-card-header">
          <div>
            <p class="eyebrow">Meeting reschedule</p>
            <h3>Your reschedule request was reviewed. Please contact DG Film Co. if you need further assistance.</h3>
          </div>
          ${dgBadge('Reschedule Rejected')}
        </div>
      </div>
      ${dgCanRequestReschedule(booking) ? dgRescheduleRequestFormMarkup() : ''}
    `;
  }

  if (!dgCanRequestReschedule(booking)) return '';
  return `
    <div class="reschedule-card reschedule-form-card">
      <div class="reschedule-card-header">
        <div>
          <p class="eyebrow">Need a different schedule?</p>
          <h3>Request a new meeting schedule</h3>
        </div>
        <button class="btn ghost small" type="button" data-open-reschedule>Request Reschedule</button>
      </div>
      <form class="reschedule-form" id="rescheduleForm" hidden novalidate>
        <div id="rescheduleMessage" class="form-message" aria-live="polite"></div>
        <div class="form-grid">
          <label>Preferred New Date
            <input type="date" name="requestedDate" min="${dgToday()}" />
            <span class="field-error" data-error-for="requestedDate"></span>
          </label>
          <label>Preferred New Time
            <input type="time" name="requestedTime" />
            <span class="field-error" data-error-for="requestedTime"></span>
          </label>
        </div>
        <label>Reason / Message
          <textarea name="reason" rows="4" placeholder="Let us know why you need a new schedule and what time works better for you."></textarea>
          <span class="field-error" data-error-for="reason"></span>
        </label>
        <button class="btn primary" type="submit">Send Reschedule Request</button>
      </form>
    </div>
  `;
}

function dgRescheduleRequestFormMarkup() {
  return `
    <div class="reschedule-card reschedule-form-card">
      <form class="reschedule-form" id="rescheduleForm" hidden novalidate>
        <div id="rescheduleMessage" class="form-message" aria-live="polite"></div>
        <div class="form-grid">
          <label>Preferred New Date
            <input type="date" name="requestedDate" min="${dgToday()}" />
            <span class="field-error" data-error-for="requestedDate"></span>
          </label>
          <label>Preferred New Time
            <input type="time" name="requestedTime" />
            <span class="field-error" data-error-for="requestedTime"></span>
          </label>
        </div>
        <label>Reason / Message
          <textarea name="reason" rows="4" placeholder="Let us know why you need a new schedule and what time works better for you."></textarea>
          <span class="field-error" data-error-for="reason"></span>
        </label>
        <button class="btn primary" type="submit">Send Reschedule Request</button>
      </form>
    </div>
  `;
}

function dgSubmitRescheduleRequest(bookingId, currentUser, values) {
  const bookings = dgBookings();
  const booking = dgNormalizeBookingDefaults(bookings.find((item) => item.id === bookingId));
  if (!booking || booking.clientId !== currentUser.id) {
    window.location.href = 'unauthorized.html';
    return false;
  }
  if (!dgCanRequestReschedule(booking) || (booking.rescheduleRequest && booking.rescheduleRequest.status === 'Pending')) {
    return false;
  }

  booking.rescheduleRequest = {
    status: 'Pending',
    requestedDate: values.requestedDate,
    requestedTime: values.requestedTime,
    reason: values.reason,
    requestedAt: new Date().toISOString(),
    requestedBy: currentUser.name || currentUser.fullName || currentUser.email
  };
  booking.meetingClientConfirmation = null;
  booking.history.push({
    date: new Date().toISOString(),
    action: 'Client requested meeting reschedule',
    by: currentUser.name || currentUser.fullName || currentUser.email
  });
  dgSaveBookings(bookings);
  dgNotifyAdmin('Reschedule requested', `The client requested a new meeting schedule for ${booking.id}.`, 'meeting', booking.id);
  dgNotifyClient(booking, 'Reschedule request sent', `Your request for a new meeting schedule for ${booking.id} has been submitted for review.`, 'meeting');
  return true;
}

function dgConfirmMeetingSchedule(bookingId, currentUser) {
  const bookings = dgBookings();
  const booking = dgNormalizeBookingDefaults(bookings.find((item) => item.id === bookingId));
  if (!booking || booking.clientId !== currentUser.id) {
    window.location.href = 'unauthorized.html';
    return false;
  }
  if (!dgCanRequestReschedule(booking) || (booking.rescheduleRequest && booking.rescheduleRequest.status === 'Pending')) {
    return false;
  }

  const confirmedAt = new Date().toISOString();
  const confirmedBy = currentUser.name || currentUser.fullName || currentUser.email;
  booking.meetingClientConfirmation = {
    status: 'Confirmed',
    confirmedAt,
    confirmedBy
  };
  booking.meetingStatus = 'Confirmed by Client';
  booking.history.push({
    date: confirmedAt,
    action: 'Client confirmed meeting schedule',
    by: confirmedBy
  });
  dgSaveBookings(bookings);
  dgNotifyAdmin('Meeting confirmed', `${booking.clientName || 'The client'} confirmed the meeting schedule for ${booking.id}.`, 'meeting', booking.id);
  dgNotifyClient(booking, 'Meeting confirmed', `You confirmed the meeting schedule for ${booking.id}.`, 'meeting');
  dgSetFlash('You confirmed this meeting schedule.');
  return true;
}

const dgProductionUpdateRequestsSent = new Set();

function dgCanRequestProductionUpdate(booking) {
  return ['Confirmed', 'Scheduled', 'On Shoot', 'Editing', 'Ready for Delivery'].includes(booking.status);
}

function dgProductionFollowUpPanel(booking) {
  if (!dgCanRequestProductionUpdate(booking)) return '';
  const alreadySent = dgProductionUpdateRequestsSent.has(booking.id);
  return `
    <div class="production-follow-up-card">
      <div>
        <p class="eyebrow">Need an update?</p>
        <h3>Follow up on this project</h3>
        <p>If you have been waiting for a progress update, let our team know and we will review your project status.</p>
      </div>
      ${alreadySent
        ? '<p class="production-follow-up-success" role="status">Update request sent. DG Film Co. will review your project status and get back to you.</p>'
        : '<button class="btn ghost" type="button" data-request-production-update>Request an update</button>'}
    </div>
  `;
}

function dgRequestProductionUpdate(booking) {
  if (!booking || !dgCanRequestProductionUpdate(booking) || dgProductionUpdateRequestsSent.has(booking.id)) return false;
  dgProductionUpdateRequestsSent.add(booking.id);
  const message = `Client requested a production update for booking ${booking.id}.`;
  dgNotifyAdmin('Production update requested', message, 'production', booking.id);
  if (booking.assignedStaffId) {
    dgClientNotification({
      role: 'staff',
      userId: booking.assignedStaffId,
      bookingId: booking.id,
      title: 'Production update requested',
      message,
      type: 'production'
    });
  }
  return true;
}

function dgProductionTimeline(booking) {
  const notes = Array.isArray(booking.productionNotes) ? booking.productionNotes : [];
  const timeline = !notes.length
    ? '<div class="empty-state">Production updates will appear here once your project is assigned and scheduled.</div>'
    : `<div class="history-list production-note-list">${notes.slice().reverse().map((item, index) => `
    <article class="history-item production-note-card${index === 0 ? ' latest-production-note' : ''}">
      <strong>${dgEscape(item.statusFrom)} to ${dgEscape(item.statusTo)}</strong>
      <span>${dgFormatDateTime(item.date)} by ${dgEscape(item.by)}</span>
      <div class="staff-note-highlight">
        <small>Staff Notes</small>
        <blockquote>${dgEscape(item.note || 'No additional note provided.')}</blockquote>
      </div>
    </article>
  `).join('')}</div>`;
  return `${timeline}${dgProductionFollowUpPanel(booking)}`;
}

function dgFindClientBooking(id, currentUser) {
  const booking = dgNormalizeBookingDefaults(dgBookings().find((item) => item.id === id));
  if (!booking) return null;
  if (booking.clientId !== currentUser.id) {
    window.location.href = 'unauthorized.html';
    return null;
  }
  return booking;
}

function dgMoney(value) {
  return `PHP ${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const DG_PAYMENT_SETTINGS_KEY = 'dgPaymentSettings';
const DG_PAYMENT_METHOD_OPTIONS = ['GCash', 'Bank Transfer', 'Cash / On-site Payment', 'Other'];

function dgClientPaymentSettings() {
  const saved = DGData.getJson(DG_PAYMENT_SETTINGS_KEY, null) || {};
  const methodRecords = Array.isArray(saved.methods) && saved.methods.some((method) => method && typeof method === 'object')
    ? saved.methods
    : [];
  const rawTypes = methodRecords.length
    ? methodRecords.map((method) => method.type)
    : (Array.isArray(saved.methods) ? saved.methods : Array.isArray(saved.acceptedMethods) ? saved.acceptedMethods : []);
  const methods = DG_PAYMENT_METHOD_OPTIONS.filter((type) => rawTypes.includes(type));
  const legacyReminder = String(saved.reminder || saved.paymentInstructions || '').trim();
  const record = (type) => methodRecords.find((method) => method.type === type) || {};
  return {
    methods,
    gcash: {
      accountName: String(record('GCash').accountName || saved.gcash?.accountName || saved.gcashAccountName || '').trim(),
      number: String(record('GCash').number || saved.gcash?.number || saved.gcashNumber || '').trim(),
      instructions: String(record('GCash').instructions || saved.gcash?.instructions || saved.gcashInstructions || (methods.includes('GCash') ? legacyReminder : '')).trim()
    },
    bank: {
      bankName: String(record('Bank Transfer').bankName || saved.bank?.bankName || saved.bankName || '').trim(),
      accountName: String(record('Bank Transfer').accountName || saved.bank?.accountName || saved.bankAccountName || '').trim(),
      accountNumber: String(record('Bank Transfer').accountNumber || saved.bank?.accountNumber || saved.bankAccountNumber || '').trim(),
      instructions: String(record('Bank Transfer').instructions || saved.bank?.instructions || saved.bankInstructions || (methods.includes('Bank Transfer') ? legacyReminder : '')).trim()
    },
    cash: {
      instructions: String(record('Cash / On-site Payment').instructions || saved.cash?.instructions || saved.cashInstructions || (methods.includes('Cash / On-site Payment') ? legacyReminder : '')).trim()
    },
    other: {
      name: String(record('Other').methodName || saved.other?.name || saved.otherMethodName || '').trim(),
      instructions: String(record('Other').instructions || saved.other?.instructions || saved.otherInstructions || (methods.includes('Other') ? legacyReminder : '')).trim()
    }
  };
}

function dgPaymentMethodOptions() {
  const enabledMethods = dgClientPaymentSettings().methods;
  const methods = enabledMethods.length ? enabledMethods : DG_PAYMENT_METHOD_OPTIONS;
  return [
    '<option value="">Choose mode of payment</option>',
    ...methods.map((method) => `<option value="${dgEscape(method)}">${dgEscape(method)}</option>`)
  ].join('');
}

function dgPaymentInstructions() {
  const settings = dgClientPaymentSettings();
  const methods = settings.methods;
  const acceptsGCash = methods.includes('GCash');
  const acceptsBank = methods.includes('Bank Transfer');
  const acceptsCash = methods.includes('Cash / On-site Payment');
  const acceptsOther = methods.includes('Other');
  const cashInstructions = acceptsCash ? settings.cash.instructions : '';
  const otherMethodName = acceptsOther ? settings.other.name : '';
  const otherInstructions = acceptsOther ? settings.other.instructions : '';
  if (!methods.length) {
    return `
      <div class="payment-guidance-card">
        <p class="eyebrow">Payment Details</p>
        <p>Payment details will be confirmed by DG Film Co. after your booking is approved.</p>
        <p>Please upload a receipt once your payment has been completed.</p>
      </div>
    `;
  }
  return `
    <div class="payment-guidance-card">
      <p class="eyebrow">Payment Details</p>
      ${methods.length ? `<p><strong>Accepted Payment Methods:</strong> ${dgEscape(methods.join(', '))}</p>` : ''}
      ${acceptsGCash ? `<div class="payment-guidance-group"><strong>GCash</strong>${settings.gcash.accountName ? `<span>Account Name: ${dgEscape(settings.gcash.accountName)}</span>` : ''}${settings.gcash.number ? `<span>Number: ${dgEscape(settings.gcash.number)}</span>` : ''}${settings.gcash.instructions ? `<span>Instructions: ${dgEscape(settings.gcash.instructions)}</span>` : ''}</div>` : ''}
      ${acceptsBank ? `<div class="payment-guidance-group"><strong>Bank Transfer</strong>${settings.bank.bankName ? `<span>Bank: ${dgEscape(settings.bank.bankName)}</span>` : ''}${settings.bank.accountName ? `<span>Account Name: ${dgEscape(settings.bank.accountName)}</span>` : ''}${settings.bank.accountNumber ? `<span>Account Number: ${dgEscape(settings.bank.accountNumber)}</span>` : ''}${settings.bank.instructions ? `<span>Instructions: ${dgEscape(settings.bank.instructions)}</span>` : ''}</div>` : ''}
      ${acceptsCash ? `<div class="payment-guidance-group"><strong>Cash / On-site Payment</strong>${cashInstructions ? `<span>Instructions: ${dgEscape(cashInstructions)}</span>` : ''}</div>` : ''}
      ${acceptsOther ? `<div class="payment-guidance-group"><strong>${dgEscape(otherMethodName || 'Other Payment Method')}</strong>${otherInstructions ? `<span>Instructions: ${dgEscape(otherInstructions)}</span>` : ''}</div>` : ''}
      <p>Please upload a receipt once your payment has been completed.</p>
    </div>
  `;
}

let dgPaymentReceiptFeedback = '';

function dgDownPaymentVerified(booking) {
  dgNormalizeBookingDefaults(booking);
  return booking.invoice ? booking.invoice.downPaymentStatus === 'Verified' : booking.paymentStatus === 'Verified';
}

function dgBalanceNeedsAttention(booking) {
  dgNormalizeBookingDefaults(booking);
  if (!booking.invoice || booking.invoice.balanceStatus === 'Verified') return false;
  if (!booking.eventDate) return false;
  const daysUntilEvent = (new Date(booking.eventDate) - new Date(dgToday())) / (1000 * 60 * 60 * 24);
  return daysUntilEvent <= 7;
}

function dgPaymentUploadType(booking, requestedType = '') {
  dgNormalizeBookingDefaults(booking);
  if (dgIsClosedBooking(booking)) return '';
  const type = requestedType === 'balance' ? 'balance' : requestedType === 'downpayment' ? 'downpayment' : '';
  if (booking.invoice) {
    const downStatus = booking.invoice.downPaymentStatus;
    const balanceStatus = booking.invoice.balanceStatus;
    const canDown = ['Unpaid', 'Needs Resubmission', 'Rejected'].includes(downStatus);
    const canBalance = downStatus === 'Verified' && ['Unpaid', 'Needs Resubmission', 'Rejected'].includes(balanceStatus);
    if (type === 'downpayment') return canDown ? 'downpayment' : '';
    if (type === 'balance') return canBalance ? 'balance' : '';
    if (canDown) return 'downpayment';
    if (canBalance) return 'balance';
    return '';
  }
  return ['Awaiting Payment', 'Awaiting Down Payment', 'Needs Resubmission'].includes(booking.paymentStatus) ? 'downpayment' : '';
}

function dgCanUploadPayment(booking, requestedType = '') {
  return Boolean(dgPaymentUploadType(booking, requestedType));
}

function dgLegacyPaymentAmount(booking) {
  const priorPayment = dgPayments()
    .filter((payment) => payment.bookingId === booking.id && Number(payment.amountPaid || 0) > 0)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];
  if (priorPayment) return Number(priorPayment.amountPaid);
  const agreedAmount = Number(booking.finalAgreedAmount || booking.totalAmount || booking.amount || 0);
  if (agreedAmount > 0) return agreedAmount;
  const packages = DGData.getJson(DGData.keys.pricing, []);
  const matchedPackage = packages.find((pkg) => (
    (booking.packageId && pkg.id === booking.packageId) ||
    (String(pkg.packageName || '').toLowerCase() === String(booking.packageName || '').toLowerCase() &&
      String(pkg.serviceName || '').toLowerCase() === String(booking.serviceType || booking.serviceName || '').toLowerCase())
  ));
  if (Number(matchedPackage?.price || 0) > 0) return Number(matchedPackage.price);
  const service = DGData.getJson(DGData.keys.services, []).find((item) => (
    item.id === booking.serviceId ||
    String(item.name || '').toLowerCase() === String(booking.serviceType || booking.serviceName || '').toLowerCase()
  ));
  return Number(service?.startingPrice || 0);
}

function dgPaymentAction(booking, requestedType = '') {
  dgNormalizeBookingDefaults(booking);
  const type = dgPaymentUploadType(booking, requestedType);
  if (!type) return '';
  const isBalance = type === 'balance';
  const status = isBalance ? booking.invoice?.balanceStatus : booking.invoice?.downPaymentStatus;
  const verb = ['Needs Resubmission', 'Rejected'].includes(status) || booking.paymentStatus === 'Needs Resubmission' ? 'Resubmit' : 'Upload';
  const label = verb === 'Resubmit' ? 'Resubmit Receipt' : 'Upload Receipt';
  if (!booking.invoice) {
    const amount = dgLegacyPaymentAmount(booking);
    return `
      <div class="payment-choice-panel" data-payment-choice-panel data-booking-id="${dgEscape(booking.id)}" data-total="${dgEscape(String(amount))}" data-minimum="${dgEscape(String(amount))}" data-balance="0" data-selected-payment-option="${type}" data-legacy-payment>
        <button class="btn primary payment-action-button" type="button" data-open-payment-modal>${label}</button>
        <div class="payment-modal-backdrop" data-payment-modal hidden>
          <div class="payment-receipt-modal" role="dialog" aria-modal="true" aria-labelledby="paymentReceiptTitle">
            <form class="payment-modal-form" data-payment-modal-form novalidate>
              <div class="payment-modal-header">
                <div>
                  <p class="eyebrow">Receipt Submission</p>
                  <h2 id="paymentReceiptTitle">Upload Receipt</h2>
                  <p>Submit your payment receipt without leaving this project page.</p>
                </div>
                <button class="modal-close-btn payment-modal-close" type="button" data-close-payment-modal aria-label="Close payment receipt form">&times;</button>
              </div>
              <div class="payment-modal-summary">
                <div><span>Payment Type</span><strong data-modal-payment-type>${dgPaymentLabel(type)}</strong></div>
                <div><span>Amount to Pay</span><strong data-modal-payment-amount>${amount > 0 ? dgMoney(amount) : 'Enter amount below'}</strong></div>
              </div>
              <div class="payment-modal-grid">
                <div class="payment-modal-column">
                  <label>Amount Paid
                    <input type="number" name="legacyAmountPaid" min="1" step="0.01" value="${amount > 0 ? dgEscape(String(amount)) : ''}" placeholder="0.00" data-legacy-payment-amount />
                    <span class="field-error" data-error-for="amountPaid"></span>
                  </label>
                  <label>Mode of Payment
                    <small class="field-hint">Select the method you used for this payment.</small>
                    <select name="paymentMethod">
                      ${dgPaymentMethodOptions()}
                    </select>
                    <span class="field-error" data-error-for="paymentMethod"></span>
                  </label>
                  <label>Payment Date
                    <input type="date" name="paymentDate" max="${dgEscape(dgToday())}" />
                    <span class="field-error" data-error-for="paymentDate"></span>
                  </label>
                  <label>Payment Reference Number
                    <input type="text" name="referenceNumber" placeholder="GCash, bank, or receipt reference" />
                    <span class="field-error" data-error-for="referenceNumber"></span>
                  </label>
                  <label class="receipt-upload-field">Receipt File
                    <input type="file" name="receiptFile" accept=".jpg,.jpeg,.png,.pdf" />
                    <small class="field-hint field-helper">JPG, PNG, or PDF up to 5MB.</small>
                    <small class="field-hint" data-modal-receipt-hint></small>
                    <span class="field-error" data-error-for="receiptFile"></span>
                  </label>
                </div>
                <div class="payment-modal-column payment-modal-side">
                  <label>Notes <span class="optional">Optional</span>
                    <textarea name="notes" rows="7" placeholder="Add any notes that may help us review your receipt."></textarea>
                  </label>
                  <div class="payment-modal-reminder">
                    <strong>Before submitting</strong>
                    <span>Make sure the receipt clearly shows the amount paid and reference number.</span>
                  </div>
                </div>
              </div>
              <div class="payment-action-row">
                <button class="btn ghost" type="button" data-close-payment-modal>Cancel</button>
                <button class="btn primary" type="submit">Submit Receipt</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }
  const total = Number(booking.invoice.totalAmount || 0);
  const minimum = Number(booking.invoice.downPaymentAmount || total * 0.5 || 0);
  const balance = Number(booking.invoice.balanceAmount || 0);
  const amount = isBalance ? balance : minimum;
  const remaining = isBalance ? Math.max(balance - amount, 0) : Math.max(total - amount, 0);
  return `
    <div class="payment-choice-panel" data-payment-choice-panel data-booking-id="${dgEscape(booking.id)}" data-total="${dgEscape(String(total))}" data-minimum="${dgEscape(String(minimum))}" data-balance="${dgEscape(String(balance))}" data-selected-payment-option="${type}">
      <button class="btn primary payment-action-button" type="button" data-open-payment-modal>${label}</button>
      <div class="payment-modal-backdrop" data-payment-modal hidden>
        <div class="payment-receipt-modal" role="dialog" aria-modal="true" aria-labelledby="paymentReceiptTitle">
          <form class="payment-modal-form" data-payment-modal-form novalidate>
            <div class="payment-modal-header">
              <div>
                <p class="eyebrow">Receipt Submission</p>
                <h2 id="paymentReceiptTitle">Upload Receipt</h2>
                <p>Submit your payment receipt without leaving this project page.</p>
              </div>
              <button class="modal-close-btn payment-modal-close" type="button" data-close-payment-modal aria-label="Close payment receipt form">&times;</button>
            </div>
            <div class="payment-modal-summary">
              <div><span>Payment Type</span><strong data-modal-payment-type>${dgPaymentLabel(type)}</strong></div>
              <div><span>Amount to Pay</span><strong data-modal-payment-amount>${dgMoney(amount)}</strong></div>
              <div><span>Remaining Balance After Payment</span><strong data-modal-payment-remaining>${dgMoney(remaining)}</strong></div>
            </div>
            <div class="payment-modal-grid">
              <div class="payment-modal-column">
                <label>Mode of Payment
                  <small class="field-hint">Select the method you used for this payment.</small>
                  <select name="paymentMethod">
                    ${dgPaymentMethodOptions()}
                  </select>
                  <span class="field-error" data-error-for="paymentMethod"></span>
                </label>
                <label>Payment Date
                  <input type="date" name="paymentDate" max="${dgEscape(dgToday())}" />
                  <span class="field-error" data-error-for="paymentDate"></span>
                </label>
                <label>Payment Reference Number
                  <input type="text" name="referenceNumber" placeholder="GCash, bank, or receipt reference" />
                  <span class="field-error" data-error-for="referenceNumber"></span>
                </label>
                <label class="receipt-upload-field">Receipt File
                  <input type="file" name="receiptFile" accept=".jpg,.jpeg,.png,.pdf" />
                  <small class="field-hint field-helper">JPG, PNG, or PDF up to 5MB.</small>
                  <small class="field-hint" data-modal-receipt-hint></small>
                  <span class="field-error" data-error-for="receiptFile"></span>
                </label>
              </div>
              <div class="payment-modal-column payment-modal-side">
                <label>Notes <span class="optional">Optional</span>
                  <textarea name="notes" rows="7" placeholder="Add any notes that may help us review your receipt."></textarea>
                </label>
                <div class="payment-modal-reminder">
                  <strong>Before submitting</strong>
                  <span>Make sure the receipt clearly shows the amount paid and reference number.</span>
                </div>
              </div>
            </div>
            <span class="field-error" data-error-for="amountPaid"></span>
            <div class="payment-action-row">
              <button class="btn ghost" type="button" data-close-payment-modal>Cancel</button>
              <button class="btn primary" type="submit">Submit Receipt</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

function dgPaymentSelectionPanel(booking) {
  dgNormalizeBookingDefaults(booking);
  if (!booking.invoice || dgPaymentUploadType(booking, 'downpayment') !== 'downpayment') return '';
  const total = Number(booking.invoice.totalAmount || 0);
  const minimum = Number(booking.invoice.downPaymentAmount || total * 0.5 || 0);
  const customStart = minimum || '';
  return `
    <div class="payment-choice-panel" data-payment-choice-panel data-booking-id="${dgEscape(booking.id)}" data-total="${dgEscape(String(total))}" data-minimum="${dgEscape(String(minimum))}" data-balance="${dgEscape(String(booking.invoice.balanceAmount || 0))}" data-selected-payment-option="downpayment">
      <div class="payment-choice-header">
        <div>
          <p class="eyebrow">Payment Amount</p>
          <h4>Choose how much to pay</h4>
        </div>
      </div>
      <div class="invoice-summary payment-dynamic-summary">
        <div class="amount-large"><span>Total Package Amount</span><strong>${dgMoney(total)}</strong></div>
        <div><span>Amount to Pay Now</span><strong data-payment-amount>${dgMoney(minimum)}</strong></div>
        <div><span>Remaining Balance After Payment</span><strong data-payment-remaining>${dgMoney(Math.max(total - minimum, 0))}</strong></div>
      </div>
      <p class="payment-choice-helper" data-payment-helper>Minimum reservation payment.</p>
      <div class="payment-option-grid" role="radiogroup" aria-label="Payment options">
        <button class="payment-option-card selected" type="button" role="radio" aria-checked="true" data-payment-option="downpayment">
          <span>50% Down Payment</span>
        </button>
        <button class="payment-option-card" type="button" role="radio" aria-checked="false" data-payment-option="full">
          <span>Full Payment</span>
        </button>
        <button class="payment-option-card" type="button" role="radio" aria-checked="false" data-payment-option="custom">
          <span>Custom Amount</span>
        </button>
      </div>
      <label class="custom-payment-field" data-custom-payment-field hidden>Custom Amount
        <input type="number" min="${dgEscape(String(minimum))}" max="${dgEscape(String(total))}" step="0.01" value="${dgEscape(String(customStart))}" data-custom-payment-amount aria-label="Custom payment amount" />
        <small class="field-hint">Minimum allowed: ${dgMoney(minimum)}</small>
      </label>
      <button class="btn primary payment-action-button" type="button" data-payment-choice-link data-open-payment-modal data-payment-modal-option="downpayment" data-payment-modal-amount="${dgEscape(String(minimum))}" aria-disabled="false">Upload Receipt</button>
      <div class="payment-modal-backdrop" data-payment-modal hidden>
        <div class="payment-receipt-modal" role="dialog" aria-modal="true" aria-labelledby="paymentReceiptTitle">
          <form class="payment-modal-form" data-payment-modal-form novalidate>
            <div class="payment-modal-header">
              <div>
                <p class="eyebrow">Receipt Submission</p>
                <h2 id="paymentReceiptTitle">Upload Receipt</h2>
                <p>Submit your payment receipt without leaving this project page.</p>
              </div>
              <button class="modal-close-btn payment-modal-close" type="button" data-close-payment-modal aria-label="Close payment receipt form">&times;</button>
            </div>
            <div class="payment-modal-summary">
              <div><span>Payment Type</span><strong data-modal-payment-type>Down Payment</strong></div>
              <div><span>Amount to Pay</span><strong data-modal-payment-amount>${dgMoney(minimum)}</strong></div>
              <div><span>Remaining Balance After Payment</span><strong data-modal-payment-remaining>${dgMoney(Math.max(total - minimum, 0))}</strong></div>
            </div>
            <div class="payment-modal-grid">
              <div class="payment-modal-column">
                <label>Mode of Payment
                  <small class="field-hint">Select the method you used for this payment.</small>
                  <select name="paymentMethod">
                    ${dgPaymentMethodOptions()}
                  </select>
                  <span class="field-error" data-error-for="paymentMethod"></span>
                </label>
                <label>Payment Date
                  <input type="date" name="paymentDate" max="${dgEscape(dgToday())}" />
                  <span class="field-error" data-error-for="paymentDate"></span>
                </label>
                <label>Payment Reference Number
                  <input type="text" name="referenceNumber" placeholder="GCash, bank, or receipt reference" />
                  <span class="field-error" data-error-for="referenceNumber"></span>
                </label>
                <label class="receipt-upload-field">Receipt File
                  <input type="file" name="receiptFile" accept=".jpg,.jpeg,.png,.pdf" />
                  <small class="field-hint field-helper">JPG, PNG, or PDF up to 5MB.</small>
                  <small class="field-hint" data-modal-receipt-hint></small>
                  <span class="field-error" data-error-for="receiptFile"></span>
                </label>
              </div>
              <div class="payment-modal-column payment-modal-side">
                <label>Notes <span class="optional">Optional</span>
                  <textarea name="notes" rows="7" placeholder="Add any notes that may help us review your receipt."></textarea>
                </label>
                <div class="payment-modal-reminder">
                  <strong>Before submitting</strong>
                  <span>Make sure the receipt clearly shows the amount paid and reference number.</span>
                </div>
              </div>
            </div>
            <span class="field-error" data-error-for="amountPaid"></span>
            <div class="payment-action-row">
              <button class="btn ghost" type="button" data-close-payment-modal>Cancel</button>
              <button class="btn primary" type="submit">Submit Receipt</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

function dgUpdatePaymentChoicePanel(panel) {
  if (!panel) return;
  const total = Number(panel.dataset.total || 0);
  const minimum = Number(panel.dataset.minimum || 0);
  const selected = panel.dataset.selectedPaymentOption || 'downpayment';
  const customInput = panel.querySelector('[data-custom-payment-amount]');
  const amount = selected === 'full'
    ? total
    : selected === 'custom'
      ? Number(customInput?.value || 0)
      : minimum;
  const customInvalid = selected === 'custom' && (amount < minimum || amount > total);
  const remaining = Math.max(total - amount, 0);
  panel.querySelectorAll('.payment-option-card').forEach((card) => {
    const isSelected = card.dataset.paymentOption === selected;
    card.classList.toggle('selected', isSelected);
    card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
  });
  const customField = panel.querySelector('[data-custom-payment-field]');
  if (customField) customField.hidden = selected !== 'custom';
  const helper = panel.querySelector('[data-payment-helper]');
  if (helper) {
    helper.textContent = customInvalid
      ? (amount < minimum ? `Minimum allowed: ${dgMoney(minimum)}` : `Maximum allowed: ${dgMoney(total)}`)
      : selected === 'full'
      ? 'Settles the full package amount.'
      : selected === 'custom'
        ? `Minimum allowed: ${dgMoney(minimum)}`
        : 'Minimum reservation payment.';
    helper.classList.toggle('error-text', customInvalid);
  }
  const remainingText = dgMoney(remaining);
  const amountMain = panel.querySelector('[data-payment-amount]');
  const remainingMain = panel.querySelector('[data-payment-remaining]');
  const link = panel.querySelector('[data-payment-choice-link]');
  if (amountMain) amountMain.textContent = dgMoney(amount);
  if (remainingMain) remainingMain.textContent = remainingText;
  if (link) {
    link.setAttribute('aria-disabled', customInvalid ? 'true' : 'false');
    link.dataset.paymentModalOption = selected;
    link.dataset.paymentModalAmount = String(amount);
  }
}

function dgPaymentChoiceValue(panel) {
  if (!panel) return null;
  const total = Number(panel.dataset.total || 0);
  const minimum = Number(panel.dataset.minimum || 0);
  const balance = Number(panel.dataset.balance || 0);
  const selectedType = panel.dataset.selectedPaymentOption || 'downpayment';
  const customInput = panel.querySelector('[data-custom-payment-amount]');
  const amountPaid = selectedType === 'full'
    ? total
    : selectedType === 'custom'
      ? Number(customInput?.value || 0)
      : selectedType === 'balance'
        ? balance
      : minimum;
  return {
    selectedType,
    amountPaid,
    remainingAfterPayment: selectedType === 'balance' ? Math.max(balance - amountPaid, 0) : Math.max(total - amountPaid, 0),
    total,
    minimum
  };
}

function dgOpenPaymentReceiptModal(panel, booking) {
  const modal = panel?.querySelector('[data-payment-modal]');
  if (!modal) return;
  const choice = dgPaymentChoiceValue(panel);
  if (!choice) return;
  const legacyAmountInput = modal.querySelector('[data-legacy-payment-amount]');
  if (!legacyAmountInput && ((choice.selectedType !== 'balance' && choice.amountPaid < choice.minimum) || choice.amountPaid > choice.total)) {
    dgUpdatePaymentChoicePanel(panel);
    return;
  }
  const form = modal.querySelector('[data-payment-modal-form]');
  if (form) {
    form.reset();
    dgClearFieldErrors(form);
    if (form.paymentDate) form.paymentDate.max = dgToday();
  }
  modal.dataset.paymentType = choice.selectedType;
  modal.dataset.paymentAmount = String(choice.amountPaid);
  const type = modal.querySelector('[data-modal-payment-type]');
  const amount = modal.querySelector('[data-modal-payment-amount]');
  const remaining = modal.querySelector('[data-modal-payment-remaining]');
  const hint = modal.querySelector('[data-modal-receipt-hint]');
  if (type) type.textContent = dgPaymentLabel(choice.selectedType);
  if (amount) amount.textContent = legacyAmountInput && !choice.amountPaid ? 'Enter amount below' : dgMoney(choice.amountPaid);
  if (remaining) remaining.textContent = dgMoney(choice.remainingAfterPayment);
  if (hint) hint.textContent = '';
  modal.hidden = false;
  document.body.classList.add('payment-modal-open');
  window.requestAnimationFrame(() => {
    const focusTarget = modal.querySelector('input[name="paymentDate"]') || modal.querySelector('[data-close-payment-modal]');
    if (focusTarget) focusTarget.focus();
  });
}

function dgClosePaymentReceiptModal(modal) {
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove('payment-modal-open');
}

function dgValidatePaymentReceiptForm(form, booking, selectedType, amountPaid) {
  dgClearFieldErrors(form);
  let valid = true;
  const file = form.receiptFile.files[0];
  const allowedTypes = ['jpg', 'jpeg', 'png', 'pdf'];
  const extension = file ? file.name.split('.').pop().toLowerCase() : '';
  const total = Number(booking.invoice?.totalAmount || 0);
  const minimum = Number(booking.invoice?.downPaymentAmount || total * 0.5 || 0);

  if (!form.paymentMethod || !form.paymentMethod.value) { dgSetFieldError(form, 'paymentMethod', 'Mode of payment is required.'); valid = false; }
  if (!form.paymentDate.value) { dgSetFieldError(form, 'paymentDate', 'Payment date is required.'); valid = false; }
  if (form.paymentDate.value && dgIsFutureDate(form.paymentDate.value)) { dgSetFieldError(form, 'paymentDate', 'Payment date cannot be in the future.'); valid = false; }
  if (!form.referenceNumber.value.trim()) { dgSetFieldError(form, 'referenceNumber', 'Payment reference number is required.'); valid = false; }
  if (!file) { dgSetFieldError(form, 'receiptFile', 'Receipt file is required.'); valid = false; }
  if (file && !allowedTypes.includes(extension)) { dgSetFieldError(form, 'receiptFile', 'Receipt must be jpg, jpeg, png, or pdf.'); valid = false; }
  if (file && file.size > 5 * 1024 * 1024) { dgSetFieldError(form, 'receiptFile', 'Receipt file must be 5MB or smaller.'); valid = false; }
  if (!amountPaid || amountPaid <= 0) { dgSetFieldError(form, 'amountPaid', 'Amount paid must be greater than 0.'); valid = false; }
  if (selectedType !== 'balance' && amountPaid < minimum) { dgSetFieldError(form, 'amountPaid', 'Payment amount must be at least 50% of the total package amount.'); valid = false; }
  if (selectedType !== 'balance' && total > 0 && amountPaid > total) { dgSetFieldError(form, 'amountPaid', 'Payment amount cannot exceed the total package amount.'); valid = false; }
  if (selectedType === 'full' && total > 0 && amountPaid !== total) { dgSetFieldError(form, 'amountPaid', `Full payment must match the total package amount of ${dgMoney(total)}.`); valid = false; }

  return valid;
}

function dgCanCancel(booking) {
  return booking.status === 'Pending Review';
}

function dgClientNextStep(booking) {
  dgNormalizeBookingDefaults(booking);
  if (booking.status === 'Pending Review') return 'DG Film Co. is reviewing your booking request.';
  if (booking.status === 'Approved for Meeting') return 'DG Film Co. will contact you with a consultation schedule.';
  if (booking.status === 'Meeting Scheduled' && booking.meetingStatus === 'Scheduled') return 'Next step: confirm the scheduled meeting or request a reschedule.';
  if (booking.status === 'Meeting Scheduled') return 'Next step: attend the scheduled meeting so the booking can be confirmed.';
  if (booking.status === 'Confirmed' && ['Awaiting Payment', 'Awaiting Down Payment'].includes(booking.paymentStatus)) return 'Your invoice is ready. Upload a receipt for at least 50% down payment, or pay the full amount now.';
  if (['Pending Verification', 'Down Payment Pending Verification', 'Balance Pending Verification'].includes(booking.paymentStatus)) return 'DG Film Co. is reviewing your submitted receipt.';
  if (booking.status === 'Confirmed' && dgDownPaymentVerified(booking)) return 'Next step: DG Film Co. will prepare your production schedule.';
  if (booking.status === 'Scheduled') return 'Next step: production is scheduled. Staff will update progress here.';
  if (['On Shoot', 'Editing'].includes(booking.status)) return 'Next step: track production progress until completion.';
  if (booking.status === 'Ready for Delivery' && booking.invoice && booking.invoice.balanceStatus !== 'Verified') return 'Your remaining balance must be settled before final delivery.';
  if (booking.status === 'Ready for Delivery') return 'Your final files are ready.';
  if (booking.status === 'Completed') return 'Your project is complete. You can review updates and open your final deliverables.';
  if (booking.status === 'Rejected') return 'This request was rejected. You can submit a new booking with updated details.';
  if (booking.status === 'Cancelled') return 'This booking was cancelled.';
  return 'Your next step will appear here as your project moves forward.';
}

function dgClientPortalMessage(booking) {
  dgNormalizeBookingDefaults(booking);
  if (booking.status === 'Pending Review') return 'DG Film Co. is reviewing your request.';
  if (booking.status === 'Approved for Meeting') return 'Your request has been approved. Please wait for the meeting schedule.';
  if (booking.status === 'Meeting Scheduled' && booking.meetingStatus === 'Scheduled') return 'Your consultation meeting is scheduled. Confirm the time or request a reschedule in your project details.';
  if (booking.status === 'Meeting Scheduled') return 'Your consultation meeting is confirmed. Please attend on the scheduled date and time.';
  if (booking.status === 'Confirmed' && ['Awaiting Payment', 'Awaiting Down Payment'].includes(booking.paymentStatus)) return 'Your booking is confirmed. Upload a receipt for at least 50% down payment, or pay the full amount now.';
  if (['Pending Verification', 'Down Payment Pending Verification', 'Balance Pending Verification'].includes(booking.paymentStatus)) return 'DG Film Co. is reviewing your payment receipt.';
  if (booking.paymentStatus === 'Needs Resubmission') return 'Your payment receipt needs to be resubmitted.';
  if (booking.paymentStatus === 'Down Payment Verified') return 'Your down payment is verified. Production scheduling can proceed while the remaining balance stays tracked.';
  if (booking.paymentStatus === 'Fully Paid') return 'Your invoice is fully paid.';
  if (booking.status === 'Scheduled') return 'Your project has been scheduled and is ready for production.';
  if (booking.status === 'On Shoot') return 'Your event coverage is currently in progress.';
  if (booking.status === 'Editing') return 'Your media is now in post-production.';
  if (booking.status === 'Ready for Delivery' && booking.invoice && booking.invoice.balanceStatus !== 'Verified') return 'Your final files are ready, and the remaining balance must be settled before delivery.';
  if (booking.status === 'Ready for Delivery') return 'Your final files are ready.';
  if (booking.status === 'Completed') return 'Your final files are ready. You may open deliverables and leave feedback.';
  return dgClientNextStep(booking).replace(/^Next step:\s*/i, '');
}

function dgClientBookingsFor(currentUser) {
  return dgBookings()
    .filter((booking) => booking.clientId === currentUser.id)
    .map(dgNormalizeBookingDefaults);
}

function dgMostRecentBooking(bookings) {
  return bookings.slice().sort((a, b) => new Date(b.createdAt || b.eventDate || 0) - new Date(a.createdAt || a.eventDate || 0))[0] || null;
}

function dgClientPhaseTitle(booking) {
  const key = dgCurrentPhaseKey(booking);
  const phase = DG_CLIENT_PHASES.find((item) => item.key === key);
  return phase ? phase.title : 'Closed';
}

const DG_CLIENT_PHASES = [
  {
    key: 'booking',
    title: 'Booking Submitted',
    currentText: 'Your booking request has been submitted. DG Film Co. is reviewing your event details.',
    upcomingText: 'Your booking request will appear here once submitted.'
  },
  {
    key: 'meeting',
    title: 'Meeting',
    currentText: 'Your consultation is the current step. Review the meeting details and prepare any questions about your event, package, and preferred style.',
    upcomingText: 'DG Film Co. will schedule a consultation before confirmation.'
  },
  {
    key: 'payment',
    title: 'Payment',
    currentText: 'Your booking has been confirmed. Upload a receipt for at least 50% down payment, or pay the full amount now.',
    upcomingText: 'Payment will be available once your booking is confirmed and an invoice is prepared.'
  },
  {
    key: 'production',
    title: 'Production',
    currentText: 'Your project is now in production. Follow updates from the DG Film Co. team.',
    upcomingText: 'Production updates will appear after your payment is verified and your project is scheduled.'
  },
  {
    key: 'delivery',
    title: 'Final Deliverables',
    currentText: 'Your project has been completed. Thank you for booking DG Film Co.',
    upcomingText: 'Final deliverables will appear once the project is completed.'
  }
];

function dgIsClosedBooking(booking) {
  return ['Rejected', 'Cancelled'].includes(booking.status);
}

function dgCurrentPhaseKey(booking) {
  dgNormalizeBookingDefaults(booking);
  if (dgIsClosedBooking(booking)) return 'closed';
  if (booking.status === 'Completed') return 'delivery';
  if (booking.status === 'Ready for Delivery' && booking.invoice && booking.invoice.balanceStatus !== 'Verified') return 'payment';
  if (dgBalanceNeedsAttention(booking)) return 'payment';
  if (['Awaiting Payment', 'Awaiting Down Payment', 'Pending Verification', 'Down Payment Pending Verification', 'Needs Resubmission', 'Payment Rejected'].includes(booking.paymentStatus)) return 'payment';
  if (dgDownPaymentVerified(booking)) return 'production';
  if (['Scheduled', 'On Shoot', 'Editing', 'Ready for Delivery'].includes(booking.status)) return 'production';
  if (['Approved for Meeting', 'Meeting Scheduled'].includes(booking.status)) return 'meeting';
  return 'booking';
}

function dgCurrentStepSectionId(booking) {
  dgNormalizeBookingDefaults(booking);
  if (['Cancelled', 'Rejected'].includes(booking.status)) return 'booking-step-summary';
  if (booking.status === 'Completed') return 'booking-step-delivery';
  if (['Scheduled', 'On Shoot', 'Editing', 'Ready for Delivery', 'Ready for Staff Assignment'].includes(booking.status)) return 'booking-step-production';
  if (['Down Payment Verified', 'Ready for Staff Assignment'].includes(booking.paymentStatus) || dgDownPaymentVerified(booking)) return 'booking-step-production';
  if (['Down Payment Pending Verification', 'Pending Verification', 'Balance Pending Verification'].includes(booking.paymentStatus)) return 'booking-step-payment';
  if (['Confirmed', 'Booking Confirmed'].includes(booking.status) || ['Awaiting Payment', 'Awaiting Down Payment'].includes(booking.paymentStatus)) return 'booking-step-payment';
  if (['Approved for Meeting', 'Meeting Scheduled'].includes(booking.status)) return 'booking-step-meeting';
  return 'booking-step-review';
}

function dgPhaseStateMap(booking) {
  const currentKey = dgCurrentPhaseKey(booking);
  if (currentKey === 'closed') {
    return DG_CLIENT_PHASES.reduce((states, phase) => {
      states[phase.key] = 'closed';
      return states;
    }, {});
  }
  const currentIndex = DG_CLIENT_PHASES.findIndex((phase) => phase.key === currentKey);
  const states = DG_CLIENT_PHASES.reduce((nextStates, phase, index) => {
    nextStates[phase.key] = index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'upcoming';
    return nextStates;
  }, {});
  if (dgBalanceNeedsAttention(booking)) {
    states.payment = 'current';
  } else if (['Awaiting Payment', 'Awaiting Down Payment', 'Pending Verification', 'Down Payment Pending Verification', 'Needs Resubmission', 'Payment Rejected'].includes(booking.paymentStatus)) {
    states.payment = 'current';
  } else if (dgDownPaymentVerified(booking)) {
    states.payment = 'completed';
  } else {
    states.payment = 'upcoming';
  }
  return states;
}

function dgPhaseStateLabel(state) {
  if (state === 'completed') return 'Completed';
  if (state === 'current') return 'Current Step';
  if (state === 'closed') return 'Closed';
  return 'Upcoming';
}

function dgPhaseBadge(state) {
  const label = dgPhaseStateLabel(state);
  const icon = state === 'completed' ? '✓ ' : '';
  return `<span class="state-badge phase-badge">${icon}${label}</span>`;
}

function dgPaymentPhaseText(booking, state) {
  dgNormalizeBookingDefaults(booking);
  if (state === 'closed') return 'This booking is no longer active.';
  if (booking.paymentStatus === 'Fully Paid') return 'Your invoice is fully paid.';
  if (booking.status === 'Ready for Delivery' && booking.invoice && booking.invoice.balanceStatus === 'Pending Verification') return 'DG Film Co. is reviewing your balance payment receipt. Final files will be released after review.';
  if (booking.status === 'Ready for Delivery' && booking.invoice && booking.invoice.balanceStatus !== 'Verified') return 'Your final files are ready. Please settle the remaining balance to receive your deliverables.';
  if (dgDownPaymentVerified(booking)) return 'Your down payment has been verified. Remaining balance is tracked before the event date.';
  if (['Pending Verification', 'Down Payment Pending Verification', 'Balance Pending Verification'].includes(booking.paymentStatus)) return 'DG Film Co. is reviewing your submitted receipt.';
  if (booking.paymentStatus === 'Needs Resubmission') return 'Your payment receipt needs to be resubmitted. Please upload a clearer or valid receipt.';
  if (['Awaiting Payment', 'Awaiting Down Payment'].includes(booking.paymentStatus)) return 'Your booking has been confirmed. Upload a receipt for at least 50% down payment, or pay the full amount now.';
  if (state === 'completed') return 'Payment is complete.';
  return 'Payment will be available once your booking is confirmed and an invoice is prepared.';
}

function dgPhaseHelper(phase, state, booking) {
  if (phase && phase.key === 'payment' && booking) return dgPaymentPhaseText(booking, state);
  if (state === 'closed') return 'This booking is no longer active.';
  if (state === 'completed') return `${phase.title} is complete.`;
  if (state === 'current') return phase.currentText;
  return phase.upcomingText;
}

function dgRenderPhaseTracker(booking) {
  const states = dgPhaseStateMap(booking);
  return `
    <nav class="process-tracker phase-tracker" aria-label="Booking process progress">
      ${DG_CLIENT_PHASES.map((phase, index) => {
        const state = states[phase.key];
        const trackerState = state === 'closed' ? 'upcoming' : state;
        return `
          <article class="process-step phase-step ${trackerState} phase-${state}">
            <div class="phase-marker">${state === 'completed' ? '✓' : state === 'current' ? '●' : '○'}</div>
            <div>
              <h3>${dgEscape(phase.title)}</h3>
              ${dgPhaseBadge(state)}
              <p>${dgEscape(dgPhaseHelper(phase, state, booking))}</p>
            </div>
          </article>
        `;
      }).join('')}
    </nav>
  `;
}

function dgPhaseSection(key, title, content, booking) {
  const phase = DG_CLIENT_PHASES.find((item) => item.key === key);
  const state = dgPhaseStateMap(booking)[key] || 'upcoming';
  const sectionIds = {
    booking: 'booking-step-review',
    meeting: 'booking-step-meeting',
    payment: 'booking-step-payment',
    production: 'booking-step-production',
    delivery: 'booking-step-delivery'
  };
  return `
    <section class="detail-block process-card phase-card phase-${state}" id="${sectionIds[key]}" data-phase="${dgEscape(key)}">
      <div class="phase-section-header">
        <div>
          <p class="eyebrow">${dgEscape(dgPhaseStateLabel(state))}</p>
          <h2>${dgEscape(title)}</h2>
          <p>${dgEscape(phase ? dgPhaseHelper(phase, state, booking) : '')}</p>
        </div>
        ${dgPhaseBadge(state)}
      </div>
      ${content}
    </section>
  `;
}

function dgCurrentStepNotice(booking) {
  const currentKey = dgCurrentPhaseKey(booking);
  if (currentKey === 'closed') {
    return booking.status === 'Rejected'
      ? 'This booking request was rejected. Future process steps are closed for this booking.'
      : 'This booking was cancelled. Future process steps are closed for this booking.';
  }
  if (currentKey === 'production' && booking.status === 'Confirmed' && dgDownPaymentVerified(booking)) {
    return 'Your down payment has been verified. DG Film Co. will schedule production next.';
  }
  if (currentKey === 'payment') {
    if (['Pending Verification', 'Down Payment Pending Verification', 'Balance Pending Verification'].includes(booking.paymentStatus)) return 'DG Film Co. is reviewing your submitted receipt.';
    if (booking.paymentStatus === 'Needs Resubmission') return 'Your payment receipt needs to be resubmitted. Please upload a clearer or valid receipt.';
    return 'Your booking has been confirmed. Please review your invoice and upload a receipt for at least 50% down payment, or pay the full amount now.';
  }
  const phase = DG_CLIENT_PHASES.find((item) => item.key === currentKey);
  return phase ? phase.currentText : dgClientNextStep(booking);
}

function dgPaymentDetails(booking) {
  dgNormalizeBookingDefaults(booking);
  const invoice = booking.invoice;
  if (invoice) {
    const dpStatus = invoice.downPaymentStatus;
    const balStatus = invoice.balanceStatus;
    const fullyPaid = dpStatus === 'Verified' && balStatus === 'Verified';
    const balanceDue = dpStatus === 'Verified' && ['Unpaid', 'Needs Resubmission', 'Rejected'].includes(balStatus);
    const eventApproaching = booking.eventDate && !fullyPaid && (new Date(booking.eventDate) - new Date(dgToday())) / (1000 * 60 * 60 * 24) <= 7;
    const dpAction = dgPaymentAction(booking, 'downpayment');
    const balAction = dgPaymentAction(booking, 'balance');
    const initialPaymentChoices = dgPaymentUploadType(booking, 'downpayment') === 'downpayment';

    const readyForDelivery = booking.status === 'Ready for Delivery';
    const deliveryLocked = readyForDelivery && !fullyPaid;

    let statusMessages = '';
    if (fullyPaid) {
      statusMessages = '<div class="balance-warning" style="border-color:rgba(151,219,160,0.35);background:rgba(90,174,103,0.1);color:#bfe8c4;">All payments have been completed. Your invoice is fully paid.</div>';
    } else {
      if (dpStatus === 'Pending Verification') statusMessages += '<div class="empty-state">DG Film Co. is reviewing your down payment receipt.</div>';
      if (dpStatus === 'Verified' && !fullyPaid) statusMessages += '<div class="empty-state">Your down payment has been verified.</div>';
      if (balStatus === 'Pending Verification') {
        statusMessages += deliveryLocked
          ? '<div class="balance-warning urgent">DG Film Co. is reviewing your balance payment receipt. Final files will be released after review.</div>'
          : '<div class="empty-state">DG Film Co. is reviewing your balance payment receipt.</div>';
      }
      if (balanceDue) {
        if (deliveryLocked) {
          statusMessages += '<div class="balance-warning urgent">Your final files are ready, but the remaining balance must be settled before delivery. Please upload your balance payment receipt.</div>';
        } else if (eventApproaching) {
          statusMessages += '<div class="balance-warning urgent">Your event date is approaching. Please settle the remaining balance before the event.</div>';
        } else {
          statusMessages += '<div class="balance-warning">Remaining balance must be settled before the event date.</div>';
        }
      }
    }

    return `
      <article class="invoice-card">
        <div class="invoice-card-header">
          <div>
            <p class="eyebrow">Invoice / Billing</p>
            <h3>${dgEscape(invoice.invoiceId)}</h3>
          </div>
          ${dgBadge(invoice.invoiceStatus)}
        </div>
        ${dgPaymentInstructions()}
        ${dgPaymentReceiptFeedback ? `<div class="payment-inline-success" role="status">${dgEscape(dgPaymentReceiptFeedback)}</div>` : ''}
        ${initialPaymentChoices ? dgPaymentSelectionPanel(booking) : `
        <div class="invoice-summary">
          <div class="amount-large"><span>Total Package Amount</span><strong>${dgMoney(invoice.totalAmount)}</strong></div>
          <div><span>Remaining Balance</span><strong>${dgMoney(invoice.balanceAmount)}</strong></div>
          <div><span>Invoice Status</span><strong>${dgBadge(invoice.invoiceStatus)}</strong></div>
        </div>
        `}
        ${!initialPaymentChoices ? `<div class="billing-grid">
          <div class="payment-status-card"><span>Service Type</span><strong>${dgEscape(invoice.serviceType)}</strong></div>
          <div class="payment-status-card"><span>Package</span><strong>${dgEscape(invoice.packageName)}</strong></div>
          <div class="payment-status-card"><span>Down Payment Status</span><strong>${dgBadge(dpStatus)}</strong></div>
          <div class="payment-status-card"><span>Balance Status</span><strong>${dgBadge(balStatus)}</strong></div>
          <div class="payment-status-card"><span>Invoice Status</span><strong>${dgBadge(invoice.invoiceStatus)}</strong></div>
        </div>` : ''}
        ${!initialPaymentChoices ? `<p class="table-helper">${dgEscape(invoice.dueNote)}</p>` : ''}
        ${statusMessages}
        ${!fullyPaid && ((initialPaymentChoices ? '' : dpAction) || balAction) ? `<div class="invoice-actions">${initialPaymentChoices ? '' : dpAction}${balAction}</div>` : ''}
      </article>
    `;
  }
  if (['Pending Verification', 'Down Payment Pending Verification'].includes(booking.paymentStatus)) {
    return `${dgPaymentInstructions()}${dgPaymentReceiptFeedback ? `<div class="payment-inline-success" role="status">${dgEscape(dgPaymentReceiptFeedback)}</div>` : ''}<div class="empty-state">DG Film Co. is reviewing your submitted receipt.</div>`;
  }
  if (['Awaiting Payment', 'Awaiting Down Payment'].includes(booking.paymentStatus)) {
    return `
      <div class="empty-state payment-action-state">
        ${dgPaymentInstructions()}
        <p>Your booking has been confirmed. Upload a receipt for at least 50% down payment, or pay the full amount now.</p>
        ${dgPaymentAction(booking)}
      </div>
    `;
  }
  if (booking.paymentStatus === 'Needs Resubmission') {
    return `
      <div class="empty-state payment-action-state">
        ${dgPaymentInstructions()}
        ${dgPaymentReceiptFeedback ? `<div class="payment-inline-success" role="status">${dgEscape(dgPaymentReceiptFeedback)}</div>` : ''}
        <p>Your payment receipt needs to be resubmitted. Please upload a clearer or valid receipt.</p>
        ${dgPaymentAction(booking)}
      </div>
    `;
  }
  if (dgDownPaymentVerified(booking)) {
    return '<div class="empty-state">Your down payment has been verified.</div>';
  }
  if (booking.status === 'Confirmed') {
    return '<div class="empty-state">Your booking is confirmed. Payment details will appear once your invoice is prepared.</div>';
  }
  return '<div class="empty-state">Payment will be available once your booking is confirmed and an invoice is prepared.</div>';
}

function dgDeliveryDetails(booking) {
  if (booking.status === 'Completed') {
    const hasDelivery = booking.deliveryOutputLink || booking.deliveryFileName || booking.deliveryNotes || booking.deliveredAt;
    return `
      <div class="delivery-output-section">
        <div class="delivery-card">
          <h3>Final Deliverables</h3>
          <p>Your final files are ready.</p>
          ${hasDelivery ? `
            <p class="delivery-note"><strong>Delivery Notes:</strong> ${dgEscape(booking.deliveryNotes || 'No delivery notes were attached.')}</p>
            <p><strong>Delivered At:</strong> ${dgFormatDateTime(booking.deliveredAt)}</p>
            ${booking.deliveryOutputLink ? `
              <div class="delivery-actions">
                <a class="btn primary output-link-button" href="${dgEscape(booking.deliveryOutputLink)}" target="_blank" rel="noopener">Open Deliverables</a>
              </div>
            ` : ''}
            ${booking.deliveryFileName ? `
              <div class="file-meta-card">
                <h3>ZIP File Details</h3>
                <dl class="details-grid">
                  <div><dt>File Name</dt><dd>${dgEscape(booking.deliveryFileName)}</dd></div>
                  <div><dt>File Type</dt><dd>${dgEscape(booking.deliveryFileType || 'Not set')}</dd></div>
                  <div><dt>File Size</dt><dd>${dgFormatFileSize(booking.deliveryFileSize)}</dd></div>
                  <div><dt>Uploaded At</dt><dd>${dgFormatDateTime(booking.deliveryFileUploadedAt)}</dd></div>
                </dl>
                <button class="btn ghost file-detail-button" type="button">View File Details</button>
                <p class="muted-text">Your file details are ready for review.</p>
              </div>
            ` : ''}
          ` : '<div class="empty-state">Final deliverables will appear here once your project is completed.</div>'}
        </div>
        ${dgFeedbackPanel(booking)}
      </div>
    `;
  }
  return '<div class="empty-state">Final deliverables will appear here once the project is completed.</div>';
}

function dgFeedbackPanel(booking) {
  if (booking.feedback) {
    return `
      <div class="feedback-summary">
        <h3>Client Feedback</h3>
        <p><strong>Rating:</strong> ${booking.feedback.rating ? `${dgEscape(booking.feedback.rating)} / 5` : 'No rating selected'}</p>
        <p><strong>Comment:</strong> ${dgEscape(booking.feedback.comment || 'No comment provided')}</p>
        <p><strong>Submitted At:</strong> ${dgFormatDateTime(booking.feedback.submittedAt)}</p>
        <p class="form-message success">Thank you for your feedback.</p>
      </div>
    `;
  }
  return `
    <form class="feedback-form" id="feedbackForm" novalidate>
      <h3>Optional Feedback</h3>
      <label>Rating
        <select class="rating-select" name="rating">
          <option value="">Choose a rating</option>
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Very Good</option>
          <option value="3">3 - Good</option>
          <option value="2">2 - Fair</option>
          <option value="1">1 - Needs Improvement</option>
        </select>
      </label>
      <label>Feedback Comment
        <textarea name="comment" rows="4" maxlength="500" placeholder="Share your experience with DG Film Co."></textarea>
        <span class="field-error" data-error-for="feedback"></span>
      </label>
      <button class="btn primary" type="submit">Submit Feedback</button>
    </form>
  `;
}

function dgSetupFeedbackForm(bookingId, currentUser) {
  const form = document.getElementById('feedbackForm');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const error = form.querySelector('[data-error-for="feedback"]');
    const rating = form.rating.value || null;
    const comment = form.comment.value.trim();
    error.textContent = '';

    if (!rating && !comment) {
      error.textContent = 'Choose a rating or enter a feedback comment.';
      return;
    }
    if (comment.length > 500) {
      error.textContent = 'Feedback comment must be 500 characters or fewer.';
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    if (window.DGLoading) { DGLoading.show('Submitting feedback…'); DGLoading.disableButton(submitBtn); }
    try {
      const bookings = dgBookings();
      const booking = bookings.find((item) => item.id === bookingId && item.clientId === currentUser.id);
      if (!booking || booking.feedback) { if (window.DGLoading) { DGLoading.hide(); DGLoading.enableButton(submitBtn); } return; }
      const now = new Date().toISOString();
      booking.feedback = {
        rating,
        comment,
        submittedAt: now,
        clientName: currentUser.name || currentUser.fullName || currentUser.email
      };
      booking.history = Array.isArray(booking.history) ? booking.history : [];
      booking.history.push({
        date: now,
        action: 'Client feedback submitted',
        by: currentUser.name || currentUser.fullName || currentUser.email
      });
      dgSaveBookings(bookings);
      dgNotifyAdmin('Client feedback received', `${booking.clientName || 'A client'} submitted feedback for ${booking.id}.`, 'feedback', booking.id);
      dgNotifyClient(booking, 'Feedback received', `Thank you. Your feedback for ${booking.id} has been received.`, 'feedback');
      dgSetFlash('Thank you for your feedback.');
    } finally {
      if (window.DGLoading) { DGLoading.hide(); DGLoading.enableButton(submitBtn); }
    }
    dgRenderBookingDetails();
  });
}

function dgCancelBooking(id) {
  const currentUser = dgCurrentClient();
  if (!currentUser) return;
  const bookings = dgBookings();
  const booking = bookings.find((item) => item.id === id);
  if (!booking || booking.clientId !== currentUser.id) {
    window.location.href = 'unauthorized.html';
    return;
  }
  if (!dgCanCancel(booking)) return;
  booking.status = 'Cancelled';
  booking.history = Array.isArray(booking.history) ? booking.history : [];
  booking.history.push({
    date: new Date().toISOString(),
    action: 'Booking cancelled by client',
    by: currentUser.name || currentUser.fullName || currentUser.email
  });
  dgSaveBookings(bookings);
  dgNotifyAdmin('Booking cancelled', `${booking.clientName || 'A client'} cancelled booking ${booking.id}.`, 'booking', booking.id);
  dgNotifyClient(booking, 'Booking cancelled', `Your booking ${booking.id} has been cancelled.`, 'booking');
  dgSetFlash(`Booking ${id} has been cancelled.`);
  return true;
}

function dgPopulateServiceOptions(select) {
  if (!select) return;
  select.innerHTML = '<option value="">Choose a service</option>';
  const services = DGData.getJson(DGData.keys.services, [])
    .filter((service) => (service.status || 'Active') === 'Active');
  if (services.length) {
    services.forEach((service) => {
      const option = document.createElement('option');
      option.value = service.name;
      option.dataset.serviceId = service.id || '';
      option.textContent = service.name;
      select.appendChild(option);
    });
    return;
  }
  Object.keys(DG_SERVICE_PACKAGES).forEach((service) => {
    const option = document.createElement('option');
    option.value = service;
    option.textContent = service;
    select.appendChild(option);
  });
}

function dgPopulatePackageOptions(serviceSelect, packageSelect) {
  if (!serviceSelect || !packageSelect) return;
  packageSelect.innerHTML = '<option value="">Choose a package</option>';
  const selectedServiceId = serviceSelect.selectedOptions[0] ? serviceSelect.selectedOptions[0].dataset.serviceId : '';
  const packages = DGData.getJson(DGData.keys.pricing, [])
    .filter((item) => (item.status || 'Active') === 'Active')
    .filter((item) => item.serviceId === selectedServiceId || item.serviceName === serviceSelect.value);

  if (packages.length) {
    packages.forEach((pkg) => {
      const option = document.createElement('option');
      option.value = pkg.packageName;
      option.dataset.packageId = pkg.id || '';
      option.textContent = pkg.packageName;
      packageSelect.appendChild(option);
    });
    return;
  }

  (DG_SERVICE_PACKAGES[serviceSelect.value] || []).forEach((packageName) => {
    const option = document.createElement('option');
    option.value = packageName;
    option.textContent = packageName;
    packageSelect.appendChild(option);
  });
}

function dgUpdatePackagePreview(form) {
  const preview = document.getElementById('packagePreview');
  if (!preview || !form) return;
  const packageId = form.packageName.selectedOptions[0] ? form.packageName.selectedOptions[0].dataset.packageId : '';
  const pkg = DGData.getJson(DGData.keys.pricing, []).find((item) => item.id === packageId);
  if (!pkg) {
    const selectedPackage = form.packageName.value;
    preview.innerHTML = selectedPackage
      ? `<span>${dgEscape(selectedPackage)}</span><p>Package selected. Final inclusions and pricing can still be discussed during consultation.</p>`
      : '<span>Selected package summary</span><p>Choose a package that matches your coverage needs. Final details can still be discussed during consultation.</p>';
    return;
  }
  preview.innerHTML = `
    <span>${dgEscape(pkg.packageName)} | PHP ${Number(pkg.price || 0).toLocaleString('en-PH')}</span>
    <ul>${(pkg.deliverables || []).map((item) => `<li>${dgEscape(item)}</li>`).join('')}</ul>
  `;
}

function dgSetupBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;
  const currentUser = dgCurrentClient();
  if (!currentUser) return;

  const serviceSelect = form.serviceType;
  const packageSelect = form.packageName;
  dgPopulateServiceOptions(serviceSelect);
  const requestedOptions = new URLSearchParams(window.location.search);
  const requestedService = requestedOptions.get('service');
  const requestedPackage = requestedOptions.get('package');
  const selectedService = DG_SERVICE_ALIASES[requestedService] || requestedService;
  if (selectedService && Array.from(serviceSelect.options).some((option) => option.value === selectedService)) {
    serviceSelect.value = selectedService;
  }
  dgPopulatePackageOptions(serviceSelect, packageSelect);
  if (requestedPackage && Array.from(packageSelect.options).some((option) => option.value === requestedPackage)) {
    packageSelect.value = requestedPackage;
  }
  form.eventDate.min = dgToday();
  dgUpdatePackagePreview(form);

  serviceSelect.addEventListener('change', () => {
    dgPopulatePackageOptions(serviceSelect, packageSelect);
    dgUpdatePackagePreview(form);
  });
  packageSelect.addEventListener('change', () => dgUpdatePackagePreview(form));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    dgClearFieldErrors(form);
    let valid = true;

    const values = {
      serviceType: form.serviceType.value,
      serviceId: form.serviceType.selectedOptions[0] ? form.serviceType.selectedOptions[0].dataset.serviceId || '' : '',
      packageName: form.packageName.value,
      packageId: form.packageName.selectedOptions[0] ? form.packageName.selectedOptions[0].dataset.packageId || '' : '',
      eventDate: form.eventDate.value,
      eventTime: form.eventTime.value,
      location: form.location.value.trim(),
      budget: form.budget.value,
      contactNumber: form.contactNumber.value.trim(),
      preferredMeetingMode: form.preferredMeetingMode ? form.preferredMeetingMode.value : '',
      preferredMeetingNotes: form.preferredMeetingNotes ? form.preferredMeetingNotes.value.trim() : '',
      details: form.details.value.trim(),
      notes: form.notes.value.trim()
    };

    if (!values.serviceType) { dgSetFieldError(form, 'serviceType', 'Service type is required.'); valid = false; }
    if (!values.packageName) { dgSetFieldError(form, 'packageName', 'Package is required.'); valid = false; }
    if (!values.eventDate) { dgSetFieldError(form, 'eventDate', 'Event date is required.'); valid = false; }
    if (values.eventDate && dgIsPastDate(values.eventDate)) { dgSetFieldError(form, 'eventDate', 'Event date cannot be in the past.'); valid = false; }
    if (!values.eventTime) { dgSetFieldError(form, 'eventTime', 'Event time is required.'); valid = false; }
    if (!values.location) { dgSetFieldError(form, 'location', 'Event location is required.'); valid = false; }
    if (!values.budget) { dgSetFieldError(form, 'budget', 'Budget range is required.'); valid = false; }
    if (!values.contactNumber) { dgSetFieldError(form, 'contactNumber', 'Contact number is required.'); valid = false; }
    if (values.contactNumber && !dgValidPhone(values.contactNumber)) { dgSetFieldError(form, 'contactNumber', 'Use 09XXXXXXXXX or +639XXXXXXXXX.'); valid = false; }
    if (!values.details) { dgSetFieldError(form, 'details', 'Event details are required.'); valid = false; }
    if (values.details && values.details.length < 20) { dgSetFieldError(form, 'details', 'Event details must be at least 20 characters.'); valid = false; }
    if (!form.terms.checked) { dgSetFieldError(form, 'terms', 'Please agree to the booking terms.'); valid = false; }

    if (!valid) return;

    const submitBtn = form.querySelector('[type="submit"]');
    if (window.DGLoading) { DGLoading.show('Creating booking…'); DGLoading.disableButton(submitBtn); }
    const bookings = dgBookings();
    const booking = {
      id: dgNextId('BKG', bookings),
      clientId: currentUser.id,
      clientName: currentUser.name || currentUser.fullName,
      serviceId: values.serviceId,
      serviceName: values.serviceType,
      serviceType: values.serviceType,
      packageId: values.packageId,
      packageName: values.packageName,
      eventDate: values.eventDate,
      eventTime: values.eventTime,
      location: values.location,
      budget: values.budget,
      contactNumber: values.contactNumber,
      preferredMeetingMode: values.preferredMeetingMode,
      preferredMeetingNotes: values.preferredMeetingNotes,
      details: values.details,
      notes: values.notes,
      status: 'Pending Review',
      paymentStatus: 'Not Required Yet',
      meetingStatus: 'Not Scheduled',
      meetingClientConfirmation: null,
      meetingDate: '',
      meetingTime: '',
      meetingMode: '',
      meetingLocation: '',
      meetingNotes: '',
      assignedStaffId: null,
      createdAt: new Date().toISOString(),
      history: [{
        date: new Date().toISOString(),
        action: 'Booking request submitted',
        by: currentUser.name || currentUser.fullName || currentUser.email
      }]
    };
    bookings.push(booking);
    dgSaveBookings(bookings);
    dgNotifyClient(booking, 'Booking request submitted', `Your booking request ${booking.id} has been received and is ready for review.`, 'booking');
    dgNotifyAdmin('New booking request', `${booking.clientName} submitted a booking request for ${booking.serviceType}.`, 'booking', booking.id);
    dgSetFlash('Your booking request has been submitted. DG Film Co. will review your details and update your project status soon.');
    window.location.href = 'my-bookings.html';
  });
}

function dgRenderBookings() {
  const list = document.getElementById('bookingsList');
  if (!list) return;
  const currentUser = dgCurrentClient();
  if (!currentUser) return;

  const search = document.getElementById('bookingSearch');
  const filter = document.getElementById('statusFilter');
  const render = () => {
    const query = (search.value || '').toLowerCase();
    const status = filter.value;
    const bookings = dgBookings()
      .filter((booking) => booking.clientId === currentUser.id)
      .map(dgNormalizeBookingDefaults)
      .filter((booking) => status === 'All' || booking.status === status)
      .filter((booking) => booking.id.toLowerCase().includes(query) || booking.serviceType.toLowerCase().includes(query));

    if (!bookings.length) {
      list.innerHTML = '<div class="empty-state"><h3>No projects yet.</h3><p>Start a booking request to begin your DG Film Co. project.</p><a class="btn primary" href="book-service.html">Book a Service</a></div>';
      return;
    }

    list.innerHTML = bookings.map((booking) => `
      <article class="booking-card project-card phase-${dgPhaseStateMap(booking)[dgCurrentPhaseKey(booking)] || 'upcoming'}">
        <div>
          <p class="eyebrow">${dgEscape(booking.id)}</p>
          <h3>${dgEscape(booking.serviceType)}</h3>
          <p>${dgEscape(booking.packageName)} | ${dgFormatDate(booking.eventDate)}</p>
          <p><strong>Current phase:</strong> ${dgEscape(dgClientPhaseTitle(booking))}</p>
          <p>Meeting: ${dgEscape(dgDisplayStatus(booking.meetingStatus || 'Not Scheduled'))}</p>
          ${['Scheduled', 'Confirmed by Client'].includes(booking.meetingStatus) ? `<p>${dgFormatDate(booking.meetingDate)} at ${dgEscape(dgFormatTime(booking.meetingTime))} | ${dgEscape(booking.meetingMode || 'Not set')}</p>` : ''}
          <p class="next-step">${dgEscape(dgClientPortalMessage(booking))}</p>
        </div>
        <div class="badge-row">${dgBadge(booking.status)} ${dgBadge(booking.meetingStatus)} ${dgBadge(booking.paymentStatus)}</div>
        <div class="card-actions">
          <a class="btn ghost" href="booking-details.html?id=${booking.id}">View Details</a>
          ${dgCanUploadPayment(booking) ? `<a class="btn ghost" href="upload-payment.html?id=${booking.id}&type=${dgPaymentUploadType(booking)}">Upload Payment</a>` : ''}
          ${booking.status === 'Completed' ? `<a class="btn ghost" href="booking-details.html?id=${booking.id}#booking-step-delivery">Open Deliverables</a>` : ''}
          ${booking.status === 'Completed' && !booking.feedback ? `<a class="btn ghost" href="booking-details.html?id=${booking.id}#feedbackForm">Leave Feedback</a>` : ''}
          ${dgCanCancel(booking) ? `<button class="btn danger" type="button" data-cancel="${booking.id}">Cancel Booking</button>` : ''}
        </div>
      </article>
    `).join('');
  };

  search.addEventListener('input', render);
  filter.addEventListener('change', render);
  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cancel]');
    if (button) {
      const booking = dgBookings().find((item) => item.id === button.dataset.cancel);
      dgClientConfirmAction({
        title: 'Cancel this booking?',
        message: 'This will stop the booking request from continuing. DG Film Co. may still keep the record for reference.',
        confirmText: 'Cancel Booking',
        cancelText: 'Keep Booking',
        variant: 'danger',
        details: [`Booking ID: ${button.dataset.cancel}`, booking?.serviceType ? `Service: ${booking.serviceType}` : ''],
        onConfirm: () => {
          if (dgCancelBooking(button.dataset.cancel)) {
            dgShowFlash();
            render();
          }
        }
      });
    }
  });
  render();
}

function dgRenderBookingDetails() {
  const panel = document.getElementById('bookingDetails');
  if (!panel) return;
  const currentUser = dgCurrentClient();
  if (!currentUser) return;
  const params = new URLSearchParams(window.location.search);
  const booking = dgFindClientBooking(params.get('id'), currentUser);

  if (!booking) {
    panel.innerHTML = '<div class="empty-state">Booking was not found.</div>';
    return;
  }

  const users = DGData.getJson(DGData.keys.users, []);
  dgNormalizeBookingDefaults(booking);
  const staff = booking.assignedStaffId ? users.find((user) => user.id === booking.assignedStaffId) : null;
  const staffName = booking.assignedStaffName || (staff ? staff.fullName : 'Not assigned yet');
  panel.innerHTML = `
    <div class="details-header">
      <div><p class="eyebrow">${dgEscape(booking.id)}</p><h1>${dgEscape(booking.serviceType)}</h1></div>
      <div class="badge-row">${dgBadge(booking.status)} ${dgBadge(booking.meetingStatus)} ${dgBadge(booking.paymentStatus)}</div>
    </div>
    ${dgRenderPhaseTracker(booking)}
    <section class="detail-block next-step-block" id="booking-step-summary">
      <h2>Current Step</h2>
      <div class="current-step-notice">${dgEscape(dgCurrentStepNotice(booking))}</div>
    </section>
    ${dgPhaseSection('booking', 'Booking Summary', `
      <dl class="details-grid">
        <div><dt>Client Name</dt><dd>${dgEscape(booking.clientName)}</dd></div>
        <div><dt>Package</dt><dd>${dgEscape(booking.packageName)}</dd></div>
        <div><dt>Event Date / Time</dt><dd>${dgFormatDate(booking.eventDate)} at ${dgEscape(dgFormatTime(booking.eventTime))}</dd></div>
        <div><dt>Location</dt><dd>${dgEscape(booking.location)}</dd></div>
        <div><dt>Budget</dt><dd>${dgEscape(booking.budget)}</dd></div>
        <div><dt>Contact Number</dt><dd>${dgEscape(booking.contactNumber)}</dd></div>
        <div><dt>Assigned Staff</dt><dd>${dgEscape(staffName)}</dd></div>
        <div><dt>Created Date</dt><dd>${dgFormatDate(booking.createdAt)}</dd></div>
        <div><dt>Meeting Status</dt><dd>${dgBadge(booking.meetingStatus)}</dd></div>
        <div><dt>Payment Status</dt><dd>${dgBadge(booking.paymentStatus)}</dd></div>
        <div class="wide"><dt>Event Details</dt><dd>${dgEscape(booking.details)}</dd></div>
        <div class="wide"><dt>Additional Notes</dt><dd>${dgEscape(booking.notes || 'None')}</dd></div>
      </dl>
    `, booking)}
    ${dgPhaseSection('meeting', 'Meeting', dgMeetingSummary(booking), booking)}
    ${dgPhaseSection('payment', 'Payment', dgPaymentDetails(booking), booking)}
    ${dgPhaseSection('production', 'Production Updates', dgProductionTimeline(booking), booking)}
    ${dgPhaseSection('delivery', 'Final Deliverables', dgDeliveryDetails(booking), booking)}
    <div class="hero-actions">
      <a class="btn ghost" href="my-bookings.html">Back to My Projects</a>
      ${dgCanCancel(booking) ? `<button class="btn danger" type="button" data-cancel="${booking.id}">Cancel Booking</button>` : ''}
    </div>
  `;

  panel.querySelectorAll('[data-payment-choice-panel]').forEach(dgUpdatePaymentChoicePanel);
  panel.addEventListener('click', (event) => {
    const disabledPaymentLink = event.target.closest('[data-payment-choice-link][aria-disabled="true"]');
    if (disabledPaymentLink) {
      event.preventDefault();
      return;
    }
    const closeModalButton = event.target.closest('[data-close-payment-modal]');
    if (closeModalButton) {
      dgClosePaymentReceiptModal(closeModalButton.closest('[data-payment-modal]'));
      return;
    }
    const modalBackdrop = event.target.matches('[data-payment-modal]') ? event.target : null;
    if (modalBackdrop) {
      dgClosePaymentReceiptModal(modalBackdrop);
      return;
    }
    const uploadButton = event.target.closest('[data-open-payment-modal]');
    if (uploadButton) {
      event.preventDefault();
      const paymentPanel = uploadButton.closest('[data-payment-choice-panel]');
      dgOpenPaymentReceiptModal(paymentPanel, booking);
      return;
    }
    const option = event.target.closest('[data-payment-option]');
    if (!option) return;
    const paymentPanel = option.closest('[data-payment-choice-panel]');
    if (!paymentPanel) return;
    paymentPanel.dataset.selectedPaymentOption = option.dataset.paymentOption || 'downpayment';
    dgUpdatePaymentChoicePanel(paymentPanel);
  });
  panel.addEventListener('change', (event) => {
    const paymentPanel = event.target.closest('[data-payment-choice-panel]');
    if (paymentPanel) dgUpdatePaymentChoicePanel(paymentPanel);
  });
  panel.addEventListener('input', (event) => {
    const legacyAmountInput = event.target.closest('[data-legacy-payment-amount]');
    if (legacyAmountInput) {
      const modal = legacyAmountInput.closest('[data-payment-modal]');
      const amount = Number(legacyAmountInput.value || 0);
      const amountLabel = modal?.querySelector('[data-modal-payment-amount]');
      if (amountLabel) amountLabel.textContent = amount > 0 ? dgMoney(amount) : 'Enter amount below';
      return;
    }
    const paymentPanel = event.target.closest('[data-payment-choice-panel]');
    if (paymentPanel) dgUpdatePaymentChoicePanel(paymentPanel);
  });
  panel.addEventListener('change', (event) => {
    const receiptInput = event.target.closest('[data-payment-modal-form] input[name="receiptFile"]');
    if (!receiptInput) return;
    const modal = receiptInput.closest('[data-payment-modal]');
    const hint = modal?.querySelector('[data-modal-receipt-hint]');
    const file = receiptInput.files[0];
    if (!hint) return;
    if (!file) {
      hint.textContent = '';
      return;
    }
    const extension = file.name.split('.').pop().toLowerCase();
    hint.textContent = extension === 'pdf'
      ? 'PDF selected. The DG Film Co. team will review the uploaded receipt details.'
      : `Selected: ${file.name} (${dgFormatFileSize(file.size)})`;
  });
  panel.addEventListener('submit', async (event) => {
    const form = event.target.closest('[data-payment-modal-form]');
    if (!form) return;
    event.preventDefault();
    const modal = form.closest('[data-payment-modal]');
    const selectedType = dgNormalizePaymentFormType(modal?.dataset.paymentType) || 'downpayment';
    const legacyAmountInput = form.querySelector('[data-legacy-payment-amount]');
    const amountPaid = legacyAmountInput ? Number(legacyAmountInput.value || 0) : Number(modal?.dataset.paymentAmount || 0);
    if (!dgValidatePaymentReceiptForm(form, booking, selectedType, amountPaid)) return;

    const submitBtn = form.querySelector('[type="submit"]');
    if (window.DGLoading) { DGLoading.show('Uploading receipt...'); DGLoading.disableButton(submitBtn); }
    try {
      const result = await dgSubmitClientPaymentReceipt(currentUser, {
        bookingId: booking.id,
        selectedType,
        amountPaid,
        paymentMethod: form.paymentMethod.value,
        paymentDate: form.paymentDate.value,
        referenceNumber: form.referenceNumber.value,
        file: form.receiptFile.files[0],
        notes: form.notes.value
      });
      if (result.ok) {
        dgClosePaymentReceiptModal(modal);
        dgPaymentReceiptFeedback = 'Receipt submitted for admin verification.';
        dgRenderBookingDetails();
      }
    } finally {
      if (window.DGLoading) { DGLoading.hide(); DGLoading.enableButton(submitBtn); }
    }
  });
  panel.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const openModal = panel.querySelector('[data-payment-modal]:not([hidden])');
    if (openModal) dgClosePaymentReceiptModal(openModal);
  });

  if (params.get('scroll') === 'current-step') {
    const currentSection = document.getElementById(dgCurrentStepSectionId(booking));
    if (currentSection) {
      window.requestAnimationFrame(() => {
        currentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        currentSection.classList.add('current-step-focus');
        window.setTimeout(() => currentSection.classList.remove('current-step-focus'), 2000);
      });
    }
  }

  panel.addEventListener('click', (event) => {
    const productionUpdateButton = event.target.closest('[data-request-production-update]');
    if (productionUpdateButton) {
      productionUpdateButton.disabled = true;
      if (dgRequestProductionUpdate(booking)) {
        dgRenderBookingDetails();
      } else {
        productionUpdateButton.disabled = false;
      }
      return;
    }
    const confirmMeetingButton = event.target.closest('[data-confirm-meeting]');
    if (confirmMeetingButton) {
      dgClientConfirmAction({
        title: 'Confirm this meeting schedule?',
        message: 'This lets DG Film Co. know that the scheduled consultation works for you.',
        confirmText: 'Confirm Meeting',
        cancelText: 'Review Schedule',
        variant: 'success',
        details: [`Booking ID: ${booking.id}`],
        onConfirm: () => {
          if (window.DGLoading) { DGLoading.show('Confirming meeting…'); DGLoading.disableButton(confirmMeetingButton); }
          let ok = false;
          try { ok = dgConfirmMeetingSchedule(booking.id, currentUser); } finally { if (window.DGLoading) { DGLoading.hide(); DGLoading.enableButton(confirmMeetingButton); } }
          if (ok) { dgRenderBookingDetails(); dgShowFlash(); }
        }
      });
      return;
    }
    const rescheduleButton = event.target.closest('[data-open-reschedule]');
    if (rescheduleButton) {
      const form = document.getElementById('rescheduleForm');
      if (form) {
        form.hidden = false;
        rescheduleButton.hidden = true;
      }
      return;
    }
    const button = event.target.closest('[data-cancel]');
    if (button) {
      dgClientConfirmAction({
        title: 'Cancel this booking?',
        message: 'This will stop the booking request from continuing. DG Film Co. may still keep the record for reference.',
        confirmText: 'Cancel Booking',
        cancelText: 'Keep Booking',
        variant: 'danger',
        details: [`Booking ID: ${button.dataset.cancel}`],
        onConfirm: () => {
          if (dgCancelBooking(button.dataset.cancel)) window.location.href = 'my-bookings.html';
        }
      });
    }
  });
  const rescheduleForm = document.getElementById('rescheduleForm');
  if (rescheduleForm) {
    rescheduleForm.addEventListener('submit', (event) => {
      event.preventDefault();
      dgClearFieldErrors(rescheduleForm);
      const message = document.getElementById('rescheduleMessage');
      if (message) {
        message.textContent = '';
        message.className = 'form-message';
      }

      const values = {
        requestedDate: rescheduleForm.requestedDate.value,
        requestedTime: rescheduleForm.requestedTime.value,
        reason: rescheduleForm.reason.value.trim()
      };
      let valid = true;

      if (!values.requestedDate) { dgSetFieldError(rescheduleForm, 'requestedDate', 'Preferred new date is required.'); valid = false; }
      if (values.requestedDate && dgIsPastDate(values.requestedDate)) { dgSetFieldError(rescheduleForm, 'requestedDate', 'Preferred new date cannot be in the past.'); valid = false; }
      if (!values.requestedTime) { dgSetFieldError(rescheduleForm, 'requestedTime', 'Preferred new time is required.'); valid = false; }
      if (!values.reason) { dgSetFieldError(rescheduleForm, 'reason', 'Reason is required.'); valid = false; }
      if (values.reason && values.reason.length < 10) { dgSetFieldError(rescheduleForm, 'reason', 'Reason must be at least 10 characters.'); valid = false; }

      if (!valid) return;

      dgClientConfirmAction({
        title: 'Send reschedule request?',
        message: 'DG Film Co. will review your request and update the meeting schedule if approved.',
        confirmText: 'Send Request',
        cancelText: 'Cancel',
        variant: 'warning',
        details: [`Booking ID: ${booking.id}`],
        onConfirm: () => {
          const rescheduleBtn = rescheduleForm.querySelector('[type="submit"]');
          if (window.DGLoading) { DGLoading.show('Submitting reschedule request…'); DGLoading.disableButton(rescheduleBtn); }
          let rescheduleOk = false;
          try {
            rescheduleOk = dgSubmitRescheduleRequest(booking.id, currentUser, values);
          } finally {
            if (window.DGLoading) { DGLoading.hide(); DGLoading.enableButton(rescheduleBtn); }
          }
          if (rescheduleOk) {
            dgSetFlash('Reschedule request pending approval.');
            dgRenderBookingDetails();
            dgShowFlash();
          } else if (message) {
            message.textContent = 'Unable to submit this reschedule request.';
            message.className = 'form-message error';
          }
        }
      });
    });
  }
  dgSetupFeedbackForm(booking.id, currentUser);
}

function dgDashboardStats(bookings) {
  return {
    total: bookings.length,
    pending: bookings.filter((booking) => booking.status === 'Pending Review').length,
    active: bookings.filter((booking) => !['Completed', 'Cancelled', 'Rejected'].includes(booking.status)).length,
    completed: bookings.filter((booking) => booking.status === 'Completed').length,
    paymentsPending: bookings.filter((booking) => ['Awaiting Payment', 'Awaiting Down Payment', 'Pending Verification', 'Down Payment Pending Verification', 'Balance Pending Verification', 'Needs Resubmission', 'Payment Rejected'].includes(booking.paymentStatus)).length,
    outputsReady: bookings.filter((booking) => booking.status === 'Completed' && (booking.deliveryOutputLink || booking.deliveryFileName)).length
  };
}

function dgRenderActiveProject(booking) {
  const container = document.getElementById('activeProjectHighlight');
  const tracker = document.getElementById('dashboardProgressTracker');
  if (!container) return;

  if (!booking) {
    container.innerHTML = `
      <div class="empty-state portal-empty">
        <h3>No active project yet.</h3>
        <p>Start a booking request when you are ready. We will review the details and contact you for the next steps.</p>
        <a class="btn primary" href="book-service.html">Book a Service</a>
      </div>
    `;
    if (tracker) tracker.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <article class="active-project-card">
      <div>
        <p class="eyebrow">Active Project</p>
        <h3>${dgEscape(booking.serviceType)}</h3>
        <dl class="dashboard-project-meta">
          <div><dt>Booking ID</dt><dd>${dgEscape(booking.id)}</dd></div>
          <div><dt>Current Step</dt><dd>${dgEscape(dgClientPhaseTitle(booking))}</dd></div>
          <div><dt>Payment Status</dt><dd>${dgBadge(booking.paymentStatus)}</dd></div>
          <div><dt>Meeting Status</dt><dd>${dgBadge(booking.meetingStatus || 'Not Scheduled')}</dd></div>
        </dl>
        <p class="next-step"><strong>Next Action:</strong> ${dgEscape(dgClientPortalMessage(booking))}</p>
      </div>
      <div class="portal-card-actions">
        <div class="badge-row">${dgBadge(booking.status)}</div>
        <a class="btn primary" href="booking-details.html?id=${dgEscape(booking.id)}&scroll=current-step">View Project</a>
      </div>
    </article>
  `;
  if (tracker) tracker.innerHTML = dgRenderPhaseTracker(booking);
}

function dgRenderPortalCards(activeBooking, completedWithDelivery) {
  const nextStep = document.getElementById('nextStepCard');
  const meeting = document.getElementById('meetingReminderCard');
  const payment = document.getElementById('paymentReminderCard');
  const deliverables = document.getElementById('deliverablesCard');
  if (!nextStep || !meeting || !payment || !deliverables) return;

  nextStep.innerHTML = `
    <p class="eyebrow">Next step</p>
    <h3>${activeBooking ? dgEscape(dgClientPhaseTitle(activeBooking)) : 'Start a project'}</h3>
    <p>${activeBooking ? dgEscape(dgClientPortalMessage(activeBooking)) : 'Book a service to begin your DG Film Co. project.'}</p>
  `;

  if (activeBooking && (activeBooking.meetingStatus === 'Scheduled' || activeBooking.meetingDate)) {
    meeting.innerHTML = `
      <p class="eyebrow">Upcoming meeting</p>
      <h3>${dgFormatDate(activeBooking.meetingDate)} at ${dgEscape(dgFormatTime(activeBooking.meetingTime))}</h3>
      <p>${dgEscape(activeBooking.meetingMode || 'Meeting mode not set')}</p>
      <p>${dgEscape(activeBooking.meetingNotes || 'No meeting notes yet.')}</p>
      <a class="btn ghost" href="booking-details.html?id=${dgEscape(activeBooking.id)}&scroll=current-step">View Project</a>
    `;
  } else {
    meeting.innerHTML = `
      <p class="eyebrow">Meeting</p>
      <h3>Consultation details</h3>
      <p>Meeting details will appear once DG Film Co. schedules your consultation.</p>
    `;
  }

  if (activeBooking && dgCanUploadPayment(activeBooking)) {
    const type = dgPaymentUploadType(activeBooking);
    const isBalance = type === 'balance';
    payment.innerHTML = `
      <p class="eyebrow">Payment action needed</p>
      <h3>${isBalance ? 'Settle remaining balance' : 'Upload down payment'}</h3>
      <p>${activeBooking.paymentStatus === 'Needs Resubmission' ? 'Please resubmit your payment receipt with clearer or corrected details.' : isBalance ? 'Your remaining balance must be settled before final delivery.' : 'Your invoice is ready. Please submit your down payment receipt for review.'}</p>
      <a class="btn primary" href="upload-payment.html?id=${dgEscape(activeBooking.id)}&type=${type}">${isBalance ? 'Upload Balance Payment' : 'Upload Down Payment'}</a>
    `;
  } else if (activeBooking && ['Pending Verification', 'Down Payment Pending Verification', 'Balance Pending Verification'].includes(activeBooking.paymentStatus)) {
    payment.innerHTML = '<p class="eyebrow">Payment</p><h3>Payment under review.</h3><p>DG Film Co. is reviewing your submitted receipt.</p>';
  } else if (activeBooking && dgDownPaymentVerified(activeBooking)) {
    payment.innerHTML = '<p class="eyebrow">Payment</p><h3>Down payment verified.</h3><p>Production can proceed. Remaining balance is due before final delivery.</p>';
  } else {
    payment.innerHTML = '<p class="eyebrow">Payment</p><h3>No payment is due right now.</h3><p>Payment details will appear once your booking is confirmed and an invoice is prepared.</p>';
  }

  if (completedWithDelivery) {
    deliverables.innerHTML = `
      <p class="eyebrow">Final deliverables</p>
      <h3>${dgEscape(completedWithDelivery.serviceType)}</h3>
      <p>Delivered ${dgFormatDateTime(completedWithDelivery.deliveredAt)}</p>
      <a class="btn primary" href="booking-details.html?id=${dgEscape(completedWithDelivery.id)}#booking-step-delivery">Open Deliverables</a>
    `;
  } else {
    deliverables.innerHTML = `
      <p class="eyebrow">Final deliverables</p>
      <h3>Delivered files</h3>
      <p>Final deliverables will appear here once your project is completed.</p>
    `;
  }
}

function dgRenderQuickActions(activeBooking, completedBooking) {
  const container = document.getElementById('clientQuickActions');
  if (!container) return;
  const uploadType = activeBooking ? dgPaymentUploadType(activeBooking) : '';
  const paymentHref = activeBooking && uploadType ? `upload-payment.html?id=${dgEscape(activeBooking.id)}&type=${uploadType}` : 'upload-payment.html';
  container.innerHTML = `
    <a href="book-service.html" class="action-tile">Book a Service</a>
    <a href="my-bookings.html" class="action-tile">View My Projects</a>
    <a href="${paymentHref}" class="action-tile ${activeBooking && dgCanUploadPayment(activeBooking) ? '' : 'action-muted'}">Payments</a>
    ${completedBooking ? `<a href="booking-details.html?id=${dgEscape(completedBooking.id)}#booking-step-delivery" class="action-tile">Open Deliverables</a>` : '<span class="action-tile action-muted">Open Deliverables</span>'}
    <a href="client-profile.html" class="action-tile">Update Profile</a>
  `;
}

function dgRenderRecentActivity(bookings) {
  const container = document.getElementById('clientRecentActivity');
  if (!container) return;
  const activities = bookings.flatMap((booking) => (Array.isArray(booking.history) ? booking.history : []).map((item) => ({
    ...item,
    bookingId: booking.id,
    serviceType: booking.serviceType
  }))).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 3);

  if (!activities.length) {
    container.innerHTML = '<div class="empty-state">No recent updates yet.</div>';
    return;
  }

  container.innerHTML = `<div class="history-list portal-activity">${activities.map((item) => `
    <article class="history-item">
      <strong>${dgEscape(item.action || 'Project update')}</strong>
      <span>${dgEscape(item.bookingId)} | ${dgFormatDateTime(item.date)}</span>
      <p>Updated by ${dgEscape(item.by || 'DG Film Co.')}</p>
    </article>
  `).join('')}</div>`;
}

function dgRenderClientDashboard() {
  const highlight = document.getElementById('activeProjectHighlight');
  if (!highlight) return;
  const currentUser = dgCurrentClient();
  if (!currentUser) return;
  const bookings = dgClientBookingsFor(currentUser);
  const activeBooking = dgMostRecentBooking(bookings.filter((booking) => !['Completed', 'Cancelled', 'Rejected'].includes(booking.status)));
  const completedBooking = dgMostRecentBooking(bookings.filter((booking) => booking.status === 'Completed'));
  const completedWithDelivery = dgMostRecentBooking(bookings.filter((booking) => booking.status === 'Completed' && (booking.deliveryOutputLink || booking.deliveryFileName)));
  const stats = dgDashboardStats(bookings);

  const name = currentUser.name || currentUser.fullName || 'Client';
  const welcome = document.getElementById('welcomeName');
  if (welcome) welcome.textContent = name;
  const set = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };
  set('totalProjects', stats.total);
  set('pendingRequests', stats.pending);
  set('activeProjects', stats.active);
  set('completedProjects', stats.completed);
  set('paymentsPending', stats.paymentsPending);
  set('finalOutputsReady', stats.outputsReady);

  dgRenderActiveProject(activeBooking);
  dgRenderPortalCards(activeBooking, completedWithDelivery);
  dgRenderQuickActions(activeBooking, completedBooking);
  dgRenderRecentActivity(bookings);
}

function dgSetupDashboardWorkPreviews() {
  const videos = Array.from(document.querySelectorAll('[data-dashboard-preview]'));
  if (!videos.length) return;

  videos.forEach((video) => {
    video.muted = true;
    video.controls = false;
    video.addEventListener('loadeddata', () => {
      const frame = video.closest('.dashboard-work-preview');
      if (frame) frame.classList.add('has-video');
    });
    video.addEventListener('error', () => {
      const frame = video.closest('.dashboard-work-preview');
      if (frame) frame.classList.remove('has-video');
    });
  });

  const playPreview = (video) => {
    video.muted = true;
    video.play().catch(() => {});
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          playPreview(video);
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.35 });
    videos.forEach((video) => observer.observe(video));
  } else {
    videos.forEach(playPreview);
  }

  document.querySelectorAll('.dashboard-work-cta[data-href]').forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('a, button')) return;
      window.location.href = card.dataset.href;
    });
    card.addEventListener('keydown', (event) => {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      window.location.href = card.dataset.href;
    });
  });
}

function dgPaymentExpectedAmount(booking, type) {
  dgNormalizeBookingDefaults(booking);
  if (!booking.invoice) return '';
  if (type === 'balance') return booking.invoice.balanceAmount;
  if (type === 'full') return booking.invoice.totalAmount;
  if (type === 'custom') return '';
  return booking.invoice.downPaymentAmount;
}

function dgNormalizePaymentFormType(type) {
  if (type === 'balance') return 'balance';
  if (type === 'full') return 'full';
  if (type === 'custom') return 'custom';
  return type === 'downpayment' ? 'downpayment' : '';
}

function dgPaymentAvailabilityType(type) {
  if (!type) return '';
  return type === 'balance' ? 'balance' : 'downpayment';
}

function dgPaymentLabel(type) {
  if (type === 'balance') return 'Balance Payment';
  if (type === 'full') return 'Full Payment';
  if (type === 'custom') return 'Custom Payment';
  return 'Down Payment';
}

function dgPaymentRecordType(type) {
  return type === 'balance' ? 'Balance Payment' : 'Down Payment';
}

function dgPaymentRemainingAfter(booking, type, amount) {
  dgNormalizeBookingDefaults(booking);
  if (!booking.invoice) return 0;
  const total = Number(booking.invoice.totalAmount || 0);
  if (type === 'balance') return Math.max(Number(booking.invoice.balanceAmount || 0) - Number(amount || 0), 0);
  return Math.max(total - Number(amount || 0), 0);
}

function dgReadReceiptPreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Receipt preview could not be read.'));
    reader.readAsDataURL(file);
  });
}

async function dgSubmitClientPaymentReceipt(currentUser, values) {
  const bookings = dgBookings();
  const booking = bookings.find((item) => item.id === values.bookingId);
  if (!booking || booking.clientId !== currentUser.id) {
    window.location.href = 'unauthorized.html';
    return { ok: false };
  }
  dgNormalizeBookingDefaults(booking);

  const amountPaid = Number(values.amountPaid || 0);
  const selectedType = dgNormalizePaymentFormType(values.selectedType) || 'downpayment';
  let effectiveSelectedType = selectedType;
  let paymentTypeLabel = dgPaymentLabel(selectedType);
  let paymentRecordType = dgPaymentRecordType(selectedType);

  if (booking.invoice && selectedType !== 'balance' && amountPaid >= Number(booking.invoice.totalAmount || 0)) {
    effectiveSelectedType = 'full';
    paymentTypeLabel = 'Full Payment';
    paymentRecordType = 'Down Payment';
  }

  const file = values.file;
  const extension = file ? file.name.split('.').pop().toLowerCase() : '';
  const imageTypes = ['jpg', 'jpeg', 'png'];
  const previewLimit = 2 * 1024 * 1024;
  let receiptPreviewDataUrl = '';
  let receiptNote = '';

  if (file && imageTypes.includes(extension) && file.size <= previewLimit) {
    try {
      receiptPreviewDataUrl = await dgReadReceiptPreview(file);
    } catch (error) {
      receiptNote = 'Preview is not available for this file. The receipt details are still attached for review.';
    }
  } else if (file && extension === 'pdf') {
    receiptNote = 'PDF selected. The DG Film Co. team will review the uploaded receipt details.';
  } else if (file && imageTypes.includes(extension) && file.size > previewLimit) {
    receiptNote = 'Preview is not available for this file size. The receipt details are still attached for review.';
  }

  const payments = dgPayments();
  const paymentNotes = String(values.notes || '').trim();
  const totalAmount = Number(booking.invoice?.totalAmount || 0);
  const minimumAmount = Number(booking.invoice?.downPaymentAmount || totalAmount * 0.5 || 0);
  const remainingAfterPayment = dgPaymentRemainingAfter(booking, effectiveSelectedType, amountPaid);
  const buildPayment = (paymentType, paymentAmount, extraNotes = '') => ({
    id: dgNextId('PAY', payments),
    bookingId: booking.id,
    invoiceId: booking.invoice?.invoiceId || '',
    clientId: currentUser.id,
    paymentType,
    paymentOption: paymentTypeLabel,
    paymentMethod: String(values.paymentMethod || '').trim(),
    submittedPaymentAmount: amountPaid,
    remainingAfterPayment,
    referenceNumber: String(values.referenceNumber || '').trim(),
    amountPaid: paymentAmount,
    paymentDate: values.paymentDate,
    receiptFileName: file.name,
    receiptFileType: file.type || extension,
    receiptFileSize: file.size,
    receiptUploadedAt: new Date().toISOString(),
    notes: [paymentNotes, extraNotes].filter(Boolean).join(' '),
    status: 'Pending Verification',
    createdAt: new Date().toISOString()
  });

  const payment = buildPayment(
    effectiveSelectedType === 'full' ? 'Full Payment' : paymentRecordType,
    amountPaid,
    effectiveSelectedType === 'full' ? `Full payment selected. Total submitted: ${dgMoney(amountPaid)}.` : ''
  );
  if (receiptPreviewDataUrl) payment.receiptPreviewDataUrl = receiptPreviewDataUrl;
  if (receiptNote) payment.receiptNote = receiptNote;
  payments.push(payment);

  if (booking.invoice) {
    if (effectiveSelectedType === 'balance') {
      booking.invoice.balanceStatus = 'Pending Verification';
      booking.paymentStatus = 'Balance Pending Verification';
    } else if (effectiveSelectedType === 'full') {
      booking.invoice.downPaymentStatus = 'Pending Verification';
      booking.invoice.balanceStatus = 'Pending Verification';
      booking.invoice.balanceAmount = 0;
      booking.paymentStatus = 'Balance Pending Verification';
    } else {
      booking.invoice.downPaymentStatus = 'Pending Verification';
      booking.invoice.balanceAmount = remainingAfterPayment;
      booking.paymentStatus = 'Down Payment Pending Verification';
    }
    booking.invoice.invoiceStatus = 'Open';
  } else {
    booking.paymentStatus = 'Pending Verification';
  }

  booking.history = Array.isArray(booking.history) ? booking.history : [];
  booking.history.push({
    date: new Date().toISOString(),
    action: `${paymentTypeLabel} receipt submitted`,
    by: currentUser.name || currentUser.fullName || currentUser.email
  });

  dgSavePayments(payments);
  dgSaveBookings(bookings);
  dgNotifyAdmin('Payment receipt uploaded', `A ${paymentTypeLabel.toLowerCase()} receipt for ${dgMoney(amountPaid)} was submitted for ${booking.id} and needs verification.`, 'payment', booking.id);
  dgNotifyClient(booking, `${paymentTypeLabel} receipt submitted`, `Your ${paymentTypeLabel.toLowerCase()} receipt for ${booking.id} has been submitted for review.`, 'payment');

  return { ok: true, booking, paymentTypeLabel, receiptNote, remainingAfterPayment };
}

function dgPopulatePaymentBookings(select, currentUser, selectedId, requestedType = '') {
  const availabilityType = dgPaymentAvailabilityType(requestedType);
  const options = dgBookings().map(dgNormalizeBookingDefaults).filter((booking) => booking.clientId === currentUser.id && dgCanUploadPayment(booking, availabilityType));
  select.innerHTML = '<option value="">Choose a booking</option>';
  options.forEach((booking) => {
    const option = document.createElement('option');
    option.value = booking.id;
    option.textContent = `${booking.id} - ${booking.serviceType}`;
    if (booking.id === selectedId) option.selected = true;
    select.appendChild(option);
  });
}

function dgSetupPaymentForm() {
  const form = document.getElementById('paymentForm');
  if (!form) return;
  const currentUser = dgCurrentClient();
  if (!currentUser) return;

  const params = new URLSearchParams(window.location.search);
  const selectedId = params.get('id');
  const typeParam = params.get('type');
  const amountParam = Number(params.get('amount') || 0);
  let requestedType = dgNormalizePaymentFormType(typeParam);
  const title = document.getElementById('paymentUploadTitle');
  const copy = document.getElementById('paymentUploadCopy');
  const billingSummary = document.getElementById('billingSummaryCard');
  const emptyState = document.getElementById('paymentEmptyState');
  const receiptPreviewHint = document.getElementById('receiptPreviewHint');
  const receiptSelectedCard = document.getElementById('receiptSelectedCard');
  const remainingBalanceHint = document.getElementById('remainingBalanceHint');

  if (selectedId) {
    const booking = dgFindClientBooking(selectedId, currentUser);
    if (!booking) return;
    if (!requestedType) requestedType = dgPaymentUploadType(booking);
    if (!dgCanUploadPayment(booking, dgPaymentAvailabilityType(requestedType))) {
      if (dgPaymentAvailabilityType(requestedType) === 'downpayment' && booking.invoice && booking.invoice.downPaymentStatus === 'Pending Verification') {
        dgSetFlash('DG Film Co. is reviewing your down payment receipt.');
      } else if (requestedType === 'balance' && booking.invoice && booking.invoice.balanceStatus === 'Pending Verification') {
        dgSetFlash('DG Film Co. is reviewing your balance payment receipt.');
      } else if (booking.invoice && booking.invoice.downPaymentStatus === 'Verified' && booking.invoice.balanceStatus === 'Verified') {
        dgSetFlash('Invoice fully paid. No payment action is required.');
      } else {
        dgSetFlash('Payment will be available once your booking is confirmed and an invoice is prepared.');
      }
      window.location.href = `booking-details.html?id=${selectedId}`;
      return;
    }
    if (form.amountPaid) form.amountPaid.value = amountParam > 0 ? amountParam : dgPaymentExpectedAmount(booking, requestedType);
  }
  if (form.paymentType && requestedType) form.paymentType.value = requestedType;
  if (title) title.textContent = 'Submit Payment Receipt';
  if (copy) copy.textContent = 'Upload your payment receipt for review. Make sure the amount and reference number match your invoice.';

  dgPopulatePaymentBookings(form.bookingId, currentUser, selectedId, requestedType);
  if (!form.bookingId.options.length || form.bookingId.options.length === 1) {
    const message = document.getElementById('flashMessage');
    if (message) {
      message.textContent = '';
      message.className = 'form-message';
    }
    if (emptyState) emptyState.hidden = false;
    form.hidden = true;
  } else {
    if (emptyState) emptyState.hidden = true;
    form.hidden = false;
  }
  const amountHint = document.getElementById('amountHint');
  function dgUpdateAmountHint(booking, type) {
    if (!booking || !booking.invoice) {
      if (amountHint) amountHint.textContent = '';
      if (remainingBalanceHint) remainingBalanceHint.textContent = '';
      return;
    }
    const minimum = Number(booking.invoice.downPaymentAmount || 0);
    const total = Number(booking.invoice.totalAmount || 0);
    const amount = Number(form.amountPaid?.value || dgPaymentExpectedAmount(booking, type) || 0);
    if (amountHint) {
      amountHint.textContent = type === 'balance'
        ? `Required balance amount: ${dgMoney(booking.invoice.balanceAmount)}`
        : `Minimum required: ${dgMoney(minimum)}. Total package amount: ${dgMoney(total)}.`;
    }
    if (remainingBalanceHint) {
      remainingBalanceHint.textContent = `Remaining balance after this payment: ${dgMoney(dgPaymentRemainingAfter(booking, type, amount))}`;
    }
  }
  function dgSelectedPaymentBooking() {
    return dgBookings().map(dgNormalizeBookingDefaults).find((item) => item.id === form.bookingId.value) || null;
  }
  function dgRenderBillingSummary(booking, type) {
    if (!billingSummary) return;
    if (!booking || !booking.invoice) {
      billingSummary.innerHTML = `
        <p class="eyebrow">Billing summary</p>
        <h2>Choose a booking to view required payment details.</h2>
      `;
      return;
    }
    const selectedType = dgNormalizePaymentFormType(type) || 'downpayment';
    const label = dgPaymentLabel(selectedType);
    const amount = Number(form.amountPaid?.value || dgPaymentExpectedAmount(booking, selectedType) || 0);
    billingSummary.innerHTML = `
      <div class="billing-summary-header">
        <div>
          <p class="eyebrow">Billing summary</p>
          <h2>${dgEscape(booking.serviceType || 'Selected booking')}</h2>
        </div>
        ${dgBadge(booking.invoice.invoiceStatus || 'Open')}
      </div>
      <dl class="details-grid compact-details payment-summary-grid">
        <div><dt>Booking ID</dt><dd>${dgEscape(booking.id)}</dd></div>
        <div><dt>Service Type</dt><dd>${dgEscape(booking.serviceType || 'Not set')}</dd></div>
        <div><dt>Invoice ID</dt><dd>${dgEscape(booking.invoice.invoiceId || 'Not set')}</dd></div>
        <div><dt>Payment Type</dt><dd>${dgEscape(label)}</dd></div>
        <div><dt>Minimum Required</dt><dd>${dgMoney(booking.invoice.downPaymentAmount)}</dd></div>
        <div><dt>Amount to Pay</dt><dd>${dgMoney(amount)}</dd></div>
        <div><dt>Remaining After Payment</dt><dd>${dgMoney(dgPaymentRemainingAfter(booking, selectedType, amount))}</dd></div>
        <div><dt>Down Payment Status</dt><dd>${dgBadge(booking.invoice.downPaymentStatus)}</dd></div>
        <div><dt>Balance Status</dt><dd>${dgBadge(booking.invoice.balanceStatus)}</dd></div>
        <div><dt>Invoice Status</dt><dd>${dgBadge(booking.invoice.invoiceStatus)}</dd></div>
      </dl>
    `;
  }
  function dgUpdatePaymentContext() {
    const booking = dgSelectedPaymentBooking();
    const type = dgNormalizePaymentFormType(form.paymentType.value);
    if (booking && !type) {
      form.paymentType.value = dgPaymentUploadType(booking);
    }
    if (booking && !dgCanUploadPayment(booking, dgPaymentAvailabilityType(type))) {
      form.paymentType.value = dgPaymentUploadType(booking);
    }
    const finalType = dgNormalizePaymentFormType(form.paymentType.value) || 'downpayment';
    if (booking) {
      const expected = dgPaymentExpectedAmount(booking, finalType);
      if (form.amountPaid && finalType !== 'custom') form.amountPaid.value = expected || '';
      if (form.amountPaid && finalType === 'custom' && (!form.amountPaid.value || Number(form.amountPaid.value) <= 0)) {
        form.amountPaid.value = booking.invoice?.downPaymentAmount || '';
      }
      dgUpdateAmountHint(booking, finalType);
    } else {
      dgUpdateAmountHint(null, finalType);
    }
    dgRenderBillingSummary(booking, finalType);
  }

  form.paymentDate.max = dgToday();
  form.bookingId.addEventListener('change', () => {
    dgUpdatePaymentContext();
  });
  form.paymentType.addEventListener('change', () => {
    const type = dgNormalizePaymentFormType(form.paymentType.value);
    dgPopulatePaymentBookings(form.bookingId, currentUser, form.bookingId.value, type);
    dgUpdatePaymentContext();
  });
  if (form.amountPaid) {
    form.amountPaid.addEventListener('input', () => {
      const booking = dgSelectedPaymentBooking();
      const type = dgNormalizePaymentFormType(form.paymentType.value) || 'downpayment';
      dgUpdateAmountHint(booking, type);
      dgRenderBillingSummary(booking, type);
    });
  }
  if (selectedId) {
    const previewBooking = dgBookings().map(dgNormalizeBookingDefaults).find((item) => item.id === selectedId);
    if (previewBooking) dgUpdateAmountHint(previewBooking, requestedType);
  }
  dgUpdatePaymentContext();
  form.receiptFile.addEventListener('change', async () => {
    const file = form.receiptFile.files[0];
    const extension = file ? file.name.split('.').pop().toLowerCase() : '';
    if (receiptSelectedCard) {
      receiptSelectedCard.hidden = !file;
      receiptSelectedCard.innerHTML = '';
    }
    if (!file) {
      if (receiptPreviewHint) receiptPreviewHint.textContent = '';
    } else if (extension === 'pdf') {
      if (receiptPreviewHint) receiptPreviewHint.textContent = 'PDF selected. The DG Film Co. team will review the uploaded receipt details.';
    } else if (['jpg', 'jpeg', 'png'].includes(extension) && file.size > 2 * 1024 * 1024) {
      if (receiptPreviewHint) receiptPreviewHint.textContent = 'Preview is not available for this file size. The receipt details are still attached for review.';
    } else if (['jpg', 'jpeg', 'png'].includes(extension)) {
      if (receiptPreviewHint) receiptPreviewHint.textContent = 'Receipt Preview';
    } else {
      if (receiptPreviewHint) receiptPreviewHint.textContent = '';
    }
    if (file && receiptSelectedCard) {
      let preview = '';
      if (['jpg', 'jpeg', 'png'].includes(extension) && file.size <= 2 * 1024 * 1024) {
        try {
          const dataUrl = await dgReadReceiptPreview(file);
          preview = `<img src="${dgEscape(dataUrl)}" alt="Selected receipt preview" />`;
        } catch (error) {
          preview = '';
        }
      }
      receiptSelectedCard.innerHTML = `
        <strong>${preview ? 'Receipt Preview' : 'Selected receipt'}</strong>
        <p>File name: ${dgEscape(file.name)}</p>
        <p>File type: ${dgEscape(file.type || extension || 'Not set')}</p>
        <p>File size: ${dgFormatFileSize(file.size)}</p>
        ${preview ? `<div class="receipt-local-preview">${preview}</div>` : ''}
      `;
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    dgClearFieldErrors(form);
    let valid = true;
    const file = form.receiptFile.files[0];
    const amountPaid = Number(form.amountPaid.value);
    const allowedTypes = ['jpg', 'jpeg', 'png', 'pdf'];
    const imageTypes = ['jpg', 'jpeg', 'png'];
    const previewLimit = 2 * 1024 * 1024;
    const extension = file ? file.name.split('.').pop().toLowerCase() : '';

    const selectedType = dgNormalizePaymentFormType(form.paymentType.value) || 'downpayment';
    let effectiveSelectedType = selectedType;
    let paymentTypeLabel = dgPaymentLabel(selectedType);
    let paymentRecordType = dgPaymentRecordType(selectedType);
    if (!form.bookingId.value) { dgSetFieldError(form, 'bookingId', 'Booking is required.'); valid = false; }
    if (!form.paymentType.value) { dgSetFieldError(form, 'paymentType', 'Payment type is required.'); valid = false; }
    if (!form.referenceNumber.value.trim()) { dgSetFieldError(form, 'referenceNumber', 'Payment reference number is required.'); valid = false; }
    if (!form.amountPaid.value || amountPaid <= 0) { dgSetFieldError(form, 'amountPaid', 'Amount paid must be greater than 0.'); valid = false; }
    if (!form.paymentDate.value) { dgSetFieldError(form, 'paymentDate', 'Payment date is required.'); valid = false; }
    if (form.paymentDate.value && dgIsFutureDate(form.paymentDate.value)) { dgSetFieldError(form, 'paymentDate', 'Payment date cannot be in the future.'); valid = false; }
    if (!file) { dgSetFieldError(form, 'receiptFile', 'Receipt file is required.'); valid = false; }
    if (file && !allowedTypes.includes(extension)) { dgSetFieldError(form, 'receiptFile', 'Receipt must be jpg, jpeg, png, or pdf.'); valid = false; }
    if (file && file.size > 5 * 1024 * 1024) { dgSetFieldError(form, 'receiptFile', 'Receipt file must be 5MB or smaller.'); valid = false; }

    const bookings = dgBookings();
    const booking = bookings.find((item) => item.id === form.bookingId.value);
    if (!booking || booking.clientId !== currentUser.id) {
      window.location.href = 'unauthorized.html';
      return;
    }
    dgNormalizeBookingDefaults(booking);
    if (booking.invoice && selectedType !== 'balance' && amountPaid >= Number(booking.invoice.totalAmount || 0)) {
      effectiveSelectedType = 'full';
      paymentTypeLabel = 'Full Payment';
      paymentRecordType = 'Down Payment';
    }
    if (!dgCanUploadPayment(booking, dgPaymentAvailabilityType(selectedType))) {
      dgSetFieldError(form, 'bookingId', 'This payment type is not available for upload right now.');
      valid = false;
    }
    if (valid && booking.invoice && amountPaid > 0) {
      const total = Number(booking.invoice.totalAmount || 0);
      const minimum = Number(booking.invoice.downPaymentAmount || total * 0.5 || 0);
      const balance = Number(booking.invoice.balanceAmount || 0);
      if (selectedType === 'balance' && balance > 0 && amountPaid !== balance) {
        dgSetFieldError(form, 'amountPaid', `Amount must match the required balance amount of ${dgMoney(balance)}.`);
        valid = false;
      } else if (selectedType !== 'balance' && amountPaid < minimum) {
        dgSetFieldError(form, 'amountPaid', 'Payment amount must be at least 50% of the total package amount.');
        valid = false;
      } else if (selectedType !== 'balance' && total > 0 && amountPaid > total) {
        dgSetFieldError(form, 'amountPaid', 'Payment amount cannot exceed the total package amount.');
        valid = false;
      } else if (selectedType === 'full' && total > 0 && amountPaid !== total) {
        dgSetFieldError(form, 'amountPaid', `Full payment must match the total package amount of ${dgMoney(total)}.`);
        valid = false;
      }
    }

    if (!valid) return;

    dgClientConfirmAction({
      title: 'Submit this payment receipt?',
      message: 'Your receipt will be sent to DG Film Co. for review.',
      confirmText: 'Submit Receipt',
      cancelText: 'Review Details',
      variant: 'warning',
      details: [`Booking ID: ${booking.id}`, `Type: ${paymentTypeLabel}`, `Amount: ${dgMoney(amountPaid)}`, `Remaining balance: ${dgMoney(dgPaymentRemainingAfter(booking, effectiveSelectedType, amountPaid))}`],
      onConfirm: async () => {
        const submitBtn = form.querySelector('[type="submit"]');
        if (window.DGLoading) { DGLoading.show('Uploading receipt…'); DGLoading.disableButton(submitBtn); }
        let receiptPreviewDataUrl = '';
        let receiptNote = '';
        if (file && imageTypes.includes(extension) && file.size <= previewLimit) {
          try {
            receiptPreviewDataUrl = await dgReadReceiptPreview(file);
          } catch (error) {
            receiptNote = 'Preview is not available for this file. The receipt details are still attached for review.';
          }
        } else if (file && extension === 'pdf') {
          receiptNote = 'PDF selected. The DG Film Co. team will review the uploaded receipt details.';
        } else if (file && imageTypes.includes(extension) && file.size > previewLimit) {
          receiptNote = 'Preview is not available for this file size. The receipt details are still attached for review.';
        }

        const payments = dgPayments();
        const paymentNotes = form.notes.value.trim();
        const totalAmount = Number(booking.invoice?.totalAmount || 0);
        const minimumAmount = Number(booking.invoice?.downPaymentAmount || totalAmount * 0.5 || 0);
        const remainingAfterPayment = dgPaymentRemainingAfter(booking, effectiveSelectedType, amountPaid);
        const buildPayment = (paymentType, paymentAmount, extraNotes = '') => ({
          id: dgNextId('PAY', payments),
          bookingId: booking.id,
          invoiceId: booking.invoice?.invoiceId || '',
          clientId: currentUser.id,
          paymentType,
          paymentOption: paymentTypeLabel,
          submittedPaymentAmount: amountPaid,
          remainingAfterPayment,
          referenceNumber: form.referenceNumber.value.trim(),
          amountPaid: paymentAmount,
          paymentDate: form.paymentDate.value,
          receiptFileName: file.name,
          receiptFileType: file.type || extension,
          receiptFileSize: file.size,
          receiptUploadedAt: new Date().toISOString(),
          notes: [paymentNotes, extraNotes].filter(Boolean).join(' '),
          status: 'Pending Verification',
          createdAt: new Date().toISOString()
        });
        const payment = buildPayment(
          effectiveSelectedType === 'full' ? 'Full Payment' : paymentRecordType,
          amountPaid,
          effectiveSelectedType === 'full' ? `Full payment selected. Total submitted: ${dgMoney(amountPaid)}.` : ''
        );
        if (receiptPreviewDataUrl) payment.receiptPreviewDataUrl = receiptPreviewDataUrl;
        if (receiptNote) payment.receiptNote = receiptNote;
        payments.push(payment);
        if (booking.invoice) {
          if (effectiveSelectedType === 'balance') {
            booking.invoice.balanceStatus = 'Pending Verification';
            booking.paymentStatus = 'Balance Pending Verification';
          } else if (effectiveSelectedType === 'full') {
            booking.invoice.downPaymentStatus = 'Pending Verification';
            booking.invoice.balanceStatus = 'Pending Verification';
            booking.invoice.balanceAmount = 0;
            booking.paymentStatus = 'Balance Pending Verification';
          } else {
            booking.invoice.downPaymentStatus = 'Pending Verification';
            booking.invoice.balanceAmount = remainingAfterPayment;
            booking.paymentStatus = 'Down Payment Pending Verification';
          }
          booking.invoice.invoiceStatus = 'Open';
        } else {
          booking.paymentStatus = 'Pending Verification';
        }
        booking.history = Array.isArray(booking.history) ? booking.history : [];
        booking.history.push({
          date: new Date().toISOString(),
          action: `${paymentTypeLabel} receipt submitted`,
          by: currentUser.name || currentUser.fullName || currentUser.email
        });
        dgSavePayments(payments);
        dgSaveBookings(bookings);
        dgNotifyAdmin('Payment receipt uploaded', `A ${paymentTypeLabel.toLowerCase()} receipt for ${dgMoney(amountPaid)} was submitted for ${booking.id} and needs verification.`, 'payment', booking.id);
        dgNotifyClient(booking, `${paymentTypeLabel} receipt submitted`, `Your ${paymentTypeLabel.toLowerCase()} receipt for ${booking.id} has been submitted for review.`, 'payment');
        dgSetFlash(`${paymentTypeLabel} receipt submitted for review.${receiptNote ? ` ${receiptNote}` : ''}`);
        if (window.DGLoading) { DGLoading.hide(); DGLoading.enableButton(submitBtn); }
        window.location.href = `booking-details.html?id=${booking.id}`;
      }
    });
  });
}

function dgSetupClientProfile() {
  const form = document.getElementById('clientProfileForm');
  if (!form) return;
  const currentUser = dgCurrentClient();
  if (!currentUser) return;
  const users = DGData.getJson(DGData.keys.users, []);
  const user = users.find((item) => item.id === currentUser.id) || currentUser;
  const message = document.getElementById('profileMessage');

  function renderSummary(profile) {
    const name = profile.fullName || profile.name || 'Client Name';
    const preferredService = DG_SERVICE_ALIASES[profile.preferredServiceType] || profile.preferredServiceType || '';
    const initials = name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'DG';
    const summaryInitials = document.getElementById('profileInitials');
    const summaryName = document.getElementById('profileSummaryName');
    const summaryEmail = document.getElementById('profileSummaryEmail');
    const summaryService = document.getElementById('profileSummaryService');
    const summaryContact = document.getElementById('profileSummaryContact');
    if (summaryInitials) summaryInitials.textContent = initials;
    if (summaryName) summaryName.textContent = name;
    if (summaryEmail) summaryEmail.textContent = profile.email || 'Email not set';
    if (summaryService) summaryService.textContent = preferredService ? `Service: ${preferredService}` : 'Preferred service not set';
    if (summaryContact) summaryContact.textContent = profile.contactNumber ? `Contact: ${profile.contactNumber}` : 'Contact number not set';
  }

  form.fullName.value = user.fullName || user.name || '';
  form.email.value = user.email || '';
  form.contactNumber.value = user.contactNumber || '';
  form.preferredServiceType.value = DG_SERVICE_ALIASES[user.preferredServiceType] || user.preferredServiceType || '';
  form.preferredVisualStyle.value = DG_VISUAL_STYLE_ALIASES[user.preferredVisualStyle] || user.preferredVisualStyle || '';
  form.socialMediaLink.value = user.socialMediaLink || '';
  form.preferenceNotes.value = user.profileNotes || user.preferenceNotes || '';
  renderSummary(user);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    dgClearFieldErrors(form);
    if (message) {
      message.textContent = '';
      message.className = 'form-message';
    }
    let valid = true;
    const values = {
      fullName: form.fullName.value.trim(),
      email: form.email.value.trim().toLowerCase(),
      contactNumber: form.contactNumber.value.trim(),
      preferredServiceType: form.preferredServiceType.value,
      preferredVisualStyle: form.preferredVisualStyle.value,
      socialMediaLink: form.socialMediaLink.value.trim(),
      preferenceNotes: form.preferenceNotes.value.trim()
    };

    if (!values.fullName) { dgSetFieldError(form, 'fullName', 'Full name is required.'); valid = false; }
    if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) { dgSetFieldError(form, 'email', 'Enter a valid email address.'); valid = false; }
    if (values.contactNumber && !dgValidPhone(values.contactNumber)) { dgSetFieldError(form, 'contactNumber', 'Use 09XXXXXXXXX or +639XXXXXXXXX.'); valid = false; }
    if (values.socialMediaLink && !/^https?:\/\/.+\..+/.test(values.socialMediaLink)) { dgSetFieldError(form, 'socialMediaLink', 'Enter a valid link starting with http:// or https://.'); valid = false; }
    const emailInUse = DGData.getJson(DGData.keys.users, [])
      .some((storedUser) => storedUser.id !== currentUser.id && String(storedUser.email || '').toLowerCase() === values.email);
    if (emailInUse) { dgSetFieldError(form, 'email', 'This email address is already linked to another account.'); valid = false; }
    if (!valid) return;

    const profileSubmitBtn = form.querySelector('[type="submit"]');
    if (window.DGLoading) { DGLoading.show('Saving profile...'); DGLoading.disableButton(profileSubmitBtn); }
    try {
      const freshUsers = DGData.getJson(DGData.keys.users, []);
      const index = freshUsers.findIndex((item) => item.id === currentUser.id);
      if (index !== -1) {
        freshUsers[index] = {
          ...freshUsers[index],
          name: values.fullName,
          fullName: values.fullName,
          email: values.email,
          contactNumber: values.contactNumber,
          preferredServiceType: values.preferredServiceType,
          preferredVisualStyle: values.preferredVisualStyle,
          socialMediaLink: values.socialMediaLink,
          preferenceNotes: values.preferenceNotes,
          profileNotes: values.preferenceNotes
        };
        DGData.setJson(DGData.keys.users, freshUsers);
      }
      const updatedCurrentUser = {
        ...currentUser,
        name: values.fullName,
        fullName: values.fullName,
        email: values.email,
        contactNumber: values.contactNumber,
        preferredServiceType: values.preferredServiceType,
        preferredVisualStyle: values.preferredVisualStyle,
        socialMediaLink: values.socialMediaLink,
        preferenceNotes: values.preferenceNotes,
        profileNotes: values.preferenceNotes
      };
      DGData.setJson(DGData.keys.currentUser, updatedCurrentUser);
      renderSummary(updatedCurrentUser);
      if (message) {
        message.textContent = 'Your profile has been updated.';
        message.className = 'form-message success';
      }
    } finally {
      if (window.DGLoading) { DGLoading.hide(); DGLoading.enableButton(profileSubmitBtn); }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  dgShowFlash();
  dgRenderClientDashboard();
  dgSetupBookingForm();
  dgRenderBookings();
  dgRenderBookingDetails();
  dgSetupPaymentForm();
  dgSetupClientProfile();
  dgSetupDashboardWorkPreviews();
});

window.DGBookings = {
  badge: dgBadge,
  cancelBooking: dgCancelBooking
};
