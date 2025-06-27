// Sidebar functionality
document.addEventListener('DOMContentLoaded', function () {
    // Sidebar toggle elements
    const openBtn = document.getElementById('openBtn');
    const mainContent = document.getElementById('main-content');
    const backdrop = document.getElementById('backdrop');
    const geminiData = document.querySelector('.gemini-data');

    // Sidebar toggle functionality
    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            if (window.innerWidth < 768) {
                // Mobile behavior - toggle sidebar visibility
                mainContent.classList.toggle('sidebar-open');
                mainContent.classList.toggle('pinned');
                backdrop.classList.toggle('active');

                // Ensure pinned state is consistent
                if (mainContent.classList.contains('sidebar-open')) {
                    mainContent.classList.remove('pinned');
                }
            } else {
                // Desktop behavior - toggle pinned state
                mainContent.classList.toggle('pinned');
            }
        });
    }

    if (backdrop) {
        backdrop.addEventListener('click', () => {
            mainContent.classList.remove('sidebar-open');
            backdrop.classList.remove('active');
        });
    }

    // Responsive behavior
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            // On desktop - ensure sidebar is visible and backdrop hidden
            mainContent.classList.remove('sidebar-open');
            backdrop.classList.remove('active');
        } else {
            // On mobile - remove pinned state
            mainContent.classList.remove('pinned');
             mainContent.classList.remove('sidebar-open');
            backdrop.classList.remove('active');
        }
    });


     if (mainContent && geminiData) {
        mainContent.addEventListener('mouseenter', () => {
            if (window.innerWidth >= 768) { /* Handled by CSS :hover */ }
        });
        mainContent.addEventListener('mouseleave', () => {
            if (window.innerWidth >= 768 && !mainContent.classList.contains("pinned")) { /* Handled by CSS :not(:hover) */ }
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                mainContent.classList.remove('sidebar-open');
                backdrop.classList.remove('active');
            }
        });
    }

    // Header dropdown functionality
    const modelToggle = document.getElementById('model-toggle');
    const modelDropdown = document.getElementById('model-dropdown');
    if (modelToggle && modelDropdown) {
        modelToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            modelDropdown.classList.toggle('show');
        });
        
        document.addEventListener('click', function (e) {
            if (!modelDropdown.contains(e.target) && !modelToggle.contains(e.target)) {
                modelDropdown.classList.remove('show');
            }
        });
        
        modelDropdown.addEventListener('click', function (e) { 
            e.stopPropagation(); 
        });
    }

    // Profile dropdown functionality
    const profileButton = document.getElementById('profile-button');
    const profileDropdown = document.getElementById('profile-dropdown');
    if (profileButton && profileDropdown) {
        profileButton.addEventListener('click', function (e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
        
        document.addEventListener('click', function (e) {
            if (!profileDropdown.contains(e.target) && e.target !== profileButton) {
                profileDropdown.classList.remove('show');
            }
        });
        
        profileDropdown.addEventListener('click', function (e) { 
            e.stopPropagation(); 
        });
    }

    // Profile image upload
    const profileInput = document.getElementById("profile-img-upload");
    const profileCircle = document.getElementById("profile-circle");
    if (profileCircle && profileInput) {
        profileCircle.addEventListener("click", () => {
            profileInput.click();
        });
        
        profileInput.addEventListener("change", function () {
            const file = this.files[0];
            if (file && file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const imageUrl = e.target.result;
                    if (profileCircle) {
                        profileCircle.innerHTML = "";
                        profileCircle.style.backgroundImage = `url(${imageUrl})`;
                        profileCircle.style.backgroundSize = "cover";
                        profileCircle.style.backgroundPosition = "center";
                    }
                    if (profileButton) {
                        profileButton.innerHTML = "";
                        profileButton.style.backgroundImage = `url(${imageUrl})`;
                        profileButton.style.backgroundSize = "cover";
                        profileButton.style.backgroundPosition = "center";
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Theme switcher functionality
    function toggleTheme(theme) {
        const body = document.body;
        body.classList.remove('light', 'dark');
        
        if (theme === 'light') {
            body.classList.add('light'); 
            localStorage.setItem('theme', 'light');
            document.querySelectorAll('.gemini-header button.bg-\\[\\#3d3f42\\] img').forEach(img => { 
                img.style.filter = 'none'; 
            });
        } else if (theme === 'dark') {
            body.classList.add('dark'); 
            localStorage.setItem('theme', 'dark');
            document.querySelectorAll('.gemini-header button.bg-\\[\\#3d3f42\\] img').forEach(img => { 
                img.style.filter = 'grayscale(100%) brightness(0) invert(1) saturate(10) hue-rotate(170deg)'; 
            });
        } else {
            // System preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                body.classList.add('dark');
                document.querySelectorAll('.gemini-header button.bg-\\[\\#3d3f42\\] img').forEach(img => { 
                    img.style.filter = 'grayscale(100%) brightness(0) invert(1) saturate(10) hue-rotate(170deg)'; 
                });
            } else {
                body.classList.add('light');
                document.querySelectorAll('.gemini-header button.bg-\\[\\#3d3f42\\] img').forEach(img => { 
                    img.style.filter = 'none'; 
                });
            }
            localStorage.setItem('theme', 'system');
        }
    }

    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        let effectiveTheme = 'system';
        
        if (savedTheme) { 
            effectiveTheme = savedTheme; 
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) { 
            effectiveTheme = 'dark'; 
        } else { 
            effectiveTheme = 'light'; 
        }
        
        toggleTheme(effectiveTheme);
        
        document.querySelectorAll('.theme-options li').forEach(li => {
            li.textContent = li.textContent.replace(' ✔', '').trim();
            if (li.textContent.toLowerCase() === effectiveTheme) { 
                li.textContent += ' ✔'; 
            }
        });
    }

    initializeTheme();
    
    document.querySelectorAll('.theme-options li').forEach(option => {
        option.addEventListener('click', function () {
            const theme = this.textContent.trim().toLowerCase().replace('✔', '').trim();
            toggleTheme(theme);
            document.querySelectorAll('.theme-options li').forEach(li => { 
                li.textContent = li.textContent.replace(' ✔', '').trim(); 
            });
            this.textContent += ' ✔';
        });
    });
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem('theme') === 'system') { 
            toggleTheme('system'); 
        }
    });
});

