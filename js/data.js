const DG_STORAGE_KEYS = {
  users: 'dg_users',
  currentUser: 'dg_current_user',
  services: 'dg_services',
  pricing: 'dg_pricing',
  pricingCatalogVersion: 'dg_pricing_catalog_version',
  inquiries: 'dg_inquiries',
  bookings: 'dg_bookings',
  payments: 'dg_payments',
  initialized: 'dg_initialized'
};

function dgGetJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function dgSetJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function dgCreateUser(fullName, email, password, role) {
  return {
    id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: fullName,
    fullName,
    email: email.toLowerCase(),
    password,
    role,
    status: 'Active',
    createdAt: new Date().toISOString()
  };
}

const DG_DEFAULT_SERVICES = [
  { id: 'SVC-001', name: 'Wedding Photo/Video', category: 'Event', description: 'Full photo and video coverage for weddings.', startingPrice: 25000, status: 'Active' },
  { id: 'SVC-002', name: 'Debut / Birthday Coverage', category: 'Event', description: 'Elegant debut, birthday, and family celebration photo and video coverage.', startingPrice: 18000, status: 'Active' },
  { id: 'SVC-003', name: 'Corporate / Commercial Video', category: 'Commercial', description: 'Brand campaigns, commercial films, launches, and business event visuals.', startingPrice: 20000, status: 'Active' },
  { id: 'SVC-009', name: 'Restaurant / Food Promo', category: 'Commercial', description: 'Restaurant features, food promos, coffee shop stories, and lifestyle visuals.', startingPrice: 15000, status: 'Active' },
  { id: 'SVC-006', name: 'Nightlife / Club Events', category: 'Event', description: 'Recap videos and photo coverage for nightlife and venue events.', startingPrice: 18000, status: 'Active' },
  { id: 'SVC-008', name: 'Graduation / Event Coverage', category: 'Event', description: 'Graduation balls, formal events, and milestone celebration coverage.', startingPrice: 18000, status: 'Active' },
  { id: 'SVC-010', name: 'Pageant / Event Coverage', category: 'Event', description: 'Pageant highlights, stage moments, portraits, and formal event coverage.', startingPrice: 20000, status: 'Active' },
  { id: 'SVC-004', name: 'Creative Film / Documentary', category: 'Creative', description: 'Purpose-driven films, documentary pieces, campaign stories, and cinematic visual narratives.', startingPrice: 25000, status: 'Active' },
  { id: 'SVC-007', name: 'Product / Brand Event', category: 'Commercial', description: 'Product reels, branded activations, and campaign-ready event visuals.', startingPrice: 15000, status: 'Active' }
];

const DG_PRICING_CATALOG_VERSION = 'creative-documentary-label-v2';

