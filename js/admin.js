function dgAdminUser() {
  return DGRbac.requireRoles(['admin']);
}

function dgAdminGetBookings() {
  return DGData.getJson(DGData.keys.bookings, []);
}

function dgAdminGetInquiries() {
  return DGData.getJson(DGData.keys.inquiries, []);
}

function dgAdminGetPayments() {
  return DGData.getJson(DGData.keys.payments, []);
}

function dgAdminGetUsers() {
  return DGData.getJson(DGData.keys.users, []);
}

function dgAdminSaveBookings(bookings) {
  DGData.setJson(DGData.keys.bookings, bookings);
}

function dgAdminSavePayments(payments) {
  DGData.setJson(DGData.keys.payments, payments);
}

function dgAdminSaveUsers(users) {
  DGData.setJson(DGData.keys.users, users);
}

function dgAdminNotify(notification) {
  if (window.DGNotifications) DGNotifications.addNotification(notification);
}

function dgAdminNotifyClient(booking, title, message, type) {
  if (!booking || !booking.clientId) return;
  dgAdminNotify({
    role: 'client',
    userId: booking.clientId,
    bookingId: booking.id,
    title,
    message,
    type
  });
}

function dgAdminNotifyStaff(booking, title, message, type) {
  if (!booking || !booking.assignedStaffId) return;
  dgAdminNotify({
    role: 'staff',
    userId: booking.assignedStaffId,
    bookingId: booking.id,
    title,
    message,
    type
  });
}

function dgAdminNotifyAdmin(title, message, type, bookingId) {
  dgAdminNotify({ role: 'admin', title, message, type, bookingId: bookingId || '' });
}

