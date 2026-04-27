document.addEventListener('DOMContentLoaded', () => {
    initBootSequence();
    initCustomCursor();
    initParticles();
    initSoundSystem();
    initScrollReveal();
    initMetricCounters();
    initSmoothScroll();
    initParallax();
    initDeckFanOut();
    initSkillCardTilt();
});

function initBootSequence() {
    const bootSequence = document.getElementById('boot-sequence');
    const mainInterface = document.getElementById('main-interface');
    const progressFill = document.getElementById('progress-fill');
    const progressGlow = document.getElementById('progress-glow');
    const progressPercent = document.getElementById('progress-percent');
    const loaderStatus = document.getElementById('loader-status');
    const moduleItems = document.querySelectorAll('.module-item');
    
    const statusMessages = [
        'INITIALIZING KERNEL...',
        'LOADING NEURAL_LINK...',
        'MOUNTING ARCHIVES...',
        'RENDERING INTERFACE...',
        'SYSTEM READY'
    ];
    
    let progress = 0;
    const totalDuration = 2800;
    const interval = 30;
    const increment = 100 / (totalDuration / interval);
    
    document.body.style.overflow = 'hidden';
    
    function updateModuleState(index, state) {
        moduleItems.forEach((item, i) => {
            item.classList.remove('active', 'complete');
            if (i < index) {
                item.classList.add('complete');
            } else if (i === index) {
                item.classList.add('active');
            }
        });
    }
    
    const progressInterval = setInterval(() => {
        progress += increment + (Math.random() * 1.5);
        if (progress >= 100) progress = 100;
        
        progressFill.style.width = progress + '%';
        progressGlow.style.left = progress + '%';
        progressPercent.textContent = Math.floor(progress) + '%';
        
        const stage = Math.min(Math.floor((progress / 100) * statusMessages.length), statusMessages.length - 1);
        loaderStatus.textContent = statusMessages[stage];
        updateModuleState(stage, stage < statusMessages.length - 1 ? 'active' : 'complete');
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
                bootSequence.classList.add('done');
                mainInterface.classList.remove('hidden');
                document.body.style.overflow = 'auto';
            }, 600);
        }
    }, interval);
}

function initCustomCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    const crosshairs = document.querySelectorAll('.cursor-crosshair');
    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    document.addEventListener('mousedown', () => document.body.classList.add('clicking'));
    document.addEventListener('mouseup', () => document.body.classList.remove('clicking'));
    const interactiveElements = document.querySelectorAll('a, button, .data-chip, .metric-card, .skill-card, .contact-link');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
    function animateCursor() {
        dotX += (mouseX - dotX) * 0.2;
        dotY += (mouseY - dotY) * 0.2;
        ringX += (mouseX - ringX) * 0.1;
        ringY += (mouseY - ringY) * 0.1;
        dot.style.left = dotX + 'px';
        dot.style.top = dotY + 'px';
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        crosshairs.forEach(ch => {
            ch.style.left = mouseX + 'px';
            ch.style.top = mouseY + 'px';
        });
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
}

function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    let isActive = true;
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = Math.random() > 0.5 ? '195, 100%, 75%' : '145, 100%, 70%';
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.color}, ${this.opacity})`;
            ctx.fill();
        }
    }
    const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    function drawConnections() {
        const maxDistance = 120;
        for (let i = 0; i < particles.length; i++) {
            let connections = 0;
            for (let j = i + 1; j < particles.length; j++) {
                if (connections >= 3) break;
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `hsla(195, 100%, 75%, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                    connections++;
                }
            }
        }
    }
    function animate() {
        if (!isActive) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
        animationId = requestAnimationFrame(animate);
    }
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isActive = false;
            cancelAnimationFrame(animationId);
        } else {
            isActive = true;
            animate();
        }
    });
    animate();
}

