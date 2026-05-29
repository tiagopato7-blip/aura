// Mobile warning overlay completely removed to prevent scroll lock

// Custom Cursor Logic
const cursor = document.querySelector('.cursor-blob');

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Interactive elements hover effect on cursor
    const interactives = document.querySelectorAll('button, a, .menu-item, .date, .ig-item, .img-wrapper, .floating-widget, .chic-menu li, .hero-video, .testimonial-card, .mood-swatch');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            if (el.classList.contains('menu-item') || el.classList.contains('active') || el.tagName.toLowerCase() === 'li') {
                cursor.style.backgroundColor = 'var(--color-matcha)';
            } else if (el.classList.contains('floating-widget')) {
                cursor.style.transform = 'translate(-50%, -50%) scale(0)';
            }
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.backgroundColor = 'var(--color-pink)';
        });
    });
} else {
    if (cursor) cursor.style.display = 'none';
}

// Booking Buttons Logic
const svcBtns = document.querySelectorAll('.svc-btn');
svcBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        svcBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Throttled Unified Scroll Manager (Only 1 passive scroll listener throttled with rAF)
window.scrollCallbacks = [];
let scrollTicking = false;

function handleScroll() {
    const scrollY = window.scrollY;
    // Execute all registered scroll callbacks
    window.scrollCallbacks.forEach(callback => {
        try {
            callback(scrollY);
        } catch (e) {
            console.error("Scroll callback error:", e);
        }
    });
}

window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        window.requestAnimationFrame(() => {
            handleScroll();
            scrollTicking = false;
        });
        scrollTicking = true;
    }
}, { passive: true });


// Interactive Color Selector Logic
(() => {
    const colorBtns = document.querySelectorAll('.color-btn');
    const nailsVideo = document.querySelector('.nails-video');

    if (!nailsVideo || colorBtns.length === 0) return;

    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const videoSrc = btn.getAttribute('data-video');

            // Remove active from all buttons
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // If no video assigned to this color, hide video and stop
            if (!videoSrc) {
                nailsVideo.classList.remove('active');
                nailsVideo.pause();
                return;
            }

            // Only reload if the source actually changed
            if (nailsVideo.getAttribute('data-current') !== videoSrc) {
                nailsVideo.setAttribute('data-current', videoSrc);
                nailsVideo.src = videoSrc;
                nailsVideo.loop = false; // Play only once, then return to base image
                nailsVideo.load();
            } else {
                // Same color tapped again — restart from beginning
                nailsVideo.currentTime = 0;
            }

            nailsVideo.classList.add('active');

            // Promise handling for play() to avoid AbortError
            const playPromise = nailsVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Video playback failed:", error);
                });
            }
        });
    });

    // When the video ends (loop=false case), fade it out
    nailsVideo.addEventListener('ended', () => {
        nailsVideo.classList.remove('active');
        colorBtns.forEach(b => b.classList.remove('active'));
    });
})();

// Scroll Reveal Observer
const reveals = document.querySelectorAll('.reveal, .reveal-grand');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.15 });

reveals.forEach(r => observer.observe(r));

// Contact Modal Logic
const contactBtn = document.getElementById('open-contact-modal');
const contactModal = document.getElementById('contact-modal');
const closeContactBtn = document.getElementById('close-contact-modal');

if (contactBtn && contactModal && closeContactBtn) {
    contactBtn.addEventListener('click', (e) => {
        e.preventDefault();
        contactModal.classList.add('active');
    });

    closeContactBtn.addEventListener('click', () => {
        contactModal.classList.remove('active');
    });

    contactModal.addEventListener('click', (e) => {
        if (e.target === contactModal) {
            contactModal.classList.remove('active');
        }
    });
}

// High-performance seamless loop for Chica video
(() => {
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        // Fast looping strategy: reset currentTime slightly before the physical end
        // of the video file to bypass any trailing black frames or decoder lags
        const buffer = 0.08; // 80ms buffer is optimal for most browsers
        heroVideo.addEventListener('timeupdate', function () {
            if (this.duration && this.currentTime >= this.duration - buffer) {
                this.currentTime = 0.03; // Start slightly after 0 to avoid initial keyframe delay
                this.play();
            }
        });

        // Fail-safe fallback if timeupdate event is delayed
        heroVideo.addEventListener('ended', function () {
            this.currentTime = 0.03;
            this.play();
        });
    }
})();