const DG_DEFAULT_PRICING = {
  'Wedding Photo/Video': [
    { name: 'Essential Wedding Coverage', price: 25000, deliverables: ['Planning consultation', 'Ceremony coverage', 'Edited highlight film', 'Online delivery link'] },
    { name: 'Cinematic Wedding Premium', price: 35000, deliverables: ['Creative planning session', 'Wedding day photo and video coverage', 'Cinematic highlight film', 'Edited digital gallery', 'Online delivery link'] },
    { name: 'Full Wedding Story', price: 45000, deliverables: ['Pre-production consultation', 'Extended wedding coverage', 'Feature wedding film', 'Edited photo collection', 'Online delivery link'] }
  ],
  'Debut / Birthday Coverage': [
    { name: 'Birthday Essentials', price: 18000, deliverables: ['Planning consultation', 'Celebration coverage', 'Highlight reel', 'Online delivery link'] },
    { name: 'Debut Cinematic Coverage', price: 30000, deliverables: ['Creative planning session', 'Photo and video coverage', 'Cinematic debut highlights', 'Edited digital gallery', 'Online delivery link'] },
    { name: 'Full Debut Celebration', price: 45000, deliverables: ['Event storytelling plan', 'Extended production coverage', 'Feature celebration film', 'Edited photos and social reels', 'Online delivery link'] }
  ],
  'Corporate / Commercial Video': [
    { name: 'Business Highlight', price: 20000, deliverables: ['Briefing consultation', 'Professional production coverage', 'Edited business highlight reel', 'Online delivery link'] },
    { name: 'Brand Campaign', price: 35000, deliverables: ['Campaign planning session', 'Directed brand shoot', 'Primary campaign video', 'Social media cutdowns', 'Online delivery link'] },
    { name: 'Full Commercial Production', price: 55000, deliverables: ['Creative direction', 'Full production coverage', 'Commercial master edit', 'Campaign deliverables', 'Online delivery link'] }
  ],
  'Restaurant / Food Promo': [
    { name: 'Food Promo Reel', price: 15000, deliverables: ['Concept consultation', 'Food and venue coverage', 'Edited promo reel', 'Online delivery link'] },
    { name: 'Restaurant Feature', price: 25000, deliverables: ['Story planning session', 'Restaurant production coverage', 'Feature highlight film', 'Social media reel', 'Online delivery link'] },
    { name: 'Full Brand Dining Story', price: 40000, deliverables: ['Creative direction', 'Extended food and lifestyle coverage', 'Brand dining film', 'Promotional cutdowns', 'Online delivery link'] }
  ],
  'Nightlife / Club Events': [
    { name: 'Event Recap', price: 18000, deliverables: ['Coverage planning', 'Nightlife event coverage', 'Edited recap reel', 'Online delivery link'] },
    { name: 'Nightlife Highlight Film', price: 28000, deliverables: ['Creative briefing', 'Professional event coverage', 'Cinematic highlight film', 'Social media edit', 'Online delivery link'] },
    { name: 'Full Nightlife Coverage', price: 40000, deliverables: ['Event production plan', 'Extended nightlife coverage', 'Full recap film', 'Social highlight set', 'Online delivery link'] }
  ],
  'Graduation / Event Coverage': [
    { name: 'Event Highlights', price: 18000, deliverables: ['Planning consultation', 'Formal event coverage', 'Edited highlight reel', 'Online delivery link'] },
    { name: 'Graduation Ball Coverage', price: 28000, deliverables: ['Program consultation', 'Photo and video coverage', 'Graduation ball highlight film', 'Edited digital gallery', 'Online delivery link'] },
    { name: 'Full Event Story', price: 38000, deliverables: ['Event storytelling plan', 'Extended celebration coverage', 'Feature event film', 'Social media highlights', 'Online delivery link'] }
  ],
  'Pageant / Event Coverage': [
    { name: 'Pageant Highlights', price: 20000, deliverables: ['Program consultation', 'Stage event coverage', 'Edited highlights reel', 'Online delivery link'] },
    { name: 'Full Pageant Coverage', price: 35000, deliverables: ['Production planning', 'Pageant photo and video coverage', 'Feature event film', 'Edited portrait gallery', 'Online delivery link'] },
    { name: 'Premium Pageant Story', price: 50000, deliverables: ['Creative direction', 'Extended pageant coverage', 'Cinematic story film', 'Promotional cutdowns', 'Online delivery link'] }
  ],
  'Creative Film / Documentary': [
    { name: 'Creative Visuals', price: 25000, deliverables: ['Creative consultation', 'Directed video shoot', 'Edited visual film', 'Online delivery link'] },
    { name: 'Documentary Story Film', price: 45000, deliverables: ['Concept development', 'Professional production coverage', 'Documentary-style master edit', 'Promotional cutdown', 'Online delivery link'] },
    { name: 'Full Creative Direction', price: 70000, deliverables: ['Creative direction and treatment', 'Full production coverage', 'Cinematic final film', 'Release-ready deliverables', 'Online delivery link'] }
  ],
  'Product / Brand Event': [
    { name: 'Product Reel', price: 15000, deliverables: ['Brand briefing', 'Product coverage', 'Edited promo reel', 'Online delivery link'] },
    { name: 'Brand Event Coverage', price: 30000, deliverables: ['Production consultation', 'Brand event coverage', 'Edited highlight film', 'Social media cutdown', 'Online delivery link'] },
    { name: 'Full Product Campaign', price: 45000, deliverables: ['Campaign planning', 'Directed product production', 'Hero campaign film', 'Marketing cutdowns', 'Online delivery link'] }
  ]
};

const DG_RETIRED_DEFAULT_PACKAGES = {
  'Wedding Photo/Video': ['Essential Coverage', 'Cinematic Premium', 'Full Wedding Story'],
  'Debut / Birthday Coverage': ['Birthday Essentials', 'Debut Highlight Film', 'Full Celebration Coverage'],
  'Corporate / Commercial Video': ['Commercial Highlights', 'Campaign Video Package', 'Brand Event Coverage'],
  'Restaurant / Food Promo': ['Menu Feature Reel', 'Restaurant Story', 'Food Campaign Package'],
  'Nightlife / Club Events': ['Event Recap', 'Social Media Highlights', 'Full Night Coverage'],
  'Graduation / Event Coverage': ['Graduation Highlights', 'Formal Event Coverage', 'Photo and Video Package'],
  'Pageant / Event Coverage': ['Stage Highlights', 'Pageant Feature Film', 'Full Event Coverage'],
  'Creative Film / Documentary': ['Creative Film Essentials', 'Cinematic Music Video', 'Music Video Production', 'Full Production Package'],
  'Product / Brand Event': ['Product Video Reel', 'Brand Activation Recap', 'Campaign Package']
};

