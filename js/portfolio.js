const DG_PORTFOLIO_WORKS = [
  {
    title: 'Wedding Film',
    category: 'Wedding Photo/Video',
    slug: 'wedding',
    description: 'A romantic wedding story shaped with soft movement, vows, details, and reception energy.',
    poster: '',
    video: 'assets/videos/portfolio/wedding-preview.mp4',
    service: 'Wedding Photo/Video'
  },
  {
    title: 'Birthday Event Coverage',
    category: 'Debut / Birthday Coverage',
    slug: 'debut',
    description: 'A milestone celebration captured with warm, elegant, cinematic storytelling.',
    poster: '',
    video: 'assets/videos/portfolio/debut-preview.mp4',
    service: 'Debut / Birthday Coverage'
  },
  {
    title: 'Commercial Video',
    category: 'Corporate / Commercial Video',
    slug: 'corporate',
    description: 'A polished commercial recap built for brands, launches, and social release.',
    poster: '',
    video: 'assets/videos/portfolio/corporate-preview.mp4',
    service: 'Corporate / Commercial Video'
  },
  {
    title: 'Restaurant / Food Promo',
    category: 'Restaurant / Food Promo',
    slug: 'restaurant',
    description: 'Warm hospitality visuals designed to showcase atmosphere, dishes, and service.',
    poster: '',
    video: 'assets/videos/portfolio/restaurant-preview.mp4',
    service: 'Restaurant / Food Promo'
  },
  {
    title: 'Nightlife Events',
    category: 'Nightlife / Club Events',
    slug: 'nightlife',
    description: 'Fast, moody event coverage for venues, DJs, launches, and social reels.',
    poster: '',
    video: 'assets/videos/portfolio/nightlife-preview.mp4',
    service: 'Nightlife / Club Events'
  },
  {
    title: 'Graduation / Event Coverage',
    category: 'Graduation / Event Coverage',
    slug: 'graduation',
    description: 'A celebratory portrait and highlight package for solo, group, and family graduation moments.',
    poster: '',
    video: 'assets/videos/portfolio/graduation-preview.mp4',
    service: 'Graduation / Event Coverage'
  },
  {
    title: 'Pageant / Event Coverage',
    category: 'Pageant / Event Coverage',
    slug: 'pageant',
    description: 'Stage highlights, formal portraits, and milestone moments captured with event-ready polish.',
    poster: '',
    video: 'assets/videos/portfolio/pageant.mp4',
    service: 'Pageant / Event Coverage'
  },
  {
    title: 'Creative Film / Documentary',
    category: 'Creative Film / Documentary',
    slug: 'creative',
    description: 'Purpose-driven films, documentary pieces, campaign stories, and cinematic visual narratives.',
    poster: '',
    video: 'assets/videos/portfolio/music-video-preview.mp4',
    service: 'Creative Film / Documentary'
  },
  {
    title: 'Product / Brand Event',
    category: 'Product / Brand Event',
    slug: 'product',
    description: 'Campaign-ready brand visuals with refined detail, motion, and event energy.',
    poster: '',
    video: 'assets/videos/portfolio/product-preview.mp4',
    service: 'Product / Brand Event'
  }
];

