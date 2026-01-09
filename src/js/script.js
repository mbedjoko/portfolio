// Ombre plus marquée au scroll
(function(){
  const header = document.getElementById('site-header');
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Hamburger / mobile nav
(function(){
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  function openMobileNav() {
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden','false');
    hamburger.setAttribute('aria-expanded','true');
  }
  function closeMobileNav() {
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden','true');
    hamburger.setAttribute('aria-expanded','false');
  }

  window.closeMobileNav = closeMobileNav;

  hamburger.addEventListener('click', function(e){
    e.stopPropagation();
    mobileNav.classList.contains('open') ? closeMobileNav() : openMobileNav();
  });

  window.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeMobileNav();
  });

  document.addEventListener('click', function(e){
    if (!mobileNav.contains(e.target) && !hamburger.contains(e.target) && mobileNav.classList.contains('open')) {
      closeMobileNav();
    }
  });

  mobileNav.addEventListener('click', function(e){
    const a = e.target.closest('a[data-close]');
    if (a) closeMobileNav();
  });
})();

// Contact form handling — CONNECTÉ AU BACKEND (version debug + plus robuste)
(function(){
  const form = document.getElementById('contact-form');
  if (!form) return;

  // Si tu veux forcer local (pratique pour tests) => true
  const DEV_FORCE_LOCAL = true;

  function getBackendUrl() {
    if (DEV_FORCE_LOCAL) return "http://localhost:4000";
    const host = location.hostname;
    // accepte localhost, 127.0.0.1, ::1 (IPv6), et quand on est en dev via nom de machine
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
      return "http://localhost:4000";
    }
    // si tu utilises un port dev spécifique (ex: 5500) tu peux le gérer ici
    // sinon en production mets ton backend réel ci-dessous
    return "https://ton-backend.example.com";
  }

  const BACKEND_URL = getBackendUrl();
  console.log("Contact form: BACKEND_URL =", BACKEND_URL);

  form.addEventListener('submit', async function(e){
    e.preventDefault();

    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    try {
      const resp = await fetch(`${BACKEND_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
      });

      let text;
      try { text = await resp.text(); } catch (e) { text = null; }

      // tente parser le JSON si possible
      let data;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }

      if (!resp.ok) {
        console.error("Contact API error:", resp.status, resp.statusText, data || text);
        const errorMsg = data?.error || (data?.errors && data.errors.map(x=>x.msg).join(", ")) || text || resp.statusText;
        alert(" Erreur : " + errorMsg);
        return;
      }

      console.log("Contact API success:", data || text);
      alert(" Message envoyé avec succès !");
      form.reset();

    } catch (error) {
      // affiche l'erreur réseau complète
      console.error("Network error sending contact:", error);
      alert(" Erreur réseau — impossible d’envoyer le message. Regarde la console (F12) pour plus de détails.");
    }
  });
})();