const DG_LEGACY_SERVICE_ALIASES = {
  Debut: 'Debut / Birthday Coverage',
  'Corporate Events': 'Corporate / Commercial Video',
  'Music Video': 'Creative Film / Documentary',
  'Music & Film': 'Creative Film / Documentary',
  'Music Video / Creative Film': 'Creative Film / Documentary',
  'Nightlife/Club Events': 'Nightlife / Club Events',
  'Product Shoot': 'Product / Brand Event',
  'Graduation Shoot': 'Graduation / Event Coverage'
};

const DG_RETIRED_SERVICE_LABELS = [
  'Real Estate',
  'Real Estate Shoot',
  'Skyline Residence',
  'Property Films',
  'Listing Photos',
  'Walkthroughs'
];

function dgCanonicalServiceName(name) {
  return DG_LEGACY_SERVICE_ALIASES[name] || name;
}

function dgIsRetiredServiceLabel(name) {
  const normalizedName = String(name || '').trim().toLowerCase();
  return DG_RETIRED_SERVICE_LABELS.some((label) => label.toLowerCase() === normalizedName);
}

function dgDefaultPricing(services, startingCounter = 1) {
  let counter = startingCounter;
  const createdAt = new Date().toISOString();
  return services.flatMap((service) => (DG_DEFAULT_PRICING[service.name] || []).map((pkg) => ({
    id: `PKG-${String(counter++).padStart(3, '0')}`,
    serviceId: service.id,
    serviceName: service.name,
    packageName: pkg.name,
    price: pkg.price,
    deliverables: [...pkg.deliverables],
    status: 'Active',
    createdAt
  })));
}

function dgNormalizeUser(user, index) {
  const fullName = user.fullName || user.name || 'Unnamed User';
  const status = String(user.status || 'Active').toLowerCase() === 'disabled' ? 'Disabled' : 'Active';
  return {
    ...user,
    id: user.id && /^U\d+/.test(user.id) ? user.id : (user.id || `U${String(index + 1).padStart(3, '0')}`),
    name: user.name || fullName,
    fullName,
    email: String(user.email || '').toLowerCase(),
    status,
    createdAt: user.createdAt || ''
  };
}

function dgNormalizeServices() {
  const raw = dgGetJson(DG_STORAGE_KEYS.services, []);
  const createdAt = new Date().toISOString();
  const previousServices = Array.isArray(raw) ? raw.map((service) => {
    if (typeof service === 'string') return { name: service };
    return service;
  }) : [];
  const services = DG_DEFAULT_SERVICES.map((defaultService) => {
    const stored = previousServices.find((service) => dgCanonicalServiceName(service.name) === defaultService.name) || {};
    const rawStatus = String(stored.status || defaultService.status || 'Active').toLowerCase();
    return {
      ...defaultService,
      id: defaultService.id,
      name: defaultService.name,
      category: defaultService.category,
      description: stored.description || defaultService.description,
      startingPrice: Number(stored.startingPrice ?? defaultService.startingPrice),
      status: rawStatus === 'inactive' || rawStatus === 'disabled' ? 'Inactive' : 'Active',
      createdAt: stored.createdAt || createdAt
    };
  });
  const retainedCustomServices = previousServices
    .filter((service) => {
      const name = String(service.name || '').trim();
      if (!name || dgIsRetiredServiceLabel(name)) return false;
      return !DG_DEFAULT_SERVICES.some((defaultService) => dgCanonicalServiceName(name) === defaultService.name);
    })
    .map((service, index) => {
      const rawStatus = String(service.status || 'Inactive').toLowerCase();
      return {
        ...service,
        id: service.id || `SVC-CUSTOM-${String(index + 1).padStart(3, '0')}`,
        name: String(service.name).trim(),
        category: service.category || 'Custom',
        description: service.description || 'Custom project coverage arranged with DG Film Co.',
        startingPrice: Number(service.startingPrice || 0),
        status: rawStatus === 'inactive' || rawStatus === 'disabled' ? 'Inactive' : 'Active',
        createdAt: service.createdAt || createdAt
      };
    });
  services.push(...retainedCustomServices);
  dgSetJson(DG_STORAGE_KEYS.services, services);
  return services;
}

