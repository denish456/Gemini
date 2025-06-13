let openBtn, mainContent, search_icon, setting_help, geminiData, backdrop, newChatButton,
    chatHistoryDiv, userInput, sendButton, sendIconContainer, tooltipText, fileInput,
    previewContainer, previewImg, removePreviewBtn, triggerUpload, recentChatsUl, greetingDiv;
let plusButton, plusDropdown; 

let currentChatId = null; 
let hasImage = false; 

function generateUniqueId() {
    return 'chat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function getChatData() {
    const data = localStorage.getItem('geminiChatHistory');
    try {
        return data ? JSON.parse(data) : { chats: [], activeChatId: null };
    } catch (e) {
        console.error("Error parsing chat history from localStorage:", e);
        return { chats: [], activeChatId: null };
    }
}

function setChatData(data) {
    localStorage.setItem('geminiChatHistory', JSON.stringify(data));
}

function saveCurrentChatSession() {
    if (!currentChatId || !chatHistoryDiv) {
        return;
    }

    const currentMessages = [];
    chatHistoryDiv.querySelectorAll('.flex').forEach(messageDiv => {
        const isUser = messageDiv.classList.contains('justify-end');
        const textElement = messageDiv.querySelector('div:not(.absolute) > span');
        const textContent = textElement ? textElement.textContent : '';
        const imageElement = messageDiv.querySelector('img.max-w-\\[200px\\]');
        const imageUrl = imageElement ? imageElement.src : null;

        currentMessages.push({
            text: textContent,
            isUser: isUser,
            imageUrl: imageUrl
        });
    });

    if (currentMessages.length === 0) {
        return;
    }

    let data = getChatData();
    let chatIndex = data.chats.findIndex(chat => chat.id === currentChatId);

    let chatTitle = "New Chat";
    const firstUserMessage = currentMessages.find(msg => msg.isUser && msg.text.trim().length > 0);
    if (firstUserMessage) {
        chatTitle = firstUserMessage.text.trim().substring(0, 30);
        if (firstUserMessage.text.trim().length > 30) {
            chatTitle += "...";
        }
    } else if (currentMessages.length > 0 && currentMessages.some(msg => msg.imageUrl)) {
        chatTitle = "Image Chat";
    } else {
        return;
    }


    if (chatIndex > -1) {
        data.chats[chatIndex].messages = currentMessages;
        data.chats[chatIndex].title = chatTitle;
        data.chats[chatIndex].timestamp = Date.now();
    } else {
        data.chats.push({
            id: currentChatId,
            title: chatTitle,
            messages: currentMessages,
            timestamp: Date.now()
        });
    }
    data.activeChatId = currentChatId;

    setChatData(data);
    renderRecentChats();
}

function loadChatSession(chatId) {
    saveCurrentChatSession();

    const data = getChatData();
    const chatToLoad = data.chats.find(chat => chat.id === chatId);

    if (chatToLoad) {
        currentChatId = chatId;
        chatHistoryDiv.innerHTML = '';
        greetingDiv.style.display = 'none';

        chatToLoad.messages.forEach(msg => {
            addMessage(msg.text, msg.isUser, msg.imageUrl, false);
        });
        chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;

        data.activeChatId = currentChatId;
        setChatData(data);

        document.querySelectorAll('#recent-chats li').forEach(li => {
            li.classList.remove('active-chat');
            if (li.dataset.chatId === chatId) {
                li.classList.add('active-chat');
            }
        });
    } else {
        console.error("Chat not found:", chatId);
        createNewChat();
    }
}

