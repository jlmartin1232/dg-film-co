function dgRequireRoles(allowedRoles) {
  const currentUser = DGData.getJson(DGData.keys.currentUser, null);

  // Protected pages redirect before any dashboard data is shown.
  if (!currentUser) {
    window.location.href = 'login.html';
    return null;
  }

  const users = DGData.getJson(DGData.keys.users, []);
  const inquiries = DGData.getJson(DGData.keys.inquiries, []);
  const storedUser = users.find((user) => user.id === currentUser.id);
  if (storedUser && (storedUser.status || 'Active') === 'Disabled') {
    localStorage.removeItem(DGData.keys.currentUser);
    window.location.href = 'login.html';
    return null;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    window.location.href = 'unauthorized.html';
    return null;
  }

  return currentUser;
}

function dgStaffWorkflowRoles() {
  return ['staff', 'admin'];
}

function dgCountBookings(bookings, predicate) {
  return bookings.filter(predicate).length;
}

function dgStatusEquals(value, expected) {
  return String(value || '').toLowerCase() === expected.toLowerCase();
}

function dgSetText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function dgSetupDashboard(allowedRoles, dashboardType) {
  const currentUser = dgRequireRoles(allowedRoles);
  if (!currentUser) return;

  const users = DGData.getJson(DGData.keys.users, []);
  const bookings = DGData.getJson(DGData.keys.bookings, []);
  const payments = DGData.getJson(DGData.keys.payments, []);
  const clientBookings = bookings.filter((booking) => booking.clientId === currentUser.id);

  dgSetText('welcomeName', currentUser.fullName);

  if (dashboardType === 'client') {
    dgSetText('totalBookings', clientBookings.length);
    dgSetText('pendingBookings', dgCountBookings(clientBookings, (booking) => dgStatusEquals(booking.status, 'Pending Review')));
    dgSetText('approvedBookings', dgCountBookings(clientBookings, (booking) => ['Approved for Meeting', 'Meeting Scheduled', 'Confirmed', 'Scheduled'].includes(booking.status)));
    dgSetText('completedProjects', dgCountBookings(clientBookings, (booking) => dgStatusEquals(booking.status, 'Completed')));
  }

  if (dashboardType === 'staff') {
    dgSetText('assignedProjects', dgCountBookings(bookings, (booking) => booking.assignedStaffId === currentUser.id));
    dgSetText('scheduledShoots', dgCountBookings(bookings, (booking) => dgStatusEquals(booking.status, 'Scheduled')));
    dgSetText('editingTasks', dgCountBookings(bookings, (booking) => dgStatusEquals(booking.status, 'Editing')));
    dgSetText('completedProjects', dgCountBookings(bookings, (booking) => dgStatusEquals(booking.status, 'Completed')));
  }

  if (dashboardType === 'admin') {
    dgSetText('totalBookings', bookings.length);
    dgSetText('newInquiries', dgCountBookings(inquiries, (inquiry) => dgStatusEquals(inquiry.status, 'New')));
    dgSetText('pendingReview', dgCountBookings(bookings, (booking) => dgStatusEquals(booking.status, 'Pending Review')));
    dgSetText('paymentsForVerification', dgCountBookings(payments, (payment) => dgStatusEquals(payment.status, 'Pending Verification')));
    dgSetText('totalUsers', users.length);
  }
}

window.DGRbac = {
  requireRoles: dgRequireRoles,
  staffWorkflowRoles: dgStaffWorkflowRoles,
  setupDashboard: dgSetupDashboard
};
