(function () {
  const ABOUT_SETTINGS_KEY = 'dgAboutSettings';
  const ABOUT_DEFAULTS = {
    label: 'ABOUT THE STUDIO',
    headline: 'We create cinematic photo and video stories for events, brands, and creative projects.',
    descriptionOne: 'DG Film Co. creates photo and video coverage for weddings, celebrations, brands, restaurants, nightlife, artists, and milestone events.',
    descriptionTwo: 'We focus on thoughtful planning, cinematic visuals, and a smooth experience from first inquiry to final delivery.',
    stats: [
      { value: '9', label: 'Signature services' },
      { value: '24\u201348h', label: 'Typical inquiry response' },
      { value: 'Full-service', label: 'Creative direction' }
    ]
  };

  function getJson(key, fallback) {
    try {
      if (window.DGData) return DGData.getJson(key, fallback);
      const parsed = JSON.parse(localStorage.getItem(key) || 'null');
      return parsed || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function normalizeAboutSettings(settings) {
    const saved = settings && typeof settings === 'object' ? settings : {};
    const savedStats = Array.isArray(saved.stats) ? saved.stats : [];
    return {
      label: String(saved.label || ABOUT_DEFAULTS.label).trim(),
      headline: String(saved.headline || ABOUT_DEFAULTS.headline).trim(),
      descriptionOne: String(saved.descriptionOne || ABOUT_DEFAULTS.descriptionOne).trim(),
      descriptionTwo: String(saved.descriptionTwo || ABOUT_DEFAULTS.descriptionTwo).trim(),
      stats: ABOUT_DEFAULTS.stats.map((fallback, index) => {
        const stat = savedStats[index] && typeof savedStats[index] === 'object' ? savedStats[index] : {};
        return {
          value: String(stat.value || fallback.value).trim(),
          label: String(stat.label || fallback.label).trim()
        };
      })
    };
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function renderAboutPage() {
    const settings = normalizeAboutSettings(getJson(ABOUT_SETTINGS_KEY, {}));
    setText('aboutPageLabel', settings.label);
    setText('aboutPageHeadline', settings.headline);
    setText('aboutPageDescriptionOne', settings.descriptionOne);
    setText('aboutPageDescriptionTwo', settings.descriptionTwo);
    const stats = document.getElementById('aboutPageStats');
    if (!stats) return;
    stats.innerHTML = settings.stats.map((stat) => `
      <div><strong>${escapeHtml(stat.value)}</strong><span>${escapeHtml(stat.label)}</span></div>
    `).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.addEventListener('DOMContentLoaded', renderAboutPage);
}());