// Creates a new chat session
function createNewChat() {
    saveCurrentChatSession();

    currentChatId = generateUniqueId();
    chatHistoryDiv.innerHTML = '';
    userInput.value = '';
    userInput.style.height = 'auto';
    if (previewImg) previewImg.src = '';
    if (previewContainer) previewContainer.classList.add("hidden");
    if (fileInput) fileInput.value = '';
    hasImage = false;
    greetingDiv.style.display = 'flex';

    if (sendIconContainer) {
        sendIconContainer.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                            <path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z"/>
                        </svg>
                    `;
    }
    if (tooltipText) {
        tooltipText.textContent = "Use Microphone";
    }

    let data = getChatData();
    data.activeChatId = currentChatId;
    setChatData(data);

    renderRecentChats();
}

if (!window.kebabOutsideClickInitialized) {
    document.addEventListener('click', () => {
        document.querySelectorAll('.kebab-dropdown').forEach(dropdown => {
            dropdown.classList.add('hidden');
        });
    });
    window.kebabOutsideClickInitialized = true;
}






let showAllChats = false; // default state

function renderRecentChats() {
    if (!recentChatsUl) return;

    recentChatsUl.innerHTML = '';
    const data = getChatData();

    data.chats.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    const chatsToShow = showAllChats ? data.chats : data.chats.slice(0, 5);

    chatsToShow.forEach(chat => {
        const li = document.createElement('li');
        li.dataset.chatId = chat.id;
        li.classList.add(
            'flex', 'items-center', 'gap-4', 'cursor-pointer',
            'text-ellipsis', 'relative', 'group'
        );

        if (chat.id === data.activeChatId) {
            li.classList.add('active-chat');
        }

        const icon = document.createElement('a');
        icon.className = 'material-symbols-outlined text-xl flex-shrink-0';
        icon.textContent = 'chat_bubble';

        const span = document.createElement('span');
        span.textContent = chat.title || "Untitled Chat";
        span.classList.add('flex-grow', 'text-ellipsis');

        li.appendChild(icon);
        li.appendChild(span);

        const kebabMenuWrapper = document.createElement('div');
        kebabMenuWrapper.className = 'kebab-menu-wrapper absolute right-2 top-1/2 -translate-y-1/2 flex items-center z-20';
        kebabMenuWrapper.innerHTML = `
            <button class="kebab-button material-icons-outlined rounded-full w-8 h-8 flex items-center justify-center">
                more_vert
            </button>
            <ul class="kebab-dropdown hidden absolute right-[100%] top-[0] mt-1 w-32 rounded-lg shadow-lg z-30 text-sm py-1"
                style="background-color: var(--dropdown-bg); color: var(--dropdown-text); border: 1px solid var(--dropdown-border);">
                <li class="hover:bg-[var(--bg-hover)] hover:rounded-none py-1">
                    <button class="block w-full text-left px-3 py-1">Pin</button>
                </li>
                <li class="hover:bg-[var(--bg-hover)] hover:rounded-none">
                    <button class="block w-full text-left px-3 py-1">Rename</button>
                </li>
                <li class="hover:bg-[var(--bg-hover)] hover:rounded-none">
                    <button class="block w-full text-left px-3 py-1">Delete</button>
                </li>
            </ul>
        `;
        li.appendChild(kebabMenuWrapper);

        const kebabButton = kebabMenuWrapper.querySelector('.kebab-button');
        const kebabDropdown = kebabMenuWrapper.querySelector('.kebab-dropdown');

        kebabButton.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.kebab-dropdown').forEach(dropdown => {
                if (dropdown !== kebabDropdown) {
                    dropdown.classList.add('hidden');
                }
            });
            kebabDropdown.classList.toggle('hidden');
        });

        const [pinBtn, renameBtn, deleteBtn] = kebabDropdown.querySelectorAll('button');

        pinBtn.addEventListener('click', () => {
            console.log('Pin clicked for chat:', chat.id);
            kebabDropdown.classList.add('hidden');
        });

        renameBtn.addEventListener('click', () => {
            const newTitle = prompt('Enter new name for chat:', chat.title);
            if (newTitle && newTitle.trim() !== "") {
                let data = getChatData();
                let chatToRename = data.chats.find(c => c.id === chat.id);
                if (chatToRename) {
                    chatToRename.title = newTitle.trim();
                    setChatData(data);
                    renderRecentChats();
                }
            }
            kebabDropdown.classList.add('hidden');
        });

        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this chat?')) {
                let data = getChatData();
                data.chats = data.chats.filter(c => c.id !== chat.id);
                if (data.activeChatId === chat.id) {
                    data.activeChatId = null;
                }
                setChatData(data);
                renderRecentChats();
                if (currentChatId === chat.id || data.chats.length === 0) {
                    createNewChat();
                }
            }
            kebabDropdown.classList.add('hidden');
        });

        li.addEventListener('click', (e) => {
            if (!kebabMenuWrapper.contains(e.target)) {
                loadChatSession(chat.id);
            }
        });

        recentChatsUl.appendChild(li);
    });

    renderViewToggle(data.chats.length); // 👇 Add this at the end
}

function renderViewToggle(totalChats) {
    let toggleBtn = document.getElementById('view-toggle-btn');

    if (!toggleBtn) {
        toggleBtn = document.createElement('button');
        toggleBtn.id = 'view-toggle-btn';
        toggleBtn.className = 'text-sm text-blue-500 mt-2 ml-2';
        toggleBtn.addEventListener('click', () => {
            showAllChats = !showAllChats;
            renderRecentChats();
        });
        recentChatsUl.parentElement.appendChild(toggleBtn); // Make sure UL is wrapped in a div
    }

    if (totalChats <= 5) {
        toggleBtn.style.display = 'none';
    } else {
        toggleBtn.textContent = showAllChats ? 'View Less' : 'View More';
        toggleBtn.style.display = 'block';
    }
}



// Global document click listener to close kebab dropdowns
document.addEventListener('click', (e) => {
    document.querySelectorAll('.kebab-dropdown').forEach(dropdown => {
        // Check if the click was outside this dropdown AND not on its corresponding kebab button
        const kebabButton = dropdown.previousElementSibling; // Assuming direct sibling
        if (!dropdown.classList.contains('hidden') && !dropdown.contains(e.target) && (!kebabButton || !kebabButton.contains(e.target))) {
            dropdown.classList.add('hidden');
        }
    });
});

// Adds a message to the chat history display
function addMessage(text, isUser, imageUrl = null, autoScroll = true) {
    if (!chatHistoryDiv) return;

    greetingDiv.style.display = 'none';

    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;

    const bubble = document.createElement('div');
    bubble.className = `p-3 max-w-[80%] break-words whitespace-pre-wrap ${isUser ? 'bg-[var(--user-bubble-bg)] text-[var(--user-bubble-text)] rounded-lg shadow-sm' : 'text-[var(--gemini-bubble-text)] text-base'
        }`;

    const messageTextElement = document.createElement('span');
    messageTextElement.textContent = text;

    if (isUser) {
        bubble.style.borderRadius = '24px 4px 24px 24px';
        bubble.appendChild(messageTextElement);
        if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.className = 'max-w-[200px] max-h-[200px] rounded-md mt-2';
            bubble.appendChild(document.createElement('br'));
            bubble.appendChild(img);
        }
    } else {
        const inlineContainer = document.createElement('div');
        inlineContainer.className = 'flex items-center gap-4';

        const avatar = document.createElement('img');
        avatar.src = 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/gemini-color.png';
        avatar.alt = 'Gemini';
        avatar.className = 'w-6 h-6 rounded-full';

        inlineContainer.appendChild(avatar);
        inlineContainer.appendChild(messageTextElement);

        bubble.appendChild(inlineContainer);
    }

    messageDiv.appendChild(bubble);
    chatHistoryDiv.appendChild(messageDiv);

    if (autoScroll) {
        chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
    }
}


function getResponse() {
    const responses = [
        "I'm here to help! What would you like to know?",
        "Interesting! Tell me more about what you're looking for.",
        "I can help with that. What specific information do you need?",
        "Thanks for your message. How can I assist you further?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// Send function with guaranteed execution
function sendMessage() {
    const message = userInput.value.trim();
    const imageUrl = hasImage && previewImg.src ? previewImg.src : null;

    if (!message && !imageUrl) {
        return;
    }

    addMessage(message, true, imageUrl);

    let data = getChatData();
    let currentChat = data.chats.find(chat => chat.id === currentChatId);

    if (!currentChat) {
        currentChat = {
            id: currentChatId,
            title: message.substring(0, 30) + (message.length > 30 ? "..." : "") || "Untitled Chat",
            messages: [],
            timestamp: Date.now()
        };
        data.chats.push(currentChat);
    } else {
        currentChat.timestamp = Date.now();
    }

    currentChat.messages.push({
        text: message,
        isUser: true,
        imageUrl: imageUrl,
        timestamp: Date.now()
    });

    setChatData(data);
    renderRecentChats();

    setTimeout(() => {
        const geminiResponse = getResponse();
        addMessage(geminiResponse, false);

        let updatedData = getChatData();
        let updatedCurrentChat = updatedData.chats.find(chat => chat.id === currentChatId);

        if (updatedCurrentChat) {
            updatedCurrentChat.messages.push({
                text: geminiResponse,
                isUser: false,
                timestamp: Date.now()
            });
            setChatData(updatedData);
        }
        renderRecentChats();
    }, 500);

    userInput.value = '';
    userInput.style.height = 'auto';
    previewImg.src = '';
    previewContainer.classList.add("hidden");
    fileInput.value = '';
    hasImage = false;

    if (sendIconContainer && tooltipText) {
        sendIconContainer.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                            <path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z"/>
                        </svg>
                    `;
        tooltipText.textContent = "Use Microphone";
    }
}