// Interactive Magazine Controller (Real 3D Book)
(() => {
    const prevBtn = document.getElementById('mag-prev');
    const nextBtn = document.getElementById('mag-next');
    const book = document.getElementById('trends-book');
    const indicatorSpan = document.getElementById('mag-current-spread');

    if (!book || !prevBtn || !nextBtn) return;

    const sheets = book.querySelectorAll('.book-sheet');
    let currentSpread = 0;
    const maxSpreads = 4; // 0: Cover, 1: Spread 1 (Pages 2-3), 2: Spread 2 (Pages 4-5), 3: Spread 3 (Pages 6-7), 4: Back cover (Page 8)

    const spreadNames = ["Portada", "Matcha & Quartz", "Celeste & Orange", "Sunflower & Purple Pastel", "Contraportada"];

    function updateMagazine() {
        // Remove previous spread classes from book
        for (let i = 0; i <= maxSpreads; i++) {
            book.classList.remove(`spread-${i}`);
        }
        // Add current spread class to book
        book.classList.add(`spread-${currentSpread}`);

        // Update sheets classes and active 3D layer z-indexes
        sheets.forEach((sheet, idx) => {
            if (idx < currentSpread) {
                // Sheet is flipped to the left side
                sheet.classList.add('flipped');
                // Stack layers: first sheet sits at the bottom of the stack on the left
                sheet.style.zIndex = idx + 1;
            } else {
                // Sheet is on the right side (unflipped)
                sheet.classList.remove('flipped');
                // Stack layers: first sheet sits at the top of the stack on the right
                sheet.style.zIndex = sheets.length - idx;
            }
        });

        // Center spine offset toggles
        if (currentSpread > 0) {
            book.classList.add('is-open');
        } else {
            book.classList.remove('is-open');
        }

        // Update navigation buttons active states
        prevBtn.disabled = currentSpread === 0;
        nextBtn.disabled = currentSpread === maxSpreads;

        // Update pagination indicator
        indicatorSpan.textContent = spreadNames[currentSpread];
    }

    prevBtn.addEventListener('click', () => {
        if (currentSpread > 0) {
            currentSpread--;
            updateMagazine();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentSpread < maxSpreads) {
            currentSpread++;
            updateMagazine();
        }
    });

    // Open cover directly on click
    const coverPage = book.querySelector('.cover-page');
    const magCta = book.querySelector('.mag-cta');

    const openBook = () => {
        if (currentSpread === 0) {
            currentSpread = 1;
            updateMagazine();
        }
    };

    if (coverPage) coverPage.addEventListener('click', openBook);
    if (magCta) magCta.addEventListener('click', (e) => {
        e.stopPropagation();
        openBook();
    });

    // Reset back cover on click to return to cover
    const backPage = book.querySelector('.back-page');
    if (backPage) {
        backPage.addEventListener('click', () => {
            currentSpread = 0;
            updateMagazine();
        });
    }

    // Smooth scroll booking logic
    const bookingBtn = book.querySelector('.trends-book-btn');
    if (bookingBtn) {
        bookingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const bookingSec = document.getElementById('booking');
            if (bookingSec) {
                bookingSec.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Initialize
    updateMagazine();
})();

// Navbar Hide/Show on Scroll Transitions
(() => {
    const header = document.querySelector('.main-header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    window.scrollCallbacks.push((scrollY) => {
        // Only run scroll effect on desktop screens (larger than 768px)
        // Mobile layout keeps header completely static to prevent style dirtying and lag
        if (window.innerWidth <= 768) {
            return;
        }

        if (scrollY > 120) {
            if (scrollY > lastScrollY) {
                // Scrolling down: slide up and hide
                header.style.transform = 'translateY(-150%)';
                header.style.opacity = '0';
            } else {
                // Scrolling up: reveal fixed capsule closer to top
                header.style.transform = 'translateY(0)';
                header.style.opacity = '1';
                header.style.top = '20px';
            }
        } else {
            // Near top: return to original position below ticker wrap
            header.style.transform = 'translateY(0)';
            header.style.opacity = '1';
            header.style.top = '60px';
        }
        lastScrollY = scrollY;
    });
})();


// Scroll-Driven Café Frame Animation
(() => {
    const canvas = document.getElementById('cafe-frames-canvas');
    const loadingEl = document.getElementById('cafe-loading');
    const panel = document.querySelector('.cafe-panel');
    const spacer = document.getElementById('horizontal-spacer');
    if (!canvas || !spacer) return;

    const ctx = canvas.getContext('2d');
    const totalFrames = 183; 
    const frames = [];
    let loadedCount = 0;
    let lastFrameIndex = -1;

    for (let i = 0; i < totalFrames; i++) {
        const img = new Image();
        const frameNum = i + 28;
        const num = String(frameNum).padStart(3, '0');
        img.src = `987/ezgif-frame-${num}.jpg`;
        img.onload = () => {
            loadedCount++;
            if (loadedCount === 1) {
                drawFrame(0);
            }
            if (loadedCount === totalFrames && loadingEl) {
                loadingEl.style.opacity = '0';
                setTimeout(() => { loadingEl.style.display = 'none'; }, 700);
            }
        };
        frames.push(img);
    }

    function drawFrame(index) {
        // Fallback dimensions if CSS hasn't applied properly yet
        const cw = canvas.offsetWidth || 500;
        const ch = canvas.offsetHeight || 500;
        
        // Auto-resize internal canvas to match display size
        if (canvas.width !== cw || canvas.height !== ch) {
            canvas.width = cw;
            canvas.height = ch;
            lastFrameIndex = -1; // force redraw
        }

        if (index === lastFrameIndex) return;

        const img = frames[index];
        if (!img || !img.complete || !img.naturalWidth) return;

        lastFrameIndex = index;

        const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        const x = (cw - w) / 2;
        const y = (ch - h) / 2;

        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, x, y, w, h);
    }

    let targetFrame = 0;
    let smoothedFrame = 0;

    window.scrollCallbacks.push(() => {
        let progress = 0;
        if(panel) {
            const rect = panel.getBoundingClientRect();
            const total = window.innerHeight + rect.height;
            const scrolled = window.innerHeight - rect.top;
            if (total > 0 && scrolled > 0) progress = scrolled / total;
        }
        
        if (isNaN(progress)) progress = 0;
        progress = Math.max(0, Math.min(1, progress));
        targetFrame = progress * (totalFrames - 1);
    });

    function cafeLoop() {
        requestAnimationFrame(cafeLoop);
        if (isNaN(targetFrame)) targetFrame = 0;
        smoothedFrame += (targetFrame - smoothedFrame) * 0.25;
        const frameIndex = Math.min(totalFrames - 1, Math.max(0, Math.round(smoothedFrame)));
        drawFrame(frameIndex);
    }

    cafeLoop();
})();