const DG_PORTFOLIO_CATEGORIES = [
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

const DG_PORTFOLIO_HIGHLIGHT_CAPTIONS = {
  'Wedding Photo/Video': 'Ceremony moments, portraits, and reception details.',
  'Debut / Birthday Coverage': 'Celebration highlights and milestone portraits.',
  'Corporate / Commercial Video': 'Brand visuals, interviews, and business events.',
  'Restaurant / Food Promo': 'Food, ambience, and hospitality details.',
  'Nightlife / Club Events': 'High-energy scenes, crowd moments, and social recaps.',
  'Graduation / Event Coverage': 'Formal milestones and recognition moments.',
  'Pageant / Event Coverage': 'Stage highlights, portraits, and candidate features.',
  'Creative Film / Documentary': 'Story-led frames with atmosphere and emotion.',
  'Product / Brand Event': 'Launch visuals, product details, and campaign moments.'
};

const DG_PORTFOLIO_HIGHLIGHT_IMAGES = {
  'Wedding Photo/Video': 'assets/images/photo-highlights/wedding-photo-video.jpg',
  'Debut / Birthday Coverage': 'assets/images/photo-highlights/debut-birthday-coverage.jpg',
  'Corporate / Commercial Video': 'assets/images/photo-highlights/corporate-commercial-video.jpg',
  'Restaurant / Food Promo': 'assets/images/photo-highlights/restaurant-food-promo.jpg',
  'Nightlife / Club Events': 'assets/images/photo-highlights/nightlife-club-events.jpg',
  'Graduation / Event Coverage': 'assets/images/photo-highlights/graduation-event-coverage.jpg',
  'Pageant / Event Coverage': 'assets/images/photo-highlights/pageant-event-coverage.jpg',
  'Creative Film / Documentary': 'assets/images/photo-highlights/creative-film-documentary.jpg',
  'Product / Brand Event': 'assets/images/photo-highlights/product-brand-event.jpg'
};

const DG_PHOTO_HIGHLIGHT_SETTINGS_KEY = 'dgPhotoHighlightSettings';
const DG_PHOTO_HIGHLIGHT_DEFAULTS = {
  'Wedding Photo/Video': { x: 50, y: 35 },
  'Debut / Birthday Coverage': { x: 50, y: 35 },
  'Corporate / Commercial Video': { x: 50, y: 45 },
  'Restaurant / Food Promo': { x: 50, y: 45 },
  'Nightlife / Club Events': { x: 50, y: 50 },
  'Graduation / Event Coverage': { x: 50, y: 28 },
  'Pageant / Event Coverage': { x: 50, y: 35 },
  'Creative Film / Documentary': { x: 50, y: 50 },
  'Product / Brand Event': { x: 50, y: 45 }
};

const DG_PORTFOLIO_SHOWREEL = {
  title: 'Visual Story',
  poster: '',
  video: 'assets/videos/hero/hero-reel.mp4'
};

function dgPortfolioEscape(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function dgPortfolioBookHref(service) {
  const hasClientNav = Boolean(document.querySelector('.dashboard-header [data-logout]'));
  const page = hasClientNav ? 'book-service.html' : 'contact.html';
  return `${page}?service=${encodeURIComponent(service || '')}`;
}

function dgPortfolioClampPercent(value, fallback = 50) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(100, Math.max(0, Math.round(number)));
}

function dgPortfolioStoredHighlightSettings() {
  try {
    if (window.DGData) return DGData.getJson(DG_PHOTO_HIGHLIGHT_SETTINGS_KEY, {});
    return JSON.parse(localStorage.getItem(DG_PHOTO_HIGHLIGHT_SETTINGS_KEY) || '{}');
  } catch (error) {
    return {};
  }
}

function dgPortfolioHighlightPosition(category) {
  const saved = dgPortfolioStoredHighlightSettings();
  const fallback = DG_PHOTO_HIGHLIGHT_DEFAULTS[category] || { x: 50, y: 50 };
  const position = saved && saved[category] ? saved[category] : {};
  const x = dgPortfolioClampPercent(position.x, fallback.x);
  const y = dgPortfolioClampPercent(position.y, fallback.y);
  return `${x}% ${y}%`;
}

function dgPortfolioWorkHref() {
  const hasClientNav = Boolean(document.querySelector('.dashboard-header [data-logout]'));
  return hasClientNav ? 'client-works.html' : 'work.html';
}

function dgPortfolioMedia(work, size = 'card') {
  const poster = work.poster
    ? `<img src="${dgPortfolioEscape(work.poster)}" alt="${dgPortfolioEscape(work.title)} poster" loading="lazy" />`
    : '';
  const posterAttribute = work.poster
    ? ` poster="${dgPortfolioEscape(work.poster)}"`
    : '';
  const heroControls = size === 'hero'
    ? `
      <div class="portfolio-media-actions">
        <button class="portfolio-fullscreen-btn" type="button" data-watch-preview="${dgPortfolioEscape(work.video)}" data-work-title="${dgPortfolioEscape(work.title)}" data-work-poster="${dgPortfolioEscape(work.poster)}" aria-label="View ${dgPortfolioEscape(work.title)} fullscreen">
          <span aria-hidden="true">&#x26F6;</span> View Fullscreen
        </button>
        <button class="hero-sound-toggle portfolio-sound-toggle is-muted" type="button" aria-label="Turn sound on" title="Turn sound on" data-portfolio-sound-toggle>
          <span class="sound-icon" aria-hidden="true">
            <span class="sound-box"></span>
            <span class="sound-wave sound-wave-one"></span>
            <span class="sound-wave sound-wave-two"></span>
            <span class="sound-slash"></span>
          </span>
        </button>
      </div>
    `
    : '';

  return `
    <div class="portfolio-media-frame ${size}">
      ${poster}
      <video muted loop playsinline preload="metadata" data-preview-video="${dgPortfolioEscape(work.video)}"${posterAttribute}></video>
      <div class="media-placeholder">
        <strong>${dgPortfolioEscape(work.title)}</strong>
      </div>
      ${heroControls}
    </div>
  `;
}

function dgPortfolioCard(work, variant = 'default') {
  return `
    <article class="portfolio-work-card ${variant}" data-category="${dgPortfolioEscape(work.slug)}">
      ${dgPortfolioMedia(work)}
      <div class="portfolio-card-copy">
        <p class="eyebrow">${dgPortfolioEscape(work.category)}</p>
        <h3>${dgPortfolioEscape(work.title)}</h3>
        <p>${dgPortfolioEscape(work.description)}</p>
        <div class="portfolio-card-actions">
          <button class="btn ghost small" type="button" data-watch-preview="${dgPortfolioEscape(work.video)}" data-work-title="${dgPortfolioEscape(work.title)}" data-work-poster="${dgPortfolioEscape(work.poster)}">Watch Film</button>
        </div>
      </div>
    </article>
  `;
}

function dgPortfolioPhotoHighlightCard(work) {
  const caption = DG_PORTFOLIO_HIGHLIGHT_CAPTIONS[work.category] || work.description;
  const image = DG_PORTFOLIO_HIGHLIGHT_IMAGES[work.category] || '';
  const focalClass = work.slug === 'creative' ? 'photo-highlight-documentary' : `photo-highlight-${work.slug}`;
  const objectPosition = dgPortfolioHighlightPosition(work.category);
  return `
    <button class="photo-highlight-card ${dgPortfolioEscape(focalClass)}" type="button" data-category="${dgPortfolioEscape(work.slug)}" data-photo-highlight-preview="${dgPortfolioEscape(image)}" data-photo-highlight-title="${dgPortfolioEscape(work.category)}" data-photo-highlight-caption="${dgPortfolioEscape(caption)}" data-photo-highlight-service="${dgPortfolioEscape(work.service)}" aria-label="View ${dgPortfolioEscape(work.category)} photo highlight">
      <div class="photo-highlight-media">
        <img src="${dgPortfolioEscape(image)}" alt="${dgPortfolioEscape(work.category)} highlight" loading="lazy" style="object-position: ${dgPortfolioEscape(objectPosition)};" />
      </div>
      <div class="photo-highlight-copy">
        <p class="eyebrow">${dgPortfolioEscape(work.category)}</p>
        <p>${dgPortfolioEscape(caption)}</p>
      </div>
      <span class="photo-highlight-hint">View photo</span>
    </button>
  `;
}

function dgRenderPortfolioPage() {
  const grid = document.getElementById('portfolioWorksGrid');
  const categories = document.getElementById('portfolioCategoryGrid');
  const hero = document.getElementById('portfolioHeroReel');
  const highlights = document.getElementById('portfolioPhotoHighlights');
  if (!grid && !categories && !hero && !highlights) return;

  if (hero) {
    const featured = DG_PORTFOLIO_WORKS[0];
    hero.innerHTML = `
      <article class="showreel-card">
        ${dgPortfolioMedia({
          ...featured,
          ...DG_PORTFOLIO_SHOWREEL
        }, 'hero')}
        <div class="showreel-copy">
          <p class="eyebrow">Featured project</p>
          <h2>Built from passion, framed with intention.</h2>
          <p>A cinematic montage created with deliberate pacing, textured details, and a strong sense of atmosphere &mdash; a personal piece that reflects the way we frame stories with energy and intention.</p>
        </div>
      </article>
    `;
  }

  if (categories) {
    categories.innerHTML = DG_PORTFOLIO_CATEGORIES.map((category) => `
      <a class="portfolio-category-chip" href="#portfolioWorksGrid" data-category-jump="${dgPortfolioEscape(category)}">${dgPortfolioEscape(category)}</a>
    `).join('');
  }

  if (highlights) {
    highlights.innerHTML = DG_PORTFOLIO_CATEGORIES.map((category) => {
      const work = DG_PORTFOLIO_WORKS.find((item) => item.category === category);
      return work ? dgPortfolioPhotoHighlightCard(work) : '';
    }).join('');
  }

  if (grid) {
    grid.innerHTML = DG_PORTFOLIO_WORKS.length
      ? DG_PORTFOLIO_WORKS.map((work) => dgPortfolioCard(work)).join('')
      : '<div class="empty-state">No portfolio projects are available right now.</div>';
  }
}

function dgRenderDashboardPortfolio() {
  const works = document.getElementById('dashboardFeaturedWorks');
  const services = document.getElementById('dashboardRecommendedServices');
  if (works) {
    works.innerHTML = `
      <article class="featured-showreel-mini">
        ${dgPortfolioMedia({
          ...DG_PORTFOLIO_SHOWREEL,
          category: 'Featured Reel',
        })}
        <div>
          <p class="eyebrow">Featured showreel</p>
          <h3>Recent DG Film Co. work</h3>
          <p>Browse recent coverage styles before choosing a service.</p>
          <button class="btn primary" type="button" data-watch-preview="${DG_PORTFOLIO_SHOWREEL.video}" data-work-title="${DG_PORTFOLIO_SHOWREEL.title}" data-work-poster="">Watch Reel</button>
        </div>
      </article>
      <div class="portfolio-work-grid compact">
        ${DG_PORTFOLIO_WORKS.slice(0, 6).map((work) => dgPortfolioCard(work, 'compact')).join('')}
      </div>
    `;
  }

  if (services) {
    services.innerHTML = DG_PORTFOLIO_WORKS.map((work) => `
      <article class="recommended-service-card">
        <p class="eyebrow">${dgPortfolioEscape(work.category)}</p>
        <h3>${dgPortfolioEscape(work.service)}</h3>
        <p>${dgPortfolioEscape(work.description)}</p>
        <span data-service-price="${dgPortfolioEscape(work.service)}">Starting price loading...</span>
        <a class="btn ghost small" href="${dgPortfolioBookHref(work.service)}">Book This Service</a>
      </article>
    `).join('');
    dgHydrateServicePrices();
  }
}

function dgRenderBookingInspiration() {
  const container = document.getElementById('bookingInspirationWorks');
  if (!container) return;
  container.innerHTML = DG_PORTFOLIO_WORKS.slice(0, 3).map((work) => dgPortfolioCard(work, 'compact')).join('');
}

function dgHydrateServicePrices() {
  if (!window.DGData) return;
  const services = DGData.getJson(DGData.keys.services, []);
  const pricing = DGData.getJson(DGData.keys.pricing, []);
  document.querySelectorAll('[data-service-price]').forEach((element) => {
    const serviceName = element.dataset.servicePrice;
    const service = services.find((item) => item.name === serviceName);
    const packagePrices = pricing
      .filter((item) => item.serviceName === serviceName || item.serviceId === (service && service.id))
      .map((item) => Number(item.price || 0))
      .filter((price) => price > 0);
    const basePrice = packagePrices.length ? Math.min(...packagePrices) : Number(service && service.startingPrice || 0);
    element.textContent = basePrice ? `Starts at PHP ${basePrice.toLocaleString('en-PH')}` : 'Custom quote available';
  });
}

function dgSetupPortfolioModal() {
  const modal = document.getElementById('portfolioPreviewModal');
  if (!modal) return;
  const video = modal.querySelector('video');
  const title = modal.querySelector('[data-modal-title]');
  const playbackPositions = new Map();
  let activeInlineVideo = null;
  let activeSource = '';
  let playbackRequestId = 0;

  const setCurrentTime = (target, time) => {
    if (!target || !Number.isFinite(time) || time < 0) return;
    try {
      target.currentTime = time;
    } catch (error) {
      // Seeking waits for metadata when the media element is not ready yet.
    }
  };

  const findTriggerVideo = (trigger, source) => {
    const localContainer = trigger.closest('.hero-frame, .portfolio-media-frame, .portfolio-work-card, .featured-showreel-mini, .work-card');
    const localVideo = localContainer && localContainer.querySelector('video');
    if (localVideo) return localVideo;
    return Array.from(document.querySelectorAll('[data-hero-video], [data-preview-video], .portfolio-video'))
      .find((item) => item !== video &&
        (item.dataset.previewVideo === source ||
          item.getAttribute('src') === source ||
          (item.querySelector('source') && item.querySelector('source').getAttribute('src') === source))) || null;
  };

  const pauseInlineVideos = () => {
    document.querySelectorAll('video').forEach((item) => {
      if (item === video) return;
      item.pause();
      item.muted = true;
    });
    document.querySelectorAll('[data-portfolio-sound-toggle], [data-hero-sound-toggle]').forEach((toggle) => {
      toggle.classList.add('is-muted');
      toggle.setAttribute('aria-label', 'Turn sound on');
      toggle.setAttribute('title', 'Turn sound on');
    });
  };

  if (video) {
    video.addEventListener('error', () => {
      console.warn(`[DG Film Co.] Unable to load local preview video: ${video.currentSrc || video.getAttribute('src') || 'unknown source'}`);
    });
  }
  const closeVideoModal = () => {
    playbackRequestId += 1;
    const modalTime = video && Number.isFinite(video.currentTime) ? video.currentTime : 0;
    if (activeSource) playbackPositions.set(activeSource, modalTime);
    if (video) video.pause();
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('portfolio-modal-active');
    if (activeInlineVideo) {
      setCurrentTime(activeInlineVideo, modalTime);
      activeInlineVideo.muted = true;
      activeInlineVideo.play().catch(() => {});
    }
    if (video) {
      video.removeAttribute('src');
      video.load();
    }
    activeInlineVideo = null;
    activeSource = '';
  };

  const openVideoModal = (trigger) => {
    playbackRequestId += 1;
    const requestId = playbackRequestId;
    activeSource = trigger.dataset.watchPreview || '';
    activeInlineVideo = findTriggerVideo(trigger, activeSource);
    const initialTime = activeInlineVideo && Number.isFinite(activeInlineVideo.currentTime)
      ? activeInlineVideo.currentTime
      : (playbackPositions.get(activeSource) || 0);
    pauseInlineVideos();
    if (title) title.textContent = trigger.dataset.workTitle || 'DG Film Co. Preview';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('portfolio-modal-active');
    if (video) {
      if (trigger.dataset.workPoster) {
        video.poster = trigger.dataset.workPoster;
      } else {
        video.removeAttribute('poster');
      }
      video.muted = true;
      video.controls = true;
      let playbackStarted = false;
      const startModalPlayback = () => {
        if (playbackStarted || requestId !== playbackRequestId || !modal.classList.contains('open')) return;
        playbackStarted = true;
        setCurrentTime(video, initialTime);
        video.play().catch(() => {});
      };
      video.addEventListener('loadedmetadata', startModalPlayback, { once: true });
      video.src = activeSource;
      video.load();
      if (video.readyState >= HTMLMediaElement.HAVE_METADATA) startModalPlayback();
    }
  };

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-watch-preview]');
    if (trigger) {
      openVideoModal(trigger);
      return;
    }
    if (event.target.matches('[data-close-modal]') || event.target === modal) closeVideoModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('open')) closeVideoModal();
  });
}

