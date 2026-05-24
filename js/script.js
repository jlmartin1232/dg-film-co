const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const filterButtons = document.querySelectorAll('.filter-btn');
const projects = document.querySelectorAll('.project');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    const filter = button.dataset.filter;
    projects.forEach((project) => {
      const match = filter === 'all' || project.dataset.category === filter;
      project.style.display = match ? 'flex' : 'none';
    });
  });
});

const portfolioVideos = document.querySelectorAll('.portfolio-video');

const heroVideo = document.querySelector('[data-hero-video]');
const heroSoundToggle = document.querySelector('[data-hero-sound-toggle]');

if (heroVideo && heroSoundToggle) {
  const updateHeroSoundToggle = () => {
    const isMuted = heroVideo.muted;
    heroSoundToggle.classList.toggle('is-muted', isMuted);
    heroSoundToggle.setAttribute('aria-label', isMuted ? 'Turn sound on' : 'Turn sound off');
    heroSoundToggle.setAttribute('title', isMuted ? 'Turn sound on' : 'Turn sound off');
  };

  updateHeroSoundToggle();

  heroSoundToggle.addEventListener('click', () => {
    heroVideo.muted = !heroVideo.muted;
    if (!heroVideo.muted) {
      heroVideo.volume = 0.75;
      heroVideo.play().catch(() => {});
    }
    updateHeroSoundToggle();
  });
}

portfolioVideos.forEach((video) => {
  const configuredSource = video.querySelector('source[src]');
  const sourcePath = configuredSource ? configuredSource.getAttribute('src') : video.getAttribute('src');
  const revealVideo = () => video.classList.add('has-media');
  const showFallback = () => {
    video.classList.remove('has-media');
    console.warn(`[DG Film Co.] Unable to load local featured video: ${sourcePath || 'unknown source'}`);
  };
  if (configuredSource || video.currentSrc || video.getAttribute('src')) {
    video.addEventListener('loadeddata', revealVideo, { once: true });
    video.addEventListener('error', showFallback, { once: true });
    video.load();
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) revealVideo();
  }
});

if ('IntersectionObserver' in window && portfolioVideos.length) {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (!video.currentSrc) return;
      if (entry.isIntersecting && !document.body.classList.contains('portfolio-modal-active')) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.45 });

  portfolioVideos.forEach((video) => videoObserver.observe(video));
}

const serviceSelect = document.getElementById('serviceSelect');
const coverageNeededSelect = document.getElementById('coverageNeededSelect');
const customProjectField = document.getElementById('customProjectField');
const customProjectInput = customProjectField ? customProjectField.querySelector('input') : null;
const dynamicQuestion = document.getElementById('dynamicQuestion');
const dynamicQuestionLabel = document.getElementById('dynamicQuestionLabel');

const questions = {
  'Wedding Photo/Video': 'What type of wedding coverage do you need?',
  'Debut / Birthday Coverage': 'What celebration moments should we capture?',
  'Corporate / Commercial Video': 'What business or brand project is this for?',
  'Restaurant / Food Promo': 'What venue, menu, or dining story should we feature?',
  'Graduation / Event Coverage': 'What milestone event should we capture?',
  'Pageant / Event Coverage': 'What stage or event moments matter most?',
  'Creative Film / Documentary': 'What story, subject, or campaign should the film explore?',
  'Product / Brand Event': 'What product or brand activation should we highlight?'
};

if (serviceSelect && dynamicQuestion && dynamicQuestionLabel) {
  const updateCustomProjectField = () => {
    const customProject = serviceSelect.value === 'Other / Custom Project';
    if (customProjectField) customProjectField.hidden = !customProject;
    if (customProjectInput) {
      customProjectInput.required = customProject;
      if (!customProject) customProjectInput.value = '';
    }
  };

  serviceSelect.addEventListener('change', () => {
    const selected = serviceSelect.value;
    dynamicQuestionLabel.childNodes[0].textContent = questions[selected] || 'Project Detail';
    dynamicQuestion.placeholder = questions[selected] || 'Tell us the main idea of your project';
    updateCustomProjectField();
  });
  updateCustomProjectField();
}

