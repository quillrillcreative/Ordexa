const CONFIG = {
  businessName: "Ordexa",
  tagline: "Shopping Made Simpler.",
  whatsapp: "254700321523", // Ordexa WhatsApp contact (international format, no + or spaces)
  whatsappMessage: "Hi Ordexa! I'd like help finding and ordering something online.",
  // Paste the "Web app URL" you get after deploying the Apps Script in
  // google-apps-script.gs (see README.md → "Order form → Spreadsheet").
  // Leave empty to disable spreadsheet logging (orders will still open WhatsApp).
  sheetWebhookUrl: "https://script.google.com/macros/s/AKfycbziWayqNX5Vf6vizu8FpHcS5_spYsav6J_oTbkP1qSAwYmQ78vd_dJOpZQugHRRLrjt/exec",
};

const waNumber = (CONFIG.whatsapp || "").replace(/\D/g, "");
const waLink = (msg) => waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(msg || CONFIG.whatsappMessage)}` : "#contact";

document.addEventListener("DOMContentLoaded", () => {

  // WhatsApp links
  document.querySelectorAll("[data-wa]").forEach(el => {
    const ready = Boolean(waNumber);
    el.href = ready ? waLink(el.getAttribute("data-wa-msg") || undefined) : "#faq";
    if (!ready) {
      el.setAttribute("aria-label", "WhatsApp contact not configured yet");
      el.addEventListener("click", (event) => {
        event.preventDefault();
        alert("Ordexa is preparing its WhatsApp contact. Please check back soon.");
      });
    }
  });

  // Brand name / tagline (safe — only touches elements that exist)
  document.querySelectorAll("#brandName1, #brandName2").forEach(el => { el.textContent = CONFIG.businessName; });
  document.querySelectorAll(".brand-tag").forEach(el => { el.textContent = CONFIG.tagline; });

  // Mobile menu toggle
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    const closeMenu = () => { toggle.classList.remove("open"); menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); };
    const openMenu = () => { toggle.classList.add("open"); menu.classList.add("open"); toggle.setAttribute("aria-expanded", "true"); };
    toggle.addEventListener("click", () => { menu.classList.contains("open") ? closeMenu() : openMenu(); });
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
  }

  // Scroll-reveal
  const revealEls = document.querySelectorAll(".reveal, .section-head, .s-card, .step-item, .t-item");
  revealEls.forEach(el => el.classList.add("reveal"));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("in"));
  }

  // Testimonial carousel
  const testimonials = [
    { quote: "Ordexa made my online shopping experience so easy! They found exactly what I needed and guided me through the process.", cite: "— Sarah K., Nairobi" },
    { quote: "I run a small salon and needed supplies fast. Ordexa found better prices than I would have on my own, and I never had to share my login.", cite: "— Brenda M., Nanyuki" },
    { quote: "Clear pricing, no surprises. They told me the fee upfront and I paid Jumia directly — exactly as promised.", cite: "— Daniel O., Mombasa" },
    { quote: "Perfect for someone like me who isn't confident shopping online. They walked me through every step on WhatsApp.", cite: "— Grace W., Nakuru" },
  ];
  const qEl = document.getElementById("tQuote");
  const cEl = document.getElementById("tCite");
  const dotsWrap = document.getElementById("tDots");
  if (qEl && cEl && dotsWrap) {
    const dots = Array.from(dotsWrap.querySelectorAll("button"));
    let active = 0, timer;
    const show = (i) => {
      active = i;
      qEl.textContent = `"${testimonials[i].quote}"`;
      cEl.textContent = testimonials[i].cite;
      dots.forEach((d, j) => d.classList.toggle("active", j === i));
    };
    const next = () => show((active + 1) % testimonials.length);
    const restart = () => { clearInterval(timer); timer = setInterval(next, 6000); };
    dots.forEach((d, i) => d.addEventListener("click", () => { show(i); restart(); }));
    restart();
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Order form → logs to Google Sheet (via Apps Script webhook) → opens WhatsApp
  const orderForm = document.getElementById("orderForm");
  const ofStatus = document.getElementById("ofStatus");
  const ofSubmit = document.getElementById("ofSubmit");
  if (orderForm) {
    orderForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("ofName").value.trim();
      const phone = document.getElementById("ofPhone").value.trim();
      const product = document.getElementById("ofProduct").value.trim();
      const notes = document.getElementById("ofNotes").value.trim();

      if (!name || !phone || !product) {
        ofStatus.textContent = "Please fill in your name, phone number and the product you need.";
        ofStatus.className = "order-note error";
        return;
      }

      ofSubmit.disabled = true;
      ofStatus.textContent = "Saving your request…";
      ofStatus.className = "order-note";

      const payload = {
        timestamp: new Date().toISOString(),
        name, phone, product, notes,
      };

      if (CONFIG.sheetWebhookUrl) {
        try {
          // Apps Script web apps don't send CORS headers for a readable response,
          // so we fire the request in no-cors mode — we can't read the result,
          // but the POST still reaches the script and appends the row.
          await fetch(CONFIG.sheetWebhookUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload),
          });
        } catch (err) {
          // Network/webhook issue — don't block the WhatsApp handoff.
          console.warn("Order webhook failed:", err);
        }
      }

      const waMsg = `Hi Ordexa! I'd like to place an order.\n\nName: ${name}\nPhone: ${phone}\nProduct: ${product}${notes ? `\nNotes: ${notes}` : ""}`;

      if (waNumber) {
        window.open(waLink(waMsg), "_blank");
        ofStatus.textContent = "Request saved! We've opened WhatsApp so you can send us the details.";
      } else {
        ofStatus.textContent = "Request saved! We'll reach out to confirm shortly.";
      }
      ofStatus.className = "order-note success";
      ofSubmit.disabled = false;
      orderForm.reset();
    });
  }
});
