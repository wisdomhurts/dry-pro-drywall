/* ----------------------------------------------
   DryPro Dry Wall — interactions
   ---------------------------------------------- */

(function () {
  "use strict";

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Before / After sliders (one or many per page) ---------- */
  const initSlider = (slider) => {
    const before = slider.querySelector(".ba__before");
    const handle = slider.querySelector(".ba__handle");
    if (!before || !handle) return;

    let dragging = false;

    const setPos = (pct) => {
      const clamped = Math.max(0, Math.min(100, pct));
      before.style.width = clamped + "%";
      handle.style.left = clamped + "%";
      handle.setAttribute("aria-valuenow", Math.round(clamped));
    };

    const posFromEvent = (evt) => {
      const rect = slider.getBoundingClientRect();
      const x = (evt.touches ? evt.touches[0].clientX : evt.clientX) - rect.left;
      return (x / rect.width) * 100;
    };

    const start = (e) => {
      dragging = true;
      slider.classList.add("is-dragging");
      setPos(posFromEvent(e));
      e.preventDefault();
    };
    const move = (e) => {
      if (!dragging) return;
      setPos(posFromEvent(e));
    };
    const end = () => {
      dragging = false;
      slider.classList.remove("is-dragging");
    };

    slider.addEventListener("mousedown", start);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);

    slider.addEventListener("touchstart", start, { passive: false });
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", end);

    slider.addEventListener("click", (e) => {
      if (e.target.closest(".ba__handle")) return;
      setPos(posFromEvent(e));
    });

    handle.addEventListener("keydown", (e) => {
      const current = parseFloat(handle.getAttribute("aria-valuenow")) || 50;
      if (e.key === "ArrowLeft")  { setPos(current - 2); e.preventDefault(); }
      if (e.key === "ArrowRight") { setPos(current + 2); e.preventDefault(); }
      if (e.key === "Home")       { setPos(0);   e.preventDefault(); }
      if (e.key === "End")        { setPos(100); e.preventDefault(); }
    });

    const nudge = () => {
      const target = 62;
      const t0 = performance.now();
      const dur = 900;
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 4);
        setPos(50 + (target - 50) * eased);
        if (p < 1) requestAnimationFrame(tick);
        else {
          const t1 = performance.now();
          const back = (t) => {
            const p2 = Math.min(1, (t - t1) / 800);
            const e2 = 1 - Math.pow(1 - p2, 4);
            setPos(target + (50 - target) * e2);
            if (p2 < 1) requestAnimationFrame(back);
          };
          setTimeout(() => requestAnimationFrame(back), 600);
        }
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!slider.dataset.nudged && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            slider.dataset.nudged = "1";
            setTimeout(nudge, 450);
          }
          io.unobserve(slider);
        }
      });
    }, { threshold: 0.35 });
    io.observe(slider);
  };

  document.querySelectorAll(".ba__slider").forEach(initSlider);

  /* ---------- Reveal on scroll ---------- */
  const revealables = document.querySelectorAll(
    ".section-head, .services__grid, .process__list, .why__grid, .about__media, .about__copy, .quotes__grid, .faq__list, .contact__head, .form, .hero__stats, .recent__grid, .gallery, .page-head, .ba-stack__head"
  );
  revealables.forEach((el) => el.classList.add("reveal"));

  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  revealables.forEach((el) => revealIO.observe(el));

  /* ---------- Form handler ---------- */
  window.handleSubmit = function (evt) {
    evt.preventDefault();
    const form = evt.target;
    const thanks = form.querySelector(".form__thanks");

    const data = Object.fromEntries(new FormData(form));
    const body = encodeURIComponent(
      "Name: " + (data.name || "") + "\n" +
      "Contact: " + (data.contact || "") + "\n" +
      "Location: " + (data.where || "") + "\n\n" +
      "Job:\n" + (data.message || "")
    );
    const subject = encodeURIComponent("Website quote request — " + (data.name || ""));

    window.location.href = "mailto:dryprodrywall@gmail.com?subject=" + subject + "&body=" + body;

    if (thanks) {
      thanks.hidden = false;
      form.querySelectorAll("input, textarea, button").forEach((f) => (f.disabled = true));
    }
    return false;
  };

  /* ---------- Lightbox for gallery images ---------- */
  (function initLightbox() {
    const containers = document.querySelectorAll(".gallery, .recent__grid");
    if (!containers.length) return;

    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("aria-hidden", "true");
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.innerHTML =
      '<div class="lightbox__backdrop"></div>' +
      '<div class="lightbox__counter" aria-live="polite"></div>' +
      '<button class="lightbox__close" type="button" aria-label="Close">' +
        '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 4 L16 16 M16 4 L4 16" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round"/></svg>' +
      '</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous image">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 L9 12 L15 18" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
      '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next image">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6 L15 12 L9 18" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
      '<figure class="lightbox__figure">' +
        '<img class="lightbox__img" alt="" />' +
        '<figcaption class="lightbox__cap"></figcaption>' +
      '</figure>';
    document.body.appendChild(lb);

    const imgEl   = lb.querySelector(".lightbox__img");
    const capEl   = lb.querySelector(".lightbox__cap");
    const ctrEl   = lb.querySelector(".lightbox__counter");
    const prevBtn = lb.querySelector(".lightbox__nav--prev");
    const nextBtn = lb.querySelector(".lightbox__nav--next");
    const closeBtn = lb.querySelector(".lightbox__close");
    const backdrop = lb.querySelector(".lightbox__backdrop");

    let current = null;
    let idx = 0;
    let lastFocus = null;

    const render = () => {
      const item = current[idx];
      imgEl.src = item.src;
      imgEl.alt = item.alt;
      capEl.textContent = item.caption;
      capEl.hidden = !item.caption;
      ctrEl.textContent = (idx + 1) + " / " + current.length;
      const multi = current.length > 1;
      prevBtn.hidden = !multi;
      nextBtn.hidden = !multi;
      ctrEl.hidden = !multi;
    };

    const open = (group, startIdx) => {
      current = group;
      idx = startIdx;
      lastFocus = document.activeElement;
      render();
      lb.classList.add("is-open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    };

    const close = () => {
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      current = null;
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    };

    const next = () => { if (current) { idx = (idx + 1) % current.length; render(); } };
    const prev = () => { if (current) { idx = (idx - 1 + current.length) % current.length; render(); } };

    closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", close);
    nextBtn.addEventListener("click", next);
    prevBtn.addEventListener("click", prev);

    window.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft")  { e.preventDefault(); prev(); }
    });

    containers.forEach((container) => {
      const tiles = Array.from(container.querySelectorAll("figure"));
      if (!tiles.length) return;
      const group = tiles.map((tile) => {
        const tImg = tile.querySelector("img");
        const tCap = tile.querySelector("figcaption");
        return {
          src: tImg ? (tImg.currentSrc || tImg.src) : "",
          alt: tImg ? (tImg.alt || "") : "",
          caption: tCap ? tCap.textContent.trim() : "",
        };
      });
      tiles.forEach((tile, i) => {
        tile.classList.add("is-lightbox-target");
        tile.setAttribute("tabindex", "0");
        tile.setAttribute("role", "button");
        tile.setAttribute("aria-label", "Open image" + (group[i].caption ? ": " + group[i].caption : ""));
        const doOpen = () => open(group, i);
        tile.addEventListener("click", doOpen);
        tile.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); doOpen(); }
        });
      });
    });
  })();
})();
