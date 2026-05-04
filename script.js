// ── Navbar scroll effect ──
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ── Mobile hamburger ──
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

// Close menu on link click (excluding dropdown triggers)
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', (e) => {
    if (a.classList.contains('dropdown-trigger')) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const parent = a.parentElement;
        const menu = parent.querySelector('.dropdown-menu');
        parent.classList.toggle('active');
        menu.classList.toggle('open');
      }
      return;
    }
    navLinks.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// ── Active nav link on scroll ──
const sections = document.querySelectorAll('.section[id]');
const navItems = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.getAttribute('id');
  });
  navItems.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
});

// ── Scroll reveal ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ── Counter animation ──
function animateCounters() {
  document.querySelectorAll('.stat-value[data-target]').forEach(el => {
    const target = el.getAttribute('data-target');
    const isNumber = !isNaN(parseInt(target));
    if (!isNumber) { el.textContent = target; return; }
    const num = parseInt(target);
    const suffix = target.replace(String(num), '');
    let start = 0;
    const step = Math.max(1, Math.floor(num / 60));
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { start = num; clearInterval(timer); }
      el.textContent = start.toLocaleString('en-IN') + suffix;
    }, 25);
  });
}
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounters(); statsObserver.unobserve(e.target); } });
}, { threshold: 0.3 });
const statsRow = document.querySelector('.stats-row');
if (statsRow) statsObserver.observe(statsRow);

// ── Review form ──
const formStars = document.querySelectorAll('.form-star');
const ratingInput = document.getElementById('reviewRating');
let selectedRating = 5;

formStars.forEach((star, i) => {
  star.addEventListener('mouseenter', () => {
    formStars.forEach((s, j) => s.classList.toggle('active', j <= i));
  });
  star.addEventListener('click', () => {
    selectedRating = i + 1;
    if (ratingInput) ratingInput.value = selectedRating;
    formStars.forEach((s, j) => s.classList.toggle('active', j <= i));
  });
});

const starsContainer = document.querySelector('.form-stars');
if (starsContainer) {
  starsContainer.addEventListener('mouseleave', () => {
    formStars.forEach((s, i) => s.classList.toggle('active', i < selectedRating));
  });
}

const reviewForm = document.getElementById('reviewForm');
const formStatus = document.getElementById('formStatus');

if (reviewForm) {
  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = reviewForm.querySelector('.btn-submit');
    const originalBtnText = submitBtn.innerHTML;
    
    // Get values for local update
    const name = document.getElementById('reviewName').value.trim();
    const email = document.getElementById('reviewEmail').value.trim();
    const role = document.getElementById('reviewRole').value.trim();
    const text = document.getElementById('reviewText').value.trim();
    
    if (!name || !text || !email) {
      alert('Please fill in all required fields.');
      return;
    }

    // Prepare data for Formspree
    const formData = new FormData(reviewForm);
    
    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending...';
      
      const response = await fetch(reviewForm.action, {
        method: reviewForm.method,
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Local update
        const card = document.createElement('div');
        card.className = 'review-card fade-up visible';
        card.innerHTML = `
          <div class="review-quote-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H5c-1.25 0-2 .75-2 2v3c0 1.25.75 2 2 2h3c0 4-4 6-4 6zm10 0c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-3c-1.25 0-2 .75-2 2v3c0 1.25.75 2 2 2h3c0 4-4 6-4 6z" />
            </svg>
          </div>
          <p class="review-text">"${text}"</p>
          <div class="review-footer">
            <div class="review-info">
              <div class="review-author">${name}</div>
              <div class="review-role">${role || ''}</div>
            </div>
            <div class="review-stars">
              ${'<span class="star">★</span>'.repeat(selectedRating)}${'<span class="star" style="color:var(--text-muted)">★</span>'.repeat(5 - selectedRating)}
            </div>
          </div>
        `;
        document.querySelector('.reviews-list').prepend(card);
        
        // Success feedback
        if (formStatus) {
          formStatus.textContent = "Thanks! Your review has been submitted.";
          formStatus.className = "form-status success";
        }
        
        reviewForm.reset();
        selectedRating = 5;
        if (ratingInput) ratingInput.value = 5;
        formStars.forEach(s => s.classList.add('active'));
        
        setTimeout(() => {
          if (formStatus) formStatus.textContent = "";
        }, 5000);

      } else {
        const data = await response.json();
        if (Object.hasOwn(data, 'errors')) {
          throw new Error(data["errors"].map(error => error["message"]).join(", "));
        } else {
          throw new Error("Oops! There was a problem submitting your form");
        }
      }
    } catch (error) {
      if (formStatus) {
        formStatus.textContent = error.message;
        formStatus.className = "form-status error";
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

// ── Smooth scroll for CTA buttons ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});