function dgSetupPortfolioVideoPreviews() {
  const videos = document.querySelectorAll('[data-preview-video]');
  document.querySelectorAll('.portfolio-media-frame img').forEach((image) => {
    image.addEventListener('error', () => {
      image.style.opacity = '0';
    }, { once: true });
  });
  videos.forEach((video) => {
    const sourcePath = video.dataset.previewVideo;
    const frame = video.closest('.portfolio-media-frame');
    const revealVideo = () => {
      video.classList.add('has-media');
      if (frame) frame.classList.add('has-media');
    };
    const showFallback = () => {
      video.classList.remove('has-media');
      if (frame) frame.classList.remove('has-media');
      console.warn(`[DG Film Co.] Unable to load local portfolio video: ${sourcePath || 'unknown source'}`);
    };
    video.addEventListener('loadeddata', revealVideo, { once: true });
    video.addEventListener('error', showFallback, { once: true });
    video.src = sourcePath;
    video.load();
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) revealVideo();
  });

  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting && !document.body.classList.contains('portfolio-modal-active')) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.45 });
  videos.forEach((video) => observer.observe(video));
}

function dgSetupPortfolioSoundToggles() {
  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-portfolio-sound-toggle]');
    if (!toggle) return;

    const frame = toggle.closest('.portfolio-media-frame');
    const video = frame && frame.querySelector('video');
    if (!video) return;

    video.muted = !video.muted;
    if (!video.muted) {
      video.volume = 0.75;
      video.play().catch(() => {});
    }

    const isMuted = video.muted;
    toggle.classList.toggle('is-muted', isMuted);
    toggle.setAttribute('aria-label', isMuted ? 'Turn sound on' : 'Turn sound off');
    toggle.setAttribute('title', isMuted ? 'Turn sound on' : 'Turn sound off');
  });
}