function dgAdminEscape(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function dgAdminBadgeClass(status) {
  return `badge status-${String(status || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function dgAdminBadge(status) {
  return `<span class="${dgAdminBadgeClass(status)}">${dgAdminEscape(status || 'Not Set')}</span>`;
}

function dgAdminFormatDate(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? dgAdminEscape(value)
    : date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function dgAdminFormatDateTime(value) {
  if (!value) return 'Not set';
  return new Date(value).toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function dgAdminToday() {
  return new Date().toISOString().slice(0, 10);
}

function dgAdminNormalizeBooking(booking) {
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

function dgAdminMoney(value) {
  return `PHP ${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function dgAdminFormatFileSize(bytes) {
  const size = Number(bytes || 0);
  if (!size) return 'Not set';
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  return `${(size / 1024).toFixed(2)} KB`;
}

function dgAdminValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function dgAdminValidPhone(value) {
  return /^(09\d{9}|\+639\d{9})$/.test(value);
}

function dgAdminValidPassword(password) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
}

function dgAdminNextRecordId(prefix, records) {
  const numbers = records
    .map((record) => Number(String(record.id || '').replace(`${prefix}-`, '').replace(prefix, '')))
    .filter(Number.isFinite);
  const max = Math.max(prefix === 'BKG' ? 1000 : 0, ...numbers) + 1;
  return prefix === 'U' ? `U${String(max).padStart(3, '0')}` : `${prefix}-${max}`;
}

function dgAdminReceiptFileType(payment) {
  return payment.receiptFileType || 'Not set';
}

function dgAdminReceiptSummary(payment) {
  if (!payment || !payment.receiptFileName) return '<span class="muted-text">No receipt details attached.</span>';
  return `
    <div class="receipt-summary">
      <strong>${dgAdminEscape(payment.receiptFileName)}</strong>
      <span>${dgAdminEscape(dgAdminReceiptFileType(payment))} | ${dgAdminFormatFileSize(payment.receiptFileSize)}</span>
    </div>
  `;
}

function dgAdminReceiptDetails(payment) {
  if (!payment) return '<div class="empty-state">Receipt details are not available.</div>';
  return `
    <div class="receipt-detail-panel">
      <dl class="details-grid compact-details">
        <div><dt>Receipt File Name</dt><dd>${dgAdminEscape(payment.receiptFileName || 'Not set')}</dd></div>
        <div><dt>File Type</dt><dd>${dgAdminEscape(dgAdminReceiptFileType(payment))}</dd></div>
        <div><dt>File Size</dt><dd>${dgAdminFormatFileSize(payment.receiptFileSize)}</dd></div>
        <div><dt>Uploaded At</dt><dd>${dgAdminFormatDateTime(payment.receiptUploadedAt || payment.createdAt)}</dd></div>
        <div><dt>Reference Number</dt><dd>${dgAdminEscape(payment.referenceNumber || 'Not set')}</dd></div>
        <div><dt>Amount Paid</dt><dd>${dgAdminMoney(payment.amountPaid)}</dd></div>
      </dl>
      ${payment.receiptPreviewDataUrl ? `
        <div class="receipt-preview-frame">
          <img src="${dgAdminEscape(payment.receiptPreviewDataUrl)}" alt="Receipt preview for ${dgAdminEscape(payment.receiptFileName || payment.id)}" />
        </div>
      ` : `
        <div class="empty-state">Preview is not available for this file type. Receipt details are still attached for review.</div>
      `}
      ${payment.receiptNote ? `<p class="table-helper">${dgAdminEscape(payment.receiptNote)}</p>` : ''}
    </div>
  `;
}

function dgAdminEnsureReceiptModal() {
  let modal = document.getElementById('receiptModal');
  if (modal) return modal;
  modal = document.createElement('div');
  modal.id = 'receiptModal';
  modal.className = 'portfolio-modal receipt-modal';
  modal.innerHTML = `
    <div class="portfolio-modal-panel receipt-modal-panel" role="dialog" aria-modal="true" aria-labelledby="receiptModalTitle">
      <button class="modal-close" type="button" data-close-receipt aria-label="Close">&times;</button>
      <p class="eyebrow">Uploaded receipt</p>
      <h2 id="receiptModalTitle">Receipt Details</h2>
      <div id="receiptModalContent"></div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.closest('[data-close-receipt]')) {
      modal.classList.remove('open');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') modal.classList.remove('open');
  });
  return modal;
}

function dgAdminOpenReceipt(paymentId) {
  const payment = dgAdminGetPayments().find((item) => item.id === paymentId);
  const modal = dgAdminEnsureReceiptModal();
  const content = modal.querySelector('#receiptModalContent');
  if (content) content.innerHTML = dgAdminReceiptDetails(payment);
  modal.classList.add('open');
}

function dgAdminSetText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function dgAdminShowMessage(message, type = 'success') {
  const element = document.getElementById('adminMessage') || document.getElementById('flashMessage');
  if (!element) return;
  element.textContent = message;
  element.className = `form-message ${type}`;
}

function dgAdminConfirmAction(options) {
  if (window.confirmAction) return window.confirmAction(options);
  return Promise.resolve().then(() => options.onConfirm());
}

function dgAdminBookingConfirmOptions(action, bookingId) {
  const booking = dgAdminGetBookings().find((item) => item.id === bookingId) || {};
  const details = [`Booking ID: ${bookingId}`];
  if (booking.clientName) details.push(`Client: ${booking.clientName}`);
  const configs = {
    approveMeeting: {
      title: 'Approve this request for meeting?',
      message: 'The booking will move to the consultation stage so a meeting can be scheduled.',
      confirmText: 'Approve for Meeting',
      cancelText: 'Review Again',
      variant: 'warning'
    },
    reject: {
      title: 'Reject this booking request?',
      message: 'The client will no longer be able to continue this request unless a new booking is submitted.',
      confirmText: 'Reject Booking',
      cancelText: 'Go Back',
      variant: 'danger'
    },
    cancel: {
      title: 'Archive this booking?',
      message: 'This booking will be removed from the active workflow, but its record will remain available for reference.',
      confirmText: 'Archive Booking',
      cancelText: 'Keep Booking',
      variant: 'danger'
    },
    confirm: {
      title: 'Confirm this booking?',
      message: 'This will confirm the project and prepare the invoice/down payment workflow.',
      confirmText: 'Confirm Booking',
      cancelText: 'Review Again',
      variant: 'warning'
    },
    assign: {
      title: 'Assign staff to this project?',
      message: 'The selected staff member will be able to update production progress for this booking.',
      confirmText: 'Assign Staff',
      cancelText: 'Cancel',
      variant: 'warning'
    },
    schedule: {
      title: 'Schedule this production?',
      message: 'This will move the project into the scheduled production workflow.',
      confirmText: 'Schedule Project',
      cancelText: 'Cancel',
      variant: 'warning'
    },
    generateInvoice: {
      title: 'Generate invoice?',
      message: 'This will create or update the invoice and down payment workflow for this booking.',
      confirmText: 'Generate Invoice',
      cancelText: 'Review Again',
      variant: 'warning'
    }
  };
  return { ...(configs[action] || configs.confirm), details };
}

function dgAdminPaymentConfirmOptions(action, paymentId) {
  const paymentIds = String(paymentId || '').split('|').filter(Boolean);
  const matchedPayments = dgAdminGetPayments().filter((item) => paymentIds.includes(item.id));
  const payment = matchedPayments[0] || {};
  const details = [`Payment ID: ${paymentId}`];
  if (payment.bookingId) details.push(`Booking ID: ${payment.bookingId}`);
  if (matchedPayments.length > 1) details.push('Type: Full Payment');
  else if (payment.paymentType) details.push(`Type: ${payment.paymentType}`);
  const configs = {
    Verified: {
      title: 'Verify this payment?',
      message: 'This will mark the receipt as verified and update the booking payment status.',
      confirmText: 'Verify Payment',
      cancelText: 'Review Receipt',
      variant: 'success'
    },
    Rejected: {
      title: 'Reject this payment?',
      message: 'The client may need to submit a corrected payment receipt.',
      confirmText: 'Reject Payment',
      cancelText: 'Keep Pending',
      variant: 'danger'
    },
    'Needs Resubmission': {
      title: 'Request payment resubmission?',
      message: 'The client will need to upload a corrected receipt before the payment can be verified.',
      confirmText: 'Request Resubmission',
      cancelText: 'Keep Pending',
      variant: 'warning'
    }
  };
  return { ...(configs[action] || configs['Needs Resubmission']), details };
}

function dgAdminStaffUsers() {
  return dgAdminGetUsers().filter((user) => user.role === 'staff');
}

function dgAdminStaffName(booking) {
  if (booking.assignedStaffName) return booking.assignedStaffName;
  const staff = dgAdminGetUsers().find((user) => user.id === booking.assignedStaffId);
  return staff ? staff.fullName : 'Not assigned';
}

function dgAdminAddHistory(booking, action, currentUser) {
  booking.history = Array.isArray(booking.history) ? booking.history : [];
  booking.history.push({
    date: new Date().toISOString(),
    action,
    by: currentUser.name || currentUser.fullName || currentUser.email
  });
}

function dgAdminRelatedPayment(bookingId) {
  return dgAdminGetPayments()
    .filter((payment) => payment.bookingId === bookingId)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0] || null;
}

function dgAdminRelatedPayments(bookingId) {
  return dgAdminGetPayments()
    .filter((payment) => payment.bookingId === bookingId)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function dgAdminDownPaymentVerified(booking) {
  dgAdminNormalizeBooking(booking);
  return booking.invoice ? booking.invoice.downPaymentStatus === 'Verified' : booking.paymentStatus === 'Verified';
}

function dgAdminNextInvoiceId(bookings) {
  const numbers = bookings
    .map((booking) => Number(String(booking.invoice?.invoiceId || '').replace('INV-', '')))
    .filter((number) => Number.isFinite(number));
  return `INV-${Math.max(1000, ...numbers) + 1}`;
}

function dgAdminEstimatedAmountFromBudget(booking) {
  const budget = String(booking.budget || '');
  const numbers = budget.match(/\d[\d,]*/g);
  if (!numbers || !numbers.length) return 0;
  const values = numbers.map((value) => Number(value.replace(/,/g, ''))).filter(Number.isFinite);
  if (!values.length) return 0;
  return values.length > 1 ? Math.round((values[0] + values[1]) / 2) : values[0];
}

function dgAdminPackageAmount(booking) {
  const pricing = DGData.getJson(DGData.keys.pricing, []);
  const matched = pricing.find((pkg) => (
    (booking.packageId && pkg.id === booking.packageId) ||
    (String(pkg.packageName || '').toLowerCase() === String(booking.packageName || '').toLowerCase() &&
      String(pkg.serviceName || '').toLowerCase() === String(booking.serviceType || booking.serviceName || '').toLowerCase())
  ));
  return Number(matched?.price || booking.finalAgreedAmount || dgAdminEstimatedAmountFromBudget(booking) || 0);
}

function dgAdminCreateInvoice(booking, bookings, currentUser, totalAmount) {
  const amount = Number(totalAmount || 0);
  const downPaymentAmount = Math.round(amount * 0.5 * 100) / 100;
  const balanceAmount = Math.max(Math.round((amount - downPaymentAmount) * 100) / 100, 0);
  return {
    invoiceId: booking.invoice?.invoiceId || dgAdminNextInvoiceId(bookings),
    bookingId: booking.id,
    clientId: booking.clientId,
    clientName: booking.clientName,
    serviceType: booking.serviceType,
    packageName: booking.packageName,
    totalAmount: amount,
    downPaymentRate: 50,
    downPaymentAmount,
    balanceAmount,
    downPaymentStatus: booking.invoice?.downPaymentStatus || 'Unpaid',
    balanceStatus: booking.invoice?.balanceStatus || 'Unpaid',
    invoiceStatus: 'Open',
    issuedAt: booking.invoice?.issuedAt || new Date().toISOString(),
    issuedBy: currentUser.name || currentUser.fullName || currentUser.email,
    dueNote: '50% down payment is required to reserve the booking. Remaining balance must be settled before the event date.'
  };
}

function dgAdminProductionTimeline(booking) {
  const notes = Array.isArray(booking.productionNotes) ? booking.productionNotes : [];
  if (!notes.length) return '<div class="empty-state">No production updates yet.</div>';
  return `<div class="history-list">${notes.slice().reverse().map((item) => `
    <article class="history-item">
      <strong>${dgAdminEscape(item.statusFrom)} to ${dgAdminEscape(item.statusTo)}</strong>
      <span>${dgAdminFormatDateTime(item.date)} by ${dgAdminEscape(item.by)} (${dgAdminEscape(item.byRole)})</span>
      <p>${dgAdminEscape(item.note)}</p>
    </article>
  `).join('')}</div>`;
}

function dgAdminUpdatePayment(paymentId, status) {
  const currentUser = dgAdminUser();
  if (!currentUser) return false;
  const payments = dgAdminGetPayments();
  const bookings = dgAdminGetBookings();
  const paymentIds = String(paymentId || '').split('|').filter(Boolean);
  const matchedPayments = payments.filter((item) => paymentIds.includes(item.id));
  const payment = matchedPayments[0];
  if (!payment) return false;
  const booking = bookings.find((item) => item.id === payment.bookingId);

  matchedPayments.forEach((item) => {
    item.status = status;
  });
  if (booking) {
    dgAdminNormalizeBooking(booking);
    const paymentType = (payment.paymentType || 'Down Payment').trim();
    const isFull = paymentType === 'Full Payment' || matchedPayments.length > 1;
    const isBalance = paymentType === 'Balance Payment';
    if (booking.invoice) {
      if (isFull) {
        booking.invoice.downPaymentStatus = status;
        booking.invoice.balanceStatus = status;
        booking.invoice.balanceAmount = status === 'Verified' ? 0 : Number(payment.remainingAfterPayment || 0);
      } else {
        const invoiceKey = isBalance ? 'balanceStatus' : 'downPaymentStatus';
        booking.invoice[invoiceKey] = status;
      }
      if (booking.invoice.downPaymentStatus === 'Verified' && booking.invoice.balanceStatus === 'Verified') {
        booking.invoice.invoiceStatus = 'Paid';
        booking.paymentStatus = 'Fully Paid';
      } else {
        booking.invoice.invoiceStatus = 'Open';
        if (status === 'Verified') {
          booking.paymentStatus = isFull ? 'Fully Paid' : isBalance ? 'Balance Verified' : 'Down Payment Verified';
        } else if (status === 'Pending Verification') {
          booking.paymentStatus = isFull ? 'Balance Pending Verification' : isBalance ? 'Balance Pending Verification' : 'Down Payment Pending Verification';
        } else if (status === 'Needs Resubmission') {
          booking.paymentStatus = 'Needs Resubmission';
        } else if (status === 'Rejected') {
          booking.paymentStatus = 'Payment Rejected';
        }
      }
    } else {
      booking.paymentStatus = status;
    }
    const historyLabels = {
      Verified: isFull ? 'Full payment verified' : isBalance ? 'Balance payment verified' : 'Down payment verified',
      Rejected: isFull ? 'Full payment rejected' : isBalance ? 'Balance payment rejected' : 'Down payment rejected',
      'Needs Resubmission': isFull ? 'Full payment marked for resubmission' : isBalance ? 'Balance payment marked for resubmission' : 'Down payment marked for resubmission'
    };
    dgAdminAddHistory(booking, historyLabels[status] || `Payment ${status}`, currentUser);
  }

  dgAdminSavePayments(payments);
  dgAdminSaveBookings(bookings);
  if (booking) {
    const paymentType = (payment.paymentType || 'Down Payment').trim();
    const label = paymentType === 'Full Payment' ? 'Full payment' : paymentType === 'Balance Payment' ? 'Balance payment' : 'Down payment';
    if (status === 'Verified') {
      dgAdminNotifyClient(booking, `${label} verified`, `Your ${label.toLowerCase()} for ${booking.id} has been verified.`, 'payment');
      if (paymentType === 'Down Payment') {
        dgAdminNotifyStaff(booking, 'Project ready for production', `${booking.id} can proceed. The down payment has been verified.`, 'production');
      } else if (paymentType === 'Full Payment') {
        dgAdminNotifyStaff(booking, 'Project fully paid', `${booking.id} has been fully paid and can proceed.`, 'production');
      } else {
        dgAdminNotifyStaff(booking, 'Delivery can proceed', `The balance payment for ${booking.id} has been verified. Final delivery can proceed.`, 'delivery');
      }
    } else if (status === 'Needs Resubmission') {
      dgAdminNotifyClient(booking, `${label} requires resubmission`, `Please submit a new ${label.toLowerCase()} receipt for ${booking.id} so it can be reviewed again.`, 'payment');
    } else if (status === 'Rejected') {
      dgAdminNotifyClient(booking, `${label} not approved`, `The submitted ${label.toLowerCase()} receipt for ${booking.id} was not approved. Please review and resubmit.`, 'payment');
    }
  }
  dgAdminShowMessage(`Payment ${paymentId} marked as ${status}.`);
  return true;
}

function dgAdminApproveForMeeting(bookingId) {
  const currentUser = dgAdminUser();
  if (!currentUser) return false;
  const bookings = dgAdminGetBookings();
  const booking = dgAdminNormalizeBooking(bookings.find((item) => item.id === bookingId));
  if (!booking) return false;

  if (booking.status !== 'Pending Review') return false;

  booking.status = 'Approved for Meeting';
  booking.meetingStatus = booking.meetingStatus || 'Not Scheduled';
  booking.paymentStatus = booking.paymentStatus || 'Not Required Yet';
  dgAdminAddHistory(booking, 'Booking approved for meeting', currentUser);
  dgAdminSaveBookings(bookings);
  dgAdminNotifyClient(booking, 'Approved for meeting', `Your booking ${booking.id} has been approved for a consultation meeting.`, 'meeting');
  dgAdminShowMessage(`Booking ${bookingId} approved for meeting.`);
  return true;
}

function dgAdminRejectBooking(bookingId) {
  const currentUser = dgAdminUser();
  if (!currentUser) return false;
  const bookings = dgAdminGetBookings();
  const booking = dgAdminNormalizeBooking(bookings.find((item) => item.id === bookingId));
  if (!booking || booking.status !== 'Pending Review') return false;

  booking.status = 'Rejected';
  dgAdminAddHistory(booking, 'Booking rejected', currentUser);
  dgAdminSaveBookings(bookings);
  dgAdminNotifyClient(booking, 'Booking rejected', `Your booking request ${booking.id} was not approved.`, 'booking');
  dgAdminShowMessage(`Booking ${bookingId} rejected.`);
  return true;
}

function dgAdminScheduleMeeting(bookingId, values) {
  const currentUser = dgAdminUser();
  if (!currentUser) return false;
  const bookings = dgAdminGetBookings();
  const booking = dgAdminNormalizeBooking(bookings.find((item) => item.id === bookingId));
  if (!booking || booking.status !== 'Approved for Meeting') return false;

  if (!values.meetingDate || values.meetingDate < dgAdminToday()) {
    dgAdminShowMessage(!values.meetingDate ? 'Meeting date is required.' : 'Meeting date cannot be in the past.', 'error');
    return false;
  }
  if (!values.meetingTime) {
    dgAdminShowMessage('Meeting time is required.', 'error');
    return false;
  }
  if (!values.meetingMode) {
    dgAdminShowMessage('Meeting mode is required.', 'error');
    return false;
  }
  if (!values.meetingLocation) {
    dgAdminShowMessage('Meeting location, link, or contact number is required.', 'error');
    return false;
  }

  booking.status = 'Meeting Scheduled';
  booking.meetingStatus = 'Scheduled';
  booking.meetingClientConfirmation = null;
  booking.meetingDate = values.meetingDate;
  booking.meetingTime = values.meetingTime;
  booking.meetingMode = values.meetingMode;
  booking.meetingLocation = values.meetingLocation;
  booking.meetingNotes = values.meetingNotes || '';
  dgAdminAddHistory(booking, 'Meeting scheduled', currentUser);
  dgAdminSaveBookings(bookings);
  dgAdminNotifyClient(booking, 'Meeting scheduled', `Your consultation for ${booking.id} is scheduled on ${dgAdminFormatDate(booking.meetingDate)} at ${booking.meetingTime}.`, 'meeting');
  dgAdminShowMessage(`Meeting scheduled for ${bookingId}.`);
  return true;
}

const DG_ADMIN_WAITING_MEETING_CONFIRMATION = 'Waiting for client meeting confirmation before this booking can be confirmed.';

function dgAdminMeetingScheduleExists(booking) {
  return Boolean(
    booking &&
    booking.status === 'Meeting Scheduled' &&
    booking.meetingDate &&
    booking.meetingTime &&
    booking.meetingMode &&
    booking.meetingLocation
  );
}

function dgAdminClientConfirmedMeeting(booking) {
  return Boolean(
    booking &&
    booking.meetingClientConfirmation &&
    booking.meetingClientConfirmation.status === 'Confirmed'
  );
}

function dgAdminConfirmationGateMessage(booking) {
  if (!booking || booking.status !== 'Meeting Scheduled') {
    return 'A scheduled consultation is required before this booking can be confirmed.';
  }
  if (!dgAdminMeetingScheduleExists(booking)) {
    return 'Complete the meeting schedule before this booking can be confirmed.';
  }
  if (!dgAdminClientConfirmedMeeting(booking)) {
    return DG_ADMIN_WAITING_MEETING_CONFIRMATION;
  }
  return '';
}

function dgAdminConfirmationInputMessage(notes, finalAmount) {
  const summary = String(notes || '').trim();
  if (!summary) return 'Enter the post-meeting notes before confirming this booking.';
  if (summary.length < 20) return 'Post-meeting notes must be at least 20 characters.';
  if (!Number(finalAmount || 0) || Number(finalAmount) <= 0) {
    return 'Enter a valid final agreed package amount before confirming this booking.';
  }
  return '';
}

function dgAdminUpdateConfirmButtonState(container, booking) {
  if (!container || !booking) return;
  const button = container.querySelector('[data-action="confirm"]');
  if (!button) return;
  const notes = container.querySelector(`[data-post-meeting-notes="${booking.id}"]`);
  const amount = container.querySelector(`[data-final-agreed-amount="${booking.id}"]`);
  const reason = dgAdminConfirmationGateMessage(booking) ||
    dgAdminConfirmationInputMessage(notes ? notes.value : '', amount ? amount.value : '');
  button.disabled = Boolean(reason);
  button.setAttribute('aria-disabled', reason ? 'true' : 'false');
  button.title = reason || 'Confirm booking and generate invoice';
}

function dgAdminConfirmBooking(bookingId, postMeetingNotes, finalAgreedAmount, errorElements) {
  const currentUser = dgAdminUser();
  if (!currentUser) return false;
  const bookings = dgAdminGetBookings();
  const booking = dgAdminNormalizeBooking(bookings.find((item) => item.id === bookingId));
  if (!booking || booking.status !== 'Meeting Scheduled') return false;

  const gateMessage = dgAdminConfirmationGateMessage(booking);
  if (gateMessage) {
    dgAdminShowMessage(gateMessage, 'error');
    return false;
  }

  const notesError = errorElements && errorElements.notes;
  const amountError = errorElements && errorElements.amount;

  const notes = String(postMeetingNotes || '').trim();
  let valid = true;
  if (!notes) {
    if (notesError) notesError.textContent = 'Post-meeting notes are required before confirming the booking.';
    else dgAdminShowMessage('Post-meeting notes are required before confirming the booking.', 'error');
    valid = false;
  } else if (notes.length < 20) {
    if (notesError) notesError.textContent = 'Post-meeting notes must be at least 20 characters.';
    else dgAdminShowMessage('Post-meeting notes must be at least 20 characters.', 'error');
    valid = false;
  }
  const amount = Number(finalAgreedAmount || 0);
  if (!amount || amount <= 0) {
    if (amountError) amountError.textContent = 'Final agreed package amount is required and must be greater than 0.';
    else dgAdminShowMessage('Final agreed package amount is required before confirming the booking.', 'error');
    valid = false;
  }
  if (!valid) return false;

  if (booking.invoice) {
    dgAdminShowMessage('Invoice already generated for this booking.', 'error');
    return false;
  }

  booking.postMeetingNotes = notes;
  booking.postMeetingConfirmedAt = new Date().toISOString();
  booking.finalAgreedAmount = amount;
  booking.invoice = dgAdminCreateInvoice(booking, bookings, currentUser, amount);
  booking.status = 'Confirmed';
  booking.paymentStatus = 'Awaiting Down Payment';
  dgAdminAddHistory(booking, 'Post-meeting notes recorded', currentUser);
  dgAdminAddHistory(booking, 'Invoice generated', currentUser);
  dgAdminAddHistory(booking, 'Booking confirmed after meeting', currentUser);
  dgAdminSaveBookings(bookings);
  dgAdminNotifyClient(booking, 'Booking confirmed', `Your booking ${booking.id} has been confirmed following your consultation.`, 'booking');
  dgAdminNotifyClient(booking, 'Invoice ready', `Your invoice for ${booking.id} is ready. Please submit the required down payment receipt.`, 'invoice');
  dgAdminShowMessage(`Booking ${bookingId} confirmed. Invoice generated and waiting for 50% down payment.`);
  return true;
}

function dgAdminGenerateInvoice(bookingId, finalAgreedAmount, errorElements) {
  const currentUser = dgAdminUser();
  if (!currentUser) return false;
  const bookings = dgAdminGetBookings();
  const booking = dgAdminNormalizeBooking(bookings.find((item) => item.id === bookingId));
  if (!booking || booking.status !== 'Confirmed') return false;

  const amountError = errorElements && errorElements.amount;
  const amount = Number(finalAgreedAmount || 0);
  if (!amount || amount <= 0) {
    if (amountError) amountError.textContent = 'Final agreed package amount is required and must be greater than 0.';
    else dgAdminShowMessage('Final agreed package amount is required to generate the invoice.', 'error');
    return false;
  }

  if (booking.invoice) {
    dgAdminShowMessage('Invoice already generated for this booking.', 'error');
    return false;
  }

  booking.finalAgreedAmount = amount;
  booking.invoice = dgAdminCreateInvoice(booking, bookings, currentUser, amount);
  booking.paymentStatus = 'Awaiting Down Payment';
  dgAdminAddHistory(booking, 'Invoice generated by admin', currentUser);
  dgAdminSaveBookings(bookings);
  dgAdminNotifyClient(booking, 'Invoice ready', `Your invoice for ${booking.id} is ready. Please submit the required down payment receipt.`, 'invoice');
  dgAdminShowMessage(`Invoice generated for booking ${bookingId}.`);
  return true;
}

function dgAdminReviewReschedule(bookingId, decision) {
  const currentUser = dgAdminUser();
  if (!currentUser) return false;
  const bookings = dgAdminGetBookings();
  const booking = dgAdminNormalizeBooking(bookings.find((item) => item.id === bookingId));
  if (!booking || !booking.rescheduleRequest || booking.rescheduleRequest.status !== 'Pending') return false;

  const reviewedBy = currentUser.name || currentUser.fullName || currentUser.email;
  booking.rescheduleRequest.status = decision;
  booking.rescheduleRequest.reviewedAt = new Date().toISOString();
  booking.rescheduleRequest.reviewedBy = reviewedBy;

  if (decision === 'Approved') {
    booking.meetingDate = booking.rescheduleRequest.requestedDate;
    booking.meetingTime = booking.rescheduleRequest.requestedTime;
    booking.meetingStatus = 'Scheduled';
    booking.meetingClientConfirmation = null;
    booking.status = 'Meeting Scheduled';
    dgAdminAddHistory(booking, 'Meeting reschedule request approved', currentUser);
    dgAdminSaveBookings(bookings);
    dgAdminNotifyClient(booking, 'Meeting rescheduled', `Your reschedule request for ${booking.id} was approved. Please review your updated meeting schedule.`, 'meeting');
    dgAdminShowMessage('Meeting schedule updated from client reschedule request.');
    return true;
  }

  booking.rescheduleRequest.status = 'Rejected';
  booking.meetingStatus = 'Scheduled';
  booking.meetingClientConfirmation = null;
  dgAdminAddHistory(booking, 'Meeting reschedule request rejected', currentUser);
  dgAdminSaveBookings(bookings);
  dgAdminNotifyClient(booking, 'Reschedule request reviewed', `Your request to reschedule the meeting for ${booking.id} was not approved. Your current schedule remains active.`, 'meeting');
  dgAdminShowMessage('Reschedule request rejected.');
  return true;
}

function dgAdminAssignStaff(bookingId, staffId) {
  const currentUser = dgAdminUser();
  if (!currentUser) return false;
  const bookings = dgAdminGetBookings();
  const booking = dgAdminNormalizeBooking(bookings.find((item) => item.id === bookingId));
  const staff = dgAdminStaffUsers();

  if (!staff.length) {
    dgAdminShowMessage('No staff accounts available. Create a staff user first.', 'error');
    return false;
  }

  if (!staffId) {
    dgAdminShowMessage('Select a staff member before assigning.', 'error');
    return false;
  }

  if (!booking || booking.status !== 'Confirmed') {
    dgAdminShowMessage('Staff can only be assigned to confirmed bookings.', 'error');
    return false;
  }
  if (!booking.invoice) {
    dgAdminShowMessage('Invoice must be generated before assigning staff.', 'error');
    return false;
  }
  if (!dgAdminDownPaymentVerified(booking)) {
    dgAdminShowMessage('Down payment must be verified before assigning staff.', 'error');
    return false;
  }
  const selectedStaff = staff.find((user) => user.id === staffId);
  if (!selectedStaff) return false;

  booking.assignedStaffId = selectedStaff.id;
  booking.assignedStaffName = selectedStaff.fullName;
  dgAdminAddHistory(booking, 'Staff assigned', currentUser);
  dgAdminSaveBookings(bookings);
  dgAdminNotifyClient(booking, 'Staff assigned', `A production staff member has been assigned to your project ${booking.id}.`, 'production');
  dgAdminNotifyStaff(booking, 'New project assigned', `You have been assigned to ${booking.id} for ${booking.serviceType}.`, 'production');
  dgAdminShowMessage(`${selectedStaff.fullName} assigned to ${bookingId}.`);
  return true;
}

function dgAdminMarkScheduled(bookingId) {
  const currentUser = dgAdminUser();
  if (!currentUser) return false;
  const bookings = dgAdminGetBookings();
  const booking = dgAdminNormalizeBooking(bookings.find((item) => item.id === bookingId));
  if (!booking || booking.status !== 'Confirmed') return false;
  if (!booking.invoice || !dgAdminDownPaymentVerified(booking)) {
    dgAdminShowMessage('Down payment must be verified before marking as scheduled.', 'error');
    return false;
  }

  if (!booking.assignedStaffId) {
    dgAdminShowMessage('Assign staff before marking this booking as scheduled.', 'error');
    return false;
  }

  booking.status = 'Scheduled';
  dgAdminAddHistory(booking, 'Booking marked as scheduled', currentUser);
  dgAdminSaveBookings(bookings);
  dgAdminNotifyClient(booking, 'Project scheduled', `Your project ${booking.id} has been scheduled for production.`, 'production');
  dgAdminNotifyStaff(booking, 'Project scheduled', `${booking.id} is scheduled and ready for production updates.`, 'production');
  dgAdminShowMessage(`Booking ${bookingId} marked as scheduled.`);
  return true;
}

function dgAdminCancelBooking(bookingId) {
  const currentUser = dgAdminUser();
  if (!currentUser) return false;
  const bookings = dgAdminGetBookings();
  const booking = bookings.find((item) => item.id === bookingId);
  if (!booking) return false;

  booking.status = 'Cancelled';
  dgAdminAddHistory(booking, 'Booking Cancelled', currentUser);
  dgAdminSaveBookings(bookings);
  dgAdminNotifyClient(booking, 'Booking cancelled', `Your booking ${booking.id} has been cancelled.`, 'booking');
  dgAdminShowMessage(`Booking ${bookingId} moved to Cancelled.`);
  return true;
}

function dgAdminStaffSelect(booking) {
  dgAdminNormalizeBooking(booking);
  const staff = dgAdminStaffUsers();
  const canAssign = booking.status === 'Confirmed' && booking.invoice && dgAdminDownPaymentVerified(booking);
  if (!canAssign) {
    return dgAdminEscape(dgAdminStaffName(booking));
  }
  if (!staff.length) {
    return '<span class="muted-text">No staff accounts</span>';
  }
  const options = ['<option value="">Select staff</option>'].concat(staff.map((user) => {
    const selected = user.id === booking.assignedStaffId ? ' selected' : '';
    return `<option value="${dgAdminEscape(user.id)}"${selected}>${dgAdminEscape(user.fullName)}</option>`;
  })).join('');
  return `<select class="inline-select" data-staff-select="${dgAdminEscape(booking.id)}">${options}</select>`;
}

function dgAdminBookingActions(booking) {
  dgAdminNormalizeBooking(booking);
  const productionStatuses = ['Scheduled', 'On Shoot', 'Editing', 'Ready for Delivery', 'Completed'];
  const canAssign = booking.status === 'Confirmed' && booking.invoice && dgAdminDownPaymentVerified(booking);
  const bookingId = dgAdminEscape(booking.id);
  const detailsHref = `admin-booking-details.html?id=${bookingId}`;
  const meetingHref = `${detailsHref}#meeting`;
  const invoiceHref = `${detailsHref}#payment-information`;
  const productionHref = `${detailsHref}#production-updates`;
  const deliveryHref = `${detailsHref}#delivery-output`;
  const projectHref = productionStatuses.includes(booking.status)
    ? `project-progress.html?id=${bookingId}`
    : productionHref;
  const normalActions = [];
  const dangerActions = [];
  const link = (label, href, primary = false) => `<a class="btn ${primary ? 'primary' : 'ghost'} small${primary ? ' booking-primary-action' : ''}" href="${href}">${label}</a>`;
  const button = (label, action, primary = false, danger = false) => `<button class="btn ${danger ? 'danger' : primary ? 'primary' : 'ghost'} small${primary ? ' booking-primary-action' : ''}" type="button" data-action="${action}" data-id="${bookingId}">${label}</button>`;
  const addDetails = () => normalActions.push(link('View Details', detailsHref));
  const addPayments = () => normalActions.push(link('View Payments', invoiceHref));
  const addCancel = () => dangerActions.push(button('Cancel', 'cancel', false, true));
  let primaryAction;

  if (['Cancelled', 'Rejected'].includes(booking.status)) {
    primaryAction = link('View Details', detailsHref, true);
    if (booking.status === 'Rejected') {
      dangerActions.push(button('Archive', 'cancel', false, true));
    } else {
      normalActions.push('<span class="booking-menu-status">Archived</span>');
    }
  } else if (booking.status === 'Completed') {
    primaryAction = link('View Summary', deliveryHref, true);
    addDetails();
    normalActions.push(link('View Deliverables', deliveryHref));
    addPayments();
  } else if (productionStatuses.includes(booking.status)) {
    primaryAction = link('View Project', projectHref, true);
    addDetails();
    normalActions.push(link('View Staff Progress', projectHref));
    addPayments();
  } else if (canAssign && !booking.assignedStaffId) {
    primaryAction = button('Assign Staff', 'assign', true);
    addDetails();
    addPayments();
  } else if (canAssign && booking.assignedStaffId) {
    primaryAction = link('View Project', projectHref, true);
    addDetails();
    normalActions.push(button('Schedule', 'schedule'));
    addPayments();
  } else if (booking.status === 'Pending Review') {
    primaryAction = link('Review', detailsHref, true);
    normalActions.push(button('Approve', 'approveMeeting'));
    dangerActions.push(button('Reject', 'reject', false, true));
    addCancel();
  } else if (booking.status === 'Approved for Meeting') {
    primaryAction = link('Schedule', meetingHref, true);
    addDetails();
    addCancel();
  } else if (booking.status === 'Meeting Scheduled') {
    primaryAction = link('View Meeting', meetingHref, true);
    normalActions.push(link('Reschedule Meeting', meetingHref));
    normalActions.push(link('Confirm Booking', `${detailsHref}#admin-actions`));
    addCancel();
  } else if (booking.status === 'Confirmed' || ['Awaiting Payment', 'Awaiting Down Payment'].includes(booking.paymentStatus)) {
    primaryAction = link('View Invoice', invoiceHref, true);
    addDetails();
    addPayments();
    addCancel();
  } else {
    primaryAction = link('View Details', detailsHref, true);
    addCancel();
  }

  return `
    <div class="booking-row-actions">
      ${primaryAction}
      <details class="booking-more-actions">
        <summary class="booking-more-toggle" aria-label="More actions for booking ${bookingId}" title="More actions">&#8942;</summary>
        <div class="booking-actions-menu">
          ${normalActions.join('')}
          ${dangerActions.length ? `<div class="booking-danger-actions">${dangerActions.join('')}</div>` : ''}
        </div>
      </details>
    </div>
  `;
}

function dgAdminBookingSourceLabel(booking) {
  return booking.source || 'Online Request';
}

function dgAdminRenderDashboard() {
  const dashboard = document.getElementById('adminOperationsDashboard');
  if (!dashboard) return;
  const currentUser = dgAdminUser();
  if (!currentUser) return;

  const bookings = dgAdminGetBookings().map(dgAdminNormalizeBooking);
  const inquiries = dgAdminGetInquiries();
  const payments = dgAdminGetPayments();
  const users = dgAdminGetUsers();
  const activeBookings = bookings.filter((booking) => !['Completed', 'Rejected', 'Cancelled'].includes(booking.status));
  const pendingPayments = payments.filter((payment) => payment.status === 'Pending Verification');
  const readyForStaffAssignment = bookings.filter((booking) => (
    booking.status === 'Confirmed' &&
    booking.invoice &&
    booking.invoice.downPaymentStatus === 'Verified' &&
    !booking.assignedStaffId
  ));
  const deliveryLockedByBalance = bookings.filter((booking) => (
    booking.status === 'Ready for Delivery' &&
    booking.invoice &&
    booking.invoice.balanceStatus !== 'Verified'
  ));
  const totalCollected = payments
    .filter((payment) => payment.status === 'Verified')
    .reduce((total, payment) => total + Number(payment.amountPaid || 0), 0);
  const outstandingBalance = bookings
    .filter((booking) => booking.invoice && booking.invoice.balanceStatus !== 'Verified')
    .reduce((total, booking) => total + Number(booking.invoice.balanceAmount || 0), 0);

  dgAdminSetText('welcomeName', currentUser.name || currentUser.fullName || 'Admin');
  dgAdminSetText('totalBookings', bookings.length);
  dgAdminSetText('newInquiries', inquiries.filter((inquiry) => inquiry.status === 'New').length);
  dgAdminSetText('pendingReview', bookings.filter((booking) => booking.status === 'Pending Review').length);
  dgAdminSetText('paymentsForVerification', pendingPayments.length);
  dgAdminSetText('readyForStaffAssignment', readyForStaffAssignment.length);
  dgAdminSetText('deliveryLockedByBalance', deliveryLockedByBalance.length);
  dgAdminSetText('totalUsers', users.length);
  dgAdminSetText('approvedBookings', activeBookings.length);
  dgAdminSetText('completedProjects', bookings.filter((booking) => booking.status === 'Completed').length);
  dgAdminSetText('totalCollected', dgAdminMoney(totalCollected));
  dgAdminSetText('outstandingBalance', dgAdminMoney(outstandingBalance));

  const recentInquiries = document.getElementById('recentInquiriesList');
  const recentBookings = document.getElementById('recentBookingsList');
  const recentPayments = document.getElementById('recentPaymentsList');
  const latestInquiries = inquiries.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 3);
  const latestBookings = bookings.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 3);
  const latestPayments = pendingPayments.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 3);

  if (recentInquiries) {
    recentInquiries.innerHTML = latestInquiries.length ? latestInquiries.map((inquiry) => {
      const preferredDate = inquiry.preferredDate || (inquiry.isDateFlexible ? 'Flexible date' : 'Date not set');
      return `
        <a class="activity-row" href="manage-inquiries.html">
          <span class="activity-row-title">${dgAdminEscape(inquiry.fullName)}</span>
          <span class="activity-row-copy">${dgAdminEscape(inquiry.serviceType)} | ${dgAdminFormatDate(preferredDate)}</span>
          ${dgAdminBadge(inquiry.status)}
        </a>
      `;
    }).join('') : '<p class="activity-empty">No new inquiries.</p>';
  }
  if (recentBookings) {
    recentBookings.innerHTML = latestBookings.length ? latestBookings.map((booking) => `
      <a class="activity-row" href="admin-booking-details.html?id=${dgAdminEscape(booking.id)}">
        <span class="activity-row-title">${dgAdminEscape(booking.id)} | ${dgAdminEscape(booking.clientName)}</span>
        <span class="activity-row-copy">${dgAdminEscape(booking.serviceType)}</span>
        ${dgAdminBadge(booking.status)}
      </a>
    `).join('') : '<p class="activity-empty">No bookings yet.</p>';
  }
  if (recentPayments) {
    recentPayments.innerHTML = latestPayments.length ? latestPayments.map((payment) => `
      <a class="activity-row" href="payment-verification.html">
        <span class="activity-row-title">${dgAdminEscape(payment.paymentType || 'Payment')} | ${dgAdminMoney(payment.amountPaid)}</span>
        <span class="activity-row-copy">${dgAdminEscape(payment.bookingId)}</span>
        ${dgAdminBadge(payment.status)}
      </a>
    `).join('') : '<p class="activity-empty">No payments waiting for verification.</p>';
  }
}