// Extended Colors Modal Logic
(() => {
    const openBtn = document.getElementById('open-colors-modal');
    const modal = document.getElementById('extended-colors-modal');
    const closeBtn = document.getElementById('close-colors-modal');
    const searchInput = document.getElementById('colors-search-input');
    const grid = document.getElementById('colors-grid');

    if (!openBtn || !modal || !closeBtn || !grid) return;

    // Database of colors - sorted by color family
    const colorsDB = [
        // --- Whites & Nudes ---
        { name: "Minimalist Color Base Cloud Tone", hex: "#F4F5F7" },
        { name: "Morning Rose", hex: "#EAD6D8" },
        { name: "Wedding Princess", hex: "#ECD5D6" },
        { name: "Perfect Rose", hex: "#F9CBD1" },
        { name: "Jungle Blush", hex: "#EEDEE2" },
        { name: "Natural Beauty", hex: "#F5D2CD" },
        { name: "Happiness Essentials", hex: "#EED2CC" },
        { name: "Forget The Ex", hex: "#E2C3CB" },

        // --- Nudes & Taupes ---
        { name: "Soft Hug", hex: "#DEB39E" },
        { name: "Cozy Latte", hex: "#D8B4A4" },
        { name: "Classy Queen", hex: "#DCBFBD" },
        { name: "Modern Princess", hex: "#CCAFA9" },
        { name: "Madame de Mode", hex: "#E3BBB0" },
        { name: "Nude", hex: "#BD8E8E" },
        { name: "Melting Rose", hex: "#B88488" },
        { name: "Rosy Memory", hex: "#B88795" },
        { name: "Mulled Wine", hex: "#D28E95" },
        { name: "Soft Taupe", hex: "#A28D8F" },
        { name: "Walnut Poem", hex: "#9E988F" },

        // --- Shimmer & Glitter ---
        { name: "Desire To Inspire (Glitter)", hex: "#E8CEBF" },
        { name: "Blushing Frost (Shimmer)", hex: "#C7A2A6" },
        { name: "Blushing Diva (Glitter)", hex: "#D2ADB3" },
        { name: "Twinkle White (Glitter)", hex: "#C0C5C7" },
        { name: "Snowlit Gold (Shimmer)", hex: "#C0B1A4" },
        { name: "Frozen Flame (Shimmer)", hex: "#A88B80" },
        { name: "Shimmering Goldrush (Glitter)", hex: "#CEBAB0" },
        { name: "Glow The Day (Glitter)", hex: "#B59085" },

        // --- Pinks ---
        { name: "Pink Power Play", hex: "#EE829B" },
        { name: "Winning Spirit", hex: "#EAA99B" },
        { name: "Bloomy Mood", hex: "#EA9B8E" },
        { name: "Neutral", hex: "#A0676D" },
        { name: "Set to Empower", hex: "#ED52A7" },
        { name: "Ticket to Anywhere", hex: "#C65893" },
        { name: "Perfect Pink", hex: "#E51D4D" },
        { name: "Pink Reef", hex: "#E61B6B" },
        { name: "Barbados Party", hex: "#FF1A4D" },
        { name: "Feel Gorgeous", hex: "#8C224B" },

        // --- Reds ---
        { name: "Spread Love", hex: "#B21A3C" },
        { name: "Hot Me", hex: "#C8032B" },
        { name: "Fiery Flamenco", hex: "#D6182B" },
        { name: "Raspberry Red", hex: "#A80F2B" },
        { name: "Perfect Red", hex: "#7C0F1D" },
        { name: "Wine Red", hex: "#7C0C24" },
        { name: "First Hug", hex: "#941026" },
        { name: "Joy In Every Moment", hex: "#671216" },

        // --- Dark Reds & Burgundies ---
        { name: "Feminine Grace", hex: "#8A2227" },
        { name: "Classic Masterpiece", hex: "#4C1D26" },
        { name: "Dark Cherry", hex: "#441F28" },
        { name: "Charming Story", hex: "#533440" },
        { name: "Jolly State", hex: "#6E5057" },
        { name: "Hot Cocoa", hex: "#A6989A" },
        { name: "Painted Shadows", hex: "#3A2328" },
        { name: "Midnight Love Story", hex: "#422019" },
        { name: "Cozy & Comfy", hex: "#401E23" },
        { name: "Dark Obsidian", hex: "#24181B" },

        // --- Purples ---
        { name: "Your Comeback", hex: "#A882C1" },
        { name: "Piece of Magic", hex: "#4A1E44" },

        // --- Blues & Greens ---
        { name: "Wild Story", hex: "#1F4A52" },
        { name: "Timeless Treasure", hex: "#0B2F30" },
        { name: "Inspiring Moment", hex: "#6D828A" },
        { name: "Court Couture", hex: "#39D3C4" },

        // --- Neon ---
        { name: "Disco Fever", hex: "#76FF58" },
    ];

    function renderColors(colors) {
        grid.innerHTML = '';
        colors.forEach(color => {
            const card = document.createElement('a');
            card.className = 'color-card';
            card.href = '#';

            // Interactive hover effect changing the custom cursor color
            card.addEventListener('mouseenter', () => {
                if (typeof cursor !== 'undefined' && cursor) {
                    cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
                    cursor.style.backgroundColor = color.hex;
                }
            });
            card.addEventListener('mouseleave', () => {
                if (typeof cursor !== 'undefined' && cursor) {
                    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                    cursor.style.backgroundColor = 'var(--color-pink)';
                }
            });

            card.innerHTML = `
                <div class="color-swatch" style="background-color: ${color.hex}"></div>
                <div class="color-name">${color.name}</div>
                <div class="color-hex">${color.hex}</div>
            `;

            grid.appendChild(card);
        });
    }

    // Sort colors by tone (Hue), then Lightness, grouping similar colors together
    colorsDB.sort((a, b) => {
        const getHSL = (hex) => {
            let r = parseInt(hex.slice(1, 3), 16) / 255;
            let g = parseInt(hex.slice(3, 5), 16) / 255;
            let b = parseInt(hex.slice(5, 7), 16) / 255;
            let max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h = 0, s = 0, l = (max + min) / 2;
            if (max !== min) {
                let d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
                else if (max === g) h = (b - r) / d + 2;
                else if (max === b) h = (r - g) / d + 4;
                h /= 6;
            }
            return { h: h * 360, s: s * 100, l: l * 100 };
        };
        const hslA = getHSL(a.hex);
        const hslB = getHSL(b.hex);

        // Push grayscale/neutral colors to the end
        if (hslA.s < 10 && hslB.s >= 10) return 1;
        if (hslB.s < 10 && hslA.s >= 10) return -1;

        // Group by hue roughly
        if (Math.abs(hslA.h - hslB.h) > 8) {
            return hslA.h - hslB.h;
        }
        // If hue is similar, sort by lightness
        return hslB.l - hslA.l;
    });

    // Initial render
    renderColors(colorsDB);
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = colorsDB.filter(c =>
            c.name.toLowerCase().includes(term) ||
            c.hex.toLowerCase().includes(term)
        );
        renderColors(filtered);
    });

    // Open Modal
    openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent background scrolling
    });

    // Close Modal
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Add a small delay before resetting search to allow close animation to play
        setTimeout(() => {
            searchInput.value = '';
            renderColors(colorsDB);
        }, 500);
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
})();