// Auto-resize textarea
function autoResize(textarea) {
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }
}

// Event listeners and initial setup for DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    // Assign elements here
    openBtn = document.getElementById('openBtn');
    mainContent = document.getElementById('main-content');
    search_icon = document.getElementById('search-icon');
    setting_help = document.getElementById('setting-help');
    geminiData = document.querySelector('.gemini-data');
    backdrop = document.getElementById('backdrop');
    newChatButton = document.getElementById('new-chat-button');
    chatHistoryDiv = document.getElementById('chat-history');
    userInput = document.getElementById('user-input');
    sendButton = document.getElementById('send-button');
    sendIconContainer = document.getElementById('send-icon');
    tooltipText = document.getElementById('tooltip-text');
    fileInput = document.getElementById('upload-preview-input');
    previewContainer = document.getElementById('image-preview-container');
    previewImg = document.getElementById('image-preview');
    removePreviewBtn = document.getElementById('remove-preview');
    triggerUpload = document.getElementById('trigger-upload');
    recentChatsUl = document.getElementById('recent-chats');
    greetingDiv = document.getElementById('greeting');
    plusButton = document.getElementById('plus-button'); // Assigned here
    plusDropdown = document.getElementById('plus-dropdown'); // Assigned here

    // Initial load logic
    const chatData = getChatData();
    if (chatData.chats.length > 0 && chatData.activeChatId) {
        loadChatSession(chatData.activeChatId);
    } else {
        createNewChat();
    }
    renderRecentChats(); // Always render recent chats on load

    // General event listeners (with null checks)
    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.innerWidth < 768) {
                mainContent.classList.toggle('sidebar-open');
                backdrop.classList.toggle('active');
            } else {
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

    if (search_icon) {
        search_icon.addEventListener('click', () => {
            search_icon.classList.toggle('search-grey');
        });
    }

    if (newChatButton) {
        newChatButton.addEventListener('click', createNewChat);
    }

    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    if (userInput) {
        userInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    if (removePreviewBtn) {
        removePreviewBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (previewImg) previewImg.src = '';
            if (previewContainer) previewContainer.classList.add("hidden");
            if (fileInput) fileInput.value = '';
            hasImage = false;
        });
    }

    // Plus button dropdown toggle
    if (plusButton && plusDropdown) {
        plusButton.addEventListener('click', function (e) {
            e.stopPropagation();
            plusDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', function (event) {
            if (!plusDropdown.contains(event.target) && !plusButton.contains(event.target)) {
                plusDropdown.classList.add('hidden');
            }
        });
    }

    // Image upload trigger
    if (triggerUpload && fileInput) {
        triggerUpload.addEventListener('click', (e) => {
            e.preventDefault();
            if (plusDropdown) {
                plusDropdown.classList.add("hidden");
            }
            fileInput.value = '';
            fileInput.click();
        });
        fileInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    if (previewImg) previewImg.src = e.target.result;
                    if (previewContainer) previewContainer.classList.remove("hidden");
                    hasImage = true;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    // Model and Profile dropdowns
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
        modelDropdown.addEventListener('click', function (e) { e.stopPropagation(); });
    }

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
        profileDropdown.addEventListener('click', function (e) { e.stopPropagation(); });
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

    // Theme management
    function toggleTheme(theme) {
        const body = document.body;
        body.classList.remove('light', 'dark');
        if (theme === 'light') {
            body.classList.add('light'); localStorage.setItem('theme', 'light');
            document.querySelectorAll('.gemini-header button.bg-\\[\\#3d3f42\\] img').forEach(img => { img.style.filter = 'none'; });
        } else if (theme === 'dark') {
            body.classList.add('dark'); localStorage.setItem('theme', 'dark');
            document.querySelectorAll('.gemini-header button.bg-\\[\\#3d3f42\\] img').forEach(img => { img.style.filter = 'grayscale(100%) brightness(0) invert(1) saturate(10) hue-rotate(170deg)'; });
        } else {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                body.classList.add('dark');
                document.querySelectorAll('.gemini-header button.bg-\\[\\#3d3f42\\] img').forEach(img => { img.style.filter = 'grayscale(100%) brightness(0) invert(1) saturate(10) hue-rotate(170deg)'; });
            } else {
                body.classList.add('light');
                document.querySelectorAll('.gemini-header button.bg-\\[\\#3d3f42\\] img').forEach(img => { img.style.filter = 'none'; });
            }
            localStorage.setItem('theme', 'system');
        }
    }

    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        let effectiveTheme = 'system';
        if (savedTheme) { effectiveTheme = savedTheme; } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) { effectiveTheme = 'dark'; } else { effectiveTheme = 'light'; }
        toggleTheme(effectiveTheme);
        document.querySelectorAll('.theme-options li').forEach(li => {
            li.textContent = li.textContent.replace(' ✔', '').trim();
            if (li.textContent.toLowerCase() === effectiveTheme) { li.textContent += ' ✔'; }
        });
    }
    initializeTheme();
    document.querySelectorAll('.theme-options li').forEach(option => {
        option.addEventListener('click', function () {
            const theme = this.textContent.trim().toLowerCase().replace('✔', '').trim();
            toggleTheme(theme);
            document.querySelectorAll('.theme-options li').forEach(li => { li.textContent = li.textContent.replace(' ✔', '').trim(); });
            this.textContent += ' ✔';
        });
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem('theme') === 'system') { toggleTheme('system'); }
    });

    // Sidebar hover/leave logic for desktop
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
});

