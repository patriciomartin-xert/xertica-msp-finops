// GSAP Registration
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

document.addEventListener('DOMContentLoaded', () => {
    initCanvasBackground();
    initHeroAnimations();
    initRoadmapAnimations();
    init3DTiltEffects();
    initModal();
});

// --- 1. Interactive Canvas Background (Node Network) ---
function initCanvasBackground() {
    const canvas = document.getElementById('heroCanvas');
    const ctx = canvas.getContext('2d');
    let width, height, particles = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    const mouse = { x: null, y: null, radius: 150 };
    window.addEventListener('mousemove', (e) => {
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
            this.density = (Math.random() * 20) + 1;
            this.color = Math.random() > 0.5 ? 'rgba(24, 153, 175, 0.85)' : 'rgba(196, 91, 170, 0.85)';
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
                let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
                             + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                if (distance < (width/7) * (height/7)) {
                    opacityValue = 1 - (distance / 20000);
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
        ease: "power3.out"
    })
    .to(".gs-reveal", {
        duration: 0.8,
        autoAlpha: 1,
        opacity: 1,
        y: 0,
        stagger: 0.2,
        ease: "power2.out"
    }, "-=0.8")
    .to("#hero-savings-counter", {
        duration: 2.5,
        innerHTML: 30,
        snap: { innerHTML: 1 },
        ease: "power3.out"
    }, "-=1.5")
    .fromTo(".gs-symbol-reveal", 
        { scale: 0.5, opacity: 0, autoAlpha: 0, rotationY: -45, rotationX: 20 },
        { duration: 1.5, scale: 1, opacity: 1, autoAlpha: 1, rotationY: 0, rotationX: 0, ease: "elastic.out(1, 0.5)" },
        "-=0.5"
    )
    .fromTo(".gs-float-1",
        { scale: 0, opacity: 0 },
        { duration: 0.6, scale: 1, opacity: 1, ease: "back.out(1.5)" },
        "-=1"
    )
    .fromTo(".gs-float-2",
        { scale: 0, opacity: 0 },
        { duration: 0.6, scale: 1, opacity: 1, ease: "back.out(1.5)" },
        "-=0.8"
    )
    .fromTo(".gs-float-3",
        { scale: 0, opacity: 0 },
        { duration: 0.6, scale: 1, opacity: 1, ease: "back.out(1.5)" },
        "-=0.6"
    )
    .fromTo(".gs-float-4",
        { scale: 0, opacity: 0 },
        { duration: 0.6, scale: 1, opacity: 1, ease: "back.out(1.5)" },
        "-=0.4"
    );

    // Continuous 3D tilt effects based on mouse movement for the symbol container
    const symbolContainer = document.querySelector('.xertica-symbol-container');
    if (symbolContainer) {
        window.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20; // max rotation degrees
            const y = (e.clientY / window.innerHeight - 0.5) * -20;

            gsap.to(symbolContainer, {
                duration: 1,
                rotationY: x,
                rotationX: y,
                ease: "power2.out"
            });
        });
    }
}

// --- 3. Scroll-Linked Orbital Satellites ---
function initRoadmapAnimations() {
    const orbit = document.getElementById('satellitesOrbit');
    const nodes = document.querySelectorAll('.satellite-node');
    const wrappers = document.querySelectorAll('.sat-content-wrapper');

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
        ease: "none"
    });

    // Counter-rotate the wrappers so they always face forward (0deg relative to screen)
    nodes.forEach((node, index) => {
        const wrapper = node.querySelector('.sat-content-wrapper');
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
            ease: "none"
        });
    });

    // Click Interaction for Nodes
    nodes.forEach(node => {
        node.addEventListener('click', (e) => {
            // Prevent event from bubbling up and potentially causing issues
            e.stopPropagation();
            
            const isActive = node.classList.contains('active');
            const info = node.querySelector('.sat-info p');
            
            if (isActive) {
                // If it's already active, just close it
                node.classList.remove('active');
                gsap.to(info, { height: 0, opacity: 0, marginTop: 0, duration: 0.3, onComplete: () => info.style.display = 'none' });
            } else {
                // If it's not active, close ALL others first
                nodes.forEach(n => {
                    if (n.classList.contains('active')) {
                        n.classList.remove('active');
                        const p = n.querySelector('.sat-info p');
                        gsap.to(p, { height: 0, opacity: 0, marginTop: 0, duration: 0.3, onComplete: () => p.style.display = 'none' });
                    }
                });

                // Then open the clicked one
                node.classList.add('active');
                info.style.display = 'block';
                // Reset height to auto to measure, then animate
                gsap.set(info, { height: "auto" });
                const targetHeight = info.offsetHeight;
                gsap.fromTo(info,
                    { height: 0, opacity: 0, marginTop: 0 },
                    { height: targetHeight, opacity: 1, marginTop: 15, duration: 0.4, ease: "power2.out", onComplete: () => { info.style.height = "auto"; } }
                );
            }
        });
    });
}

