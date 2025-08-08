document.addEventListener('DOMContentLoaded', () => {
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

    // --- 6. Анимация прогресс-кольца ---
    const progressRing = document.querySelector('.progress-ring-progress');
    if (progressRing) {
        const radius = progressRing.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        const progress = 5; // 5% прогресса - работы только начинаются

        progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
        progressRing.style.strokeDashoffset = circumference;

        // Анимация при появлении в viewport
        const progressObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const offset = circumference - (progress / 100) * circumference;
                    progressRing.style.strokeDashoffset = offset;
                    progressObserver.unobserve(entry.target);
                }
            });
        });

        progressObserver.observe(progressRing);
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

                const response = await fetch('https://sov237-backend.onrender.com/api/contact', {
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

});