const contactInquiryForm = document.getElementById('contactInquiryForm');

if (contactInquiryForm) {
  const successMessage = document.getElementById('contactFormSuccess');
  const params = new URLSearchParams(window.location.search);
  const requestedService = String(params.get('service') || '').trim();
  const requestedPackage = String(params.get('package') || '').trim();
  const serviceField = contactInquiryForm.elements.requestedService;
  const packageField = contactInquiryForm.elements.requestedPackage;
  const sendAnotherButton = successMessage?.querySelector('[data-contact-send-another]');
  const applyRequestedContext = () => {
    if (requestedService && serviceField) {
      serviceField.value = requestedService;
      serviceField.closest('[data-contact-prefill]')?.removeAttribute('hidden');
      if (contactInquiryForm.elements.inquiryType) contactInquiryForm.elements.inquiryType.value = 'Booking Inquiry';
    }
    if (requestedPackage && packageField) {
      packageField.value = requestedPackage;
      packageField.closest('[data-contact-prefill]')?.removeAttribute('hidden');
    }
  };
  const closeSuccessMessage = () => {
    if (!successMessage) return;
    successMessage.hidden = true;
    document.body.classList.remove('contact-success-open');
  };
  applyRequestedContext();
  const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validMobileNumber = (value) => /^(09\d{9}|\+639\d{9})$/.test(value);
  const showError = (fieldName, message) => {
    const target = contactInquiryForm.querySelector(`[data-contact-error="${fieldName}"]`);
    if (target) target.textContent = message || '';
    const field = contactInquiryForm.elements[fieldName];
    if (field) {
      if (message) {
        field.setAttribute('aria-invalid', 'true');
      } else {
        field.removeAttribute('aria-invalid');
      }
    }
  };

  contactInquiryForm.querySelectorAll('input, select, textarea').forEach((field) => {
    field.addEventListener('input', () => showError(field.name, ''));
    field.addEventListener('change', () => showError(field.name, ''));
  });

  if (sendAnotherButton) {
    sendAnotherButton.addEventListener('click', () => {
      closeSuccessMessage();
      contactInquiryForm.reset();
      applyRequestedContext();
      contactInquiryForm.elements.name?.focus();
    });
  }
  if (successMessage) {
    successMessage.addEventListener('click', (event) => {
      if (event.target === successMessage) closeSuccessMessage();
    });
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && successMessage && !successMessage.hidden) closeSuccessMessage();
  });

  contactInquiryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(contactInquiryForm);
    if (formData.get('website')) return;

    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const mobileNumber = String(formData.get('mobileNumber') || '').trim();
    const inquiryType = String(formData.get('inquiryType') || '').trim();
    const selectedService = String(formData.get('requestedService') || '').trim();
    const selectedPackage = String(formData.get('requestedPackage') || '').trim();
    const message = String(formData.get('message') || '').trim();
    let valid = true;

    ['name', 'email', 'mobileNumber', 'inquiryType', 'message'].forEach((field) => showError(field, ''));
    if (!name) {
      showError('name', 'Full name is required.');
      valid = false;
    }
    if (!email) {
      showError('email', 'Email address is required.');
      valid = false;
    } else if (!validEmail(email)) {
      showError('email', 'Enter a valid email address.');
      valid = false;
    }
    if (!mobileNumber) {
      showError('mobileNumber', 'Mobile number is required.');
      valid = false;
    } else if (!validMobileNumber(mobileNumber)) {
      showError('mobileNumber', 'Use 09XXXXXXXXX or +639XXXXXXXXX.');
      valid = false;
    }
    if (!inquiryType) {
      showError('inquiryType', 'Choose an inquiry type.');
      valid = false;
    }
    if (!message) {
      showError('message', 'Please enter a message.');
      valid = false;
    }
    if (!valid) return;

    const submitButton = contactInquiryForm.querySelector('[type="submit"]');
    if (window.DGLoading) {
      DGLoading.show('Sending inquiry...');
      DGLoading.disableButton(submitButton);
    }

    const inquiries = window.DGData ? DGData.getJson(DGData.keys.inquiries, []) : [];
    const inquiryNumbers = inquiries
      .map((inquiry) => Number(String(inquiry.id || '').replace('INQ-', '')))
      .filter(Number.isFinite);
    const inquiryId = `INQ-${Math.max(1000, ...inquiryNumbers) + 1}`;

    inquiries.push({
      id: inquiryId,
      fullName: name,
      email,
      mobileNumber,
      serviceType: selectedService || inquiryType,
      inquiryType,
      packageName: selectedPackage,
      coverageNeeded: '',
      customProjectType: '',
      celebrationMoments: [
        selectedService ? `Requested service: ${selectedService}` : '',
        selectedPackage ? `Selected package: ${selectedPackage}` : ''
      ].filter(Boolean).join('\n'),
      preferredDate: '',
      isDateFlexible: true,
      locationCity: '',
      budgetRange: '',
      message,
      referralSource: 'Contact Page',
      status: 'New',
      createdAt: new Date().toISOString()
    });
    if (window.DGData) DGData.setJson(DGData.keys.inquiries, inquiries);

    if (window.DGLoading) {
      DGLoading.hide();
      DGLoading.enableButton(submitButton);
    }
    contactInquiryForm.reset();
    applyRequestedContext();
    if (successMessage) {
      successMessage.hidden = false;
      document.body.classList.add('contact-success-open');
      sendAnotherButton?.focus();
    }
  });
}