function dgAdminRenderManageBookings() {
  const body = document.getElementById('manageBookingsBody');
  if (!body) return;
  const currentUser = dgAdminUser();
  if (!currentUser) return;

  const search = document.getElementById('bookingSearch');
  const statusFilter = document.getElementById('bookingStatusFilter');
  const paymentFilter = document.getElementById('paymentStatusFilter');
  const manualButton = document.getElementById('openManualBooking');
  const manualModal = document.getElementById('manualBookingModal');
  const manualForm = document.getElementById('manualBookingForm');
  const accountNotice = document.getElementById('manualAccountNotice');
  const finalAmountField = manualForm?.querySelector('.manual-final-amount-field');
  const packagePreview = document.getElementById('manualPackagePreview');
  const manualStepPanels = manualForm ? Array.from(manualForm.querySelectorAll('[data-manual-step]')) : [];
  const manualStepIndicators = manualForm ? Array.from(manualForm.querySelectorAll('[data-manual-step-indicator]')) : [];
  const manualBackButton = manualForm?.querySelector('[data-manual-back]');
  const manualCancelButton = manualForm?.querySelector('[data-manual-cancel]');
  const manualNextButton = manualForm?.querySelector('[data-manual-next]');
  const manualSubmitButton = manualForm?.querySelector('[data-manual-submit]');
  const manualReview = document.getElementById('manualBookingReview');
  const manualModalBody = manualForm?.querySelector('.manual-modal-body');
  let manualCurrentStep = 1;
  let manualAccountModeSelected = false;

  const setSummary = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  const clearManualErrors = () => {
    if (!manualForm) return;
    manualForm.querySelectorAll('[data-error-for]').forEach((el) => { el.textContent = ''; });
  };

  const manualError = (field, message) => {
    const target = manualForm?.querySelector(`[data-error-for="${field}"]`);
    if (target) target.textContent = message;
  };

  const updateBookingSummary = (bookings) => {
    setSummary('bookingPendingCount', bookings.filter((booking) => booking.status === 'Pending Review').length);
    setSummary('bookingApprovedCount', bookings.filter((booking) => booking.status === 'Approved for Meeting').length);
    setSummary('bookingAwaitingPaymentCount', bookings.filter((booking) => ['Awaiting Payment', 'Awaiting Down Payment'].includes(booking.paymentStatus)).length);
    setSummary('bookingActiveCount', bookings.filter((booking) => !['Completed', 'Rejected', 'Cancelled'].includes(booking.status)).length);
    setSummary('bookingCompletedCount', bookings.filter((booking) => booking.status === 'Completed').length);
  };

  const activeServices = () => DGData.getJson(DGData.keys.services, []).filter((service) => (service.status || 'Active') === 'Active' && service.name !== 'Real Estate Shoot');
  const activePackages = () => DGData.getJson(DGData.keys.pricing, []).filter((pkg) => (pkg.status || 'Active') === 'Active' && pkg.serviceName !== 'Real Estate Shoot');

  const populateManualServices = () => {
    if (!manualForm) return;
    manualForm.serviceType.innerHTML = '<option value="">Choose service</option>' + activeServices().map((service) => (
      `<option value="${dgAdminEscape(service.name)}" data-service-id="${dgAdminEscape(service.id)}">${dgAdminEscape(service.name)}</option>`
    )).join('');
  };

  const populateManualPackages = () => {
    if (!manualForm) return;
    const selected = manualForm.serviceType.selectedOptions[0];
    const serviceId = selected?.dataset.serviceId || '';
    const serviceName = manualForm.serviceType.value;
    const packages = activePackages().filter((pkg) => pkg.serviceId === serviceId || pkg.serviceName === serviceName);
    manualForm.packageName.innerHTML = '<option value="">Choose package</option>' + packages.map((pkg) => (
      `<option value="${dgAdminEscape(pkg.packageName)}" data-package-id="${dgAdminEscape(pkg.id)}" data-price="${Number(pkg.price || 0)}">${dgAdminEscape(pkg.packageName)}</option>`
    )).join('');
    updateManualPackagePreview();
  };

  function selectedManualPackage() {
    if (!manualForm) return null;
    const packageId = manualForm.packageName.selectedOptions[0]?.dataset.packageId || '';
    return activePackages().find((pkg) => pkg.id === packageId) || null;
  }

  function updateManualPackagePreview() {
    if (!packagePreview || !manualForm) return;
    const pkg = selectedManualPackage();
    if (!pkg) {
      packagePreview.innerHTML = manualForm.packageName.value
        ? `<span>${dgAdminEscape(manualForm.packageName.value)}</span><p>Package selected. Final pricing can still be confirmed with the client.</p>`
        : '<span>Selected package summary</span><p>Select a package to see price and deliverables.</p>';
      return;
    }
    const deliverables = Array.isArray(pkg.deliverables) ? pkg.deliverables : [];
    const visibleDeliverables = deliverables.slice(0, 3);
    const remainingCount = deliverables.length - visibleDeliverables.length;
    packagePreview.innerHTML = `
      <span>${dgAdminEscape(pkg.packageName)} | ${dgAdminMoney(pkg.price)}</span>
      <ul>
        ${visibleDeliverables.map((item) => `<li>${dgAdminEscape(item)}</li>`).join('')}
        ${remainingCount > 0 ? `<li>+ ${remainingCount} more deliverable${remainingCount === 1 ? '' : 's'}</li>` : ''}
      </ul>
    `;
    if (manualForm.initialStatus.value === 'Confirmed' && !manualForm.finalAgreedAmount.value) {
      manualForm.finalAgreedAmount.value = Number(pkg.price || 0);
    }
  }

  const findManualUserByEmail = (email) => email
    ? dgAdminGetUsers().find((user) => String(user.email || '').toLowerCase() === email) || null
    : null;

  const updateManualAccountState = (source = 'state') => {
    if (!manualForm) return;
    const email = manualForm.email.value.trim().toLowerCase();
    const existing = findManualUserByEmail(email);
    const existingClient = existing && existing.role === 'client';
    if (source === 'email' || source === 'mode') manualError('email', '');
    if (source === 'email') {
      if (existingClient) {
        manualForm.accountMode.value = 'link';
        manualAccountModeSelected = false;
      } else if (!manualAccountModeSelected) {
        manualForm.accountMode.value = 'create';
      }
    }
    const shouldCreate = manualForm.accountMode.value === 'create';
    manualForm.querySelectorAll('.manual-password-field').forEach((field) => { field.hidden = !shouldCreate; });
    if (!shouldCreate) {
      manualForm.temporaryPassword.value = '';
      manualForm.confirmTemporaryPassword.value = '';
      manualError('temporaryPassword', '');
      manualError('confirmTemporaryPassword', '');
    }
    if (accountNotice) {
      if (existingClient && manualForm.accountMode.value === 'link') {
        accountNotice.hidden = false;
        accountNotice.textContent = 'Existing client found. This booking will be linked to that account.';
      } else if (existingClient && manualForm.accountMode.value === 'create') {
        accountNotice.hidden = false;
        accountNotice.textContent = 'This email already belongs to an existing client. Link this booking to the existing account instead.';
      } else if (existing) {
        accountNotice.hidden = false;
        accountNotice.textContent = 'This email belongs to a non-client account. Use a client email address for manual booking access.';
      } else if (manualForm.accountMode.value === 'link') {
        accountNotice.hidden = false;
        accountNotice.textContent = email
          ? 'No existing client account found for this email.'
          : 'Enter an existing client email address to link this booking.';
      } else {
        accountNotice.hidden = true;
        accountNotice.textContent = '';
      }
    }
  };

  const updateManualWorkflowState = () => {
    if (!manualForm || !finalAmountField) return;
    finalAmountField.hidden = manualForm.initialStatus.value !== 'Confirmed';
    if (manualForm.initialStatus.value === 'Confirmed' && !manualForm.finalAgreedAmount.value) {
      const pkg = selectedManualPackage();
      if (pkg) manualForm.finalAgreedAmount.value = Number(pkg.price || 0);
    }
  };

  const clearManualStepErrors = (fields) => {
    fields.forEach((field) => manualError(field, ''));
  };

  const validateManualStep = (step) => {
    if (!manualForm) return false;
    const email = manualForm.email.value.trim().toLowerCase();
    const existingUser = findManualUserByEmail(email);
    const existingClient = existingUser && existingUser.role === 'client';
    let valid = true;
    const fail = (field, message) => { manualError(field, message); valid = false; };

    if (step === 1) {
      clearManualStepErrors(['fullName', 'email', 'contactNumber', 'temporaryPassword', 'confirmTemporaryPassword']);
      if (!manualForm.fullName.value.trim()) fail('fullName', 'Full name is required.');
      if (!email || !dgAdminValidEmail(email)) fail('email', 'Valid email is required.');
      if (existingUser && existingUser.role !== 'client') fail('email', 'Use an email address assigned to a client account.');
      if (manualForm.accountMode.value === 'link' && !existingClient) fail('email', 'No existing client account found for this email.');
      if (manualForm.accountMode.value === 'create' && existingClient) {
        fail('email', 'This email already belongs to an existing client. Link this booking to the existing account instead.');
      }
      if (!manualForm.contactNumber.value.trim() || !dgAdminValidPhone(manualForm.contactNumber.value.trim())) fail('contactNumber', 'Use 09XXXXXXXXX or +639XXXXXXXXX.');
      if (manualForm.accountMode.value === 'create' && !existingUser) {
        if (!dgAdminValidPassword(manualForm.temporaryPassword.value)) fail('temporaryPassword', 'Password needs 8 chars, uppercase, lowercase, and number.');
        if (manualForm.temporaryPassword.value !== manualForm.confirmTemporaryPassword.value) fail('confirmTemporaryPassword', 'Passwords must match.');
      }
    }

    if (step === 2) {
      clearManualStepErrors(['serviceType', 'packageName', 'eventDate', 'eventTime', 'location', 'budget', 'details']);
      if (!manualForm.serviceType.value) fail('serviceType', 'Service type is required.');
      if (!manualForm.packageName.value) fail('packageName', 'Package is required.');
      if (!manualForm.eventDate.value) fail('eventDate', 'Event date is required.');
      if (manualForm.eventDate.value && manualForm.eventDate.value < new Date().toISOString().slice(0, 10)) fail('eventDate', 'Event date cannot be in the past.');
      if (!manualForm.eventTime.value) fail('eventTime', 'Event time is required.');
      if (!manualForm.location.value.trim()) fail('location', 'Event location is required.');
      if (!manualForm.budget.value) fail('budget', 'Budget range is required.');
      if (!manualForm.details.value.trim() || manualForm.details.value.trim().length < 20) fail('details', 'Event details must be at least 20 characters.');
    }

    if (step === 3) {
      clearManualStepErrors(['initialStatus', 'finalAgreedAmount']);
      if (!manualForm.initialStatus.value) fail('initialStatus', 'Initial status is required.');
      if (manualForm.initialStatus.value === 'Confirmed' && Number(manualForm.finalAgreedAmount.value || 0) <= 0) {
        fail('finalAgreedAmount', 'Final agreed package amount is required.');
      }
    }

    return valid;
  };

  const renderManualReview = () => {
    if (!manualForm || !manualReview) return;
    const statusLabel = manualForm.initialStatus.selectedOptions[0]?.textContent || 'Not set';
    const accountLabel = manualForm.accountMode.selectedOptions[0]?.textContent || 'Not set';
    const rows = [
      ['Client Name', manualForm.fullName.value.trim()],
      ['Email', manualForm.email.value.trim()],
      ['Contact Number', manualForm.contactNumber.value.trim()],
      ['Account Setup', accountLabel],
      ['Service Type', manualForm.serviceType.value],
      ['Package', manualForm.packageName.value],
      ['Event Date', dgAdminFormatDate(manualForm.eventDate.value)],
      ['Event Time', manualForm.eventTime.value || 'Not set'],
      ['Event Location', manualForm.location.value.trim()],
      ['Budget Range', manualForm.budget.value],
      ['Initial Status', statusLabel]
    ];
    if (manualForm.initialStatus.value === 'Confirmed') {
      rows.push(['Final Agreed Package Amount', dgAdminMoney(manualForm.finalAgreedAmount.value)]);
    }
    manualReview.innerHTML = rows.map(([label, value]) => `
      <div><dt>${dgAdminEscape(label)}</dt><dd>${dgAdminEscape(value || 'Not set')}</dd></div>
    `).join('');
  };

  const showManualStep = (step) => {
    if (!manualForm) return;
    manualCurrentStep = Math.min(Math.max(step, 1), 4);
    manualStepPanels.forEach((panel) => { panel.hidden = Number(panel.dataset.manualStep) !== manualCurrentStep; });
    manualStepIndicators.forEach((indicator) => {
      const number = Number(indicator.dataset.manualStepIndicator);
      indicator.classList.toggle('active', number === manualCurrentStep);
      indicator.classList.toggle('complete', number < manualCurrentStep);
      if (number === manualCurrentStep) indicator.setAttribute('aria-current', 'step');
      else indicator.removeAttribute('aria-current');
    });
    if (manualCancelButton) manualCancelButton.hidden = manualCurrentStep !== 1;
    if (manualBackButton) manualBackButton.hidden = manualCurrentStep === 1;
    if (manualNextButton) {
      manualNextButton.hidden = manualCurrentStep === 4;
      manualNextButton.textContent = manualCurrentStep === 1
        ? 'Next: Booking Details'
        : manualCurrentStep === 2
          ? 'Next: Workflow'
          : 'Review Booking';
    }
    if (manualSubmitButton) manualSubmitButton.hidden = manualCurrentStep !== 4;
    if (manualCurrentStep === 4) renderManualReview();
    if (manualModalBody) manualModalBody.scrollTop = 0;
  };

  const openManualModal = () => {
    if (!manualModal || !manualForm) return;
    manualForm.reset();
    manualAccountModeSelected = false;
    clearManualErrors();
    manualForm.eventDate.min = new Date().toISOString().slice(0, 10);
    populateManualServices();
    populateManualPackages();
    updateManualAccountState('state');
    updateManualWorkflowState();
    showManualStep(1);
    manualModal.hidden = false;
    manualForm.fullName.focus();
  };

  const closeManualModal = () => {
    if (!manualModal || !manualForm) return;
    manualModal.hidden = true;
    manualForm.reset();
    clearManualErrors();
  };

  const closeActionMenus = () => {
    body.querySelectorAll('.booking-more-actions[open]').forEach((menu) => {
      menu.open = false;
      menu.classList.remove('menu-positioned');
    });
  };

  const positionActionMenu = (menu) => {
    const toggle = menu.querySelector('.booking-more-toggle');
    const popup = menu.querySelector('.booking-actions-menu');
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

  const createManualBooking = () => {
    if (!manualForm) return false;
    clearManualErrors();
    const users = dgAdminGetUsers();
    const bookings = dgAdminGetBookings();
    const email = manualForm.email.value.trim().toLowerCase();
    const existingUser = users.find((user) => String(user.email || '').toLowerCase() === email);
    const existingClient = existingUser && existingUser.role === 'client';
    const selectedService = manualForm.serviceType.selectedOptions[0];
    const pkg = selectedManualPackage();
    let clientUser = existingUser || null;
    let valid = true;
    const fail = (field, message) => { manualError(field, message); valid = false; };

    const values = {
      fullName: manualForm.fullName.value.trim(),
      email,
      contactNumber: manualForm.contactNumber.value.trim(),
      accountMode: manualForm.accountMode.value,
      temporaryPassword: manualForm.temporaryPassword.value,
      confirmTemporaryPassword: manualForm.confirmTemporaryPassword.value,
      serviceType: manualForm.serviceType.value,
      serviceId: selectedService?.dataset.serviceId || '',
      packageName: manualForm.packageName.value,
      packageId: manualForm.packageName.selectedOptions[0]?.dataset.packageId || '',
      eventDate: manualForm.eventDate.value,
      eventTime: manualForm.eventTime.value,
      location: manualForm.location.value.trim(),
      budget: manualForm.budget.value,
      details: manualForm.details.value.trim(),
      notes: manualForm.notes.value.trim(),
      initialStatus: manualForm.initialStatus.value,
      finalAgreedAmount: Number(manualForm.finalAgreedAmount.value || 0),
      adminNotes: manualForm.adminNotes.value.trim()
    };

    if (!values.fullName) fail('fullName', 'Full name is required.');
    if (!values.email || !dgAdminValidEmail(values.email)) fail('email', 'Valid email is required.');
    if (existingUser && existingUser.role !== 'client') fail('email', 'Use an email address assigned to a client account.');
    if (values.accountMode === 'link' && !existingClient) fail('email', 'No existing client account found for this email.');
    if (values.accountMode === 'create' && existingClient) fail('email', 'This email already belongs to an existing client. Link this booking to the existing account instead.');
    if (!values.contactNumber || !dgAdminValidPhone(values.contactNumber)) fail('contactNumber', 'Use 09XXXXXXXXX or +639XXXXXXXXX.');
    if (!existingUser && values.accountMode === 'create') {
      if (!dgAdminValidPassword(values.temporaryPassword)) fail('temporaryPassword', 'Password needs 8 chars, uppercase, lowercase, and number.');
      if (values.temporaryPassword !== values.confirmTemporaryPassword) fail('confirmTemporaryPassword', 'Passwords must match.');
    }
    if (!values.serviceType) fail('serviceType', 'Service type is required.');
    if (!values.packageName) fail('packageName', 'Package is required.');
    if (!values.eventDate) fail('eventDate', 'Event date is required.');
    if (values.eventDate && values.eventDate < new Date().toISOString().slice(0, 10)) fail('eventDate', 'Event date cannot be in the past.');
    if (!values.eventTime) fail('eventTime', 'Event time is required.');
    if (!values.location) fail('location', 'Event location is required.');
    if (!values.budget) fail('budget', 'Budget range is required.');
    if (!values.details || values.details.length < 20) fail('details', 'Event details must be at least 20 characters.');
    if (values.initialStatus === 'Confirmed' && values.finalAgreedAmount <= 0) fail('finalAgreedAmount', 'Final agreed package amount is required.');
    if (!valid) return false;

    if (!clientUser) {
      clientUser = {
        id: dgAdminNextRecordId('U', users),
        name: values.fullName,
        fullName: values.fullName,
        email: values.email,
        password: values.temporaryPassword,
        temporaryPassword: values.temporaryPassword,
        role: 'client',
        status: 'Active',
        createdAt: new Date().toISOString(),
        dateCreated: new Date().toISOString(),
        contactNumber: values.contactNumber
      };
      users.push(clientUser);
      dgAdminSaveUsers(users);
    } else {
      clientUser.fullName = clientUser.fullName || values.fullName;
      clientUser.name = clientUser.name || values.fullName;
      clientUser.contactNumber = clientUser.contactNumber || values.contactNumber;
      dgAdminSaveUsers(users);
    }

    const now = new Date().toISOString();
    const booking = {
      id: dgAdminNextRecordId('BKG', bookings),
      bookingId: '',
      clientId: clientUser.id,
      clientName: clientUser.name || clientUser.fullName || values.fullName,
      clientEmail: clientUser.email,
      contactNumber: values.contactNumber,
      serviceId: values.serviceId,
      serviceName: values.serviceType,
      serviceType: values.serviceType,
      packageId: values.packageId,
      package: values.packageName,
      packageName: values.packageName,
      eventDate: values.eventDate,
      eventTime: values.eventTime,
      location: values.location,
      budget: values.budget,
      budgetRange: values.budget,
      details: values.details,
      eventDetails: values.details,
      notes: values.notes,
      additionalNotes: values.notes,
      adminNotes: values.adminNotes,
      status: values.initialStatus,
      paymentStatus: values.initialStatus === 'Confirmed' ? 'Awaiting Down Payment' : 'Not Required Yet',
      meetingStatus: 'Not Scheduled',
      meetingClientConfirmation: null,
      meetingDate: '',
      meetingTime: '',
      meetingMode: '',
      meetingLocation: '',
      meetingNotes: '',
      assignedStaffId: null,
      assignedStaff: '',
      finalAgreedAmount: values.initialStatus === 'Confirmed' ? values.finalAgreedAmount : Number(pkg?.price || 0),
      createdAt: now,
      createdBy: 'Admin',
      source: 'Manual Booking',
      history: [{
        date: now,
        action: 'Manual booking created',
        by: currentUser.name || currentUser.fullName || currentUser.email
      }]
    };
    booking.bookingId = booking.id;
    if (values.initialStatus === 'Confirmed') {
      booking.invoice = dgAdminCreateInvoice(booking, bookings, currentUser, values.finalAgreedAmount);
      booking.history.push({ date: now, action: 'Invoice generated', by: currentUser.name || currentUser.fullName || currentUser.email });
    }
    bookings.push(booking);
    dgAdminSaveBookings(bookings);
    dgAdminNotifyAdmin('Manual booking created', `${booking.clientName} was added as booking ${booking.id} for ${booking.serviceType}.`, 'booking', booking.id);
    dgAdminNotifyClient(booking, 'Booking created', `A booking for ${booking.serviceType} has been created for you as ${booking.id}.`, 'booking');
    if (booking.invoice) {
      dgAdminNotifyClient(booking, 'Invoice ready', `Your invoice for ${booking.id} is ready. Please submit the required down payment receipt.`, 'invoice');
    }
    closeManualModal();
    dgAdminShowMessage('Manual booking created successfully.');
    render();
    return true;
  };

  const render = () => {
    const query = (search.value || '').toLowerCase();
    const status = statusFilter.value;
    const paymentStatus = paymentFilter.value;
    const allBookings = dgAdminGetBookings().map(dgAdminNormalizeBooking);
    updateBookingSummary(allBookings);
    const rows = allBookings
      .filter((booking) => status === 'All' || booking.status === status)
      .filter((booking) => paymentStatus === 'All' || booking.paymentStatus === paymentStatus)
      .filter((booking) => {
        const haystack = `${booking.id} ${booking.clientName} ${booking.serviceType} ${booking.location} ${booking.source || ''}`.toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    body.innerHTML = rows.length ? rows.map((booking) => `
      <tr>
        <td>${dgAdminEscape(booking.id)}</td>
        <td>${dgAdminEscape(booking.clientName)}</td>
        <td>${dgAdminEscape(booking.serviceType)}</td>
        <td>${dgAdminEscape(booking.packageName)}</td>
        <td>${dgAdminFormatDate(booking.eventDate)}</td>
        <td>${dgAdminBadge(dgAdminBookingSourceLabel(booking))}</td>
        <td>${dgAdminBadge(booking.status)}</td>
        <td>${dgAdminBadge(dgAdminMeetingConfirmationLabel(booking))}</td>
        <td>${dgAdminBadge(booking.paymentStatus)}</td>
        <td>${dgAdminStaffSelect(booking)}</td>
        <td>${dgAdminBookingActions(booking)}</td>
      </tr>
    `).join('') : '<tr><td colspan="11"><div class="empty-state admin-table-empty"><strong>No bookings yet.</strong><span>New booking requests and manual bookings will appear here.</span><button class="btn primary small" type="button" data-open-manual-empty>+ Manual Booking</button></div></td></tr>';
  };

  search.addEventListener('input', render);
  statusFilter.addEventListener('change', render);
  paymentFilter.addEventListener('change', render);
  manualButton?.addEventListener('click', openManualModal);
  manualModal?.addEventListener('click', (event) => {
    if (event.target === manualModal || event.target.closest('[data-close-manual-booking]')) closeManualModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && manualModal && !manualModal.hidden) closeManualModal();
  });
  manualForm?.email.addEventListener('input', () => updateManualAccountState('email'));
  manualForm?.accountMode.addEventListener('change', () => {
    manualAccountModeSelected = true;
    updateManualAccountState('mode');
  });
  manualForm?.serviceType.addEventListener('change', populateManualPackages);
  manualForm?.packageName.addEventListener('change', updateManualPackagePreview);
  manualForm?.initialStatus.addEventListener('change', updateManualWorkflowState);
  manualBackButton?.addEventListener('click', () => showManualStep(manualCurrentStep - 1));
  manualNextButton?.addEventListener('click', () => {
    if (!validateManualStep(manualCurrentStep)) return;
    showManualStep(manualCurrentStep + 1);
  });
  manualForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (manualCurrentStep < 4) {
      if (validateManualStep(manualCurrentStep)) showManualStep(manualCurrentStep + 1);
      return;
    }
    for (let step = 1; step <= 3; step += 1) {
      if (!validateManualStep(step)) {
        showManualStep(step);
        return;
      }
    }
    const manualSubmitBtn = manualForm.querySelector('[type="submit"]');
    if (window.DGLoading) { DGLoading.show('Creating manual booking…'); DGLoading.disableButton(manualSubmitBtn); }
    let manualOk = false;
    try { manualOk = createManualBooking(); } finally { if (window.DGLoading) { DGLoading.hide(); DGLoading.enableButton(manualSubmitBtn); } }
    if (manualOk) render();
  });
  body.addEventListener('click', (event) => {
    if (event.target.closest('[data-open-manual-empty]')) {
      openManualModal();
      return;
    }
    const moreToggle = event.target.closest('.booking-more-toggle');
    if (moreToggle) {
      body.querySelectorAll('.booking-more-actions[open]').forEach((menu) => {
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
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const staffSelect = body.querySelector(`[data-staff-select="${button.dataset.id}"]`);
    const loadingMessages = {
      approveMeeting: 'Approving for meeting…',
      reject: 'Rejecting booking…',
      confirm: 'Confirming booking…',
      assign: 'Assigning staff…',
      schedule: 'Scheduling booking…',
      cancel: 'Cancelling booking…'
    };
    const actions = {
      approveMeeting: () => dgAdminApproveForMeeting(button.dataset.id),
      reject: () => dgAdminRejectBooking(button.dataset.id),
      confirm: () => dgAdminConfirmBooking(button.dataset.id),
      assign: () => dgAdminAssignStaff(button.dataset.id, staffSelect ? staffSelect.value : ''),
      schedule: () => dgAdminMarkScheduled(button.dataset.id),
      cancel: () => dgAdminCancelBooking(button.dataset.id)
    };
    if (actions[button.dataset.action]) {
      dgAdminConfirmAction({
        ...dgAdminBookingConfirmOptions(button.dataset.action, button.dataset.id),
        onConfirm: () => {
          const msg = loadingMessages[button.dataset.action] || 'Saving changes…';
          if (window.DGLoading) { DGLoading.show(msg); DGLoading.disableButton(button); }
          let ok = false;
          try { ok = actions[button.dataset.action](); } finally { if (window.DGLoading) { DGLoading.hide(); DGLoading.enableButton(button); } }
          if (ok) render();
        }
      });
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.booking-more-actions')) {
      closeActionMenus();
    }
  });
  window.addEventListener('resize', closeActionMenus);
  window.addEventListener('scroll', closeActionMenus, true);
  render();
}

function dgAdminPaymentActions(payment) {
  const paymentId = dgAdminEscape(payment.actionIds || payment.id);
  const receiptId = dgAdminEscape(payment.receiptPaymentId || payment.id);
  return `
    <div class="payment-action-compact">
      <button class="btn primary small" type="button" data-view-receipt="${receiptId}">Review Receipt</button>
      ${payment.status === 'Pending Verification' ? `<button class="btn ghost small" type="button" data-payment-action="Verified" data-id="${paymentId}">Verify</button>` : ''}
      <button class="payment-more-toggle" type="button" data-payment-more-menu data-payment-id="${paymentId}" data-can-update="${payment.status === 'Pending Verification' ? 'true' : 'false'}" data-hide-view-booking="true" aria-haspopup="menu" aria-expanded="false">More</button>
    </div>
  `;
}

function dgAdminPaymentReviewActions(payment) {
  const paymentId = dgAdminEscape(payment.actionIds || payment.id);
  const receiptId = dgAdminEscape(payment.receiptPaymentId || payment.id);
  const bookingHref = `admin-booking-details.html?id=${dgAdminEscape(payment.bookingId)}&scroll=payments`;
  return `
    <div class="payment-action-compact">
      <button class="btn ghost small" type="button" data-view-receipt="${receiptId}">Review</button>
      ${payment.status === 'Pending Verification' ? `<button class="btn primary small" type="button" data-payment-action="Verified" data-id="${paymentId}">Verify</button>` : ''}
      <button class="payment-more-toggle" type="button" data-payment-more-menu data-payment-id="${paymentId}" data-booking-href="${dgAdminEscape(bookingHref)}" data-can-update="${payment.status === 'Pending Verification' ? 'true' : 'false'}" aria-haspopup="menu" aria-expanded="false">More</button>
    </div>
  `;
}

function dgAdminCompactPaymentRows(payments) {
  const used = new Set();
  return payments.reduce((rows, payment, index) => {
    if (used.has(index)) return rows;
    const isSplitFull = (item) => (
      item &&
      ['Down Payment', 'Balance Payment'].includes((item.paymentType || '').trim()) &&
      (item.paymentOption === 'Full Payment' || String(item.notes || '').includes('Full payment selected')) &&
      Number(item.submittedPaymentAmount || 0) > 0
    );
    if (isSplitFull(payment)) {
      const matches = payments
        .map((item, matchIndex) => ({ item, matchIndex }))
        .filter(({ item, matchIndex }) => (
          !used.has(matchIndex) &&
          isSplitFull(item) &&
          item.bookingId === payment.bookingId &&
          item.referenceNumber === payment.referenceNumber &&
          item.receiptFileName === payment.receiptFileName &&
          item.paymentDate === payment.paymentDate &&
          Number(item.submittedPaymentAmount || 0) === Number(payment.submittedPaymentAmount || 0)
        ));
      const totalParts = matches.reduce((sum, { item }) => sum + Number(item.amountPaid || 0), 0);
      const submitted = Number(payment.submittedPaymentAmount || 0);
      if (matches.length > 1 && Math.abs(totalParts - submitted) < 0.01) {
        matches.forEach(({ matchIndex }) => used.add(matchIndex));
        rows.push({
          ...payment,
          id: payment.id,
          receiptPaymentId: payment.id,
          actionIds: matches.map(({ item }) => item.id).join('|'),
          paymentType: 'Full Payment',
          amountPaid: submitted,
          remainingAfterPayment: 0,
          status: matches.every(({ item }) => item.status === payment.status) ? payment.status : 'Pending Verification'
        });
        return rows;
      }
    }
    used.add(index);
    rows.push(payment);
    return rows;
  }, []);
}

function dgAdminClosePaymentMenus() {
  document.querySelectorAll('[data-payment-more-menu][aria-expanded="true"]').forEach((button) => {
    button.setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll('.payment-floating-menu').forEach((menu) => menu.remove());
}

function dgAdminOpenPaymentMenu(button) {
  if (!button) return;
  const alreadyOpen = button.getAttribute('aria-expanded') === 'true';
  dgAdminClosePaymentMenus();
  if (alreadyOpen) return;
  const paymentId = button.dataset.paymentId || '';
  const bookingHref = button.dataset.bookingHref || '#';
  const canUpdate = button.dataset.canUpdate === 'true';
  const hideViewBooking = button.dataset.hideViewBooking === 'true';
  const menu = document.createElement('div');
  menu.className = 'payment-floating-menu';
  menu.setAttribute('role', 'menu');
  menu.innerHTML = `
    ${canUpdate ? `<button type="button" role="menuitem" data-payment-action="Rejected" data-id="${dgAdminEscape(paymentId)}">Reject Payment</button>` : ''}
    ${canUpdate ? `<button type="button" role="menuitem" data-payment-action="Needs Resubmission" data-id="${dgAdminEscape(paymentId)}">Request Resubmission</button>` : ''}
    ${hideViewBooking ? '' : `<a role="menuitem" href="${dgAdminEscape(bookingHref)}">View Booking</a>`}
  `;
  document.body.appendChild(menu);
  const rect = button.getBoundingClientRect();
  const menuWidth = 210;
  const left = Math.max(12, Math.min(window.innerWidth - menuWidth - 12, rect.right - menuWidth));
  menu.style.left = `${left}px`;
  menu.style.top = `${rect.bottom + 8}px`;
  button.setAttribute('aria-expanded', 'true');
}

function dgAdminMeetingDetails(booking) {
  dgAdminNormalizeBooking(booking);
  if (!booking.meetingDate || !['Scheduled', 'Confirmed by Client'].includes(booking.meetingStatus)) {
    return '<div class="empty-state">Meeting has not been scheduled yet.</div>';
  }
  return `
    <dl class="details-grid">
      <div><dt>Meeting Status</dt><dd>${dgAdminBadge(booking.meetingStatus)}</dd></div>
      <div><dt>Meeting Date</dt><dd>${dgAdminFormatDate(booking.meetingDate)}</dd></div>
      <div><dt>Meeting Time</dt><dd>${dgAdminEscape(booking.meetingTime || 'Not set')}</dd></div>
      <div><dt>Meeting Mode</dt><dd>${dgAdminEscape(booking.meetingMode || 'Not set')}</dd></div>
      <div class="wide"><dt>Meeting Location / Link / Contact Number</dt><dd>${dgAdminEscape(booking.meetingLocation || 'Not set')}</dd></div>
      <div class="wide"><dt>Meeting Notes</dt><dd>${dgAdminEscape(booking.meetingNotes || 'None')}</dd></div>
    </dl>
  `;
}

function dgAdminMeetingConfirmationLabel(booking) {
  dgAdminNormalizeBooking(booking);
  const confirmation = booking.meetingClientConfirmation;
  const request = booking.rescheduleRequest;
  if (confirmation && confirmation.status === 'Confirmed') return 'Confirmed by Client';
  if (request && request.status === 'Pending') return 'Reschedule Requested';
  if (request && request.status === 'Approved') return 'Reschedule Approved';
  if (request && request.status === 'Rejected') return 'Reschedule Rejected';
  if (booking.status === 'Meeting Scheduled') return 'Pending Confirmation';
  return booking.meetingStatus || 'Not Scheduled';
}

function dgAdminClientMeetingConfirmation(booking) {
  dgAdminNormalizeBooking(booking);
  if (booking.status !== 'Meeting Scheduled' && !booking.meetingClientConfirmation && !booking.rescheduleRequest) return '';
  const confirmation = booking.meetingClientConfirmation;
  return `
    <div class="meeting-confirmation-status-card">
      <p class="eyebrow">Client Meeting Confirmation</p>
      <div class="meeting-confirmation-header">
        <h3>${dgAdminEscape(dgAdminMeetingConfirmationLabel(booking))}</h3>
        ${dgAdminBadge(dgAdminMeetingConfirmationLabel(booking))}
      </div>
      ${confirmation && confirmation.status === 'Confirmed' ? `
        <dl class="details-grid compact-details">
          <div><dt>Confirmed At</dt><dd>${dgAdminFormatDateTime(confirmation.confirmedAt)}</dd></div>
          <div><dt>Confirmed By</dt><dd>${dgAdminEscape(confirmation.confirmedBy || 'Client')}</dd></div>
        </dl>
      ` : '<p class="table-helper">The client has not confirmed the active meeting schedule yet.</p>'}
    </div>
  `;
}

function dgAdminMeetingPreference(booking) {
  dgAdminNormalizeBooking(booking);
  return `
    <div class="meeting-preference-card">
      <p class="eyebrow">Client meeting preference</p>
      <dl class="details-grid compact-details">
        <div><dt>Preferred Meeting Mode</dt><dd>${dgAdminEscape(booking.preferredMeetingMode || 'No preference')}</dd></div>
        <div class="wide"><dt>Preferred Meeting Notes</dt><dd>${dgAdminEscape(booking.preferredMeetingNotes || 'None provided')}</dd></div>
      </dl>
      <p class="table-helper">Client preferences are suggestions only. Admin sets the final meeting schedule based on availability.</p>
    </div>
  `;
}

function dgAdminRescheduleRequestCard(booking) {
  dgAdminNormalizeBooking(booking);
  const request = booking.rescheduleRequest;
  if (!request) return '';

  const statusLabel = `Reschedule ${request.status}`;
  const isPending = request.status === 'Pending';
  return `
    <div class="reschedule-card ${isPending ? 'reschedule-pending' : request.status === 'Approved' ? 'reschedule-approved' : 'reschedule-rejected'}">
      <div class="reschedule-card-header">
        <div>
          <p class="eyebrow">Client Reschedule Request</p>
          <h3>${isPending ? 'Client Reschedule Request' : `Reschedule request ${dgAdminEscape(request.status || 'reviewed')}`}</h3>
        </div>
        ${dgAdminBadge(statusLabel)}
      </div>
      <dl class="details-grid compact-details">
        <div><dt>Requested New Date</dt><dd>${dgAdminFormatDate(request.requestedDate)}</dd></div>
        <div><dt>Requested New Time</dt><dd>${dgAdminEscape(request.requestedTime || 'Not set')}</dd></div>
        <div><dt>Requested At</dt><dd>${dgAdminFormatDateTime(request.requestedAt)}</dd></div>
        <div><dt>Requested By</dt><dd>${dgAdminEscape(request.requestedBy || 'Client')}</dd></div>
        <div class="wide"><dt>Reason / Message</dt><dd>${dgAdminEscape(request.reason || 'None provided')}</dd></div>
        ${request.reviewedAt ? `<div><dt>Reviewed At</dt><dd>${dgAdminFormatDateTime(request.reviewedAt)}</dd></div>` : ''}
        ${request.reviewedBy ? `<div><dt>Reviewed By</dt><dd>${dgAdminEscape(request.reviewedBy)}</dd></div>` : ''}
      </dl>
      ${isPending ? `
        <div class="hero-actions">
          <button class="btn primary" type="button" data-reschedule-action="Approved" data-id="${dgAdminEscape(booking.id)}">Approve Reschedule</button>
          <button class="btn danger" type="button" data-reschedule-action="Rejected" data-id="${dgAdminEscape(booking.id)}">Reject Request</button>
        </div>
      ` : ''}
    </div>
  `;
}

function dgAdminMeetingForm(booking) {
  return `
    <form class="inquiry-form compact-form" id="meetingForm" data-meeting-booking="${dgAdminEscape(booking.id)}" novalidate>
      <div class="form-grid">
        <label>Meeting Date
          <input type="date" name="meetingDate" min="${dgAdminToday()}" value="${dgAdminEscape(booking.meetingDate || '')}" />
        </label>
        <label>Meeting Time
          <input type="time" name="meetingTime" value="${dgAdminEscape(booking.meetingTime || '')}" />
        </label>
        <label>Meeting Mode
          <select name="meetingMode">
            <option value="">Choose meeting mode</option>
            ${['Online Meeting', 'Phone Call', 'In-Person Meeting'].map((mode) => `<option value="${mode}"${booking.meetingMode === mode ? ' selected' : ''}>${mode}</option>`).join('')}
          </select>
        </label>
        <label>Meeting Location / Link / Contact Number
          <input type="text" name="meetingLocation" value="${dgAdminEscape(booking.meetingLocation || '')}" placeholder="Google Meet link, phone number, studio address, or meeting place" />
        </label>
      </div>
      <label>Meeting Notes <span class="optional">Optional</span>
        <textarea name="meetingNotes" rows="4" placeholder="Agenda, reminders, preparation notes, or final schedule details">${dgAdminEscape(booking.meetingNotes || '')}</textarea>
      </label>
      <button class="btn primary" type="submit">Save Meeting Schedule</button>
    </form>
  `;
}

function dgAdminDetailActions(booking, payments) {
  dgAdminNormalizeBooking(booking);
  const canAssign = booking.status === 'Confirmed' && booking.invoice && dgAdminDownPaymentVerified(booking);
  const canMarkScheduled = canAssign && Boolean(booking.assignedStaffId);
  const productionStatuses = ['Scheduled', 'On Shoot', 'Editing', 'Ready for Delivery', 'Completed'];
  const suggestedAmount = booking.finalAgreedAmount || dgAdminPackageAmount(booking);
  const pendingPayments = (Array.isArray(payments) ? payments : (payments ? [payments] : [])).filter((p) => p && p.status === 'Pending Verification');

  const downPaymentBlocked = booking.status === 'Confirmed' && booking.invoice && !dgAdminDownPaymentVerified(booking) && !['Awaiting Down Payment', 'Awaiting Payment'].includes(booking.paymentStatus);
  const confirmationGateMessage = booking.status === 'Meeting Scheduled' ? dgAdminConfirmationGateMessage(booking) : '';
  const confirmDisabledReason = confirmationGateMessage ||
    dgAdminConfirmationInputMessage(booking.postMeetingNotes || '', suggestedAmount || '');
  const confirmDisabledAttributes = confirmDisabledReason
    ? ` disabled aria-disabled="true" title="${dgAdminEscape(confirmDisabledReason)}"`
    : ' aria-disabled="false" title="Confirm booking and generate invoice"';

  return `
    ${booking.status === 'Pending Review' ? `<button class="btn primary" type="button" data-action="approveMeeting" data-id="${dgAdminEscape(booking.id)}">Approve for Meeting</button>` : ''}
    ${booking.status === 'Pending Review' ? `<button class="btn danger" type="button" data-action="reject" data-id="${dgAdminEscape(booking.id)}">Reject Booking</button>` : ''}
    ${booking.status === 'Meeting Scheduled' ? `
      <div class="post-meeting-confirm-card">
        <p class="table-helper">Confirm the booking only after the consultation meeting is completed and the final details are agreed.</p>
        ${confirmationGateMessage ? `<div class="meeting-confirmation-warning">${dgAdminEscape(confirmationGateMessage)}</div>` : ''}
        <label>Post-Meeting Notes / Meeting Summary
          <textarea name="postMeetingNotes" data-post-meeting-notes="${dgAdminEscape(booking.id)}" rows="5" placeholder="Summarize what was discussed during the consultation: final package, event timeline, client requirements, payment agreement, delivery expectations, and special requests.">${dgAdminEscape(booking.postMeetingNotes || '')}</textarea>
          <span class="field-error" data-error-for="postMeetingNotes"></span>
        </label>
        <label>Final Agreed Package Amount
          <input type="number" min="1" step="0.01" data-final-agreed-amount="${dgAdminEscape(booking.id)}" value="${dgAdminEscape(suggestedAmount || '')}" placeholder="Enter final agreed amount" />
          <span class="field-error" data-error-for="finalAgreedAmount"></span>
        </label>
        <div class="admin-action-buttons">
          <button class="btn primary" type="button" data-action="confirm" data-id="${dgAdminEscape(booking.id)}"${confirmDisabledAttributes}>Confirm Booking</button>
          <a class="btn ghost" href="manage-bookings.html">Back to Manage Bookings</a>
        </div>
      </div>
    ` : ''}
    ${booking.status === 'Confirmed' && !booking.invoice ? `
      <div class="post-meeting-confirm-card">
        <p class="table-helper">This confirmed booking is missing an invoice. Generate one now by entering the final agreed package amount.</p>
        <label>Final Agreed Package Amount
          <input type="number" min="1" step="0.01" data-generate-invoice-amount="${dgAdminEscape(booking.id)}" value="${dgAdminEscape(suggestedAmount || '')}" placeholder="Enter final agreed amount" />
          <span class="field-error" data-error-for="generateInvoiceAmount"></span>
        </label>
        <button class="btn primary" type="button" data-action="generateInvoice" data-id="${dgAdminEscape(booking.id)}">Generate Invoice</button>
      </div>
    ` : ''}
    ${booking.status === 'Confirmed' && booking.invoice && ['Awaiting Payment', 'Awaiting Down Payment'].includes(booking.paymentStatus) ? '<div class="empty-state">Waiting for client down payment.</div>' : ''}
    ${downPaymentBlocked ? '<div class="empty-state">Down payment must be verified before staff assignment. Verify the payment in the Payment Information section below.</div>' : ''}
    ${canAssign ? `<button class="btn ghost" type="button" data-action="assign" data-id="${dgAdminEscape(booking.id)}">Assign Staff</button>` : ''}
    ${canMarkScheduled ? `<button class="btn primary" type="button" data-action="schedule" data-id="${dgAdminEscape(booking.id)}">Mark as Scheduled</button>` : ''}
    ${productionStatuses.includes(booking.status) ? `<a class="btn primary" href="project-progress.html?id=${dgAdminEscape(booking.id)}">Update Production Progress</a>` : ''}
  `;
}

function dgAdminPaymentRows(payments) {
  if (!payments.length) return '<div class="empty-state">No payment submitted for this booking.</div>';
  const displayPayments = dgAdminCompactPaymentRows(payments);
  return `<div class="table-wrap compact-table-wrap">
    <table class="dashboard-table admin-table compact-payment-table">
      <thead>
        <tr>
          <th>Payment Type</th>
          <th>Reference</th>
          <th>Amount</th>
          <th>Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${displayPayments.map((payment) => `
          <tr>
            <td>${dgAdminEscape(payment.paymentType || 'Down Payment')}</td>
            <td>${dgAdminEscape(payment.referenceNumber)}</td>
            <td>${dgAdminMoney(payment.amountPaid)}</td>
            <td>${dgAdminFormatDate(payment.paymentDate)}</td>
            <td>${dgAdminBadge(payment.status)}</td>
            <td><div class="table-actions">${dgAdminPaymentActions(payment)}</div></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>`;
}

function dgAdminInvoiceDetails(booking, payments) {
  dgAdminNormalizeBooking(booking);
  const invoice = booking.invoice;
  if (!invoice) {
    return `
      <div class="empty-state">No invoice generated yet for this booking.</div>
      ${dgAdminPaymentRows(payments)}
    `;
  }
  const bothVerified = invoice.downPaymentStatus === 'Verified' && invoice.balanceStatus === 'Verified';
  const dpVerified = invoice.downPaymentStatus === 'Verified';
  const balUnpaid = !['Verified'].includes(invoice.balanceStatus);
  const readyForDelivery = booking.status === 'Ready for Delivery';

  let billingNotice = '';
  if (bothVerified) {
    billingNotice = '<div class="balance-warning" style="border-color:rgba(151,219,160,0.35);background:rgba(90,174,103,0.1);color:#bfe8c4;">Invoice fully paid. Both down payment and balance have been verified.</div>';
  } else if (readyForDelivery && dpVerified && balUnpaid) {
    billingNotice = '<div class="balance-warning urgent">Project is ready for delivery. Request the client to settle the remaining balance before releasing final files.</div>';
  } else if (dpVerified && balUnpaid) {
    billingNotice = '<div class="balance-warning">Production may continue, but final output cannot be released until the balance is paid and verified.</div>';
  }

  return `
    <article class="invoice-card">
      <div class="invoice-card-header">
        <div>
          <p class="eyebrow">Invoice / Billing</p>
          <h3>${dgAdminEscape(invoice.invoiceId)}</h3>
        </div>
        ${dgAdminBadge(invoice.invoiceStatus)}
      </div>
      <div class="billing-grid">
        <div class="payment-status-card amount-large"><span>Total Amount</span><strong>${dgAdminMoney(invoice.totalAmount)}</strong></div>
        <div class="payment-status-card"><span>Down Payment Required (${dgAdminEscape(String(invoice.downPaymentRate))}%)</span><strong>${dgAdminMoney(invoice.downPaymentAmount)}</strong></div>
        <div class="payment-status-card"><span>Down Payment Status</span><strong>${dgAdminBadge(invoice.downPaymentStatus)}</strong></div>
        <div class="payment-status-card"><span>Remaining Balance</span><strong>${dgAdminMoney(invoice.balanceAmount)}</strong></div>
        <div class="payment-status-card"><span>Balance Status</span><strong>${dgAdminBadge(invoice.balanceStatus)}</strong></div>
        <div class="payment-status-card"><span>Invoice Status</span><strong>${dgAdminBadge(invoice.invoiceStatus)}</strong></div>
        <div class="payment-status-card"><span>Issued At</span><strong>${dgAdminFormatDateTime(invoice.issuedAt)}</strong><small>by ${dgAdminEscape(invoice.issuedBy || 'Admin')}</small></div>
      </div>
      <p class="table-helper">${dgAdminEscape(invoice.dueNote)}</p>
      ${billingNotice}
    </article>
    <h3 class="section-subtitle">Related Payments</h3>
    ${dgAdminPaymentRows(payments)}
  `;
}

function dgAdminDeliveryFeedback(booking) {
  const hasDelivery = booking.deliveryOutputLink || booking.deliveryFileName || booking.deliveryNotes || booking.deliveredAt;
  const hasFeedback = Boolean(booking.feedback);
  if (!hasDelivery && !hasFeedback) {
    return '<div class="empty-state">No delivery output or client feedback has been recorded yet.</div>';
  }
  return `
    <div class="delivery-output-section">
      ${hasDelivery ? `
        <div class="delivery-card">
          <h3>Delivery Output</h3>
          ${booking.deliveryOutputLink ? `<p><strong>Output Link:</strong> <a class="text-link" href="${dgAdminEscape(booking.deliveryOutputLink)}" target="_blank" rel="noopener">Open final output</a></p>` : ''}
          ${booking.deliveryFileName ? `
            <div class="file-meta-card">
              <strong>ZIP File Details</strong>
              <p>File Name: ${dgAdminEscape(booking.deliveryFileName)}</p>
              <p>File Type: ${dgAdminEscape(booking.deliveryFileType || 'Not set')}</p>
              <p>File Size: ${dgAdminFormatFileSize(booking.deliveryFileSize)}</p>
              <p>Uploaded At: ${dgAdminFormatDateTime(booking.deliveryFileUploadedAt)}</p>
            </div>
          ` : ''}
          <p class="delivery-note"><strong>Delivery Notes:</strong> ${dgAdminEscape(booking.deliveryNotes || 'None')}</p>
          <p><strong>Delivered At:</strong> ${dgAdminFormatDateTime(booking.deliveredAt)}</p>
        </div>
      ` : ''}
      ${hasFeedback ? `
        <div class="feedback-summary">
          <h3>Client Feedback</h3>
          <p><strong>Rating:</strong> ${booking.feedback.rating ? `${dgAdminEscape(booking.feedback.rating)} / 5` : 'No rating selected'}</p>
          <p><strong>Client Feedback:</strong> ${dgAdminEscape(booking.feedback.comment || 'No comment provided')}</p>
          <p><strong>Feedback Submitted:</strong> ${dgAdminFormatDateTime(booking.feedback.submittedAt)}</p>
          <p><strong>Client Name:</strong> ${dgAdminEscape(booking.feedback.clientName || booking.clientName || 'Client')}</p>
        </div>
      ` : ''}
    </div>
  `;
}

function dgAdminNextAction(booking, payment) {
  dgAdminNormalizeBooking(booking);
  if (booking.status === 'Pending Review') return 'Review the request, then approve it for meeting or reject it.';
  if (booking.status === 'Approved for Meeting') return 'Schedule the client meeting with date, time, mode, and notes.';
  if (booking.status === 'Meeting Scheduled') return 'Confirm the booking after the meeting is completed.';
  if (booking.status === 'Confirmed' && !booking.invoice) return 'This booking is confirmed but has no invoice. Generate the invoice by entering the final agreed package amount.';
  if (booking.status === 'Confirmed' && ['Awaiting Payment', 'Awaiting Down Payment'].includes(booking.paymentStatus)) return 'Waiting for client to upload the down payment receipt.';
  if (booking.status === 'Confirmed' && booking.paymentStatus === 'Down Payment Pending Verification') return 'Verify the submitted down payment receipt in the Payment Information section.';
  if (booking.status === 'Confirmed' && booking.paymentStatus === 'Balance Pending Verification') return 'Verify the submitted balance payment receipt in the Payment Information section.';
  if (booking.status === 'Confirmed' && booking.paymentStatus === 'Down Payment Verified' && !booking.assignedStaffId) return 'Down payment verified. Assign staff to proceed.';
  if (payment && payment.status === 'Pending Verification') return 'Verify the receipt, reject it, or request resubmission in the Payment Information section.';
  if (booking.status === 'Confirmed' && dgAdminDownPaymentVerified(booking) && !booking.assignedStaffId) return 'Down payment verified. Assign a staff member before marking this booking as scheduled.';
  if (booking.status === 'Confirmed' && dgAdminDownPaymentVerified(booking) && booking.assignedStaffId) return 'Staff assigned. Mark this booking as Scheduled so staff can begin production updates.';
  if (booking.status === 'Scheduled') return 'Production is scheduled. Staff can now move the project through the workflow.';
  if (['On Shoot', 'Editing'].includes(booking.status)) return 'Staff production progress is underway.';
  if (booking.status === 'Ready for Delivery' && booking.invoice && booking.invoice.balanceStatus !== 'Verified') return 'Project is ready for delivery. The client must settle and verify the remaining balance before final output can be released.';
  if (booking.status === 'Ready for Delivery') return 'Balance is verified. Staff can now release the final output and mark the project as Completed.';
  if (booking.status === 'Completed') return 'Project completed. Review reports or history if needed.';
  if (booking.status === 'Rejected') return 'This booking was rejected.';
  if (booking.status === 'Cancelled') return 'This booking is archived as cancelled.';
  return 'No admin action is currently required.';
}

function dgAdminRenderPayments() {
  const list = document.getElementById('paymentsReviewList') || document.getElementById('paymentsBody');
  if (!list) return;
  if (!dgAdminUser()) return;

  const search = document.getElementById('paymentSearch');
  const statusFilter = document.getElementById('paymentStatusFilter');
  const typeFilter = document.getElementById('paymentTypeFilter');

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  const updateSummary = (payments, bookings) => {
    const rejectedStatuses = ['Rejected', 'Needs Resubmission'];
    const outstanding = bookings.reduce((sum, booking) => {
      dgAdminNormalizeBooking(booking);
      const invoice = booking.invoice;
      if (!invoice) return sum;
      const balanceDue = invoice.balanceStatus === 'Verified' ? 0 : Number(invoice.balanceAmount || 0);
      return sum + balanceDue;
    }, 0);

    setText('pendingPaymentCount', payments.filter((payment) => payment.status === 'Pending Verification').length);
    setText('verifiedPaymentCount', payments.filter((payment) => payment.status === 'Verified').length);
    setText('rejectedPaymentCount', payments.filter((payment) => rejectedStatuses.includes(payment.status)).length);
    setText('totalCollectedAmount', dgAdminMoney(payments.filter((payment) => payment.status === 'Verified').reduce((sum, payment) => sum + Number(payment.amountPaid || 0), 0)));
    setText('outstandingBalanceAmount', dgAdminMoney(outstanding));
  };

  const render = () => {
    const query = (search?.value || '').toLowerCase();
    const status = statusFilter?.value || 'All';
    const paymentType = typeFilter?.value || 'All';
    const bookings = dgAdminGetBookings();
    const payments = dgAdminGetPayments();
    updateSummary(payments, bookings);
    const rows = payments
      .map((payment) => ({ payment, booking: bookings.find((booking) => booking.id === payment.bookingId) }))
      .filter(({ payment }) => status === 'All' || payment.status === status)
      .filter(({ payment }) => paymentType === 'All' || (payment.paymentType || 'Down Payment') === paymentType)
      .filter(({ payment, booking }) => {
        const haystack = `${payment.id} ${payment.bookingId} ${payment.invoiceId || ''} ${payment.paymentType || ''} ${payment.referenceNumber} ${booking ? booking.clientName : ''}`.toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => {
        if (a.payment.status === 'Pending Verification' && b.payment.status !== 'Pending Verification') return -1;
        if (a.payment.status !== 'Pending Verification' && b.payment.status === 'Pending Verification') return 1;
        return new Date(b.payment.createdAt || 0) - new Date(a.payment.createdAt || 0);
      });

    const emptyCopy = payments.length
      ? '<h3>No payment records match your search.</h3><p>Adjust the filters or search terms to review more submitted receipts.</p>'
      : '<h3>No receipts waiting for review.</h3><p>Submitted payment receipts will appear here once clients upload them.</p>';

    list.innerHTML = rows.length ? rows.map(({ payment, booking }) => `
      <article class="admin-payment-review-card">
        <div class="admin-payment-review-header">
          <div>
            <p class="eyebrow">Payment ID | ${dgAdminEscape(payment.id)}</p>
            <h2>${dgAdminEscape(payment.paymentType || 'Down Payment')}</h2>
          </div>
          <div class="badge-row">${dgAdminBadge(payment.status)}</div>
        </div>
        <div class="admin-payment-review-grid">
          <div><span>Booking ID</span><strong>${dgAdminEscape(payment.bookingId)}</strong></div>
          <div><span>Invoice ID</span><strong>${dgAdminEscape(payment.invoiceId || booking?.invoice?.invoiceId || 'Not set')}</strong></div>
          <div><span>Client Name</span><strong>${dgAdminEscape(booking ? booking.clientName : 'Unknown')}</strong></div>
          <div><span>Amount Paid</span><strong>${dgAdminMoney(payment.amountPaid)}</strong></div>
          <div><span>Reference Number</span><strong>${dgAdminEscape(payment.referenceNumber || 'Not set')}</strong></div>
          <div><span>Payment Date</span><strong>${dgAdminFormatDate(payment.paymentDate)}</strong></div>
        </div>
        <div class="admin-payment-receipt-row">
          <div>
            <span>Receipt</span>
            ${dgAdminReceiptSummary(payment)}
          </div>
        </div>
        <div class="admin-payment-actions">${dgAdminPaymentReviewActions(payment)}</div>
      </article>
    `).join('') : `
      <div class="empty-state admin-payment-empty">
        ${emptyCopy}
        <a class="btn ghost" href="manage-bookings.html">View Manage Bookings</a>
      </div>
    `;
  };

  search?.addEventListener('input', render);
  statusFilter?.addEventListener('change', render);
  typeFilter?.addEventListener('change', render);
  list.addEventListener('click', (event) => {
    const moreButton = event.target.closest('[data-payment-more-menu]');
    if (moreButton) {
      event.preventDefault();
      dgAdminOpenPaymentMenu(moreButton);
      return;
    }
    const receiptButton = event.target.closest('[data-view-receipt]');
    if (receiptButton) {
      dgAdminOpenReceipt(receiptButton.dataset.viewReceipt);
      return;
    }
    const button = event.target.closest('[data-payment-action]');
    if (button) {
      dgAdminClosePaymentMenus();
      dgAdminConfirmAction({
        ...dgAdminPaymentConfirmOptions(button.dataset.paymentAction, button.dataset.id),
        onConfirm: () => {
          const pmMsg = { Verified: 'Verifying payment…', Rejected: 'Rejecting payment…', 'Needs Resubmission': 'Requesting resubmission…' }[button.dataset.paymentAction] || 'Updating payment…';
          if (window.DGLoading) { DGLoading.show(pmMsg); DGLoading.disableButton(button); }
          let pmOk = false;
          try { pmOk = dgAdminUpdatePayment(button.dataset.id, button.dataset.paymentAction); } finally { if (window.DGLoading) { DGLoading.hide(); DGLoading.enableButton(button); } }
          if (pmOk) render();
        }
      });
      return;
    }
  });
  render();
}

function dgAdminRenderDetails() {
  const panel = document.getElementById('adminBookingDetails');
  if (!panel) return;
  if (!dgAdminUser()) return;

  const params = new URLSearchParams(window.location.search);
  const booking = dgAdminNormalizeBooking(dgAdminGetBookings().find((item) => item.id === params.get('id')));
  if (!booking) {
    panel.innerHTML = '<div class="empty-state">Booking was not found.</div>';
    return;
  }

  const payments = dgAdminRelatedPayments(booking.id);
  const payment = payments[0] || null;
  const history = Array.isArray(booking.history) ? booking.history : [];
  panel.innerHTML = `
    <div class="details-header">
      <div><p class="eyebrow">${dgAdminEscape(booking.id)}</p><h1>${dgAdminEscape(booking.serviceType)}</h1></div>
      <div class="badge-row">${dgAdminBadge(booking.status)} ${dgAdminBadge(booking.meetingStatus)} ${dgAdminBadge(booking.paymentStatus)}</div>
    </div>
    <dl class="details-grid">
      <div><dt>Client Name</dt><dd>${dgAdminEscape(booking.clientName)}</dd></div>
      <div><dt>Client ID</dt><dd>${dgAdminEscape(booking.clientId)}</dd></div>
      <div><dt>Package</dt><dd>${dgAdminEscape(booking.packageName)}</dd></div>
      <div><dt>Event Date</dt><dd>${dgAdminFormatDate(booking.eventDate)}</dd></div>
      <div><dt>Event Time</dt><dd>${dgAdminEscape(booking.eventTime)}</dd></div>
      <div><dt>Location</dt><dd>${dgAdminEscape(booking.location)}</dd></div>
      <div><dt>Budget</dt><dd>${dgAdminEscape(booking.budget)}</dd></div>
      <div><dt>Contact Number</dt><dd>${dgAdminEscape(booking.contactNumber)}</dd></div>
      <div><dt>Assigned Staff</dt><dd>${dgAdminEscape(dgAdminStaffName(booking))}</dd></div>
      <div><dt>Created Date</dt><dd>${dgAdminFormatDateTime(booking.createdAt)}</dd></div>
      <div><dt>Meeting Status</dt><dd>${dgAdminBadge(booking.meetingStatus)}</dd></div>
      <div><dt>Payment Status</dt><dd>${dgAdminBadge(booking.paymentStatus)}</dd></div>
      <div class="wide"><dt>Event Details</dt><dd>${dgAdminEscape(booking.details)}</dd></div>
      <div class="wide"><dt>Additional Notes</dt><dd>${dgAdminEscape(booking.notes || 'None')}</dd></div>
    </dl>
    <section class="detail-block" id="meeting">
      <h2>Meeting</h2>
      ${dgAdminMeetingPreference(booking)}
      ${booking.status === 'Approved for Meeting' ? dgAdminMeetingForm(booking) : dgAdminMeetingDetails(booking)}
      ${dgAdminClientMeetingConfirmation(booking)}
      ${dgAdminRescheduleRequestCard(booking)}
      ${booking.postMeetingNotes ? `
        <div class="post-meeting-summary-card">
          <p class="eyebrow">Post-meeting summary</p>
          <dl class="details-grid compact-details">
            <div class="wide"><dt>Post-Meeting Notes / Meeting Summary</dt><dd>${dgAdminEscape(booking.postMeetingNotes)}</dd></div>
            <div><dt>Confirmed At</dt><dd>${dgAdminFormatDateTime(booking.postMeetingConfirmedAt)}</dd></div>
          </dl>
        </div>
      ` : ''}
    </section>
    <section class="detail-block admin-action-card" id="admin-actions">
      <h2>Admin Actions</h2>
      <div class="empty-state">${dgAdminEscape(dgAdminNextAction(booking, payment))}</div>
      ${booking.status === 'Confirmed' && booking.invoice && dgAdminDownPaymentVerified(booking) ? `<div class="staff-action-row">
        ${dgAdminStaffSelect(booking)}
      </div>` : ''}
      ${booking.status === 'Meeting Scheduled' ? dgAdminDetailActions(booking, payments) : `
      <div class="admin-action-buttons">
        ${dgAdminDetailActions(booking, payments)}
        <a class="btn ghost" href="manage-bookings.html">Back to Manage Bookings</a>
      </div>
      `}
    </section>
    <section class="detail-block" id="payment-information">
      <h2>Payment Information</h2>
      ${dgAdminInvoiceDetails(booking, payments)}
    </section>
    <section class="detail-block" id="production-updates">
      <h2>Production Updates</h2>
      ${dgAdminProductionTimeline(booking)}
    </section>
    <section class="detail-block" id="delivery-output">
      <h2>Delivery Output and Client Feedback</h2>
      ${dgAdminDeliveryFeedback(booking)}
    </section>
    <section class="detail-block">
      <h2>History Log</h2>
      <div class="history-list">
        ${history.length ? history.slice().reverse().map((item) => `
          <article class="history-item">
            <strong>${dgAdminEscape(item.action)}</strong>
            <span>${dgAdminFormatDateTime(item.date)} by ${dgAdminEscape(item.by)}</span>
          </article>
        `).join('') : '<div class="empty-state">No admin history yet.</div>'}
      </div>
    </section>
  `;

  dgAdminUpdateConfirmButtonState(panel, booking);
  panel.oninput = (event) => {
    if (event.target.matches('[data-post-meeting-notes], [data-final-agreed-amount]')) {
      dgAdminUpdateConfirmButtonState(panel, booking);
    }
  };

  window.requestAnimationFrame(() => {
    const params = new URLSearchParams(window.location.search);
    const scrollTarget = params.get('scroll');
    const targetMap = {
      payments: 'payment-information',
      payment: 'payment-information',
      meeting: 'meeting',
      actions: 'admin-actions'
    };
    const targetId = targetMap[scrollTarget] || (window.location.hash ? window.location.hash.slice(1) : '');
    const section = targetId ? document.getElementById(targetId) : null;
    if (section) {
      section.scrollIntoView({ block: 'start', behavior: 'smooth' });
      section.classList.add('admin-section-focus');
      window.setTimeout(() => section.classList.remove('admin-section-focus'), 1800);
    }
  });

  panel.onclick = (event) => {
    const moreButton = event.target.closest('[data-payment-more-menu]');
    if (moreButton) {
      event.preventDefault();
      dgAdminOpenPaymentMenu(moreButton);
      return;
    }
    const paymentButton = event.target.closest('[data-payment-action]');
    const receiptButton = event.target.closest('[data-view-receipt]');
    const rescheduleButton = event.target.closest('[data-reschedule-action]');
    const actionButton = event.target.closest('[data-action]');
    let changed = false;
    if (receiptButton) {
      dgAdminOpenReceipt(receiptButton.dataset.viewReceipt);
      return;
    }
    if (paymentButton) {
      dgAdminClosePaymentMenus();
      dgAdminConfirmAction({
        ...dgAdminPaymentConfirmOptions(paymentButton.dataset.paymentAction, paymentButton.dataset.id),
        onConfirm: () => {
          const paymentMsg = { Verified: 'Verifying payment…', Rejected: 'Rejecting payment…', 'Needs Resubmission': 'Requesting resubmission…' }[paymentButton.dataset.paymentAction] || 'Updating payment…';
          if (window.DGLoading) { DGLoading.show(paymentMsg); DGLoading.disableButton(paymentButton); }
          try { changed = dgAdminUpdatePayment(paymentButton.dataset.id, paymentButton.dataset.paymentAction); } finally { if (window.DGLoading) { DGLoading.hide(); DGLoading.enableButton(paymentButton); } }
          if (changed) dgAdminRenderDetails();
        }
      });
      return;
    }
    if (rescheduleButton) {
      const rescheduleMsg = rescheduleButton.dataset.rescheduleAction === 'approve' ? 'Approving reschedule…' : 'Rejecting reschedule…';
      if (window.DGLoading) { DGLoading.show(rescheduleMsg); DGLoading.disableButton(rescheduleButton); }
      try { changed = dgAdminReviewReschedule(rescheduleButton.dataset.id, rescheduleButton.dataset.rescheduleAction); } finally { if (window.DGLoading) { DGLoading.hide(); DGLoading.enableButton(rescheduleButton); } }
    }
    if (actionButton) {
      const staffSelect = panel.querySelector(`[data-staff-select="${actionButton.dataset.id}"]`);
      const postMeetingNotes = panel.querySelector(`[data-post-meeting-notes="${actionButton.dataset.id}"]`);
      const finalAmount = panel.querySelector(`[data-final-agreed-amount="${actionButton.dataset.id}"]`);
      const generateInvoiceAmount = panel.querySelector(`[data-generate-invoice-amount="${actionButton.dataset.id}"]`);
      if (actionButton.dataset.action === 'confirm') {
        const latestBooking = dgAdminNormalizeBooking(dgAdminGetBookings().find((item) => item.id === actionButton.dataset.id));
        const blockedReason = dgAdminConfirmationGateMessage(latestBooking) ||
          dgAdminConfirmationInputMessage(postMeetingNotes ? postMeetingNotes.value : '', finalAmount ? finalAmount.value : '');
        if (blockedReason) {
          dgAdminShowMessage(blockedReason, 'error');
          dgAdminUpdateConfirmButtonState(panel, latestBooking);
          return;
        }
      }
      const detailLoadingMessages = {
        approveMeeting: 'Approving for meeting…',
        reject: 'Rejecting booking…',
        confirm: 'Confirming booking…',
        generateInvoice: 'Generating invoice…',
        assign: 'Assigning staff…',
        schedule: 'Scheduling booking…'
      };
      const actions = {
        approveMeeting: () => dgAdminApproveForMeeting(actionButton.dataset.id),
        reject: () => dgAdminRejectBooking(actionButton.dataset.id),
        confirm: () => {
          const error = panel.querySelector('[data-error-for="postMeetingNotes"]');
          const amountError = panel.querySelector('[data-error-for="finalAgreedAmount"]');
          if (error) error.textContent = '';
          if (amountError) amountError.textContent = '';
          const value = postMeetingNotes ? postMeetingNotes.value.trim() : '';
          const amountValue = finalAmount ? Number(finalAmount.value) : 0;
          return dgAdminConfirmBooking(actionButton.dataset.id, value, amountValue, { notes: error, amount: amountError });
        },
        generateInvoice: () => {
          const amountError = panel.querySelector('[data-error-for="generateInvoiceAmount"]');
          if (amountError) amountError.textContent = '';
          const amountValue = generateInvoiceAmount ? Number(generateInvoiceAmount.value) : 0;
          return dgAdminGenerateInvoice(actionButton.dataset.id, amountValue, { amount: amountError });
        },
        assign: () => dgAdminAssignStaff(actionButton.dataset.id, staffSelect ? staffSelect.value : ''),
        schedule: () => dgAdminMarkScheduled(actionButton.dataset.id)
      };
      if (actions[actionButton.dataset.action]) {
        dgAdminConfirmAction({
          ...dgAdminBookingConfirmOptions(actionButton.dataset.action, actionButton.dataset.id),
          onConfirm: () => {
            const msg = detailLoadingMessages[actionButton.dataset.action] || 'Saving changes…';
            if (window.DGLoading) { DGLoading.show(msg); DGLoading.disableButton(actionButton); }
            try { changed = actions[actionButton.dataset.action](); } finally { if (window.DGLoading) { DGLoading.hide(); DGLoading.enableButton(actionButton); } }
            if (changed) dgAdminRenderDetails();
          }
        });
        return;
      }
    }
    if (changed) dgAdminRenderDetails();
  };

  const meetingForm = document.getElementById('meetingForm');
  if (meetingForm) {
    meetingForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const meetingSubmitBtn = meetingForm.querySelector('[type="submit"]');
      const runSchedule = () => {
        if (window.DGLoading) { DGLoading.show('Scheduling meeting…'); DGLoading.disableButton(meetingSubmitBtn); }
        let changed = false;
        try {
          changed = dgAdminScheduleMeeting(meetingForm.dataset.meetingBooking, {
            meetingDate: meetingForm.meetingDate.value,
            meetingTime: meetingForm.meetingTime.value,
            meetingMode: meetingForm.meetingMode.value,
            meetingLocation: meetingForm.meetingLocation.value.trim(),
            meetingNotes: meetingForm.meetingNotes.value.trim()
          });
        } finally {
          if (window.DGLoading) { DGLoading.hide(); DGLoading.enableButton(meetingSubmitBtn); }
        }
        if (changed) dgAdminRenderDetails();
      };
      const replacingSchedule = Boolean(booking.meetingDate || booking.meetingTime || booking.meetingLocation);
      if (replacingSchedule) {
        dgAdminConfirmAction({
          title: 'Replace this meeting schedule?',
          message: 'This will update the existing consultation schedule for this booking.',
          confirmText: 'Update Schedule',
          cancelText: 'Keep Current',
          variant: 'warning',
          details: [`Booking ID: ${booking.id}`, `Client: ${booking.clientName}`],
          onConfirm: runSchedule
        });
      } else {
        runSchedule();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  dgAdminRenderDashboard();
  dgAdminRenderManageBookings();
  dgAdminRenderPayments();
  dgAdminRenderDetails();
  const resetButton = document.getElementById('resetSampleDataBtn');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      if (confirm('Reset DG Film Co. records on this device? This clears saved project records and restores the starter records.')) {
        if (window.DGNotifications) DGNotifications.saveNotifications([]);
        DGData.resetDemoData();
        window.location.href = 'login.html';
      }
    });
  }
});

document.addEventListener('click', (event) => {
  if (event.target.closest('[data-payment-more-menu], .payment-floating-menu')) return;
  dgAdminClosePaymentMenus();
});

window.addEventListener('resize', dgAdminClosePaymentMenus);
window.addEventListener('scroll', dgAdminClosePaymentMenus, true);