function dgNormalizePricing(services) {
  const raw = dgGetJson(DG_STORAGE_KEYS.pricing, null);
  const catalogVersion = localStorage.getItem(DG_STORAGE_KEYS.pricingCatalogVersion);
  const hasCustomizedPricing = Array.isArray(raw) && raw.some((pkg) => {
    const canonicalName = dgCanonicalServiceName(pkg.serviceName);
    if (canonicalName === 'Real Estate Shoot') return false;
    const retiredNames = DG_RETIRED_DEFAULT_PACKAGES[canonicalName] || [];
    const currentNames = (DG_DEFAULT_PRICING[canonicalName] || []).map((entry) => entry.name);
    return !retiredNames.includes(pkg.packageName) && !currentNames.includes(pkg.packageName);
  });
  if (!raw || !Array.isArray(raw) || !raw.length || (catalogVersion !== DG_PRICING_CATALOG_VERSION && !hasCustomizedPricing)) {
    dgSetJson(DG_STORAGE_KEYS.pricing, dgDefaultPricing(services));
    localStorage.setItem(DG_STORAGE_KEYS.pricingCatalogVersion, DG_PRICING_CATALOG_VERSION);
    return;
  }

  const normalized = raw.map((pkg, index) => {
    const canonicalName = dgCanonicalServiceName(pkg.serviceName);
    if (canonicalName === 'Real Estate Shoot') return null;
    const service = services.find((item) => item.name === canonicalName || item.id === pkg.serviceId);
    if (!service) return null;
    const status = String(pkg.status || 'Active').toLowerCase() === 'inactive' ? 'Inactive' : 'Active';
    return {
      id: pkg.id || `PKG-${String(index + 1).padStart(3, '0')}`,
      serviceId: service.id,
      serviceName: service.name,
      packageName: pkg.packageName || pkg.name || 'Untitled Package',
      price: Number(pkg.price || 0),
      deliverables: Array.isArray(pkg.deliverables) ? pkg.deliverables : String(pkg.deliverables || 'Edited digital deliverables').split('\n').filter(Boolean),
      status,
      createdAt: pkg.createdAt || new Date().toISOString()
    };
  }).filter(Boolean);
  const nextPackageId = normalized.reduce((max, pkg) => Math.max(max, Number(String(pkg.id || '').replace('PKG-', '')) || 0), 0) + 1;
  const missingServices = services.filter((service) => !normalized.some((pkg) => pkg.serviceId === service.id));
  normalized.push(...dgDefaultPricing(missingServices, nextPackageId));
  dgSetJson(DG_STORAGE_KEYS.pricing, normalized);
  localStorage.setItem(DG_STORAGE_KEYS.pricingCatalogVersion, DG_PRICING_CATALOG_VERSION);
}

function dgNormalizeBookings() {
  const raw = dgGetJson(DG_STORAGE_KEYS.bookings, []);
  if (!Array.isArray(raw)) {
    dgSetJson(DG_STORAGE_KEYS.bookings, []);
    return;
  }
  const normalized = raw.map((booking) => {
    const next = { ...booking };
    const canonicalServiceName = dgCanonicalServiceName(next.serviceType || next.serviceName);
    if (canonicalServiceName && canonicalServiceName !== 'Real Estate Shoot') {
      const canonicalService = DG_DEFAULT_SERVICES.find((service) => service.name === canonicalServiceName);
      next.serviceName = canonicalServiceName;
      next.serviceType = canonicalServiceName;
      if (canonicalService) next.serviceId = canonicalService.id;
      if (next.invoice) next.invoice = { ...next.invoice, serviceType: canonicalServiceName };
    }
    if (next.status === 'Approved') next.status = 'Confirmed';
    next.meetingStatus = next.meetingStatus || (next.status === 'Meeting Scheduled' ? 'Scheduled' : 'Not Scheduled');
    next.preferredMeetingMode = next.preferredMeetingMode || '';
    next.preferredMeetingNotes = next.preferredMeetingNotes || '';
    next.meetingDate = next.meetingDate || '';
    next.meetingTime = next.meetingTime || '';
    next.meetingMode = next.meetingMode || '';
    next.meetingLocation = next.meetingLocation || '';
    next.meetingNotes = next.meetingNotes || '';
    next.rescheduleRequest = next.rescheduleRequest || null;
    next.meetingClientConfirmation = next.meetingClientConfirmation || null;
    next.postMeetingNotes = next.postMeetingNotes || '';
    next.postMeetingConfirmedAt = next.postMeetingConfirmedAt || '';
    next.finalAgreedAmount = Number(next.finalAgreedAmount || next.invoice?.totalAmount || 0);
    if (next.invoice) {
      next.invoice.totalAmount = Number(next.invoice.totalAmount || 0);
      next.invoice.downPaymentRate = Number(next.invoice.downPaymentRate || 50);
      next.invoice.downPaymentAmount = Number(next.invoice.downPaymentAmount || next.invoice.totalAmount * 0.5);
      next.invoice.balanceAmount = Number(next.invoice.balanceAmount || Math.max(next.invoice.totalAmount - next.invoice.downPaymentAmount, 0));
      next.invoice.downPaymentStatus = next.invoice.downPaymentStatus || 'Unpaid';
      next.invoice.balanceStatus = next.invoice.balanceStatus || 'Unpaid';
      next.invoice.invoiceStatus = next.invoice.invoiceStatus || (next.invoice.downPaymentStatus === 'Verified' && next.invoice.balanceStatus === 'Verified' ? 'Paid' : 'Open');
      next.paymentStatus = next.paymentStatus === 'Awaiting Payment' ? 'Awaiting Down Payment' : next.paymentStatus;
      next.paymentStatus = next.paymentStatus === 'Pending Verification' ? 'Down Payment Pending Verification' : next.paymentStatus;
      next.paymentStatus = next.paymentStatus === 'Verified' ? 'Down Payment Verified' : next.paymentStatus;
    }
    if (!next.paymentStatus || next.paymentStatus === 'Not Submitted') {
      next.paymentStatus = next.status === 'Confirmed' ? 'Awaiting Down Payment' : 'Not Required Yet';
    }
    next.history = Array.isArray(next.history) ? next.history : [];
    return next;
  });
  dgSetJson(DG_STORAGE_KEYS.bookings, normalized);
}