// --- 4. 3D Tilt Effect on Cards ---
function init3DTiltEffects() {
    const cards = document.querySelectorAll('.main-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
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
                ease: "power2.out"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                duration: 0.8,
                rotateX: 0,
                rotateY: 0,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });
}

// --- 5. Modal Logic with GSAP ---
function initModal() {
    const modal = document.getElementById('assessmentModal');
    const openBtns = document.querySelectorAll('#assessmentBtn, #headerAssessmentBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('assessmentForm');

    const heroBtn = document.getElementById('assessmentBtn');
    const headerBtn = document.getElementById('headerAssessmentBtn');

    const openModalDirectly = () => {
        modal.style.display = 'flex';
        setTimeout(() => { modal.classList.add('active'); }, 10);
    };

    if(headerBtn) {
        headerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModalDirectly();
        });
    }

    if(heroBtn) {
        heroBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 1. Convert to Rocket
            const originalWidth = heroBtn.offsetWidth;
            const originalHTML = heroBtn.innerHTML;
            
            heroBtn.style.width = originalWidth + 'px'; // Fix width for transition
            heroBtn.innerHTML = '<span class="material-symbols-outlined">rocket_launch</span>';
            heroBtn.classList.add('btn-rocket-mode');
            
            // Find target (Xertica symbol)
            const target = document.querySelector('.xertica-main-symbol');
            const targetRect = target.getBoundingClientRect();
            const btnRect = heroBtn.getBoundingClientRect();
            
            const destX = (targetRect.left + targetRect.width / 2) - (btnRect.left + btnRect.width / 2);
            const destY = (targetRect.top + targetRect.height / 2) - (btnRect.top + btnRect.height / 2);

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
                    gsap.to(target, { scale: 1.5, filter: "drop-shadow(0 0 100px rgba(250,243,56,1))", duration: 0.2, yoyo: true, repeat: 1 });
                    
                    // Open Modal
                    setTimeout(openModalDirectly, 300);

                    // Reset button silently after modal opens
                    setTimeout(() => {
                        heroBtn.classList.remove('btn-rocket-mode');
                        heroBtn.style = '';
                        heroBtn.innerHTML = originalHTML;
                        gsap.set(heroBtn, { x: 0, y: 0, rotation: 0, scale: 1 });
                    }, 1000);
                }
            });

            // 2. Shake and prepare (rotate to the correct angle)
            tl.to(heroBtn, { x: 2, y: -2, rotation: 5, duration: 0.1, yoyo: true, repeat: 5 })
              .to(heroBtn, { rotation: finalRotation, scale: 1.2, duration: 0.4, ease: "back.out(1.5)" });

            // 3. Smoke generation interval
            let smokeInterval = setInterval(() => {
                const smoke = document.createElement('div');
                smoke.classList.add('smoke-particle');
                heroBtn.appendChild(smoke);
                
                gsap.to(smoke, {
                    y: 40 + Math.random() * 20,
                    x: (Math.random() - 0.5) * 40,
                    scale: Math.random() * 2 + 1,
                    opacity: 0.8,
                    duration: 0.6 + Math.random() * 0.4,
                    onComplete: () => smoke.remove()
                });
                gsap.to(smoke, { opacity: 0, duration: 0.4, delay: 0.4 });
            }, 50);

            // 4. Launch!
            tl.to(heroBtn, {
                x: destX,
                y: destY,
                scale: 0.5,
                duration: 1.2,
                ease: "power2.in",
                onComplete: () => clearInterval(smokeInterval)
            }, "+=0.2");
        });
    }

    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 400);
    };

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<span class="material-symbols-outlined spin">sync</span> Procesando...';
        submitBtn.style.opacity = '0.8';
        submitBtn.disabled = true;

        setTimeout(() => {
            submitBtn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Assessment Solicitado';
            submitBtn.style.background = 'var(--xe-green)';
            submitBtn.style.color = '#FFF';
            submitBtn.style.boxShadow = '0 0 20px rgba(46, 139, 90, 0.4)';
            
            setTimeout(() => {
                closeModal();
                form.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.style = '';
                submitBtn.disabled = false;
            }, 2000);
        }, 1500);
    });

    // 6. Initialize Telemetry & Hidden Lock Dashboard
    initTelemetrySystem();
}

