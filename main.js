import { db, collection, addDoc } from "./firebase-config.js";

// GSAP Registration
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

document.addEventListener("DOMContentLoaded", () => {
  initCanvasBackground();
  initHeroAnimations();
  initRoadmapAnimations();
  init3DTiltEffects();
  initModal();
});

// --- 1. Interactive Canvas Background (Node Network) ---
function initCanvasBackground() {
  const canvas = document.getElementById("heroCanvas");
  const ctx = canvas.getContext("2d");
  let width,
    height,
    particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resize);
  resize();

  const mouse = { x: null, y: null, radius: 150 };
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 3 + 1.5;
      this.baseX = this.x;
      this.baseY = this.y;
      this.density = Math.random() * 20 + 1;
      this.color =
        Math.random() > 0.5
          ? "rgba(24, 153, 175, 0.85)"
          : "rgba(196, 91, 170, 0.85)";
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }
    update() {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      let forceDirectionX = dx / distance;
      let forceDirectionY = dy / distance;
      let maxDistance = mouse.radius;
      let force = (maxDistance - distance) / maxDistance;
      let directionX = forceDirectionX * force * this.density;
      let directionY = forceDirectionY * force * this.density;

      if (distance < mouse.radius) {
        this.x -= directionX;
        this.y -= directionY;
      } else {
        if (this.x !== this.baseX) {
          let dx = this.x - this.baseX;
          this.x -= dx / 10;
        }
        if (this.y !== this.baseY) {
          let dy = this.y - this.baseY;
          this.y -= dy / 10;
        }
      }
    }
  }

  function init() {
    particles = [];
    let numberOfParticles = (width * height) / 9000;
    for (let i = 0; i < numberOfParticles; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    connect();
    requestAnimationFrame(animate);
  }

  function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particles.length; a++) {
      for (let b = a; b < particles.length; b++) {
        let distance =
          (particles[a].x - particles[b].x) *
            (particles[a].x - particles[b].x) +
          (particles[a].y - particles[b].y) * (particles[a].y - particles[b].y);
        if (distance < (width / 7) * (height / 7)) {
          opacityValue = 1 - distance / 20000;
          ctx.strokeStyle = `rgba(255,255,255,${opacityValue * 0.15})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  init();
  animate();
}

// --- 2. Advanced GSAP Hero Animations ---
function initHeroAnimations() {
  const tl = gsap.timeline();

  tl.to(".text-blur-reveal", {
    duration: 1.2,
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    stagger: 0.15,
    ease: "power3.out",
  })
    .to(
      ".gs-reveal",
      {
        duration: 0.8,
        autoAlpha: 1,
        opacity: 1,
        y: 0,
        stagger: 0.2,
        ease: "power2.out",
      },
      "-=0.8",
    )
    .to(
      "#hero-savings-counter",
      {
        duration: 2.5,
        innerHTML: 30,
        snap: { innerHTML: 1 },
        ease: "power3.out",
      },
      "-=1.5",
    )
    .fromTo(
      ".gs-symbol-reveal",
      { scale: 0.5, opacity: 0, autoAlpha: 0, rotationY: -45, rotationX: 20 },
      {
        duration: 1.5,
        scale: 1,
        opacity: 1,
        autoAlpha: 1,
        rotationY: 0,
        rotationX: 0,
        ease: "elastic.out(1, 0.5)",
      },
      "-=0.5",
    )
    .fromTo(
      ".gs-float-1",
      { scale: 0, autoAlpha: 0 },
      { duration: 0.6, scale: 1, autoAlpha: 1, ease: "back.out(1.5)" },
      "-=1",
    )
    .fromTo(
      ".gs-float-2",
      { scale: 0, autoAlpha: 0 },
      { duration: 0.6, scale: 1, autoAlpha: 1, ease: "back.out(1.5)" },
      "-=0.8",
    )
    .fromTo(
      ".gs-float-3",
      { scale: 0, autoAlpha: 0 },
      { duration: 0.6, scale: 1, autoAlpha: 1, ease: "back.out(1.5)" },
      "-=0.6",
    );

  // Continuous 3D tilt effects based on mouse movement for the symbol container
  const symbolContainer = document.querySelector(".xertica-symbol-container");
  if (symbolContainer) {
    window.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20; // max rotation degrees
      const y = (e.clientY / window.innerHeight - 0.5) * -20;

      gsap.to(symbolContainer, {
        duration: 1,
        rotationY: x,
        rotationX: y,
        ease: "power2.out",
      });
    });
  }

  // Add interactive click animations to the orbit tech nodes
  const techNodes = document.querySelectorAll(".tech-node");
  let isExploded = false;

  techNodes.forEach((node) => {
    node.addEventListener("click", function () {
      if (isExploded) return;

      // Activate node
      if (!this.classList.contains("clicked")) {
        this.classList.add("clicked");
      }

      // GSAP bounce/wobble effect
      gsap.fromTo(
        this,
        { scale: 0.8, rotationZ: -15 },
        {
          scale: 1,
          rotationZ: 0,
          duration: 1,
          ease: "elastic.out(1.2, 0.3)",
        },
      );

      // Check if all 4 are active
      const allActive = Array.from(techNodes).every((n) =>
        n.classList.contains("clicked"),
      );
      if (allActive && !isExploded) {
        isExploded = true;
        triggerEasterEggExplosion();
      }
    });
  });

  function triggerEasterEggExplosion() {
    const tl = gsap.timeline();

    // 1. Black Hole Implosion (Charge Up)
    tl.to(".xertica-main-symbol", {
      duration: 1.5,
      scale: 0.1,
      rotation: 1440,
      filter:
        "brightness(5) hue-rotate(90deg) drop-shadow(0 0 100px rgba(0, 255, 255, 1))",
      ease: "power4.in",
    })
      .to(
        ".glow-ring",
        {
          duration: 1.2,
          scale: 0,
          opacity: 1,
          rotation: -720,
          ease: "power4.in",
        },
        "-=1.5",
      )
      .to(
        ".orbit-node",
        {
          duration: 1,
          scale: 0.2,
          x: 0,
          y: 0,
          z: 0,
          rotationX: 360,
          rotationY: 360,
          opacity: 0,
          ease: "power3.in",
        },
        "-=1.2",
      )

      // 2. SUPERNOVA EXPLOSION!
      .to(".xertica-main-symbol", {
        duration: 0.8,
        scale: 25,
        opacity: 0,
        rotation: 2880,
        filter: "brightness(20) contrast(5) hue-rotate(360deg) blur(20px)",
        ease: "expo.out",
      })
      .to(
        ".glow-ring",
        {
          duration: 1,
          scale: 8,
          opacity: 0,
          stagger: 0.1,
          borderWidth: "10px",
          filter: "brightness(5)",
          ease: "power2.out",
        },
        "-=0.8",
      )
      .to(
        ".orbit-node",
        {
          duration: 1.5,
          scale: 2,
          x: "random(-1500, 1500)",
          y: "random(-1500, 1500)",
          z: "random(-1000, 1000)",
          rotationX: "random(-1440, 1440)",
          rotationY: "random(-1440, 1440)",
          rotationZ: "random(-1440, 1440)",
          opacity: 0,
          ease: "expo.out",
        },
        "-=0.8",
      )

      // 3. Calm down, then Rebirth (fade back in)
      .to(
        [".xertica-main-symbol", ".glow-ring", ".orbit-node"],
        {
          duration: 3,
          scale: 1,
          opacity: 1,
          autoAlpha: 1,
          x: 0,
          y: 0,
          z: 0,
          rotation: 0,
          rotationX: 0,
          rotationY: 0,
          rotationZ: 0,
          filter:
            "brightness(1) blur(0px) hue-rotate(0deg) drop-shadow(0 0 30px rgba(250, 243, 56, 0.4))",
          ease: "power3.inOut",
          onComplete: () => {
            // Remove clicked classes
            techNodes.forEach((n) => n.classList.remove("clicked"));
            // Clear inline GSAP styles but PRESERVE visibility/opacity to avoid gs-float bugs
            gsap.set(".orbit-node", { clearProps: "transform,filter" });
            gsap.set(".xertica-main-symbol", { clearProps: "all" });
            gsap.set(".glow-ring", { clearProps: "all" });
            isExploded = false;
          },
        },
        "+=1.5",
      );
  }
}

// --- 3. Scroll-Linked Orbital Satellites ---
function initRoadmapAnimations() {
  const orbit = document.getElementById("satellitesOrbit");
  const nodes = document.querySelectorAll(".satellite-node");
  const wrappers = document.querySelectorAll(".sat-content-wrapper");

  if (!orbit) return;

  // Pin the section and rotate the orbit based on scroll progress
  // The orbit will rotate -270 degrees in total, while the items counter-rotate +270 to stay upright
  gsap.to(orbit, {
    scrollTrigger: {
      trigger: "#orbitalSection",
      start: "top top",
      end: "+=2000", // Scroll 2000px to complete the orbit
      scrub: 1, // Smooth scrubbing
      pin: true,
    },
    rotationY: -270,
    ease: "none",
  });

  // Counter-rotate the wrappers so they always face forward (0deg relative to screen)
  nodes.forEach((node, index) => {
    const wrapper = node.querySelector(".sat-content-wrapper");
    const initialAngle = -(index * 90);

    // Set initial angle to cancel out the parent's base rotation
    gsap.set(wrapper, { rotationY: initialAngle });

    // As orbit goes to -270, wrapper must go to initialAngle + 270
    gsap.to(wrapper, {
      scrollTrigger: {
        trigger: "#orbitalSection",
        start: "top top",
        end: "+=2000",
        scrub: 1,
      },
      rotationY: initialAngle + 270,
      ease: "none",
    });
  });

  // Click Interaction for Nodes
  nodes.forEach((node) => {
    node.addEventListener("click", (e) => {
      // Prevent event from bubbling up and potentially causing issues
      e.stopPropagation();

      const isActive = node.classList.contains("active");
      const info = node.querySelector(".sat-info p");

      if (isActive) {
        // If it's already active, just close it
        node.classList.remove("active");
        gsap.to(info, {
          height: 0,
          opacity: 0,
          marginTop: 0,
          duration: 0.3,
          onComplete: () => (info.style.display = "none"),
        });
      } else {
        // If it's not active, close ALL others first
        nodes.forEach((n) => {
          if (n.classList.contains("active")) {
            n.classList.remove("active");
            const p = n.querySelector(".sat-info p");
            gsap.to(p, {
              height: 0,
              opacity: 0,
              marginTop: 0,
              duration: 0.3,
              onComplete: () => (p.style.display = "none"),
            });
          }
        });

        // Then open the clicked one
        node.classList.add("active");
        info.style.display = "block";
        // Reset height to auto to measure, then animate
        gsap.set(info, { height: "auto" });
        const targetHeight = info.offsetHeight;
        gsap.fromTo(
          info,
          { height: 0, opacity: 0, marginTop: 0 },
          {
            height: targetHeight,
            opacity: 1,
            marginTop: 15,
            duration: 0.4,
            ease: "power2.out",
            onComplete: () => {
              info.style.height = "auto";
            },
          },
        );
      }
    });
  });
}

// --- 4. 3D Tilt Effect on Cards ---
function init3DTiltEffects() {
  const cards = document.querySelectorAll(".main-card");

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      gsap.to(card, {
        duration: 0.5,
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 1000,
        ease: "power2.out",
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        duration: 0.8,
        rotateX: 0,
        rotateY: 0,
        ease: "elastic.out(1, 0.3)",
      });
    });
  });
}

// --- 5. Modal Logic with GSAP ---
function initModal() {
  const modal = document.getElementById("assessmentModal");
  const openBtns = document.querySelectorAll(
    "#assessmentBtn, #headerAssessmentBtn",
  );
  const closeBtn = document.getElementById("closeModalBtn");
  const form = document.getElementById("assessmentForm");

  const heroBtn = document.getElementById("assessmentBtn");
  const headerBtn = document.getElementById("headerAssessmentBtn");

  const openModalDirectly = () => {
    modal.style.display = "flex";
    setTimeout(() => {
      modal.classList.add("active");
    }, 10);
  };

  if (headerBtn) {
    headerBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModalDirectly();
    });
  }

  if (heroBtn) {
    heroBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // 1. Convert to Rocket
      const originalWidth = heroBtn.offsetWidth;
      const originalHTML = heroBtn.innerHTML;

      heroBtn.style.width = originalWidth + "px"; // Fix width for transition
      heroBtn.innerHTML =
        '<span class="material-symbols-outlined">rocket_launch</span>';
      heroBtn.classList.add("btn-rocket-mode");

      // Find target (Xertica symbol)
      const target = document.querySelector(".xertica-main-symbol");
      const targetRect = target.getBoundingClientRect();
      const btnRect = heroBtn.getBoundingClientRect();

      const destX =
        targetRect.left +
        targetRect.width / 2 -
        (btnRect.left + btnRect.width / 2);
      const destY =
        targetRect.top +
        targetRect.height / 2 -
        (btnRect.top + btnRect.height / 2);

      // Calculate angle in degrees
      // rocket_launch icon natively points to the top-right (approx -45 degrees from X axis in math terms, or 315 deg)
      // atan2 returns angle from X axis.
      let angleRad = Math.atan2(destY, destX);
      let angleDeg = angleRad * (180 / Math.PI);

      // The icon's nose is at -45deg. We add 45 to align it.
      let finalRotation = angleDeg + 45;

      const tl = gsap.timeline({
        onComplete: () => {
          // Explode/Flash effect on target
          gsap.to(target, {
            scale: 1.5,
            filter: "drop-shadow(0 0 100px rgba(250,243,56,1))",
            duration: 0.2,
            yoyo: true,
            repeat: 1,
          });

          // Open Modal
          setTimeout(openModalDirectly, 300);

          // Reset button silently after modal opens
          setTimeout(() => {
            heroBtn.classList.remove("btn-rocket-mode");
            heroBtn.style = "";
            heroBtn.innerHTML = originalHTML;
            gsap.set(heroBtn, { x: 0, y: 0, rotation: 0, scale: 1 });
          }, 1000);
        },
      });

      // 2. Shake and prepare (rotate to the correct angle)
      tl.to(heroBtn, {
        x: 2,
        y: -2,
        rotation: 5,
        duration: 0.1,
        yoyo: true,
        repeat: 5,
      }).to(heroBtn, {
        rotation: finalRotation,
        scale: 1.2,
        duration: 0.4,
        ease: "back.out(1.5)",
      });

      // 3. Smoke generation interval
      let smokeInterval = setInterval(() => {
        const smoke = document.createElement("div");
        smoke.classList.add("smoke-particle");
        heroBtn.appendChild(smoke);

        gsap.to(smoke, {
          y: 40 + Math.random() * 20,
          x: (Math.random() - 0.5) * 40,
          scale: Math.random() * 2 + 1,
          opacity: 0.8,
          duration: 0.6 + Math.random() * 0.4,
          onComplete: () => smoke.remove(),
        });
        gsap.to(smoke, { opacity: 0, duration: 0.4, delay: 0.4 });
      }, 50);

      // 4. Launch!
      tl.to(
        heroBtn,
        {
          x: destX,
          y: destY,
          scale: 0.5,
          duration: 1.2,
          ease: "power2.in",
          onComplete: () => clearInterval(smokeInterval),
        },
        "+=0.2",
      );
    });
  }

  const closeModal = () => {
    modal.classList.remove("active");
    setTimeout(() => {
      modal.style.display = "none";
    }, 400);
  };

  closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.innerHTML =
      '<span class="material-symbols-outlined spin">sync</span> Procesando...';
    submitBtn.style.opacity = "0.8";
    submitBtn.disabled = true;

    // Extract Form Data for CRM
    const leadName =
      document.getElementById("name")?.value.trim() || "Prospecto";
    const leadEmpresa =
      document.getElementById("empresa")?.value.trim() || "Empresa Privada";
    const leadCargo =
      document.getElementById("cargo")?.value.trim() || "Ejecutivo TI";
    const leadPaisCode = document.getElementById("pais")?.value || "mx";
    const leadTelefono =
      document.getElementById("telefono")?.value.trim() || "";
    const leadEmail =
      document.getElementById("email")?.value.trim() || "prospecto@empresa.com";

    const countryMap = {
      co: "Colombia 🇨🇴",
      mx: "México 🇲🇽",
      pe: "Perú 🇵🇪",
      cl: "Chile 🇨🇱",
      ec: "Ecuador 🇪🇨",
      ar: "Argentina 🇦🇷",
      br: "Brasil 🇧🇷",
    };

    const countryName = countryMap[leadPaisCode] || "América Latina 🌐";

    // Data structure for both DB and Email
    const emailData = {
      name: leadName,
      empresa: leadEmpresa,
      cargo: leadCargo,
      pais: countryName,
      telefono: leadTelefono,
      email: leadEmail,
    };

    const newLead = {
      ...emailData,
      source: "Formulario Assessment Landing",
      status: "Nuevo",
      stage: "Nuevos Leads",
      estimatedValue: 18500,
      dateStr: new Date().toLocaleString("es-MX"),
      location:
        typeof currentSession !== "undefined" && currentSession.location
          ? currentSession.location
          : countryName,
      ipProvider:
        typeof currentSession !== "undefined" && currentSession.ipProvider
          ? currentSession.ipProvider
          : "Red Corporativa",
      device:
        typeof currentSession !== "undefined" && currentSession.deviceBrowser
          ? currentSession.deviceBrowser
          : "Desktop • Chrome",
      notes: [
        "Lead recibido a través del formulario de Assessment en la Landing Page.",
      ],
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Send Email Notification via Formspree
      // We use fetch directly to avoid needing extra libraries
      await fetch("https://formspree.io/f/xyzyorqw", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: `🚀 Nuevo Lead MSP: ${leadName} de ${leadEmpresa}`,
          ...emailData,
        }),
      }).catch((e) => console.warn("Email notice issue", e));

      // 2. Save to Firebase Firestore CRM
      await addDoc(collection(db, "crm_leads"), newLead);

      // 3. Fallback Save to LocalStorage just in case
      let existingLeads = JSON.parse(
        localStorage.getItem("xertica_msp_leads") || "[]",
      );
      existingLeads.unshift({ ...newLead, id: "lead-" + Date.now() });
      localStorage.setItem("xertica_msp_leads", JSON.stringify(existingLeads));

      // Success UI
      submitBtn.innerHTML =
        '<span class="material-symbols-outlined">check_circle</span> Assessment Solicitado';
      submitBtn.style.background = "var(--xe-green)";
      submitBtn.style.color = "#FFF";
      submitBtn.style.boxShadow = "0 0 20px rgba(46, 139, 90, 0.4)";

      setTimeout(() => {
        closeModal();
        form.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.style = "";
        submitBtn.disabled = false;
      }, 2000);
    } catch (error) {
      console.error("Error saving lead:", error);
      submitBtn.innerHTML =
        '<span class="material-symbols-outlined">error</span> Error al enviar';
      submitBtn.style.background = "#ef4444";
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style = "";
        submitBtn.disabled = false;
      }, 2500);
    }
  });

  // 6. Initialize Telemetry & Hidden Lock Dashboard
  initTelemetrySystem();
}

// --- 6. Zero-Friction Telemetry & Hidden Lock Dashboard ---
function initTelemetrySystem() {
  const lockBtn = document.getElementById("telemetryLockBtn");
  const teleModal = document.getElementById("telemetryModal");
  const closeTeleBtn = document.getElementById("closeTelemetryBtn");
  const refreshBtn = document.getElementById("refreshTelemetryBtn");
  const exportCsvBtn = document.getElementById("exportCsvBtn");
  const searchInput = document.getElementById("telemetrySearchInput");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  const tableBody = document.getElementById("telemetryTableBody");

  const detailModal = document.getElementById("telemetryDetailModal");
  const closeDetailBtn = document.getElementById("closeDetailBtn");

  // Admin elements
  const adminEmailInput = document.getElementById("adminEmailInput");
  const addAdminBtn = document.getElementById("addAdminBtn");
  const adminTagsList = document.getElementById("adminTagsList");

  if (!lockBtn || !teleModal) return;

  // 1. Initial Storage Setup with Default Historical Demo Sessions
  const initialSessions = [
    {
      id: "sess-1",
      userName: "Patricio Martin",
      userEmail: "patricio.martin@xertica.com",
      dateStr: "19/8/2026, 10:05:22 a.m.",
      location: "Mexico City, Mexico 🇲🇽",
      ipProvider: "Megacable Comunicaciones de Mexico, S.A. de C.V.",
      activeTimeSeconds: 626, // 10m 26s
      deviceBrowser: "Desktop • Chrome (Linux / ChromeOS)",
      resolution: "1600×1000",
      clicksCount: 33,
      stages: ["Habilitación", "optimization"],
      useCases: [
        "Navegación general en el portafolio",
        "Calculadora de Ahorros FinOps",
        "Revisión de Pilares Estratégicos",
      ],
    },
    {
      id: "sess-2",
      userName: "Invitado Corporativo",
      userEmail: "carlos.mendoza@empresa.com",
      dateStr: "19/8/2026, 09:12:05 a.m.",
      location: "Bogotá, Colombia 🇨🇴",
      ipProvider: "Claro Colombia S.A.",
      activeTimeSeconds: 840,
      deviceBrowser: "Desktop • Safari (macOS)",
      resolution: "1920×1080",
      clicksCount: 22,
      stages: ["Advisory", "Factory"],
      useCases: ["Cálculo de presupuesto $500k USD", "Solicitud de Assessment"],
    },
    {
      id: "sess-3",
      userName: "Visitante Anónimo #402",
      userEmail: "anon.user402@xertica-client.com",
      dateStr: "18/8/2026, 04:45:10 p.m.",
      location: "Santiago, Chile 🇨🇱",
      ipProvider: "Entel Chile S.A.",
      activeTimeSeconds: 410,
      deviceBrowser: "Mobile • Chrome (Android)",
      resolution: "390×844",
      clicksCount: 15,
      stages: ["Enablement"],
      useCases: ["Exploración de servicios de gestión 24/7"],
    },
  ];

  let storedSessions = JSON.parse(
    localStorage.getItem("xertica_telemetry_sessions") || "null",
  );
  if (!storedSessions) {
    storedSessions = initialSessions;
    localStorage.setItem(
      "xertica_telemetry_sessions",
      JSON.stringify(storedSessions),
    );
  }

  let authorizedAdmins = JSON.parse(
    localStorage.getItem("xertica_admins") || '["patricio.martin@xertica.com"]',
  );

  // 2. Capture Current Active Session Automatically (Zero Friction)
  const currentSessionId = "sess-active-" + Date.now();
  let currentActiveSeconds = 0;
  let currentClicks = 0;
  let currentStages = new Set(["Enablement"]);
  let currentUseCases = new Set(["Navegación general en el portafolio"]);

  const ua = navigator.userAgent;
  let isMobile = /Mobi|Android/i.test(ua);
  let deviceType = isMobile ? "Mobile" : "Desktop";
  let browserName = "Chrome";
  if (ua.includes("Firefox")) browserName = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome"))
    browserName = "Safari";
  else if (ua.includes("Edg")) browserName = "Edge";

  let osName = "Linux / ChromeOS";
  if (ua.includes("Mac")) osName = "macOS";
  else if (ua.includes("Win")) osName = "Windows";
  else if (ua.includes("Android")) osName = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) osName = "iOS";

  // 2. Auto-detect URL Parameters for Zero-Friction Visitor Identification
  const urlParams = new URLSearchParams(window.location.search);
  const urlEmpresa =
    urlParams.get("empresa") ||
    urlParams.get("cliente") ||
    urlParams.get("c") ||
    urlParams.get("utm_company");
  const urlNombre =
    urlParams.get("nombre") || urlParams.get("contacto") || urlParams.get("n");
  const urlRef =
    urlParams.get("ref") ||
    urlParams.get("utm_source") ||
    urlParams.get("source");

  let initialName = "Visitante Web";
  let initialEmail = "visitante.desconocido@red";

  if (urlEmpresa || urlNombre) {
    if (urlNombre && urlEmpresa) {
      initialName = `${urlNombre} (${urlEmpresa})`;
      initialEmail = `contacto@${urlEmpresa.toLowerCase().replace(/\s+/g, "")}.com`;
    } else if (urlEmpresa) {
      initialName = `Visitante de ${urlEmpresa}`;
      initialEmail = `enlace_personalizado@${urlEmpresa.toLowerCase().replace(/\s+/g, "")}.com`;
    } else {
      initialName = `${urlNombre} (Prospecto)`;
      initialEmail = `prospecto_url@red`;
    }
    currentUseCases.add(`Enlace Personalizado: ${urlEmpresa || urlNombre}`);
  } else if (urlRef) {
    initialName = `Visitante (vía ${urlRef})`;
    initialEmail = `origen_${urlRef}@red`;
    currentUseCases.add(`Origen de Tráfico: ${urlRef}`);
  }

  let currentSession = {
    id: currentSessionId,
    userName: initialName,
    userEmail: initialEmail,
    dateStr: new Date().toLocaleString("es-MX"),
    location: "Mexico City, Mexico 🇲🇽",
    ipProvider: "Red Local / Proveedor ISP Activo",
    activeTimeSeconds: 0,
    deviceBrowser: `${deviceType} • ${browserName} (${osName})`,
    resolution: `${window.innerWidth}×${window.innerHeight}`,
    clicksCount: 0,
    stages: Array.from(currentStages),
    useCases: Array.from(currentUseCases),
  };

  fetch("https://ipapi.co/json/")
    .then((res) => res.json())
    .then((data) => {
      if (data && data.city && data.country_name) {
        let flag =
          data.country_code === "MX"
            ? "🇲🇽"
            : data.country_code === "CO"
              ? "🇨🇴"
              : "🌐";
        currentSession.location = `${data.city}, ${data.country_name} ${flag}`;
        if (data.org) {
          currentSession.ipProvider = data.org;
          // If no custom URL parameter was provided, enrich session with ISP/Corporate Org name
          if (
            !urlEmpresa &&
            !urlNombre &&
            !urlRef &&
            currentSession.userName === "Visitante Web"
          ) {
            currentSession.userName = `Visitante (${data.org})`;
            currentSession.userEmail = `red_${data.org.toLowerCase().replace(/[^a-z0-9]/g, "")}@red`;
          }
        }
        saveAndRenderCurrentSession();
      }
    })
    .catch(() => {});

  setInterval(() => {
    currentActiveSeconds += 1;
    currentSession.activeTimeSeconds = currentActiveSeconds;
    currentSession.stages = Array.from(currentStages);
    currentSession.useCases = Array.from(currentUseCases);
    saveAndRenderCurrentSession();
  }, 1000);

  document.addEventListener("click", (e) => {
    currentClicks += 1;
    currentSession.clicksCount = currentClicks;

    if (e.target.closest("#calcSection")) {
      currentStages.add("Advisory");
      currentUseCases.add("Uso de la Calculadora de Ahorro");
    }
    if (e.target.closest("#orbitalSection")) {
      currentStages.add("Factory");
      currentUseCases.add("Interacción con Pilares Estratégicos 3D");
    }
    if (
      e.target.closest("#assessmentBtn") ||
      e.target.closest("#headerAssessmentBtn")
    ) {
      currentStages.add("Support");
      currentUseCases.add("Apertura de Solicitud de Assessment");
    }

    // Quick Tag Chip Handler (1-tap context capture)
    const cloudChip = e.target.closest(".tag-cloud-btn");
    if (cloudChip) {
      const cloud = cloudChip.getAttribute("data-cloud");
      currentUseCases.add(`Entorno Cloud: ${cloud}`);
      cloudChip.style.background = "rgba(250, 243, 56, 0.25)";
      cloudChip.style.borderColor = "var(--xe-yellow)";
      cloudChip.style.color = "#FFF";
      saveAndRenderCurrentSession();
    }

    const indChip = e.target.closest(".tag-ind-btn");
    if (indChip) {
      const ind = indChip.getAttribute("data-ind");
      currentUseCases.add(`Industria: ${ind}`);
      indChip.style.background = "rgba(250, 243, 56, 0.25)";
      indChip.style.borderColor = "var(--xe-yellow)";
      indChip.style.color = "#FFF";
      saveAndRenderCurrentSession();
    }
  });

  // Sync Assessment Form Inputs with Live Telemetry Session in Real-Time
  const nameInput = document.getElementById("name");
  const empresaInput = document.getElementById("empresa");
  const cargoInput = document.getElementById("cargo");
  const emailInput = document.getElementById("email");

  function syncFormToTelemetry() {
    const nVal = nameInput ? nameInput.value.trim() : "";
    const empVal = empresaInput ? empresaInput.value.trim() : "";
    const cargoVal = cargoInput ? cargoInput.value.trim() : "";
    const emailVal = emailInput ? emailInput.value.trim() : "";

    if (nVal || empVal) {
      let label = nVal || "Prospecto";
      if (empVal) label += ` (${cargoVal ? cargoVal + " en " : ""}${empVal})`;
      currentSession.userName = label;
    }
    if (emailVal) {
      currentSession.userEmail = emailVal;
    }
    currentStages.add("Support");
    currentUseCases.add("Escribiendo en Formulario de Assessment");
    saveAndRenderCurrentSession();
  }

  [nameInput, empresaInput, cargoInput, emailInput].forEach((inp) => {
    if (inp) {
      inp.addEventListener("input", syncFormToTelemetry);
    }
  });

  async function saveAndRenderCurrentSession() {
    let list = JSON.parse(
      localStorage.getItem("xertica_telemetry_sessions") || "[]",
    );
    const existingIdx = list.findIndex((s) => s.id === currentSessionId);
    if (existingIdx >= 0) {
      list[existingIdx] = currentSession;
    } else {
      list.unshift(currentSession);
    }
    localStorage.setItem("xertica_telemetry_sessions", JSON.stringify(list));

    // Save to Firebase
    try {
      const { collection, doc, setDoc } = await import("./firebase-config.js");
      // Use setDoc with merge:true to update existing or create new doc with our ID
      const sessionRef = doc(db, "telemetry_sessions", currentSessionId);
      await setDoc(
        sessionRef,
        { ...currentSession, updatedAt: new Date().toISOString() },
        { merge: true },
      );
    } catch (error) {
      console.error("Error syncing telemetry to Firebase:", error);
    }

    if (teleModal.classList.contains("active")) {
      renderDashboard();
    }
  }

  function renderDashboard() {
    let sessions = JSON.parse(
      localStorage.getItem("xertica_telemetry_sessions") || "[]",
    );
    const filterText = (searchInput ? searchInput.value : "").toLowerCase();

    if (filterText) {
      sessions = sessions.filter(
        (s) =>
          s.userName.toLowerCase().includes(filterText) ||
          s.userEmail.toLowerCase().includes(filterText) ||
          s.location.toLowerCase().includes(filterText) ||
          s.deviceBrowser.toLowerCase().includes(filterText),
      );
    }

    document.getElementById("statTotalVisits").textContent = sessions.length;
    document.getElementById("statUniqueUsers").textContent =
      `${Math.ceil(sessions.length * 0.4)} Usuarios Únicos`;

    let totalSeconds = sessions.reduce(
      (acc, s) => acc + (s.activeTimeSeconds || 0),
      0,
    );
    let avgSecs = sessions.length
      ? Math.round(totalSeconds / sessions.length)
      : 0;
    let mins = Math.floor(avgSecs / 60);
    let secs = avgSecs % 60;
    document.getElementById("statAvgTime").textContent = `${mins}m ${secs}s`;

    tableBody.innerHTML = "";
    sessions.forEach((s, idx) => {
      const tr = document.createElement("tr");

      let sMins = Math.floor((s.activeTimeSeconds || 0) / 60);
      let sSecs = (s.activeTimeSeconds || 0) % 60;
      let timeFormatted = `${sMins}m ${sSecs}s`;

      let stagesHtml = (s.stages || ["Habilitación"])
        .map((st) => `<span class="stage-tag">${st}</span>`)
        .join("");

      tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>
                    <span class="table-user-name">${s.userName}</span>
                    <span class="table-user-email">${s.userEmail}</span>
                </td>
                <td>${s.dateStr}</td>
                <td>${s.location}</td>
                <td><span class="time-badge"><span class="material-symbols-outlined icon-small">schedule</span> ${timeFormatted}</span></td>
                <td>${s.deviceBrowser}</td>
                <td>${stagesHtml}</td>
                <td>
                    <button class="btn-view-detail" data-id="${s.id}">Ver Detalle 🔍</button>
                </td>
            `;
      tableBody.appendChild(tr);
    });

    document.querySelectorAll(".btn-view-detail").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sid = btn.getAttribute("data-id");
        openDetailModal(sid);
      });
    });

    renderAdmins();
  }

  function renderAdmins() {
    if (!adminTagsList) return;
    adminTagsList.innerHTML = "";
    authorizedAdmins.forEach((email) => {
      const span = document.createElement("span");
      span.className = "admin-tag";
      span.innerHTML = `${email} <span class="remove-admin" data-email="${email}">×</span>`;
      adminTagsList.appendChild(span);
    });

    document.querySelectorAll(".remove-admin").forEach((rm) => {
      rm.addEventListener("click", () => {
        const targetEmail = rm.getAttribute("data-email");
        authorizedAdmins = authorizedAdmins.filter((a) => a !== targetEmail);
        localStorage.setItem(
          "xertica_admins",
          JSON.stringify(authorizedAdmins),
        );
        renderAdmins();
      });
    });
  }

  if (addAdminBtn) {
    addAdminBtn.addEventListener("click", () => {
      const val = adminEmailInput.value.trim();
      if (val && val.includes("@") && !authorizedAdmins.includes(val)) {
        authorizedAdmins.push(val);
        localStorage.setItem(
          "xertica_admins",
          JSON.stringify(authorizedAdmins),
        );
        adminEmailInput.value = "";
        renderAdmins();
      }
    });
  }

  let selectedSessionId = null;
  function openDetailModal(sid) {
    let sessions = JSON.parse(
      localStorage.getItem("xertica_telemetry_sessions") || "[]",
    );
    const s = sessions.find((item) => item.id === sid);
    if (!s) return;

    selectedSessionId = sid;
    document.getElementById("detailUserName").textContent = s.userName;
    document.getElementById("detailUserEmail").textContent = s.userEmail;

    let sMins = Math.floor((s.activeTimeSeconds || 0) / 60);
    let sSecs = (s.activeTimeSeconds || 0) % 60;
    document.getElementById("detailActiveTime").textContent =
      `${sMins} min ${sSecs} seg`;
    document.getElementById("detailGeoLoc").textContent = s.location;
    document.getElementById("detailIp").textContent = s.ipProvider;
    document.getElementById("detailDeviceBrowser").textContent =
      s.deviceBrowser;
    document.getElementById("detailResolution").textContent = s.resolution;
    document.getElementById("detailClicks").textContent =
      `${s.clicksCount || 0} acciones registradas`;

    const useCasesList = document.getElementById("detailUseCasesList");
    useCasesList.innerHTML = "";
    (s.useCases || ["Navegación general en el portafolio"]).forEach((uc) => {
      const li = document.createElement("li");
      li.textContent = uc;
      useCasesList.appendChild(li);
    });

    detailModal.classList.add("active");
  }

  if (closeDetailBtn)
    closeDetailBtn.addEventListener("click", () =>
      detailModal.classList.remove("active"),
    );

  const deleteBtn = document.getElementById("deleteSessionBtn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      if (!selectedSessionId) return;
      let sessions = JSON.parse(
        localStorage.getItem("xertica_telemetry_sessions") || "[]",
      );
      sessions = sessions.filter((s) => s.id !== selectedSessionId);
      localStorage.setItem(
        "xertica_telemetry_sessions",
        JSON.stringify(sessions),
      );
      detailModal.classList.remove("active");
      renderDashboard();
    });
  }

  if (searchInput) searchInput.addEventListener("input", renderDashboard);

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
      if (confirm("¿Deseas limpiar el historial de telemetría registrado?")) {
        localStorage.setItem(
          "xertica_telemetry_sessions",
          JSON.stringify([currentSession]),
        );
        renderDashboard();
      }
    });
  }

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", () => {
      let sessions = JSON.parse(
        localStorage.getItem("xertica_telemetry_sessions") || "[]",
      );
      let csv =
        "Usuario,Correo,Fecha,Ubicacion,Permanencia(seg),Dispositivo,Acciones\n";
      sessions.forEach((s) => {
        csv += `"${s.userName}","${s.userEmail}","${s.dateStr}","${s.location}",${s.activeTimeSeconds},"${s.deviceBrowser}",${s.clicksCount}\n`;
      });
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `telemetria_xertica_${Date.now()}.csv`;
      a.click();
    });
  }

  // Auth Password Modal Elements
  const authModal = document.getElementById("adminAuthModal");
  const closeAuthBtn = document.getElementById("closeAuthBtn");
  const authForm = document.getElementById("adminAuthForm");
  const passInput = document.getElementById("adminPasswordInput");
  const authErrorMsg = document.getElementById("authErrorMsg");

  lockBtn.addEventListener("click", () => {
    if (authModal) {
      authModal.classList.add("active");
      if (passInput) {
        passInput.value = "";
        passInput.focus();
      }
      if (authErrorMsg) authErrorMsg.style.display = "none";
    } else {
      teleModal.classList.add("active");
      renderDashboard();
    }
  });

  // Initial Login Logs Setup
  const initialLoginLogs = [
    {
      dateStr: "19/8/2026, 10:05:22 a.m.",
      userName: "Patricio Martin",
      userEmail: "patricio.martin@xertica.com",
      status: "Éxito",
      keyTyped: "Eirs2026.",
      location: "Mexico City, Mexico 🇲🇽",
      ipProvider: "Xertica Cloud Inc.",
      device: "Desktop • Chrome (Linux / ChromeOS)",
    },
  ];

  let adminLoginLogs = JSON.parse(
    localStorage.getItem("xertica_admin_login_logs") || "null",
  );
  if (!adminLoginLogs) {
    adminLoginLogs = initialLoginLogs;
    localStorage.setItem(
      "xertica_admin_login_logs",
      JSON.stringify(adminLoginLogs),
    );
  }

  async function recordLoginAttempt(success, keyEntered, uName, uEmail) {
    let logs = JSON.parse(
      localStorage.getItem("xertica_admin_login_logs") || "[]",
    );

    const newLog = {
      dateStr: new Date().toLocaleString("es-MX"),
      userName: uName || "Patricio Martin",
      userEmail: uEmail || "patricio.martin@xertica.com",
      status: success ? "Éxito" : "Intento Fallido",
      keyTyped: keyEntered ? (success ? "Eirs2026." : "••••••••") : "(vacío)",
      location: currentSession.location || "Mexico City, Mexico 🇲🇽",
      ipProvider: currentSession.ipProvider || "Desconocido / ISP Privado",
      device: currentSession.deviceBrowser || "Desktop • Chrome",
    };

    logs.unshift(newLog);
    localStorage.setItem("xertica_admin_login_logs", JSON.stringify(logs));

    // Save to Firebase
    try {
      const { collection, addDoc } = await import("./firebase-config.js");
      await addDoc(collection(db, "telemetry_admin_logins"), {
        ...newLog,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error saving admin login to Firebase:", error);
    }
  }

  function renderAdminLoginLogs() {
    const loginsTableBody = document.getElementById("adminLoginsTableBody");
    if (!loginsTableBody) return;

    let logs = JSON.parse(
      localStorage.getItem("xertica_admin_login_logs") || "[]",
    );
    loginsTableBody.innerHTML = "";

    if (logs.length === 0) {
      loginsTableBody.innerHTML =
        '<tr><td colspan="5" style="text-align:center; color:#666;">No hay inicios de sesión registrados.</td></tr>';
      return;
    }

    logs.forEach((log, index) => {
      const tr = document.createElement("tr");
      const isSuccess = log.status === "Éxito";
      const badgeClass = isSuccess ? "live-badge" : "time-badge";
      const badgeStyle = isSuccess
        ? "background: rgba(46, 139, 90, 0.2); color: #4ade80; border: 1px solid rgba(46, 139, 90, 0.4);"
        : "background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4);";

      tr.innerHTML = `
                <td>${log.dateStr}</td>
                <td><strong>${log.userName || "Patricio Martin"}</strong><br><span style="font-size: 0.85em; color: rgba(255,255,255,0.5);">${log.userEmail || "patricio.martin@xertica.com"}</span></td>
                <td><span class="${badgeClass}" style="${badgeStyle}">${isSuccess ? "✅ Acceso Concedido" : "❌ Clave Incorrecta"}</span></td>
                <td><code>${log.keyTyped}</code></td>
                <td>${log.location}<br><span style="font-size: 0.85em; color: rgba(255,255,255,0.5);">${log.ipProvider || "Desconocido"}</span></td>
                <td>${log.device}</td>
                <td style="text-align:center;">
                    <button class="btn-delete-log" data-index="${index}" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 5px; z-index: 10;" title="Eliminar este ingreso">
                        <span class="material-symbols-outlined" style="font-size: 20px;">delete</span>
                    </button>
                </td>
            `;

      tr.style.cursor = "pointer";
      tr.addEventListener("click", (e) => {
        if (e.target.closest(".btn-delete-log")) return; // Ignore if delete button is clicked

        const detailModal = document.getElementById("adminLoginDetailModal");
        if (detailModal) {
          document.getElementById("adminLoginDetailStatus").innerHTML =
            isSuccess ? "✅ Acceso Concedido" : "❌ Intento Fallido";
          document.getElementById("adminLoginDetailStatus").style.color =
            isSuccess ? "#4ade80" : "#f87171";
          const userElem = document.getElementById("adminLoginDetailUser");
          if (userElem)
            userElem.textContent = `${log.userName || "Patricio Martin"} (${log.userEmail || "patricio.martin@xertica.com"})`;
          document.getElementById("adminLoginDetailDate").textContent =
            log.dateStr;
          document.getElementById("adminLoginDetailKey").textContent =
            log.keyTyped;
          document.getElementById("adminLoginDetailGeoLoc").textContent =
            log.location;
          document.getElementById("adminLoginDetailIp").textContent =
            log.ipProvider || "Desconocido";
          document.getElementById("adminLoginDetailDevice").textContent =
            log.device;

          detailModal.classList.add("active");
        }
      });

      loginsTableBody.appendChild(tr);
    });

    // Add event listeners for delete buttons
    document.querySelectorAll(".btn-delete-log").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = e.currentTarget.getAttribute("data-index");
        logs.splice(idx, 1);
        localStorage.setItem("xertica_admin_login_logs", JSON.stringify(logs));
        renderAdminLoginLogs();
      });
    });
  }

  const closeAdminLoginDetailBtn = document.getElementById(
    "closeAdminLoginDetailBtn",
  );
  if (closeAdminLoginDetailBtn) {
    closeAdminLoginDetailBtn.addEventListener("click", () => {
      const detailModal = document.getElementById("adminLoginDetailModal");
      if (detailModal) detailModal.classList.remove("active");
    });
  }

  if (closeAuthBtn) {
    closeAuthBtn.addEventListener("click", () => {
      if (authModal) authModal.classList.remove("active");
    });
  }

  if (authForm) {
    authForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = passInput.value.trim();

      if (val === "Eirs2026.") {
        sessionStorage.setItem("isAdminAuth", "true");
        recordLoginAttempt(
          true,
          val,
          "Patricio Martin",
          "patricio.martin@xertica.com",
        );
        if (authErrorMsg) authErrorMsg.style.display = "none";
        authModal.classList.remove("active");

        const portalSelectionModal = document.getElementById(
          "adminPortalSelectionModal",
        );
        if (portalSelectionModal) {
          portalSelectionModal.classList.add("active");
        } else {
          // Fallback just in case
          teleModal.classList.add("active");
          renderDashboard();
        }
      } else {
        recordLoginAttempt(false, val, "Desconocido", "desconocido@red");
        if (authErrorMsg) authErrorMsg.style.display = "block";
        if (passInput) {
          passInput.style.borderColor = "#ef4444";
          setTimeout(() => {
            passInput.style.borderColor = "";
          }, 1500);
        }
      }
    });
  }

  // Portal Selection Logic
  const portalSelectionModal = document.getElementById(
    "adminPortalSelectionModal",
  );
  const closePortalSelectionBtn = document.getElementById(
    "closePortalSelectionBtn",
  );
  const btnGoTelemetry = document.getElementById("btnGoTelemetry");
  const btnGoCrm = document.getElementById("btnGoCrm");

  if (closePortalSelectionBtn) {
    closePortalSelectionBtn.addEventListener("click", () => {
      if (portalSelectionModal) portalSelectionModal.classList.remove("active");
    });
  }

  if (btnGoTelemetry) {
    btnGoTelemetry.addEventListener("click", () => {
      if (portalSelectionModal) portalSelectionModal.classList.remove("active");
      teleModal.classList.add("active");
      renderDashboard();
    });
  }

  if (btnGoCrm) {
    btnGoCrm.addEventListener("click", () => {
      if (portalSelectionModal) portalSelectionModal.classList.remove("active");
      const crmModal = document.getElementById("crmModal");
      if (crmModal) crmModal.classList.add("active");
    });
  }

  // Also link renderAdminLoginLogs inside renderDashboard
  const oldRenderDashboard = renderDashboard;
  renderDashboard = function () {
    oldRenderDashboard();
    renderAdminLoginLogs();
  };

  if (closeTeleBtn)
    closeTeleBtn.addEventListener("click", () =>
      teleModal.classList.remove("active"),
    );
  if (refreshBtn) refreshBtn.addEventListener("click", renderDashboard);

  teleModal.addEventListener("click", (e) => {
    if (e.target === teleModal) teleModal.classList.remove("active");
  });

  // Auto-open logic for cross-navigation from CRM
  const adminUrlParams = new URLSearchParams(window.location.search);
  if (adminUrlParams.get("admin") === "telemetry") {
    if (sessionStorage.getItem("isAdminAuth") === "true") {
      teleModal.classList.add("active");
      renderDashboard();

      // Clean up the URL so it doesn't stay there forever
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
}