// Function to toggle settings dropdown (already exists and works)
function toggleDropdown() {
    const menu = document.getElementById('dropdownMenu');
    if (menu) {
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        if (window.innerWidth >= 768) {
            mainContent.classList.toggle('pinned');
            setting_help.classList.toggle('setingbackgroundChange');
        }
    }
}
document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('dropdownMenu');
    const button = document.querySelector('.dropdown-toggle');
    if (dropdown && button && !dropdown.contains(e.target) && !button.contains(e.target)) {
        dropdown.style.display = 'none';
        setting_help.classList.remove('setingbackgroundChange');
    }
});

const textarea = document.getElementById("user-input");
const micIcon = document.getElementById("mic-icon");
const sendIcon = document.getElementById("send-icon");

textarea.addEventListener("input", () => {
    const hasText = textarea.value.trim().length > 0;

    if (hasText) {
        micIcon.classList.remove("opacity-100", "scale-100", "translate-x-0");
        micIcon.classList.add("opacity-0", "scale-75", "translate-x-2");

        sendIcon.classList.remove("opacity-0", "scale-75", "translate-x-2", "pointer-events-none");
        sendIcon.classList.add("opacity-100", "scale-100", "translate-x-0");
    } else {
        micIcon.classList.remove("opacity-0", "scale-75", "translate-x-2");
        micIcon.classList.add("opacity-100", "scale-100", "translate-x-0");

        sendIcon.classList.remove("opacity-100", "scale-100", "translate-x-0");
        sendIcon.classList.add("opacity-0", "scale-75", "translate-x-2", "pointer-events-none");
    }
});