function initSoundSystem() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    let audioCtx;
    let isMuted = false;
    let isInitialized = false;
    const toggle = document.getElementById('sound-toggle');
    if (!toggle) return;
    function initAudio() {
        if (!isInitialized) {
            audioCtx = new AudioContext();
            isInitialized = true;
        }
    }
    function playTone(frequency, duration, type = 'sine', volume = 0.05) {
        if (isMuted || !audioCtx) return;
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + duration);
    }
    function playHoverSound() { playTone(800, 0.08, 'sine', 0.03); }
    function playClickSound() {
        playTone(1200, 0.12, 'square', 0.04);
        setTimeout(() => playTone(1600, 0.08, 'square', 0.03), 50);
    }
    function playBootSound() {
        if (isMuted) return;
        setTimeout(() => playTone(440, 0.15, 'sine', 0.04), 500);
        setTimeout(() => playTone(554, 0.15, 'sine', 0.04), 650);
        setTimeout(() => playTone(659, 0.2, 'sine', 0.04), 800);
    }
    toggle.addEventListener('click', () => {
        initAudio();
        isMuted = !isMuted;
        toggle.classList.toggle('muted', isMuted);
        toggle.querySelector('.sound-icon').textContent = isMuted ? '🔇' : '🔊';
        if (!isMuted) playClickSound();
    });
    const interactiveElements = document.querySelectorAll('a, button, .data-chip, .metric-card, .skill-card, .contact-link, .nav-link');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => { initAudio(); playHoverSound(); });
        el.addEventListener('click', () => { initAudio(); playClickSound(); });
    });
    playBootSound();
    document.addEventListener('click', () => {
        if (!isInitialized) { initAudio(); }
    }, { once: true });
}

function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.section-header, .mission-card, .data-chip, .metric-card, .skill-card, .education-card, .contact-prompt, .contact-link'
    );
    revealElements.forEach(el => el.classList.add('reveal'));
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const delay = Array.from(entry.target.parentElement.children).indexOf(entry.target) * 100;
                setTimeout(() => { entry.target.classList.add('visible'); }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealElements.forEach(el => observer.observe(el));
}

function initMetricCounters() {
    const metricCards = document.querySelectorAll('.metric-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const valueEl = entry.target.querySelector('.metric-value');
                const target = parseInt(valueEl.getAttribute('data-target'));
                animateCounter(valueEl, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    metricCards.forEach(card => observer.observe(card));
}

function animateCounter(element, target) {
    const duration = 2000;
    const startTime = performance.now();
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(eased * target);
        element.textContent = current.toLocaleString();
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    requestAnimationFrame(update);
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function initParallax() {
    const heroVisual = document.querySelector('.hero-visual');
    if (!heroVisual || window.matchMedia('(pointer: coarse)').matches) return;
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        heroVisual.style.transform = `translate(${x}px, ${y}px)`;
    });
}

let lastScroll = 0;
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.nav-hud');
    const currentScroll = window.pageYOffset;
    if (currentScroll > 100) {
        nav.style.background = 'oklch(8% 0.02 220 / 0.95)';
    } else {
        nav.style.background = 'oklch(10% 0.02 220 / 0.85)';
    }
    lastScroll = currentScroll;
});

document.querySelectorAll('.data-chip').forEach(chip => {
    chip.addEventListener('mouseenter', function() {
        this.style.borderColor = 'oklch(75% 0.18 195 / 0.3)';
    });
    chip.addEventListener('mouseleave', function() {
        this.style.borderColor = '';
    });
});

document.querySelectorAll('.metric-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        const value = this.querySelector('.metric-value');
        value.style.textShadow = '0 0 30px oklch(75% 0.18 195 / 0.5)';
    });
    card.addEventListener('mouseleave', function() {
        const value = this.querySelector('.metric-value');
        value.style.textShadow = '';
    });
});

function initDeckFanOut() {
    const deck = document.getElementById('nodes-deck');
    if (!deck) return;
    const cards = deck.querySelectorAll('.deck-card');
    cards.forEach((card, index) => {
        card.style.setProperty('--stack-index', index);
        card.classList.add('stacked');
    });
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                deck.classList.add('fanned');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.remove('stacked');
                        card.classList.add('fanned');
                    }, index * 150);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    observer.observe(deck);
}

function initSkillCardTilt() {
    const cards = document.querySelectorAll('.skill-card');
    if (!cards.length || window.matchMedia('(pointer: coarse)').matches) return;
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -12;
            const rotateY = ((x - centerX) / centerX) * 12;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        card.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
}

console.log('%cJUN_OS_V3.0', 'font-size: 24px; font-weight: bold; color: #00f0ff; text-shadow: 0 0 10px #00f0ff;');
console.log('%cSystem initialized. Welcome, SHAFRY YUSUF AL JUNI.', 'font-size: 12px; color: #00ff88;');
console.log('%cConnection secure. All archives verified.', 'font-size: 10px; color: #888;');
