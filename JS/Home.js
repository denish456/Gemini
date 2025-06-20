document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('openBtn');
    const mainContent = document.getElementById('main-content'); // The sidebar container
    const geminiData = document.querySelector('.gemini-data'); // The main content area
    const geminiHeader = document.getElementById('gemini-header'); // The header
    const settingHelpSection = document.getElementById('setting-help');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const modelToggle = document.getElementById('model-toggle');
    const modelDropdown = document.getElementById('model-dropdown');
    const mainInnerLeft = document.querySelector('.main-inner-left');
    const expandText = mainInnerLeft.querySelector('.expand');
    const collapseText = mainInnerLeft.querySelector('.collapse');

    // Create and append overlay for mobile view
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    document.body.appendChild(overlay);

    // Helper function to check if it's a mobile view
    const isMobileView = () => window.innerWidth < 768;

    // --- Sidebar Toggle Logic ---
    function toggleSidebar() {
        if (isMobileView()) {
            // Mobile: Toggle collapsed-mobile class
            mainContent.classList.toggle('collapsed-mobile');
            geminiData.classList.toggle('collapsed-mobile');
            geminiHeader.classList.toggle('shifted-mobile');
            overlay.classList.toggle('active', !mainContent.classList.contains('collapsed-mobile')); // Overlay active when sidebar is NOT collapsed
            document.body.style.overflow = mainContent.classList.contains('collapsed-mobile') ? 'auto' : 'hidden'; // Prevent body scroll when sidebar open
        } else {
            // Desktop: Toggle expanded-desktop class
            mainContent.classList.toggle('expanded-desktop');
            geminiData.classList.toggle('expanded-desktop');
            geminiHeader.classList.toggle('expanded-desktop');

            // Toggle expand/collapse text visibility on desktop
            const isExpanded = mainContent.classList.contains('expanded-desktop');
            expandText.style.display = isExpanded ? 'none' : 'inline-block';
            collapseText.style.display = isExpanded ? 'inline-block' : 'none';

            // Hide/Show text labels for desktop expanded/collapsed state
            document.querySelectorAll('.drawer-data li span:not(.material-symbols-outlined), .recent-section h3, .recent-section ul li, .setting-help span:not(.material-symbols-outlined)').forEach(el => {
                if (isExpanded) {
                    el.style.display = 'inline-block';
                } else {
                    el.style.display = 'none';
                }
            });

            // Adjust recent section padding and text alignment
            const recentSection = document.querySelector('.recent-section');
            const recentSectionH3 = recentSection.querySelector('h3');
            if (isExpanded) {
                recentSection.style.paddingLeft = '15px';
                recentSectionH3.style.textAlign = 'left';
            } else {
                recentSection.style.paddingLeft = '0';
                recentSectionH3.style.textAlign = 'center';
            }

            // Adjust list item justification
            document.querySelectorAll('.drawer-data li').forEach(li => {
                if (isExpanded) {
                    li.style.justifyContent = 'flex-start';
                    li.style.paddingLeft = '15px';
                    li.style.paddingRight = '15px';
                } else {
                    li.style.justifyContent = 'center';
                    li.style.paddingLeft = '0';
                    li.style.paddingRight = '0';
                }
            });
        }
    }

    // --- Initial Setup on Load and Resize ---
    const initializeLayout = () => {
        // Reset classes first to apply correct ones based on screen size
        mainContent.classList.remove('collapsed-mobile', 'expanded-desktop');
        geminiData.classList.remove('collapsed-mobile', 'expanded-desktop');
        geminiHeader.classList.remove('shifted-mobile', 'expanded-desktop');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto'; // Default to auto scroll

        if (isMobileView()) {
            // Mobile: Sidebar is visible by default
            mainContent.style.width = '250px';
            mainContent.style.transform = 'translateX(0)';
            geminiData.style.marginLeft = '250px';
            geminiData.style.width = 'calc(100% - 250px)';
            geminiHeader.style.left = '0'; // Header starts at 0, shifts with mainContent if needed
            geminiHeader.style.width = '100%'; // Full width initially

            // Hide expand/collapse text for mobile
            expandText.style.display = 'none';
            collapseText.style.display = 'none';

            // Hide text labels in sidebar
            document.querySelectorAll('.drawer-data li span:not(.material-symbols-outlined), .recent-section h3, .recent-section ul li, .setting-help span:not(.material-symbols-outlined)').forEach(el => {
                el.style.display = 'none';
            });
            document.querySelectorAll('.drawer-data li').forEach(li => {
                li.style.justifyContent = 'center';
                li.style.paddingLeft = '0';
                li.style.paddingRight = '0';
            });
            const recentSection = document.querySelector('.recent-section');
            const recentSectionH3 = recentSection.querySelector('h3');
            recentSection.style.paddingLeft = '0';
            recentSectionH3.style.textAlign = 'center';


        } else {
            // Desktop: Sidebar starts collapsed
            mainContent.style.width = '70px';
            mainContent.style.transform = 'translateX(0)'; // Ensure no mobile transform
            geminiData.style.marginLeft = '70px';
            geminiData.style.width = 'calc(100% - 70px)';
            geminiHeader.style.left = '70px'; // Header starts shifted
            geminiHeader.style.width = 'calc(100% - 70px)';

            // Show expand text, hide collapse text for desktop (initial state)
            expandText.style.display = 'inline-block';
            collapseText.style.display = 'none';

            // Hide text labels in sidebar (as it's collapsed)
            document.querySelectorAll('.drawer-data li span:not(.material-symbols-outlined), .recent-section h3, .recent-section ul li, .setting-help span:not(.material-symbols-outlined)').forEach(el => {
                el.style.display = 'none';
            });
            document.querySelectorAll('.drawer-data li').forEach(li => {
                li.style.justifyContent = 'center';
                li.style.paddingLeft = '0';
                li.style.paddingRight = '0';
            });
            const recentSection = document.querySelector('.recent-section');
            const recentSectionH3 = recentSection.querySelector('h3');
            recentSection.style.paddingLeft = '0';
            recentSectionH3.style.textAlign = 'center';
        }
        // Ensure no fixed overflow on non-mobile states
        document.body.style.overflow = 'auto';
    };

    // --- Event Listeners ---
    openBtn.addEventListener('click', toggleSidebar);

    overlay.addEventListener('click', () => {
        if (isMobileView() && !mainContent.classList.contains('collapsed-mobile')) {
            // Only toggle if sidebar is open on mobile
            toggleSidebar();
        }
    });

    // Close settings dropdown when sidebar is toggled (relevant for desktop)
    openBtn.addEventListener('click', () => {
        dropdownMenu.classList.remove('show');
    });

    // Close settings dropdown on content click (outside sidebar/header)
    geminiData.addEventListener('click', () => {
        dropdownMenu.classList.remove('show');
        modelDropdown.classList.remove('show');
        const profileDropdown = document.getElementById('profile-dropdown');
        if (profileDropdown) profileDropdown.classList.remove('show-profile-dropdown');
    });


    // --- Settings & Help Dropdown ---
    settingHelpSection.querySelector('.dropdown-toggle').addEventListener('click', (event) => {
        dropdownMenu.classList.toggle('show');
        event.stopPropagation(); // Prevent click from bubbling up and closing immediately
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!settingHelpSection.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('show');
        }
        if (!modelToggle.contains(event.target) && !modelDropdown.contains(event.target)) {
            modelDropdown.classList.remove('show');
        }
    });

    // --- Model Toggle Dropdown ---
    modelToggle.addEventListener('click', (event) => {
        modelDropdown.classList.toggle('show');
        event.stopPropagation();
    });

    // --- Profile Dropdown (from your original HTML) ---
    const profileButton = document.getElementById('profile-button');
    const profileDropdown = document.getElementById('profile-dropdown');

    if (profileButton && profileDropdown) {
        profileButton.addEventListener('click', (event) => {
            profileDropdown.classList.toggle('show-profile-dropdown');
            event.stopPropagation();
        });
    }

    // --- Profile Image Upload (from your original HTML) ---
    const profileCircle = document.getElementById('profile-circle');
    const profileImgUpload = document.getElementById('profile-img-upload');

    if (profileCircle && profileImgUpload) {
        profileCircle.addEventListener('click', () => {
            profileImgUpload.click(); // Trigger the hidden file input
        });

        profileImgUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profileCircle.innerHTML = `<img src="${e.target.result}" alt="Profile" class="w-full h-full object-cover rounded-full">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }


    // --- Recent Chats (from your original HTML) ---
    const recentChatsData = [
        "Code Review: Gemini Chat A...",
        "Saved Info Page Implement...",
        "Responsive Design for HTM...",
        "HTML Navigation with Persi...",
        "GitHub થી બ્રાન્ચ ખોલવાની રીત",
    ];

    const recentChatsList = document.getElementById('recent-chats');
    if (recentChatsList) {
        recentChatsData.forEach(chat => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="#">${chat}</a>`;
            recentChatsList.appendChild(li);
        });

        // Add "Show more" functionality (optional)
        if (recentChatsData.length > 5) { // Example threshold
            const showMoreLi = document.createElement('li');
            showMoreLi.innerHTML = `<a href="#" class="flex items-center gap-2">Show more <span class="material-icons">arrow_drop_down</span></a>`;
            recentChatsList.appendChild(showMoreLi);
        }
    }


    // Initial layout setup on load
    initializeLayout();
    // Re-initialize layout on window resize
    window.addEventListener('resize', initializeLayout);
});