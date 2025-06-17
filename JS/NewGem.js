const input = document.getElementById("nameInput");
  const wrapper = document.getElementById("inputWrapper");
  const errorText = document.getElementById("errorText");
  const errorIcon = document.getElementById("errorIcon");

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
      wrapper.classList.remove("border-[#B3261E]");
      wrapper.classList.add("border-transparent");
      errorText.classList.add("hidden");
      errorIcon.classList.add("hidden");
    }
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

  // Toggle dropdown
  plusButton.addEventListener('click', () => {
    plusDropdown.classList.toggle('hidden');
  });

  // Upload file
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
      };
      reader.readAsDataURL(file);
    }
  });

  // Remove preview
  removePreview.addEventListener('click', () => {
    imagePreview.src = '';
    imagePreviewContainer.classList.add('hidden');
    uploadInput.value = '';
  });

  // Auto-resize textarea
  function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';

    // Show/hide mic/send icons
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

  // Optional: Send button updates preview
  document.getElementById('send-button').addEventListener('click', () => {
    const value = userInput.value.trim();
    if (value) {
      previewText.textContent = `Previewing "${value}" Gem`;
      errorText.classList.add('hidden');
    } else {
      errorText.classList.remove('hidden');
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
    // Clear redoStack on new input
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