function dgNormalizeInquiries() {
  const raw = dgGetJson(DG_STORAGE_KEYS.inquiries, []);
  if (!Array.isArray(raw)) {
    dgSetJson(DG_STORAGE_KEYS.inquiries, []);
    return;
  }
  const inquiries = raw.map((inquiry) => ({
    ...inquiry,
    mobileNumber: inquiry.mobileNumber || '',
    preferredDate: inquiry.preferredDate || '',
    isDateFlexible: Boolean(inquiry.isDateFlexible),
    status: inquiry.status || 'New'
  }));
  dgSetJson(DG_STORAGE_KEYS.inquiries, inquiries);
}

function dgSeedData() {
  if (localStorage.getItem(DG_STORAGE_KEYS.initialized)) {
    const users = dgGetJson(DG_STORAGE_KEYS.users, []).map(dgNormalizeUser);
    dgSetJson(DG_STORAGE_KEYS.users, users);
    const services = dgNormalizeServices();
    dgNormalizePricing(services);
    dgNormalizeInquiries();
    dgNormalizeBookings();
    return;
  }

  // Default accounts for role-based access.
  const users = [
    {
      id: 'user-admin',
      fullName: 'Admin User',
      name: 'Admin User',
      email: 'admin@dgfilmco.com',
      password: 'Admin123!',
      role: 'admin',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user-staff',
      fullName: 'Staff User',
      name: 'Staff User',
      email: 'staff@dgfilmco.com',
      password: 'Staff123!',
      role: 'staff',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user-client',
      fullName: 'Client User',
      name: 'Client User',
      email: 'client@example.com',
      password: 'Client123!',
      role: 'client',
      status: 'Active',
      createdAt: new Date().toISOString()
    }
  ];

  const services = DG_DEFAULT_SERVICES.map((service) => ({ ...service, createdAt: new Date().toISOString() }));

  dgSetJson(DG_STORAGE_KEYS.users, users);
  dgSetJson(DG_STORAGE_KEYS.services, services);
  dgSetJson(DG_STORAGE_KEYS.pricing, dgDefaultPricing(services));
  localStorage.setItem(DG_STORAGE_KEYS.pricingCatalogVersion, DG_PRICING_CATALOG_VERSION);
  dgSetJson(DG_STORAGE_KEYS.inquiries, []);
  dgSetJson(DG_STORAGE_KEYS.bookings, []);
  dgSetJson(DG_STORAGE_KEYS.payments, []);
  localStorage.removeItem(DG_STORAGE_KEYS.currentUser);
  localStorage.setItem(DG_STORAGE_KEYS.initialized, 'true');
}

dgSeedData();

function resetDemoData() {
  Object.keys(DG_STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(DG_STORAGE_KEYS[key]);
  });
  dgSeedData();
}

window.DGData = {
  keys: DG_STORAGE_KEYS,
  getJson: dgGetJson,
  setJson: dgSetJson,
  createUser: dgCreateUser,
  resetDemoData
};
