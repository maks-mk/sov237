document.addEventListener('DOMContentLoaded', () => {
    // --- 0. База API и тема ---
    const host = window.location.hostname;
    const API_BASE = (
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '192.168.0.3'
    ) ? 'http://192.168.0.3:8000' : 'https://sov237-backend.onrender.com';

    const rootEl = document.documentElement;
    const themeMeta = document.querySelector('#theme-color-meta');
    const savedTheme = localStorage.getItem('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const initialTheme = savedTheme || (prefersLight ? 'light' : 'dark');
    if (initialTheme === 'light') {
        rootEl.setAttribute('data-theme', 'light');
        if (themeMeta) themeMeta.setAttribute('content', '#ffffff');
    }

    // === Voting progress bars (combined card) ===
    const updateVotingUI = () => {
        const votesForEl = document.getElementById('votes-for');
        const votesAgainstEl = document.getElementById('votes-against');
        const progressForEl = document.getElementById('progress-for');
        const progressAgainstEl = document.getElementById('progress-against');
        const totalEl = document.getElementById('total-votes');
        const supportPctEl = document.getElementById('support-percentage');

        if (!votesForEl || !votesAgainstEl || !progressForEl || !progressAgainstEl) return;

        const parseNum = (el) => {
            const n = parseInt((el.textContent || '0').replace(/[^0-9\-]/g, ''), 10);
            return Number.isFinite(n) ? Math.max(0, n) : 0;
        };

        const forCount = parseNum(votesForEl);
        const againstCount = parseNum(votesAgainstEl);
        const total = forCount + againstCount;
        const supportPct = total > 0 ? (forCount / total) * 100 : 0;
        const againstPct = total > 0 ? (againstCount / total) * 100 : 0;

        // Update counters (total and percentage) if present
        if (totalEl) totalEl.textContent = String(total);
        if (supportPctEl) supportPctEl.textContent = `${supportPct.toFixed(1)}%`;

        // Apply widths
        progressForEl.style.width = `${supportPct}%`;
        progressAgainstEl.style.width = `${againstPct}%`;
    };

    // Initial render
    updateVotingUI();

    // === Scroll Progress Bar ===
    const progressBar = document.querySelector('.scroll-progress__bar');
    const updateScrollProgress = () => {
        if (!progressBar) return;
        const docEl = document.documentElement;
        const scrollTop = docEl.scrollTop || document.body.scrollTop;
        const scrollHeight = docEl.scrollHeight - docEl.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        progressBar.style.width = progress + '%';
    };
    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    // === Mobile CTA visibility enhancements ===
    const mobileCta = document.querySelector('.mobile-cta');
    if (mobileCta) {
        let hideTimer;
        const show = () => {
            mobileCta.classList.add('visible');
        };
        const hide = () => {
            mobileCta.classList.remove('visible');
        };

        // Show by default on load for small screens
        const mq = window.matchMedia('(max-width: 768px)');
        const applyMQ = () => {
            if (mq.matches) show(); else hide();
        };
        applyMQ();
        mq.addEventListener ? mq.addEventListener('change', applyMQ) : mq.addListener(applyMQ);

        // Hide when user scrolls down fast, show on idle
        let lastY = window.pageYOffset;
        window.addEventListener('scroll', () => {
            if (!mq.matches) return;
            const y = window.pageYOffset;
            if (y > lastY + 10) {
                hide();
            } else if (y < lastY - 10) {
                show();
            }
            lastY = y;
            clearTimeout(hideTimer);
            hideTimer = setTimeout(show, 1200);
        }, { passive: true });

        // Avoid overlap with on-screen keyboards
        window.addEventListener('resize', () => {
            if (!mq.matches) return;
            // If height shrinks a lot (keyboard likely open), hide
            const ratio = window.innerHeight / screen.height;
            if (ratio < 0.7) hide(); else show();
        });

        // Плавный переход к секции контактов и автофокус на поле имени
        const writeBtn = document.querySelector('.mobile-cta__btn--secondary');
        if (writeBtn) {
            writeBtn.addEventListener('click', (e) => {
                // Прерываем стандартный якорь для контроля смещения и фокуса
                e.preventDefault();
                const targetSection = document.querySelector('#contacts');
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80; // учитываем шапку
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                    // Небольшая задержка для установки фокуса после скролла
                    setTimeout(() => {
                        const nameInput = document.querySelector('#contact-name') || targetSection.querySelector('input, textarea');
                        if (nameInput) nameInput.focus({ preventScroll: true });
                    }, 500);
                }
            });
        }

        // Всегда фиксируем кнопку у нижнего края — без подъёма у футера
    }

    // --- 1. Мобильная навигация ---
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!expanded));
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Закрытие меню при клике на ссылку
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // --- 2. Плавная прокрутка для навигации ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Учитываем высоту навигации
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- 3. Логика для слайдера "До/После" ---
    const sliders = document.querySelectorAll('.image-comparison-slider');

    sliders.forEach(slider => {
        const topImage = slider.querySelector('img:last-of-type');
        const handle = document.createElement('div');
        handle.classList.add('handle');

        const topImageClone = topImage.cloneNode();
        topImageClone.classList.add('top-image');
        slider.appendChild(topImageClone);
        slider.appendChild(handle);

        let isDragging = false;

        const startDrag = (e) => {
            isDragging = true;
            slider.classList.add('is-dragging');
            e.preventDefault();
        };

        const stopDrag = () => {
            isDragging = false;
            slider.classList.remove('is-dragging');
        };

        const onDrag = (e) => {
            if (!isDragging) return;

            const sliderRect = slider.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            if (clientX === undefined) return;

            let x = clientX - sliderRect.left;
            x = Math.max(0, Math.min(x, sliderRect.width));

            const percentage = (x / sliderRect.width) * 100;

            handle.style.left = `${percentage}%`;
            topImageClone.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
        };

        slider.addEventListener('mousedown', startDrag);
        slider.addEventListener('touchstart', startDrag, { passive: false });

        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);

        document.addEventListener('mousemove', onDrag);
        document.addEventListener('touchmove', onDrag, { passive: false });
    });

    // --- 3b. Показать ещё участки ---
    const showMoreBtn = document.getElementById('show-more');
    const moreSection = document.getElementById('comparison-more');
    if (showMoreBtn && moreSection) {
        moreSection.setAttribute('hidden', '');
        showMoreBtn.addEventListener('click', () => {
            const expanded = showMoreBtn.getAttribute('aria-expanded') === 'true';
            if (expanded) {
                moreSection.setAttribute('hidden', '');
                showMoreBtn.setAttribute('aria-expanded', 'false');
                showMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Показать ещё участки';
            } else {
                moreSection.removeAttribute('hidden');
                showMoreBtn.setAttribute('aria-expanded', 'true');
                showMoreBtn.innerHTML = '<i class="fas fa-minus"></i> Скрыть дополнительные участки';
            }
        });
    }

    // --- 4. Анимация появления секций при скролле ---
    const sections = document.querySelectorAll('section');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // --- 5. Кнопка "Наверх" ---
    const scrollToTopBtn = document.querySelector('.scroll-to-top');

    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- 6. Анимация прогресс-кольца (совместимость с мобильными) ---
    const progressRing = document.querySelector('.progress-ring-progress');
    const progressTarget = document.querySelector('.progress-ring') || document.querySelector('.progress-circle');
    const progressTextEl = document.querySelector('.progress-percentage');
    const progressCircleEl = document.querySelector('.progress-circle');
    if (progressRing) {
        const defaultProgress = 17; // дефолт для разработки
        const configured = parseFloat(
            (progressCircleEl && progressCircleEl.dataset && progressCircleEl.dataset.progress) ||
            (progressTextEl && (progressTextEl.textContent || '').replace('%','')) ||
            `${defaultProgress}`
        );
        const progress = Number.isFinite(configured) ? configured : defaultProgress;

        const applyProgress = (percent) => {
            const safe = Math.max(0, Math.min(100, percent));
            const normLen = parseFloat(progressRing.getAttribute('pathLength') || '0');
            if (normLen > 0) {
                // Нормализованная длина (pathLength=100)
                progressRing.style.strokeDasharray = '100';
                progressRing.style.strokeDashoffset = '100';
                const offset = 100 - safe;
                requestAnimationFrame(() => {
                    progressRing.style.strokeDashoffset = `${offset}`;
                    if (progressTextEl) progressTextEl.textContent = `${Math.round(safe)}%`;
                });
                return;
            }
            // Fallback: реальная длина окружности
            const radius = parseFloat(progressRing.getAttribute('r')) || (progressRing.r && progressRing.r.baseVal.value) || 80;
            const circumference = radius * 2 * Math.PI;
            progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
            progressRing.style.strokeDashoffset = `${circumference}`;
            const offset = circumference - (safe / 100) * circumference;
            requestAnimationFrame(() => {
                progressRing.style.strokeDashoffset = `${offset}`;
                if (progressTextEl) progressTextEl.textContent = `${Math.round(safe)}%`;
            });
        };

        const isInViewport = (el) => {
            const rect = (el || progressRing).getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
        };

        // Если поддерживается IO, наблюдаем за SVG/контейнером; иначе применяем сразу
        if ('IntersectionObserver' in window && progressTarget) {
            const progressObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        applyProgress(progress);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            progressObserver.observe(progressTarget);

            // На случай, если элемент уже в вьюпорте на мобильных — применяем сразу
            if (isInViewport(progressTarget)) {
                applyProgress(progress);
            }
        } else {
            applyProgress(progress);
        }

        // Резервный триггер на мобильных (если IO не сработал)
        setTimeout(() => {
            if (parseFloat(progressRing.style.strokeDashoffset || '0') === 0) return; // уже применено
            if (isInViewport(progressTarget)) applyProgress(progress);
        }, 800);
    }

    // --- 7. Обработка формы обратной связи ---
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.querySelector('#contact-name')?.value?.trim() || '';
            const email = document.querySelector('#contact-email')?.value?.trim() || '';
            const message = document.querySelector('#contact-message')?.value?.trim() || '';

            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';

                const response = await fetch(`${API_BASE}/api/contact`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, message })
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(data?.error || 'Ошибка отправки. Попробуйте позже.');
                }

                submitBtn.innerHTML = '<i class="fas fa-check"></i> Отправлено!';
                submitBtn.style.background = 'var(--success-color)';
                contactForm.reset();

                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                }, 3000);
            } catch (err) {
                submitBtn.innerHTML = '<i class="fas fa-triangle-exclamation"></i> Ошибка';
                submitBtn.style.background = 'var(--danger-color)';
                alert(err.message || 'Не удалось отправить сообщение');
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                }, 3000);
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    // --- 7b. Система голосования через API ---
    class VotingSystem {
        constructor() {
            this.fingerprint = null;
            this.hasVoted = false;
            this.userVote = null;
            // UI элементы
            this.votesForEl = document.getElementById('votes-for');
            this.votesAgainstEl = document.getElementById('votes-against');
            this.totalEl = document.getElementById('total-votes');
            this.supportPctEl = document.getElementById('support-percentage');
            this.msgEl = document.getElementById('vote-message');
            this.formEl = document.getElementById('voting-form');
            this.alreadyEl = document.getElementById('already-voted');
            this.userVoteEl = document.getElementById('user-vote');
            this.btnFor = document.getElementById('vote-for-btn');
            this.btnAgainst = document.getElementById('vote-against-btn');
            this.voteClickEls = document.querySelectorAll('.vote-click');
        }

        async init() {
            if (!window.generateFingerprint) return; // safety
            try {
                this.fingerprint = await window.generateFingerprint();
            } catch { this.fingerprint = null; }
            await this.refreshStats();
            await this.checkStatus();
            this.bindEvents();
        }

        bindEvents() {
            // Старые кнопки, если где-то остались
            if (this.btnFor) this.btnFor.addEventListener('click', () => this.submitVote('for'));
            if (this.btnAgainst) this.btnAgainst.addEventListener('click', () => this.submitVote('against'));

            // Новые кликабельные подписи
            if (this.voteClickEls && this.voteClickEls.length) {
                this.voteClickEls.forEach(el => {
                    el.addEventListener('click', () => {
                        if (this.hasVoted) return;
                        const type = el.dataset.vote === 'against' ? 'against' : 'for';
                        this.submitVote(type);
                    });
                    el.addEventListener('keydown', (e) => {
                        if (this.hasVoted) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            const type = el.dataset.vote === 'against' ? 'against' : 'for';
                            this.submitVote(type);
                        }
                    });
                });
            }
        }

        async refreshStats() {
            try {
                const ts = Date.now();
                const url = this.fingerprint
                    ? `${API_BASE}/api/votes?fingerprint=${encodeURIComponent(this.fingerprint)}&_ts=${ts}`
                    : `${API_BASE}/api/votes?_ts=${ts}`;
                const res = await fetch(url, {
                    method: 'GET',
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, max-age=0',
                        'Pragma': 'no-cache'
                    }
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) return;
                this.applyStats(data);
                if (typeof data.hasVoted === 'boolean') {
                    this.hasVoted = data.hasVoted;
                    this.userVote = data.userVote || null;
                    this.updateStatusUI();
                }
            } catch (_) {}
        }

        async checkStatus() {
            if (!this.fingerprint) return;
            try {
                const ts = Date.now();
                const res = await fetch(`${API_BASE}/api/vote/check?fingerprint=${encodeURIComponent(this.fingerprint)}&_ts=${ts}` , {
                    method: 'GET',
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, max-age=0',
                        'Pragma': 'no-cache'
                    }
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) return;
                this.hasVoted = !!data.hasVoted;
                this.userVote = data.vote || null;
                this.updateStatusUI();
            } catch (_) {}
        }

        async submitVote(type) {
            if (this.hasVoted) return;
            if (!this.fingerprint) {
                this.showMsg('Не удалось сгенерировать отпечаток', true);
                return;
            }
            const btn = type === 'for' ? this.btnFor : this.btnAgainst; // может быть null
            const prev = btn ? btn.innerHTML : '';
            try {
                if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...'; }
                const res = await fetch(`${API_BASE}/api/vote?_ts=${Date.now()}` , {
                    method: 'POST',
                    cache: 'no-store',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache, no-store, max-age=0',
                        'Pragma': 'no-cache'
                    },
                    body: JSON.stringify({ vote: type, fingerprint: this.fingerprint })
                });
                const data = await res.json().catch(() => ({}));
                if (res.status === 409) {
                    this.hasVoted = true;
                    this.userVote = data.userVote || null;
                    this.applyStats(data);
                    this.updateStatusUI();
                    this.showMsg(data.message || 'Вы уже голосовали', true);
                    return;
                }
                if (!res.ok) {
                    throw new Error(data.message || 'Ошибка голосования');
                }
                this.applyStats(data);
                this.hasVoted = true;
                this.userVote = type;
                this.updateStatusUI();
                this.showMsg('Голос учтен', false);
            } catch (e) {
                this.showMsg(e.message || 'Ошибка сети', true);
            } finally {
                if (btn) { btn.disabled = false; btn.innerHTML = prev; }
            }
        }

        applyStats(data) {
            const vf = Number(data.votesFor || 0);
            const va = Number(data.votesAgainst || 0);
            const total = Number(data.total || (vf + va));
            if (this.votesForEl) this.votesForEl.textContent = String(vf);
            if (this.votesAgainstEl) this.votesAgainstEl.textContent = String(va);
            if (this.totalEl) this.totalEl.textContent = String(total);
            if (this.supportPctEl) {
                const pct = total > 0 ? ((vf / total) * 100).toFixed(1) : '0.0';
                this.supportPctEl.textContent = `${pct}%`;
            }
            // обновляем бары существующей функцией
            if (typeof updateVotingUI === 'function') updateVotingUI();
        }

        updateStatusUI() {
            if (this.hasVoted) {
                if (this.formEl) this.formEl.style.display = 'none';
                if (this.alreadyEl) this.alreadyEl.style.display = '';
                if (this.userVoteEl) this.userVoteEl.textContent = this.userVote === 'for' ? 'ЗА реконструкцию' : 'ПРОТИВ реконструкции';
                if (this.voteClickEls && this.voteClickEls.length) {
                    this.voteClickEls.forEach(el => {
                        el.setAttribute('aria-disabled', 'true');
                        el.classList.add('is-disabled');
                    });
                }
            } else {
                if (this.formEl) this.formEl.style.display = '';
                if (this.alreadyEl) this.alreadyEl.style.display = 'none';
                if (this.voteClickEls && this.voteClickEls.length) {
                    this.voteClickEls.forEach(el => {
                        el.setAttribute('aria-disabled', 'false');
                        el.classList.remove('is-disabled');
                    });
                }
            }
        }

        showMsg(text, isError=false) {
            if (this.msgEl) {
                this.msgEl.textContent = text;
                this.msgEl.style.color = isError ? 'var(--danger-color)' : 'var(--text-color)';
            } else {
                // fallback на общий toast, если есть
                if (typeof showToast === 'function') showToast(text, isError);
            }
        }
    }

    // Инициализация голосования
    const voting = new VotingSystem();
    voting.init();

    // --- 8. Активная навигация при скролле ---
    const navbarLinks = document.querySelectorAll('.nav-link');
    const sectionElements = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        let current = '';

        sectionElements.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;

            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navbarLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'true');
            }
        });
    });

    // --- 9. Параллакс эффект для hero секции (отключено) ---
    /*
    const heroBackground = document.querySelector('.hero-background');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (heroBackground && !prefersReducedMotion.matches) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroBackground.style.transform = `translateY(${rate}px)`;
        });
    }
    */

    // --- 9b. Лёгкий 3D-наклон HERO при движении мыши (отключено) ---
    /*
    const headerEl = document.querySelector('.header');
    const heroContent = document.querySelector('.hero-content');
    if (headerEl && heroContent) {
        const maxTilt = 6; // градусов
        const applyHeroTilt = (e) => {
            if (prefersReducedMotion.matches) return;
            const rect = headerEl.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;  // 0..1
            const y = (e.clientY - rect.top) / rect.height; // 0..1
            const tiltX = (0.5 - y) * maxTilt; // вверх/вниз => rotateX
            const tiltY = (x - 0.5) * maxTilt; // влево/вправо => rotateY
            heroContent.style.setProperty('--heroTiltX', `${tiltX.toFixed(2)}deg`);
            heroContent.style.setProperty('--heroTiltY', `${tiltY.toFixed(2)}deg`);
        };
        const resetHeroTilt = () => {
            heroContent.style.setProperty('--heroTiltX', '0deg');
            heroContent.style.setProperty('--heroTiltY', '0deg');
        };
        headerEl.addEventListener('mousemove', applyHeroTilt);
        headerEl.addEventListener('mouseleave', resetHeroTilt);
    }
    */

    // --- 9c. 3D tilt + shine для карточек (отключено) ---
    /*
    const enableCardTilt = () => {
        if (prefersReducedMotion.matches) return;
        const cards = document.querySelectorAll('.comparison-card, .detail-card, .voting-card, .finance-item, .cta-button, .show-more-btn, .voting-buttons .btn, .mobile-cta__btn, .theme-toggle');
        cards.forEach(card => {
            // Разный максимум для тяжёлых карточек и маленьких кнопок
            const isButton = card.matches('.cta-button, .show-more-btn, .voting-buttons .btn, .mobile-cta__btn, .theme-toggle');
            const maxTilt = isButton ? 5 : 8; // градусов
            let rafId = null;
            const onMove = (e) => {
                const rect = card.getBoundingClientRect();
                const cx = e.clientX ?? (e.touches && e.touches[0]?.clientX);
                const cy = e.clientY ?? (e.touches && e.touches[0]?.clientY);
                if (cx == null || cy == null) return;
                const x = (cx - rect.left) / rect.width;  // 0..1
                const y = (cy - rect.top) / rect.height; // 0..1
                const tiltX = (0.5 - y) * maxTilt;
                const tiltY = (x - 0.5) * maxTilt;
                // Используем rAF для плавности
                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    card.style.setProperty('--tiltX', `${tiltX.toFixed(2)}deg`);
                    card.style.setProperty('--tiltY', `${tiltY.toFixed(2)}deg`);
                    // Блик
                    const shineX = `${(x * 100).toFixed(1)}%`;
                    const shineY = `${(y * 100).toFixed(1)}%`;
                    card.style.setProperty('--shineX', shineX);
                    card.style.setProperty('--shineY', shineY);
                    card.style.setProperty('--shineOpacity', '1');
                });
            };
            const onLeave = () => {
                if (rafId) cancelAnimationFrame(rafId);
                card.style.setProperty('--tiltX', '0deg');
                card.style.setProperty('--tiltY', '0deg');
                card.style.setProperty('--shineOpacity', '0');
            };
            card.addEventListener('mousemove', onMove);
            card.addEventListener('mouseleave', onLeave);
            // На тач-устройствах отключаем наклон, чтобы не мешать скроллу
            card.addEventListener('touchstart', () => card.classList.add('no-transform'), { passive: true });
            card.addEventListener('touchend', () => card.classList.remove('no-transform'));
        });
    };
    enableCardTilt();
    */

    // --- 10. Ленивая загрузка изображений (через атрибут) ---
    document.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('loading')) img.loading = 'lazy';
        img.decoding = 'async';
    });

    // --- 10b. Ленивая загрузка изображений по data-src (fallback) ---
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // --- 11. Тень навбара при прокрутке ---
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const toggleNavbarShadow = () => {
            if (window.pageYOffset > 0) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        };
        toggleNavbarShadow();
        window.addEventListener('scroll', toggleNavbarShadow);
    }

    // --- 12. Переключение темы ---
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = rootEl.getAttribute('data-theme') === 'light';
            if (isLight) {
                rootEl.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
                if (themeMeta) themeMeta.setAttribute('content', '#0d1117');
            } else {
                rootEl.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                if (themeMeta) themeMeta.setAttribute('content', '#ffffff');
            }
        });
    }

    // --- 13. Toast helper ---
    function showToast(text, isError = false) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = text;
        toast.style.borderColor = isError ? 'var(--danger-color)' : 'var(--border-color)';
        toast.classList.add('show');
        clearTimeout(showToast._timer);
        showToast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // --- 14. Регистрация сервис-воркера для PWA ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
    
});