// Services Expandable Card Logic
(() => {
    const servicesCard = document.getElementById('services-card');
    if (servicesCard) {
        servicesCard.addEventListener('click', () => {
            servicesCard.classList.toggle('open');
        });
    }
})();

// Scroll Video Sequence (Folder 123)
(() => {
    const canvas = document.getElementById('scroll-video-canvas');
    const section = document.getElementById('scroll-video-section');
    if (!canvas || !section) return;

    const ctx = canvas.getContext('2d');
    const frameCount = 240;
    const frames = [];
    let loadedCount = 0;
    let currentFrameIndex = -1;

    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        const num = String(i).padStart(3, '0');
        img.src = `123/ezgif-frame-${num}.jpg`;
        img.onload = () => {
            loadedCount++;
            if (loadedCount === 1) {
                drawFrame(0);
            }
        };
        frames.push(img);
    }

    function drawFrame(index) {
        const cw = canvas.offsetWidth || 500;
        const ch = canvas.offsetHeight || 500;
        
        if (canvas.width !== cw || canvas.height !== ch) {
            canvas.width = cw;
            canvas.height = ch;
            currentFrameIndex = -1; // force redraw
        }

        if (index === currentFrameIndex) return;

        const img = frames[index];
        if (!img || !img.complete || !img.naturalWidth) return;

        currentFrameIndex = index;

        const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        const x = (cw - w) / 2;
        const y = (ch - h) / 2;

        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, x, y, w, h);
    }

    let targetFrame = 0;
    let smoothedFrame = 0;

    window.scrollCallbacks.push(() => {
        const rect = section.getBoundingClientRect();
        let progress = 0;
        
        if (window.innerWidth <= 768) {
            const total = window.innerHeight + rect.height;
            const scrolled = window.innerHeight - rect.top;
            if(total > 0 && scrolled > 0) progress = (scrolled / total) * 1.5;
        } else {
            const scrollMax = rect.height - window.innerHeight;
            if(scrollMax > 0) progress = -rect.top / scrollMax;
        }
        
        if (isNaN(progress)) progress = 0;
        progress = Math.max(0, Math.min(1, progress));
        targetFrame = progress * (frameCount - 1);
    });

    function loop() {
        requestAnimationFrame(loop);
        if (isNaN(targetFrame)) targetFrame = 0;
        smoothedFrame += (targetFrame - smoothedFrame) * 0.25;
        const frameIndex = Math.round(smoothedFrame);
        drawFrame(Math.min(frameCount - 1, Math.max(0, frameIndex)));
    }

    loop();
})();
