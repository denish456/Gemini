const openBtn = document.getElementById('openBtn');
const mainContent = document.getElementById('main-content');
const search_icon = document.getElementById('search-icon');
const setting_help = document.getElementById('setting-help');
const geminiData = document.querySelector('.gemini-data');
 
openBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  mainContent.classList.toggle('pinned');
});
 
search_icon.addEventListener('click', () => {
  search_icon.classList.toggle('search-grey');
});
 
 
 
window.addEventListener('DOMContentLoaded', () => {
  const chatHistory = document.getElementById('chat-history');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');
 
  function addMessage(sender, message, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('flex', isUser ? 'justify-end' : 'justify-start');
 
    const messageBubble = document.createElement('div');
    messageBubble.classList.add(
      'p-3', 'rounded-lg', 'max-w-[80%]', 'shadow-sm', 'break-words', 'whitespace-pre-wrap',
      isUser ? 'bg-[#333537]' : 'bg-gray-700',
      isUser ? 'text-white' : 'text-gray-200'
    );
 
    if (isUser) {
      messageBubble.style.borderRadius = '24px 4px 24px 24px';
    }
 
    if (!isUser) {
      const senderSpan = document.createElement('span');
      senderSpan.textContent = `${sender}: `;
      senderSpan.classList.add('font-bold', 'text-blue-300', 'mr-1');
      messageBubble.appendChild(senderSpan);
    }
 
    messageBubble.appendChild(document.createTextNode(message));
    messageDiv.appendChild(messageBubble);
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }
 
  function getGeminiResponse(userMessage) {
    const lower = userMessage.toLowerCase();
    let response = "I'm sorry, I don't understand that. Could you please rephrase?";
 
    if (lower.includes("hello") || lower.includes("hi")) {
      response = "Hello there! How can I help you today?";
    } else if (lower.includes("your purpose")) {
      response = "I am a large language model trained by Google. I'm here to help with information and creative tasks.";
    } else if (lower.includes("weather")) {
      response = "I can't access live weather, but you can check a weather app for that!";
    } else if (lower.includes("time")) {
      response = `The current time is ${new Date().toLocaleTimeString()}.`;
    } else if (lower.includes("joke")) {
      response = "Why don't scientists trust atoms? Because they make up everything!";
    }
 
    setTimeout(() => addMessage("Gemini", response, false), 700);
  }
 
  function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
      addMessage("You", message, true);
      getGeminiResponse(message);
      userInput.value = '';
    } else {
      userInput.classList.add('border-red-500');
      setTimeout(() => userInput.classList.remove('border-red-500'), 1000);
    }
  }
 
  function autoResize(textarea) {
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = (scrollHeight > 150 ? 150 : scrollHeight) + 'px';
    textarea.style.overflowY = scrollHeight > 150 ? 'auto' : 'hidden';
  }
 
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
 
  document.addEventListener('DOMContentLoaded', function () {
    const modelToggle = document.getElementById('model-toggle');
    const modelDropdown = document.getElementById('model-dropdown');
 
    // Toggle dropdown visibility
    modelToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      modelDropdown.classList.toggle('hidden');
    });
 
    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
      if (!modelDropdown.contains(e.target) && e.target !== modelToggle) {
        modelDropdown.classList.add('hidden');
      }
    });
 
    // Prevent dropdown from closing when clicking inside it
    modelDropdown.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  });
 
  sendButton.addEventListener('click', sendMessage);
});
 
 
document.addEventListener('DOMContentLoaded', function () {
  const modelToggle = document.getElementById('model-toggle');
  const modelDropdown = document.getElementById('model-dropdown');
 
  modelToggle.addEventListener('click', function (e) {
    e.stopPropagation();
 
    if (modelDropdown.classList.contains('show')) {
      // Close dropdown with transition
      modelDropdown.classList.remove('show');
      setTimeout(() => {
        modelDropdown.classList.add('hidden');
      }, 200);
    } else {
      // Open dropdown with transition
      modelDropdown.classList.remove('hidden');
      setTimeout(() => {
        modelDropdown.classList.add('show');
      }, 10);
    }
  });
 
  // Close when clicking outside
  document.addEventListener('click', function (e) {
    if (!modelDropdown.contains(e.target) && !modelToggle.contains(e.target)) {
      modelDropdown.classList.remove('show');
      setTimeout(() => {
        modelDropdown.classList.add('hidden');
      }, 200);
    }
  });
 
  modelDropdown.addEventListener('click', function (e) {
    e.stopPropagation();
  });
});
 
function toggleDropdown() {
  const menu = document.getElementById('dropdownMenu');
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  mainContent.classList.toggle('pinned');
  setting_help.classList.toggle('setingbackgroundChange')
}
 
// Optional: Hide dropdown when clicking outside
document.addEventListener('click', function (e) {
  const dropdown = document.getElementById('dropdownMenu');
  const button = document.querySelector('.dropdown-toggle');
  if (!dropdown.contains(e.target) && !button.contains(e.target)) {
    dropdown.style.display = 'none';
    setting_help.classList.remove('setingbackgroundChange')
  }
 
});
 
 
const sidebar = document.getElementById("main-content");
const content = document.getElementById("gemini-data-wrapper");
 
mainContent.addEventListener('mouseenter', () => {
  geminiData.classList.remove('add-width');
  geminiData.classList.add('remove-width');
});
 
mainContent.addEventListener('mouseleave', () => {
  if (!sidebar.classList.contains("pinned")) {
    geminiData.classList.add('add-width');
    geminiData.classList.remove('remove-width');
  }
});
 
sidebar.addEventListener("mouseleave", () => {
  if (!sidebar.classList.contains("pinned")) {
    content.classList.remove("ml-[260px]");
    content.classList.add("ml-[60px]");
  }
});
 
 
 
 



// 11-6

document.addEventListener('DOMContentLoaded', function () {
    const profileButton = document.getElementById('profile-button');
    const profileDropdown = document.getElementById('profile-dropdown');

    // Toggle dropdown
    profileButton.addEventListener('click', function (e) {
        e.stopPropagation();
        if (profileDropdown.classList.contains('hidden')) {
            profileDropdown.classList.remove('hidden');
            setTimeout(() => {
                profileDropdown.classList.remove('scale-95', 'opacity-0');
                profileDropdown.classList.add('scale-100', 'opacity-100');
            }, 10);
        } else {
            profileDropdown.classList.remove('scale-100', 'opacity-100');
            profileDropdown.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                profileDropdown.classList.add('hidden');
            }, 200);
        }
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
        if (!profileDropdown.contains(e.target) && e.target !== profileButton) {
            profileDropdown.classList.remove('scale-100', 'opacity-100');
            profileDropdown.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                profileDropdown.classList.add('hidden');
            }, 200);
        }
    });

    // Prevent dropdown clicks from closing it
    profileDropdown.addEventListener('click', function (e) {
        e.stopPropagation();
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const profileWrapper = document.getElementById("profile-pic-wrapper");
    const profileInput = document.getElementById("profile-img-upload");
    const profileCircle = document.getElementById("profile-circle");

    profileWrapper.addEventListener("click", () => {
        profileInput.click();
    });

    profileInput.addEventListener("change", function () {
        const file = this.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profileCircle.innerHTML = ""; // remove the "d"
                profileCircle.style.backgroundImage = `url(${e.target.result})`;
                profileCircle.style.backgroundSize = "cover";
                profileCircle.style.backgroundPosition = "center";
            };
            reader.readAsDataURL(file);
        }
    });
});
