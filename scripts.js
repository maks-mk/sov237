document.addEventListener('DOMContentLoaded', () => {
    // --- 0. База API и тема ---
    const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8000'
        : 'https://sov237-backend.onrender.com';

    const rootEl = document.documentElement;
    const themeMeta = document.querySelector('#theme-color-meta');
    const savedTheme = localStorage.getItem('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const initialTheme = savedTheme || (prefersLight ? 'light' : 'dark');
    if (initialTheme === 'light') {
        rootEl.setAttribute('data-theme', 'light');
        if (themeMeta) themeMeta.setAttribute('content', '#ffffff');
    }

    // --- 1. Мобильная навигация ---
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Закрытие меню при клике на ссылку
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
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
        const defaultProgress = 15; // дефолт для разработки
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

    // --- 7b. Система голосования (статичные данные) ---
    // ИЗМЕНЯЙТЕ ЭТИ ЦИФРЫ ДЛЯ ОБНОВЛЕНИЯ ГОЛОСОВ:
    const VOTES_FOR = 273;      // Голоса "За проект"
    const VOTES_AGAINST = 38;   // Голоса "Против проекта"
    
    // Функция для обновления отображения голосов
    function updateVotingDisplay() {
        const totalVotes = VOTES_FOR + VOTES_AGAINST;
        const supportPercentage = totalVotes > 0 ? ((VOTES_FOR / totalVotes) * 100).toFixed(1) : 0;
        
        // Обновляем числа
        document.getElementById('votes-for').textContent = VOTES_FOR;
        document.getElementById('votes-against').textContent = VOTES_AGAINST;
        document.getElementById('total-votes').textContent = totalVotes;
        document.getElementById('support-percentage').textContent = supportPercentage + '%';
        
        // Обновляем прогресс-бары
        const forProgress = totalVotes > 0 ? (VOTES_FOR / totalVotes) * 100 : 0;
        const againstProgress = totalVotes > 0 ? (VOTES_AGAINST / totalVotes) * 100 : 0;
        
        document.getElementById('progress-for').style.width = forProgress + '%';
        document.getElementById('progress-against').style.width = againstProgress + '%';
    }
    
    // Инициализируем отображение при загрузке
    updateVotingDisplay();

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
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // --- 9. Параллакс эффект для hero секции ---
    const heroBackground = document.querySelector('.hero-background');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (heroBackground && !prefersReducedMotion.matches) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroBackground.style.transform = `translateY(${rate}px)`;
        });
    }

    // --- 10. Ленивая загрузка изображений (через атрибут) ---
    document.querySelectorAll('img:not([loading])').forEach(img => {
        img.loading = 'lazy';
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