const servicesInquiryModal = document.getElementById('servicesInquiryModal');
const servicesInquiryTriggers = document.querySelectorAll('[data-open-inquiry-modal]');
const servicesInquiryCloseButtons = document.querySelectorAll('[data-close-inquiry-modal]');
const servicesInquiryStepPanels = document.querySelectorAll('[data-inquiry-step-panel]');
const servicesInquiryActions = document.querySelectorAll('[data-inquiry-actions]');
const servicesInquiryStepIndicator = document.querySelector('[data-inquiry-step-indicator]');
const servicesInquiryBody = document.querySelector('.services-inquiry-body');
const servicesInquirySuccess = document.querySelector('[data-inquiry-success]');
let servicesInquiryStep = 1;

function dgSetServicesInquiryStep(step) {
  servicesInquiryStep = step;
  servicesInquiryStepPanels.forEach((panel) => {
    const active = panel.dataset.inquiryStepPanel === String(step);
    panel.hidden = !active;
    panel.classList.toggle('is-active', active);
  });
  servicesInquiryActions.forEach((action) => {
    action.hidden = action.dataset.inquiryActions !== String(step);
  });
  if (servicesInquiryStepIndicator) {
    servicesInquiryStepIndicator.textContent = step === 1
      ? 'Step 1 of 2 - Project Basics'
      : 'Step 2 of 2 - Project Details';
  }
}

if (servicesInquiryModal && serviceSelect && servicesInquiryTriggers.length) {
  let lastInquiryTrigger = null;

  const closeServicesInquiry = () => {
    servicesInquiryModal.hidden = true;
    servicesInquiryModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('services-inquiry-open');
    if (servicesInquirySuccess) servicesInquirySuccess.hidden = true;
    if (servicesInquiryBody) servicesInquiryBody.hidden = false;
    if (servicesInquiryStepIndicator) servicesInquiryStepIndicator.hidden = false;
    if (lastInquiryTrigger) lastInquiryTrigger.focus();
  };

  const openServicesInquiry = (trigger) => {
    lastInquiryTrigger = trigger;
    const form = document.getElementById('inquiryForm');
    if (form) {
      form.reset();
      if (form.elements.date) {
        form.elements.date.disabled = false;
        form.elements.date.required = true;
      }
      form.querySelectorAll('[data-error-for]').forEach((element) => { element.textContent = ''; });
    }
    if (servicesInquirySuccess) servicesInquirySuccess.hidden = true;
    if (servicesInquiryBody) servicesInquiryBody.hidden = false;
    if (servicesInquiryStepIndicator) servicesInquiryStepIndicator.hidden = false;
    serviceSelect.value = trigger.dataset.service || '';
    if (coverageNeededSelect) coverageNeededSelect.value = trigger.dataset.service ? 'Photo and video' : 'Not sure yet';
    serviceSelect.dispatchEvent(new Event('change'));
    dgSetServicesInquiryStep(1);
    servicesInquiryModal.hidden = false;
    servicesInquiryModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('services-inquiry-open');
    const firstField = servicesInquiryModal.querySelector('input[name="name"]');
    if (firstField) firstField.focus();
  };

  servicesInquiryTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => openServicesInquiry(trigger));
  });

  servicesInquiryCloseButtons.forEach((button) => {
    button.addEventListener('click', closeServicesInquiry);
  });

  servicesInquiryModal.addEventListener('click', (event) => {
    if (event.target === servicesInquiryModal) closeServicesInquiry();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !servicesInquiryModal.hidden) closeServicesInquiry();
  });
}

const inquiryForm = document.getElementById('inquiryForm');

