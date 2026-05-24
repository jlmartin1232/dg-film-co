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

const DG_PORTFOLIO_SHOWREEL = {
  title: 'DG Film Co. Showreel',
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
  return `book-service.html?service=${encodeURIComponent(service || '')}`;
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
          <button class="btn ghost small" type="button" data-watch-preview="${dgPortfolioEscape(work.video)}" data-work-title="${dgPortfolioEscape(work.title)}" data-work-poster="${dgPortfolioEscape(work.poster)}">Watch Preview</button>
          <a class="btn ghost small" href="${dgPortfolioWorkHref()}">View Portfolio</a>
        </div>
      </div>
    </article>
  `;
}

function dgRenderPortfolioPage() {
  const grid = document.getElementById('portfolioWorksGrid');
  const categories = document.getElementById('portfolioCategoryGrid');
  const hero = document.getElementById('portfolioHeroReel');
  if (!grid && !categories && !hero) return;

  if (hero) {
    const featured = DG_PORTFOLIO_WORKS[0];
    hero.innerHTML = `
      <article class="showreel-card">
        ${dgPortfolioMedia({
          ...featured,
          ...DG_PORTFOLIO_SHOWREEL
        }, 'hero')}
        <div class="showreel-copy">
          <p class="eyebrow">Featured showreel</p>
          <h2>See recent DG Film Co. work in motion.</h2>
          <p>View highlights from weddings, celebrations, commercial shoots, events, food promotions, and brand projects.</p>
        </div>
      </article>
    `;
  }

  if (categories) {
    categories.innerHTML = DG_PORTFOLIO_CATEGORIES.map((category) => `
      <a class="portfolio-category-chip" href="#portfolioWorksGrid" data-category-jump="${dgPortfolioEscape(category)}">${dgPortfolioEscape(category)}</a>
    `).join('');
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
  dgSetupPortfolioFilters();
});

window.DGPortfolio = {
  works: DG_PORTFOLIO_WORKS,
  renderCard: dgPortfolioCard
};
