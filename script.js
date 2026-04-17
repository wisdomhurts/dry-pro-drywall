/* ----------------------------------------------
   Dry Pro Dry Wall — interactions
   ---------------------------------------------- */

(function () {
  "use strict";

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Before / After slider ---------- */
  const slider = document.getElementById("baSlider");
  if (slider) {
    const before = slider.querySelector(".ba__before");
    const handle = slider.querySelector(".ba__handle");

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

    // Click anywhere on slider (for non-drag users)
    slider.addEventListener("click", (e) => {
      if (e.target.closest(".ba__handle")) return;
      setPos(posFromEvent(e));
    });

    // Keyboard
    handle.addEventListener("keydown", (e) => {
      const current = parseFloat(handle.getAttribute("aria-valuenow")) || 50;
      if (e.key === "ArrowLeft")  { setPos(current - 2); e.preventDefault(); }
      if (e.key === "ArrowRight") { setPos(current + 2); e.preventDefault(); }
      if (e.key === "Home")       { setPos(0);   e.preventDefault(); }
      if (e.key === "End")        { setPos(100); e.preventDefault(); }
    });

    // Little nudge on first view so people get it
    const nudge = () => {
      let pct = 50;
      const target = 62;
      const t0 = performance.now();
      const dur = 900;
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 4);
        setPos(50 + (target - 50) * eased);
        if (p < 1) requestAnimationFrame(tick);
        else {
          // swing back
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
    }, { threshold: 0.4 });
    io.observe(slider);
  }

  /* ---------- Reveal on scroll ---------- */
  const revealables = document.querySelectorAll(
    ".section-head, .services__grid, .process__list, .why__grid, .about__media, .about__copy, .quotes__grid, .faq__list, .contact__head, .form, .hero__stats"
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

    window.location.href = "mailto:josh@dryprodrywall.ca?subject=" + subject + "&body=" + body;

    if (thanks) {
      thanks.hidden = false;
      form.querySelectorAll("input, textarea, button").forEach((f) => (f.disabled = true));
    }
    return false;
  };
})();
