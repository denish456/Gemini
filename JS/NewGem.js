document.addEventListener('DOMContentLoaded', function () {
    // Back button functionality
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', function () {
            window.history.back();
        });
    }

    // --- Mobile toggle functionality ---
    const editorToggle = document.getElementById('editorToggle');
    const previewToggle = document.getElementById('previewToggle');
    const editorSection = document.getElementById('editorSection');
    const previewSection = document.getElementById('previewSection');

    function toggleSections(showEditor) {
        if (window.innerWidth <= 959) {
            if (showEditor) {
                editorSection.classList.add('active');
                previewSection.classList.remove('active');
                editorToggle.style.backgroundColor = 'var(--button-primary-bg)';
                editorToggle.style.color = 'var(--button-primary-text)';
                previewToggle.style.backgroundColor = 'var(--button-disabled-bg)';
                previewToggle.style.color = 'var(--button-disabled-text)';
            } else {
                previewSection.classList.add('active');
                editorSection.classList.remove('active');
                previewToggle.style.backgroundColor = 'var(--button-primary-bg)';
                previewToggle.style.color = 'var(--button-primary-text)';
                editorToggle.style.backgroundColor = 'var(--button-disabled-bg)';
                editorToggle.style.color = 'var(--button-disabled-text)';
            }
        } else {
            editorSection.classList.add('active');
            previewSection.classList.add('active');
        }
    }

    function initializeSections() {
        if (window.innerWidth <= 959) {
            toggleSections(true); // Default to editor on mobile
        } else {
            editorSection.classList.add('active');
            previewSection.classList.add('active');
            // Ensure buttons revert to neutral if resized to desktop
            editorToggle.style.backgroundColor = '';
            editorToggle.style.color = '';
            previewToggle.style.backgroundColor = '';
            previewToggle.style.color = '';
        }
    }

    if (editorToggle && previewToggle) {
        editorToggle.addEventListener('click', () => toggleSections(true));
        previewToggle.addEventListener('click', () => toggleSections(false));
    }

    window.addEventListener('resize', initializeSections);
    initializeSections();

    // --- Theme Toggle functionality ---
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Check for saved theme preference or system preference
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        body.classList.add(currentTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.classList.add('dark-theme');
    }

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light-theme');
        } else {
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark-theme');
        }
    });

    // --- Existing JavaScript functionalities, updated to use CSS variables ---
    const gemTitle = document.getElementById('gemTitle');
    const saveButton = document.getElementById('saveButton');
    const input = document.getElementById("nameInput");
    const wrapper = document.getElementById("inputWrapper");
    const errorText = document.getElementById("errorText");
    const errorIcon = document.getElementById("errorIcon");

    function updateSaveButtonState() {
        if (input.value.trim() !== "") {
            saveButton.disabled = false;
            saveButton.style.backgroundColor = 'var(--button-primary-bg)';
            saveButton.style.color = 'var(--button-primary-text)';
            saveButton.onmouseover = () => saveButton.style.backgroundColor = 'var(--button-primary-hover-bg)';
            saveButton.onmouseout = () => saveButton.style.backgroundColor = 'var(--button-primary-bg)';
        } else {
            saveButton.disabled = true;
            saveButton.style.backgroundColor = 'var(--button-disabled-bg)';
            saveButton.style.color = 'var(--button-disabled-text)';
            saveButton.onmouseover = null;
            saveButton.onmouseout = null;
        }
    }

    updateSaveButtonState();

    input.addEventListener("blur", () => {
        if (input.value.trim() === "") {
            wrapper.style.borderColor = 'var(--error-color)';
            errorText.classList.remove("hidden");
            errorIcon.classList.remove("hidden");
        } else {
            wrapper.style.borderColor = 'transparent';
            errorText.classList.add("hidden");
            errorIcon.classList.add("hidden");
        }
    });

    input.addEventListener("input", () => {
        if (input.value.trim() !== "") {
            gemTitle.textContent = input.value.trim();
        } else {
            gemTitle.textContent = 'New Gem';
        }

        if (input.value.trim() !== "") {
            wrapper.style.borderColor = 'transparent';
            errorText.classList.add("hidden");
            errorIcon.classList.add("hidden");
        }
        updateSaveButtonState();
    });

    const plusButton = document.getElementById('plus-button');
    const plusDropdown = document.getElementById('plus-dropdown');
    const triggerUpload = document.getElementById('trigger-upload');
    const uploadInput = document.getElementById('upload-preview-input');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removePreview = document.getElementById('remove-preview');
    const userInput = document.getElementById('user-input');
    const previewText = document.getElementById('previewText');
    const micIcon = document.getElementById('mic-icon');
    const sendIcon = document.getElementById('send-icon');

    plusButton.addEventListener('click', (e) => {
        e.stopPropagation();
        plusDropdown.classList.toggle('hidden');
    });

    triggerUpload.addEventListener('click', () => {
        uploadInput.click();
    });

    uploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                imagePreview.src = reader.result;
                imagePreviewContainer.classList.remove('hidden');
                plusDropdown.classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    document.addEventListener('click', (e) => {
        if (!plusButton.contains(e.target) && !plusDropdown.contains(e.target)) {
            plusDropdown.classList.add('hidden');
        }
    });

    removePreview.addEventListener('click', () => {
        imagePreview.src = '';
        imagePreviewContainer.classList.add('hidden');
        uploadInput.value = '';
    });

    function autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';

        if (textarea.value.trim()) {
            micIcon.classList.add('opacity-0', 'scale-75', 'translate-x-2');
            micIcon.classList.remove('opacity-100', 'scale-100', 'translate-x-0');
            sendIcon.classList.remove('opacity-0', 'scale-75', 'translate-x-2');
            sendIcon.classList.add('opacity-100', 'scale-100', 'translate-x-0');
        } else {
            micIcon.classList.remove('opacity-0', 'scale-75', 'translate-x-2');
            micIcon.classList.add('opacity-100', 'scale-100', 'translate-x-0');
            sendIcon.classList.add('opacity-0', 'scale-75', 'translate-x-2');
            sendIcon.classList.remove('opacity-100', 'scale-100', 'translate-x-0');
        }
    }
    // Initial call to set correct icon on page load if text area has content
    autoResize(userInput);
    userInput.addEventListener('input', () => autoResize(userInput));


    document.getElementById('send-button').addEventListener('click', () => {
        const value = userInput.value.trim();
        if (value) {
            previewText.textContent = `Previewing "${value}" Gem`;
        } else {
            previewText.textContent = 'To preview your Gem start by giving it a name';
        }
    });

    const textarea = document.getElementById('nameTextarea');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    const undoStack = [];
    const redoStack = [];

    // Initialize undo stack with current content on load
    undoStack.push(textarea.value);

    textarea.addEventListener('input', () => {
        if (undoStack[undoStack.length - 1] !== textarea.value) { // Prevent pushing same state multiple times for rapid input
            undoStack.push(textarea.value);
            redoStack.length = 0; // Clear redo stack on new input
        }
    });

    undoBtn.addEventListener('click', () => {
        if (undoStack.length > 1) { // Ensure there's a previous state to revert to
            redoStack.push(undoStack.pop());
            textarea.value = undoStack[undoStack.length - 1];
        }
    });

    redoBtn.addEventListener('click', () => {
        if (redoStack.length > 0) {
            const value = redoStack.pop();
            textarea.value = value;
            undoStack.push(value);
        }
    });

    const toggleBtn = document.getElementById('toggleDropdown');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const uploadOption = document.getElementById('uploadOption');
    const fileInput = document.getElementById('fileInput');
    const fileText = document.getElementById('fileText');
    const previewImage = document.getElementById('previewImage');
    const imageWrapper = document.getElementById('imageWrapper');
    const removeImage = document.getElementById('removeImage');

    uploadOption.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                imageWrapper.classList.remove('hidden');
                fileText.classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    removeImage.addEventListener('click', () => {
        previewImage.src = '';
        imageWrapper.classList.add('hidden');
        fileText.classList.remove('hidden');
        fileInput.value = ''; // Clear the file input so the same file can be re-uploaded
    });

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent document click from immediately closing it
        dropdownMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!dropdownMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });

    const infoIcon = document.getElementById('infoIcon');
    const tooltip = document.getElementById('tooltip');

    infoIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        tooltip.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!infoIcon.contains(e.target) && !tooltip.contains(e.target)) { // Also check if click is inside tooltip
            tooltip.classList.add('hidden');
        }
    });

    const knowledgeIcon = document.getElementById('knowledgeIcon');
    const knowledgeTooltip = document.getElementById('knowledgeTooltip');

    knowledgeIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        knowledgeTooltip.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!knowledgeIcon.contains(e.target) && !knowledgeTooltip.contains(e.target)) { // Also check if click is inside tooltip
            knowledgeTooltip.classList.add('hidden');
        }
    });
});