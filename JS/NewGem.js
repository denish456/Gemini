document.addEventListener('DOMContentLoaded', function () {
    // Back button functionality
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', function () {
            // Use history.back() to go to the previous page
            window.history.back();

            // Alternatively, you can use:
            // window.location.href = '/'; // Goes to home page
            // or specify a specific URL:
            // window.location.href = '/previous-page.html';
        });
    }
});
    // Mobile toggle functionality
    const editorToggle = document.getElementById('editorToggle');
    const previewToggle = document.getElementById('previewToggle');
    const editorSection = document.getElementById('editorSection');
    const previewSection = document.getElementById('previewSection');

    // Function to toggle sections
    function toggleSections(showEditor) {
        if (window.innerWidth <= 959) { // Only for mobile view
            if (showEditor) {
                editorSection.classList.add('active');
                previewSection.classList.remove('active');
                editorToggle.classList.add('bg-[#0B57D0]', 'text-white');
                editorToggle.classList.remove('bg-gray-300');
                previewToggle.classList.add('bg-gray-300');
                previewToggle.classList.remove('bg-[#0B57D0]', 'text-white');
            } else {
                previewSection.classList.add('active');
                editorSection.classList.remove('active');
                previewToggle.classList.add('bg-[#0B57D0]', 'text-white');
                previewToggle.classList.remove('bg-gray-300');
                editorToggle.classList.add('bg-gray-300');
                editorToggle.classList.remove('bg-[#0B57D0]', 'text-white');
            }
        } else {
            // For desktop, always show both sections
            editorSection.classList.add('active');
            previewSection.classList.add('active');
        }
    }

    // Initialize based on screen size
    function initializeSections() {
        if (window.innerWidth <= 959) {
            // Mobile view - start with editor visible
            toggleSections(true);
        } else {
            // Desktop view - show both sections
            editorSection.classList.add('active');
            previewSection.classList.add('active');
        }
    }

    // Only add event listeners if the toggle buttons exist (mobile view)
    if (editorToggle && previewToggle) {
        editorToggle.addEventListener('click', () => toggleSections(true));
        previewToggle.addEventListener('click', () => toggleSections(false));
    }

    // Handle window resize
    window.addEventListener('resize', initializeSections);

    // Initial setup
    initializeSections();

    // Rest of your existing JavaScript...
    const gemTitle = document.getElementById('gemTitle');
    const saveButton = document.getElementById('saveButton');
    const input = document.getElementById("nameInput");
    const wrapper = document.getElementById("inputWrapper");
    const errorText = document.getElementById("errorText");
    const errorIcon = document.getElementById("errorIcon");

    // Function to update Save button state
    function updateSaveButtonState() {
        if (input.value.trim() !== "") {
            saveButton.disabled = false;
           
        } else {
            saveButton.disabled = true;
            
        }
    }

    updateSaveButtonState();

    input.addEventListener("blur", () => {
        if (input.value.trim() === "") {
            wrapper.classList.remove("border-blue-800", "border-transparent");
            wrapper.classList.add("border-[#B3261E]");
            errorText.classList.remove("hidden");
            errorIcon.classList.remove("hidden");
        } else {
            wrapper.classList.remove("border-[#B3261E]");
            wrapper.classList.add("border-transparent");
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
            wrapper.classList.remove("border-[#B3261E]");
            wrapper.classList.add("border-transparent");
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

    plusButton.addEventListener('click', () => {
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

    textarea.addEventListener('input', () => {
        undoStack.push(textarea.value);
        redoStack.length = 0;
    });

    undoBtn.addEventListener('click', () => {
        if (undoStack.length > 1) {
            redoStack.push(undoStack.pop());
            textarea.value = undoStack[undoStack.length - 1] || '';
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
        fileInput.value = '';
    });

    toggleBtn.addEventListener('click', () => {
        dropdownMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!dropdownMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });

    const icon = document.getElementById('infoIcon');
    const tooltip = document.getElementById('tooltip');

    icon.addEventListener('click', (e) => {
        e.stopPropagation();
        tooltip.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!icon.contains(e.target)) {
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
        if (!knowledgeIcon.contains(e.target)) {
            knowledgeTooltip.classList.add('hidden');
        }
    });
