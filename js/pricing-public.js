document.addEventListener('DOMContentLoaded', () => {
  const accordion = document.getElementById('publicPricingAccordion');
  if (!accordion || !window.DGData) return;
  const serviceDetails = {
    'Wedding Photo/Video': { slug: 'wedding', description: 'Emotional wedding films, highlight reels, and timeless photo coverage.' },
    'Debut / Birthday Coverage': { slug: 'debut', description: 'Elegant birthday stories, debut highlights, and celebration coverage.' },
    'Corporate / Commercial Video': { slug: 'commercial', description: 'Brand films, campaign videos, and business event visuals.' },
    'Restaurant / Food Promo': { slug: 'food', description: 'Restaurant features, food promos, and lifestyle-driven visuals.' },
    'Nightlife / Club Events': { slug: 'nightlife', description: 'High-energy event coverage, club recaps, and social reels.' },
    'Graduation / Event Coverage': { slug: 'graduation', description: 'Graduation balls, formal events, and milestone stories.' },
    'Pageant / Event Coverage': { slug: 'pageant', description: 'Stage highlights, portraits, and polished pageant coverage.' },
    'Creative Film / Documentary': { slug: 'creative', description: 'Purpose-driven films, documentary pieces, campaign stories, and cinematic visual narratives.' },
    'Product / Brand Event': { slug: 'product', description: 'Product reels, launches, and campaign-ready brand coverage.' }
  };
  const officialServiceOrder = [
    'Wedding Photo/Video',
    'Debut / Birthday Coverage',
    'Corporate / Commercial Video',
    'Restaurant / Food Promo',
    'Nightlife / Club Events',
    'Graduation / Event Coverage',
    'Pageant / Event Coverage',
    'Creative Film / Documentary',
    'Product / Brand Event'
  ];
  const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
  const activeServiceMap = new Map(
    DGData.getJson(DGData.keys.services, [])
      .filter((service) => (service.status || 'Active') === 'Active')
      .filter((service) => officialServiceOrder.includes(service.name))
      .map((service) => [service.name, service])
  );
  const activeServices = officialServiceOrder
    .map((serviceName) => activeServiceMap.get(serviceName))
    .filter(Boolean);
  const packages = DGData.getJson(DGData.keys.pricing, [])
    .filter((pkg) => (pkg.status || 'Active') === 'Active')
    .filter((pkg) => activeServices.some((service) => service.id === pkg.serviceId || service.name === pkg.serviceName));
  if (!packages.length) return;

  const availableServices = activeServices.map((service) => ({
    service,
    packages: packages.filter((pkg) => pkg.serviceId === service.id || pkg.serviceName === service.name)
  })).filter((entry) => entry.packages.length);

  accordion.innerHTML = availableServices.map(({ service, packages: servicePackages }, serviceIndex) => {
    const details = serviceDetails[service.name] || { slug: `service-${serviceIndex + 1}`, description: service.description || '' };
    const panelId = `pricing-panel-${details.slug}`;
    const startingPrice = Math.min(...servicePackages.map((pkg) => Number(pkg.price || 0)));
    return `
      <article class="pricing-accordion-item">
        <button class="pricing-accordion-toggle" type="button" aria-expanded="false" aria-controls="${panelId}">
          <span class="pricing-service-copy">
            <strong>${escapeHtml(service.name)}</strong>
            <span>${escapeHtml(details.description)}</span>
          </span>
          <span class="pricing-service-meta">
            <span>Starts at PHP ${startingPrice.toLocaleString('en-PH')}</span>
            <span>${servicePackages.length} packages</span>
            <span class="pricing-accordion-icon" aria-hidden="true"></span>
          </span>
        </button>
        <div class="pricing-accordion-panel" id="${panelId}" aria-hidden="true" inert>
          <div class="pricing-panel-inner">
            <div class="pricing-grid pricing-catalog-grid">
              ${servicePackages.map((pkg) => `
                <article class="price-card">
                  <h2>PHP ${Number(pkg.price || 0).toLocaleString('en-PH')}</h2>
                  <h3>${escapeHtml(pkg.packageName)}</h3>
                  <ul>${(pkg.deliverables || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
                  <a href="contact.html?service=${encodeURIComponent(pkg.serviceName)}&package=${encodeURIComponent(pkg.packageName)}" class="btn ghost">Book This Package</a>
                </article>
              `).join('')}
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');

  accordion.querySelectorAll('.pricing-accordion-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const selectedItem = button.closest('.pricing-accordion-item');
      const opening = !selectedItem.classList.contains('open');
      accordion.querySelectorAll('.pricing-accordion-item').forEach((item) => {
        item.classList.remove('open');
        item.querySelector('.pricing-accordion-toggle').setAttribute('aria-expanded', 'false');
        const panel = item.querySelector('.pricing-accordion-panel');
        panel.setAttribute('aria-hidden', 'true');
        panel.inert = true;
      });
      if (opening) {
        selectedItem.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
        const panel = selectedItem.querySelector('.pricing-accordion-panel');
        panel.setAttribute('aria-hidden', 'false');
        panel.inert = false;
      }
    });
  });
});