// --- 6. Zero-Friction Telemetry & Hidden Lock Dashboard ---
function initTelemetrySystem() {
    const lockBtn = document.getElementById('telemetryLockBtn');
    const teleModal = document.getElementById('telemetryModal');
    const closeTeleBtn = document.getElementById('closeTelemetryBtn');
    const refreshBtn = document.getElementById('refreshTelemetryBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const searchInput = document.getElementById('telemetrySearchInput');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const tableBody = document.getElementById('telemetryTableBody');

    const detailModal = document.getElementById('telemetryDetailModal');
    const closeDetailBtn = document.getElementById('closeDetailBtn');

    // Admin elements
    const adminEmailInput = document.getElementById('adminEmailInput');
    const addAdminBtn = document.getElementById('addAdminBtn');
    const adminTagsList = document.getElementById('adminTagsList');

    if (!lockBtn || !teleModal) return;

    // 1. Initial Storage Setup with Default Historical Demo Sessions
    const initialSessions = [
        {
            id: 'sess-1',
            userName: 'Patricio Martin',
            userEmail: 'patricio.martin@xertica.com',
            dateStr: '19/8/2026, 10:05:22 a.m.',
            location: 'Mexico City, Mexico 🇲🇽',
            ipProvider: 'Megacable Comunicaciones de Mexico, S.A. de C.V.',
            activeTimeSeconds: 626, // 10m 26s
            deviceBrowser: 'Desktop • Chrome (Linux / ChromeOS)',
            resolution: '1600×1000',
            clicksCount: 33,
            stages: ['Habilitación', 'optimization'],
            useCases: ['Navegación general en el portafolio', 'Calculadora de Ahorros FinOps', 'Revisión de Pilares Estratégicos']
        },
        {
            id: 'sess-2',
            userName: 'Invitado Corporativo',
            userEmail: 'carlos.mendoza@empresa.com',
            dateStr: '19/8/2026, 09:12:05 a.m.',
            location: 'Bogotá, Colombia 🇨🇴',
            ipProvider: 'Claro Colombia S.A.',
            activeTimeSeconds: 840,
            deviceBrowser: 'Desktop • Safari (macOS)',
            resolution: '1920×1080',
            clicksCount: 22,
            stages: ['Advisory', 'Factory'],
            useCases: ['Cálculo de presupuesto $500k USD', 'Solicitud de Assessment']
        },
        {
            id: 'sess-3',
            userName: 'Visitante Anónimo #402',
            userEmail: 'anon.user402@xertica-client.com',
            dateStr: '18/8/2026, 04:45:10 p.m.',
            location: 'Santiago, Chile 🇨🇱',
            ipProvider: 'Entel Chile S.A.',
            activeTimeSeconds: 410,
            deviceBrowser: 'Mobile • Chrome (Android)',
            resolution: '390×844',
            clicksCount: 15,
            stages: ['Enablement'],
            useCases: ['Exploración de servicios de gestión 24/7']
        }
    ];

    let storedSessions = JSON.parse(localStorage.getItem('xertica_telemetry_sessions') || 'null');
    if (!storedSessions) {
        storedSessions = initialSessions;
        localStorage.setItem('xertica_telemetry_sessions', JSON.stringify(storedSessions));
    }

    let authorizedAdmins = JSON.parse(localStorage.getItem('xertica_admins') || '["patricio.martin@xertica.com"]');

    // 2. Capture Current Active Session Automatically (Zero Friction)
    const currentSessionId = 'sess-active-' + Date.now();
    let currentActiveSeconds = 0;
    let currentClicks = 0;
    let currentStages = new Set(['Enablement']);
    let currentUseCases = new Set(['Navegación general en el portafolio']);

    const ua = navigator.userAgent;
    let isMobile = /Mobi|Android/i.test(ua);
    let deviceType = isMobile ? 'Mobile' : 'Desktop';
    let browserName = 'Chrome';
    if (ua.includes('Firefox')) browserName = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browserName = 'Safari';
    else if (ua.includes('Edg')) browserName = 'Edge';

    let osName = 'Linux / ChromeOS';
    if (ua.includes('Mac')) osName = 'macOS';
    else if (ua.includes('Win')) osName = 'Windows';
    else if (ua.includes('Android')) osName = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) osName = 'iOS';

    let currentSession = {
        id: currentSessionId,
        userName: 'Sesión Actual (En Vivo)',
        userEmail: 'visitante.actual@xertica.com',
        dateStr: new Date().toLocaleString('es-MX'),
        location: 'Mexico City, Mexico 🇲🇽',
        ipProvider: 'Red Local / Proveedor ISP Activo',
        activeTimeSeconds: 0,
        deviceBrowser: `${deviceType} • ${browserName} (${osName})`,
        resolution: `${window.innerWidth}×${window.innerHeight}`,
        clicksCount: 0,
        stages: Array.from(currentStages),
        useCases: Array.from(currentUseCases)
    };

    fetch('https://ipapi.co/json/').then(res => res.json()).then(data => {
        if (data && data.city && data.country_name) {
            let flag = data.country_code === 'MX' ? '🇲🇽' : (data.country_code === 'CO' ? '🇨🇴' : '🌐');
            currentSession.location = `${data.city}, ${data.country_name} ${flag}`;
            if (data.org) currentSession.ipProvider = data.org;
            saveAndRenderCurrentSession();
        }
    }).catch(() => {});

    setInterval(() => {
        currentActiveSeconds += 1;
        currentSession.activeTimeSeconds = currentActiveSeconds;
        currentSession.stages = Array.from(currentStages);
        currentSession.useCases = Array.from(currentUseCases);
        saveAndRenderCurrentSession();
    }, 1000);

    document.addEventListener('click', (e) => {
        currentClicks += 1;
        currentSession.clicksCount = currentClicks;

        if (e.target.closest('#calcSection')) {
            currentStages.add('Advisory');
            currentUseCases.add('Uso de la Calculadora de Ahorro');
        }
        if (e.target.closest('#orbitalSection')) {
            currentStages.add('Factory');
            currentUseCases.add('Interacción con Pilares Estratégicos 3D');
        }
        if (e.target.closest('#assessmentBtn') || e.target.closest('#headerAssessmentBtn')) {
            currentStages.add('Support');
            currentUseCases.add('Apertura de Solicitud de Assessment');
        }
    });

    function saveAndRenderCurrentSession() {
        let list = JSON.parse(localStorage.getItem('xertica_telemetry_sessions') || '[]');
        const existingIdx = list.findIndex(s => s.id === currentSessionId);
        if (existingIdx >= 0) {
            list[existingIdx] = currentSession;
        } else {
            list.unshift(currentSession);
        }
        localStorage.setItem('xertica_telemetry_sessions', JSON.stringify(list));

        if (teleModal.classList.contains('active')) {
            renderDashboard();
        }
    }

    function renderDashboard() {
        let sessions = JSON.parse(localStorage.getItem('xertica_telemetry_sessions') || '[]');
        const filterText = (searchInput ? searchInput.value : '').toLowerCase();

        if (filterText) {
            sessions = sessions.filter(s => 
                s.userName.toLowerCase().includes(filterText) ||
                s.userEmail.toLowerCase().includes(filterText) ||
                s.location.toLowerCase().includes(filterText) ||
                s.deviceBrowser.toLowerCase().includes(filterText)
            );
        }

        document.getElementById('statTotalVisits').textContent = sessions.length;
        document.getElementById('statUniqueUsers').textContent = `${Math.ceil(sessions.length * 0.4)} Usuarios Únicos`;

        let totalSeconds = sessions.reduce((acc, s) => acc + (s.activeTimeSeconds || 0), 0);
        let avgSecs = sessions.length ? Math.round(totalSeconds / sessions.length) : 0;
        let mins = Math.floor(avgSecs / 60);
        let secs = avgSecs % 60;
        document.getElementById('statAvgTime').textContent = `${mins}m ${secs}s`;

        tableBody.innerHTML = '';
        sessions.forEach((s, idx) => {
            const tr = document.createElement('tr');
            
            let sMins = Math.floor((s.activeTimeSeconds || 0) / 60);
            let sSecs = (s.activeTimeSeconds || 0) % 60;
            let timeFormatted = `${sMins}m ${sSecs}s`;

            let stagesHtml = (s.stages || ['Habilitación']).map(st => `<span class="stage-tag">${st}</span>`).join('');

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

        document.querySelectorAll('.btn-view-detail').forEach(btn => {
            btn.addEventListener('click', () => {
                const sid = btn.getAttribute('data-id');
                openDetailModal(sid);
            });
        });

        renderAdmins();
    }

    function renderAdmins() {
        if (!adminTagsList) return;
        adminTagsList.innerHTML = '';
        authorizedAdmins.forEach(email => {
            const span = document.createElement('span');
            span.className = 'admin-tag';
            span.innerHTML = `${email} <span class="remove-admin" data-email="${email}">×</span>`;
            adminTagsList.appendChild(span);
        });

        document.querySelectorAll('.remove-admin').forEach(rm => {
            rm.addEventListener('click', () => {
                const targetEmail = rm.getAttribute('data-email');
                authorizedAdmins = authorizedAdmins.filter(a => a !== targetEmail);
                localStorage.setItem('xertica_admins', JSON.stringify(authorizedAdmins));
                renderAdmins();
            });
        });
    }

    if (addAdminBtn) {
        addAdminBtn.addEventListener('click', () => {
            const val = adminEmailInput.value.trim();
            if (val && val.includes('@') && !authorizedAdmins.includes(val)) {
                authorizedAdmins.push(val);
                localStorage.setItem('xertica_admins', JSON.stringify(authorizedAdmins));
                adminEmailInput.value = '';
                renderAdmins();
            }
        });
    }

    let selectedSessionId = null;
    function openDetailModal(sid) {
        let sessions = JSON.parse(localStorage.getItem('xertica_telemetry_sessions') || '[]');
        const s = sessions.find(item => item.id === sid);
        if (!s) return;

        selectedSessionId = sid;
        document.getElementById('detailUserName').textContent = s.userName;
        document.getElementById('detailUserEmail').textContent = s.userEmail;

        let sMins = Math.floor((s.activeTimeSeconds || 0) / 60);
        let sSecs = (s.activeTimeSeconds || 0) % 60;
        document.getElementById('detailActiveTime').textContent = `${sMins} min ${sSecs} seg`;
        document.getElementById('detailGeoLoc').textContent = s.location;
        document.getElementById('detailIp').textContent = s.ipProvider;
        document.getElementById('detailDeviceBrowser').textContent = s.deviceBrowser;
        document.getElementById('detailResolution').textContent = s.resolution;
        document.getElementById('detailClicks').textContent = `${s.clicksCount || 0} acciones registradas`;

        const useCasesList = document.getElementById('detailUseCasesList');
        useCasesList.innerHTML = '';
        (s.useCases || ['Navegación general en el portafolio']).forEach(uc => {
            const li = document.createElement('li');
            li.textContent = uc;
            useCasesList.appendChild(li);
        });

        detailModal.classList.add('active');
    }

    if (closeDetailBtn) closeDetailBtn.addEventListener('click', () => detailModal.classList.remove('active'));

    const deleteBtn = document.getElementById('deleteSessionBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (!selectedSessionId) return;
            let sessions = JSON.parse(localStorage.getItem('xertica_telemetry_sessions') || '[]');
            sessions = sessions.filter(s => s.id !== selectedSessionId);
            localStorage.setItem('xertica_telemetry_sessions', JSON.stringify(sessions));
            detailModal.classList.remove('active');
            renderDashboard();
        });
    }

    if (searchInput) searchInput.addEventListener('input', renderDashboard);

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('¿Deseas limpiar el historial de telemetría registrado?')) {
                localStorage.setItem('xertica_telemetry_sessions', JSON.stringify([currentSession]));
                renderDashboard();
            }
        });
    }

    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => {
            let sessions = JSON.parse(localStorage.getItem('xertica_telemetry_sessions') || '[]');
            let csv = 'Usuario,Correo,Fecha,Ubicacion,Permanencia(seg),Dispositivo,Acciones\n';
            sessions.forEach(s => {
                csv += `"${s.userName}","${s.userEmail}","${s.dateStr}","${s.location}",${s.activeTimeSeconds},"${s.deviceBrowser}",${s.clicksCount}\n`;
            });
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `telemetria_xertica_${Date.now()}.csv`;
            a.click();
        });
    }

    // Auth Password Modal Elements
    const authModal = document.getElementById('adminAuthModal');
    const closeAuthBtn = document.getElementById('closeAuthBtn');
    const authForm = document.getElementById('adminAuthForm');
    const passInput = document.getElementById('adminPasswordInput');
    const authErrorMsg = document.getElementById('authErrorMsg');

    lockBtn.addEventListener('click', () => {
        if (authModal) {
            authModal.classList.add('active');
            if (passInput) {
                passInput.value = '';
                passInput.focus();
            }
            if (authErrorMsg) authErrorMsg.style.display = 'none';
        } else {
            teleModal.classList.add('active');
            renderDashboard();
        }
    });

    // Initial Login Logs Setup
    const initialLoginLogs = [
        {
            dateStr: '19/8/2026, 10:05:22 a.m.',
            status: 'Éxito',
            keyTyped: 'Eirs2026',
            location: 'Mexico City, Mexico 🇲🇽',
            device: 'Desktop • Chrome (Linux / ChromeOS)'
        }
    ];

    let adminLoginLogs = JSON.parse(localStorage.getItem('xertica_admin_login_logs') || 'null');
    if (!adminLoginLogs) {
        adminLoginLogs = initialLoginLogs;
        localStorage.setItem('xertica_admin_login_logs', JSON.stringify(adminLoginLogs));
    }

    function recordLoginAttempt(success, keyEntered) {
        let logs = JSON.parse(localStorage.getItem('xertica_admin_login_logs') || '[]');
        logs.unshift({
            dateStr: new Date().toLocaleString('es-MX'),
            status: success ? 'Éxito' : 'Intento Fallido',
            keyTyped: keyEntered ? (success ? 'Eirs2026' : '••••••••') : '(vacío)',
            location: currentSession.location || 'Mexico City, Mexico 🇲🇽',
            device: currentSession.deviceBrowser || 'Desktop • Chrome'
        });
        localStorage.setItem('xertica_admin_login_logs', JSON.stringify(logs));
    }

    function renderAdminLoginLogs() {
        const loginsTableBody = document.getElementById('adminLoginsTableBody');
        if (!loginsTableBody) return;

        let logs = JSON.parse(localStorage.getItem('xertica_admin_login_logs') || '[]');
        loginsTableBody.innerHTML = '';

        if (logs.length === 0) {
            loginsTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#666;">No hay inicios de sesión registrados.</td></tr>';
            return;
        }

        logs.forEach(log => {
            const tr = document.createElement('tr');
            const isSuccess = log.status === 'Éxito';
            const badgeClass = isSuccess ? 'live-badge' : 'time-badge';
            const badgeStyle = isSuccess ? 'background: rgba(46, 139, 90, 0.2); color: #4ade80; border: 1px solid rgba(46, 139, 90, 0.4);' : 'background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4);';

            tr.innerHTML = `
                <td>${log.dateStr}</td>
                <td><span class="${badgeClass}" style="${badgeStyle}">${isSuccess ? '✅ Acceso Concedido' : '❌ Clave Incorrecta'}</span></td>
                <td><code>${log.keyTyped}</code></td>
                <td>${log.location}</td>
                <td>${log.device}</td>
            `;
            loginsTableBody.appendChild(tr);
        });
    }

    if (closeAuthBtn) {
        closeAuthBtn.addEventListener('click', () => {
            if (authModal) authModal.classList.remove('active');
        });
    }

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = passInput.value.trim();
            if (val === 'Eirs2026') {
                recordLoginAttempt(true, val);
                if (authErrorMsg) authErrorMsg.style.display = 'none';
                authModal.classList.remove('active');
                teleModal.classList.add('active');
                renderDashboard();
            } else {
                recordLoginAttempt(false, val);
                if (authErrorMsg) authErrorMsg.style.display = 'block';
                if (passInput) {
                    passInput.style.borderColor = '#ef4444';
                    setTimeout(() => { passInput.style.borderColor = ''; }, 1500);
                }
            }
        });
    }

    // Also link renderAdminLoginLogs inside renderDashboard
    const oldRenderDashboard = renderDashboard;
    renderDashboard = function() {
        oldRenderDashboard();
        renderAdminLoginLogs();
    };

    if (closeTeleBtn) closeTeleBtn.addEventListener('click', () => teleModal.classList.remove('active'));
    if (refreshBtn) refreshBtn.addEventListener('click', renderDashboard);

    teleModal.addEventListener('click', (e) => {
        if (e.target === teleModal) teleModal.classList.remove('active');
    });
}