// Settings dropdown in header
function toggleDropdown() {
    const menu = document.getElementById('dropdownMenu');
    if (menu) {
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        if (window.innerWidth >= 768) {
            document.getElementById('main-content').classList.toggle('pinned');
            document.getElementById('setting-help').classList.toggle('setingbackgroundChange');
        }
    }
}

document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('dropdownMenu');
    const button = document.querySelector('.dropdown-toggle');
    if (dropdown && button && !dropdown.contains(e.target) && !button.contains(e.target)) {
        dropdown.style.display = 'none';
        document.getElementById('setting-help').classList.remove('setingbackgroundChange');
    }
});


// Mobile menu toggle functionality
document.getElementById('mobileMenuBtn').addEventListener('click', function () {
    document.getElementById('main-content').classList.toggle('sidebar-open');
    document.getElementById('main-content').classList.toggle('pinned');
    document.getElementById('backdrop').classList.toggle('active');
});

// Close sidebar when clicking backdrop
document.getElementById('backdrop').addEventListener('click', function () {
    document.getElementById('main-content').classList.remove('sidebar-open');
    document.getElementById('main-content').classList.remove('pinned');
    this.classList.remove('active');
});

function selectOption(clickedElement) {
    // Remove 'selected' class and hide all check icons
    document.querySelectorAll('.option').forEach(option => {
        option.classList.remove('selected');
        const checkIcon = option.querySelector('.fa-circle-check');
        if (checkIcon) {
            checkIcon.classList.add('hidden');
        }
    });

    // Add 'selected' class and show check icon for clicked option
    clickedElement.classList.add('selected');
    const clickedCheckIcon = clickedElement.querySelector('.fa-circle-check');
    if (clickedCheckIcon) {
        clickedCheckIcon.classList.remove('hidden');
    }
}