function dgSetupPortfolioCategoryJumps() {
  document.querySelectorAll('[data-category-jump]').forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.categoryJump;
      const work = DG_PORTFOLIO_WORKS.find((item) => item.category === category);
      const slug = work ? work.slug : 'all';
      document.querySelectorAll('[data-portfolio-filter]').forEach((filter) => {
        filter.classList.toggle('active', filter.dataset.portfolioFilter === slug);
      });
      dgApplyPortfolioFilter(slug);
    });
  });
}

function dgSetupPhotoHighlightLightbox() {
  const lightbox = document.getElementById('photoHighlightLightbox');
  if (!lightbox) return;
  const image = lightbox.querySelector('[data-photo-lightbox-image]');
  const title = lightbox.querySelector('[data-photo-lightbox-title]');
  const caption = lightbox.querySelector('[data-photo-lightbox-caption]');
  const inquire = lightbox.querySelector('[data-photo-lightbox-inquire]');

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('photo-lightbox-active');
    if (image) {
      image.removeAttribute('src');
      image.alt = '';
    }
  };

  const openLightbox = (trigger) => {
    const photoTitle = trigger.dataset.photoHighlightTitle || 'Photo Highlight';
    const photoCaption = trigger.dataset.photoHighlightCaption || '';
    const service = trigger.dataset.photoHighlightService || photoTitle;
    if (image) {
      image.src = trigger.dataset.photoHighlightPreview || '';
      image.alt = `${photoTitle} highlight`;
    }
    if (title) title.textContent = photoTitle;
    if (caption) caption.textContent = photoCaption;
    if (inquire) inquire.href = dgPortfolioBookHref(service);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('photo-lightbox-active');
  };

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-photo-highlight-preview]');
    if (trigger) {
      openLightbox(trigger);
      return;
    }
    if (event.target.closest('[data-close-photo-lightbox]') || event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
}