if (inquiryForm) {
  inquiryForm.setAttribute('novalidate', 'novalidate');
  const nameInput = inquiryForm.elements.name;
  const emailInput = inquiryForm.elements.email;
  const mobileNumberInput = inquiryForm.elements.mobileNumber;
  const preferredDateInput = inquiryForm.elements.date;
  const dateFlexibleInput = inquiryForm.elements.isDateFlexible;
  const locationInput = inquiryForm.elements.location;
  const budgetInput = inquiryForm.elements.budget;
  const detailInput = inquiryForm.elements.detail;
  const messageInput = inquiryForm.elements.message;
  const nextStepButton = inquiryForm.querySelector('[data-inquiry-next]');
  const backStepButton = inquiryForm.querySelector('[data-inquiry-back]');
  const setInquiryError = (fieldName, message) => {
    const element = inquiryForm.querySelector(`[data-error-for="${fieldName}"]`);
    if (element) element.textContent = message || '';
  };
  const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const publicToday = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - offset).toISOString().slice(0, 10);
  };
  const validMobileNumber = (value) => /^(09\d{9}|\+639\d{9})$/.test(value);
  preferredDateInput.min = publicToday();
  const clearInquiryErrors = (...fields) => fields.forEach((field) => setInquiryError(field, ''));

  const updateFlexibleDate = () => {
    const flexible = dateFlexibleInput.checked;
    preferredDateInput.disabled = flexible;
    preferredDateInput.required = !flexible;
    if (flexible) {
      preferredDateInput.value = '';
      setInquiryError('preferredDate', '');
    }
  };

  const validateStepOne = () => {
    let valid = true;
    const name = String(nameInput.value || '').trim();
    const email = String(emailInput.value || '').trim();
    const mobileNumber = String(mobileNumberInput.value || '').trim();
    const serviceType = String(serviceSelect.value || '').trim();
    const coverageNeeded = coverageNeededSelect ? String(coverageNeededSelect.value || '').trim() : '';
    const customProjectType = customProjectInput ? String(customProjectInput.value || '').trim() : '';
    clearInquiryErrors('name', 'email', 'mobileNumber', 'service', 'coverageNeeded', 'customProjectType');
    if (!name) {
      setInquiryError('name', 'Full name is required.');
      valid = false;
    }
    if (!email) {
      setInquiryError('email', 'Email address is required.');
      valid = false;
    } else if (!validEmail(email)) {
      setInquiryError('email', 'Enter a valid email address.');
      valid = false;
    }
    if (!mobileNumber) {
      setInquiryError('mobileNumber', 'Mobile number is required.');
      valid = false;
    } else if (!validMobileNumber(mobileNumber)) {
      setInquiryError('mobileNumber', 'Use 09XXXXXXXXX or +639XXXXXXXXX.');
      valid = false;
    }
    if (!serviceType) {
      setInquiryError('service', 'Choose a service or project type.');
      valid = false;
    }
    if (!coverageNeeded) {
      setInquiryError('coverageNeeded', 'Choose what coverage you need.');
      valid = false;
    }
    if (serviceType === 'Other / Custom Project' && !customProjectType) {
      setInquiryError('customProjectType', 'Tell us what type of project this is.');
      valid = false;
    }
    return valid;
  };

  const validateStepTwo = () => {
    let valid = true;
    const isDateFlexible = dateFlexibleInput.checked;
    const preferredDate = isDateFlexible ? '' : String(preferredDateInput.value || '').trim();
    const location = String(locationInput.value || '').trim();
    const budget = String(budgetInput.value || '').trim();
    const detail = String(detailInput.value || '').trim();
    const message = String(messageInput.value || '').trim();
    clearInquiryErrors('preferredDate', 'location', 'budget', 'detail', 'message');
    if (!isDateFlexible && !preferredDate) {
      setInquiryError('preferredDate', 'Preferred Date is required unless your date is flexible.');
      valid = false;
    } else if (!isDateFlexible && preferredDate < publicToday()) {
      setInquiryError('preferredDate', 'Preferred Date cannot be in the past.');
      valid = false;
    }
    if (!location) {
      setInquiryError('location', 'Event location is required.');
      valid = false;
    }
    if (!budget) {
      setInquiryError('budget', 'Choose a budget range.');
      valid = false;
    }
    if (!detail && !message) {
      setInquiryError('detail', 'Add a project detail or message.');
      setInquiryError('message', 'Share a short project message.');
      valid = false;
    }
    return valid;
  };

  dateFlexibleInput.addEventListener('change', updateFlexibleDate);
  [nameInput, emailInput, serviceSelect, coverageNeededSelect, customProjectInput, locationInput, budgetInput, detailInput, messageInput]
    .filter(Boolean)
    .forEach((input) => {
      input.addEventListener('input', () => {
        clearInquiryErrors('name', 'email', 'service', 'coverageNeeded', 'customProjectType', 'location', 'budget', 'detail', 'message');
      });
      input.addEventListener('change', () => {
        clearInquiryErrors('service', 'coverageNeeded', 'customProjectType', 'location', 'budget');
      });
    });
  mobileNumberInput.addEventListener('input', () => setInquiryError('mobileNumber', ''));
  preferredDateInput.addEventListener('change', () => setInquiryError('preferredDate', ''));
  mobileNumberInput.addEventListener('invalid', (event) => {
    event.preventDefault();
    const value = String(mobileNumberInput.value || '').trim();
    setInquiryError('mobileNumber', value ? 'Use 09XXXXXXXXX or +639XXXXXXXXX.' : 'Mobile number is required.');
  });
  preferredDateInput.addEventListener('invalid', (event) => {
    event.preventDefault();
    const value = String(preferredDateInput.value || '').trim();
    setInquiryError('preferredDate', value && value < publicToday()
      ? 'Preferred Date cannot be in the past.'
      : 'Preferred Date is required unless your date is flexible.');
  });

  if (nextStepButton) {
    nextStepButton.addEventListener('click', () => {
      if (validateStepOne()) dgSetServicesInquiryStep(2);
    });
  }

  if (backStepButton) {
    backStepButton.addEventListener('click', () => dgSetServicesInquiryStep(1));
  }

  inquiryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (servicesInquiryStep === 1) {
      if (validateStepOne()) dgSetServicesInquiryStep(2);
      return;
    }
    const formData = new FormData(inquiryForm);

    if (formData.get('website')) {
      return;
    }

    const mobileNumber = String(mobileNumberInput.value || '').trim();
    const isDateFlexible = dateFlexibleInput.checked;
    const preferredDate = isDateFlexible ? '' : String(preferredDateInput.value || '').trim();
    if (!validateStepOne()) {
      dgSetServicesInquiryStep(1);
      return;
    }
    if (!validateStepTwo()) return;

    const submitBtn = inquiryForm.querySelector('[type="submit"]');
    if (window.DGLoading) { DGLoading.show('Submitting inquiry…'); DGLoading.disableButton(submitBtn); }

    const inquiries = window.DGData ? DGData.getJson(DGData.keys.inquiries, []) : [];
    const inquiryNumbers = inquiries
      .map((inquiry) => Number(String(inquiry.id || '').replace('INQ-', '')))
      .filter(Number.isFinite);
    const inquiryId = `INQ-${Math.max(1000, ...inquiryNumbers) + 1}`;
    const inquiry = {
      id: inquiryId,
      fullName: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim().toLowerCase(),
      mobileNumber,
      serviceType: String(formData.get('service') || '').trim(),
      coverageNeeded: String(formData.get('coverageNeeded') || '').trim(),
      customProjectType: String(formData.get('customProjectType') || '').trim(),
      celebrationMoments: String(formData.get('detail') || '').trim(),
      preferredDate,
      isDateFlexible,
      locationCity: String(formData.get('location') || '').trim(),
      budgetRange: String(formData.get('budget') || '').trim(),
      message: String(formData.get('message') || '').trim(),
      referralSource: String(formData.get('source') || '').trim(),
      status: 'New',
      createdAt: new Date().toISOString()
    };
    inquiries.push(inquiry);
    if (window.DGData) DGData.setJson(DGData.keys.inquiries, inquiries);
    if (window.DGNotifications) {
      DGNotifications.addNotification({
        role: 'admin',
        title: 'New client inquiry',
        message: `${inquiry.fullName || 'A prospective client'} submitted an inquiry for ${inquiry.serviceType || 'a project'}.`,
        type: 'inquiry',
        inquiryId: inquiry.id
      });
    }

    if (window.DGLoading) {
      DGLoading.hide();
      DGLoading.enableButton(submitBtn);
    }
    if (servicesInquiryBody) servicesInquiryBody.hidden = true;
    if (servicesInquiryStepIndicator) servicesInquiryStepIndicator.hidden = true;
    servicesInquiryActions.forEach((action) => { action.hidden = true; });
    if (servicesInquirySuccess) servicesInquirySuccess.hidden = false;
  });
}

const referenceNumber = document.getElementById('referenceNumber');
const summaryBox = document.getElementById('summaryBox');

function dgPublicEscape(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

if (referenceNumber && summaryBox) {
  const params = new URLSearchParams(window.location.search);
  const randomRef = Math.floor(1000 + Math.random() * 9000);
  referenceNumber.textContent = params.get('inquiryId') || `#DGF-${randomRef}`;

  if (params.toString()) {
    const name = dgPublicEscape(params.get('name') || 'Client');
    const service = dgPublicEscape(params.get('service') || 'Not provided');
    const mobileNumber = dgPublicEscape(params.get('mobileNumber') || 'Not provided');
    const date = dgPublicEscape(params.get('date') || 'Not provided');
    const location = dgPublicEscape(params.get('location') || 'Not provided');
    const budget = dgPublicEscape(params.get('budget') || 'Not provided');

    summaryBox.innerHTML = `
      <h2>Your inquiry summary</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Service:</strong> ${service}</p>
      <p><strong>Mobile Number:</strong> ${mobileNumber}</p>
      <p><strong>Preferred Date:</strong> ${date}</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>Budget:</strong> ${budget}</p>
    `;
  }
}