function dgApplyPortfolioFilter(slug) {
  document.querySelectorAll('.portfolio-work-card[data-category]').forEach((card) => {
    const match = slug === 'all' || card.dataset.category === slug;
    card.style.display = match ? '' : 'none';
  });
}

function dgPortfolioHashSlug() {
  const requested = window.location.hash.replace(/^#/, '').toLowerCase();
  const aliases = {
    commercial: 'corporate',
    music: 'creative'
  };
  return aliases[requested] || requested;
}

function dgApplyPortfolioHashFilter() {
  const slug = dgPortfolioHashSlug();
  const filter = document.querySelector(`[data-portfolio-filter="${slug}"]`);
  if (!filter) return;
  document.querySelectorAll('[data-portfolio-filter]').forEach((item) => item.classList.remove('active'));
  filter.classList.add('active');
  dgApplyPortfolioFilter(slug);
}

function dgSetupPortfolioFilters() {
  document.querySelectorAll('[data-portfolio-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-portfolio-filter]').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      dgApplyPortfolioFilter(button.dataset.portfolioFilter || 'all');
    });
  });
  dgApplyPortfolioHashFilter();
  window.addEventListener('hashchange', dgApplyPortfolioHashFilter);
}

document.addEventListener('DOMContentLoaded', () => {
  dgRenderPortfolioPage();
  dgRenderDashboardPortfolio();
  dgRenderBookingInspiration();
  dgSetupPortfolioModal();
  dgSetupPortfolioVideoPreviews();
  dgSetupPortfolioSoundToggles();
  dgSetupPortfolioCategoryJumps();
  dgSetupPhotoHighlightLightbox();
  dgSetupPortfolioFilters();
});

window.DGPortfolio = {
  works: DG_PORTFOLIO_WORKS,
  renderCard: dgPortfolioCard
};
