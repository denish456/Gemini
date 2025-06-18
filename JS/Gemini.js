// Declare variables globally but assign inside DOMContentLoaded for safety
let openBtn, mainContent, search_icon, setting_help, geminiData, backdrop, newChatButton,
    chatHistoryDiv, userInput, sendButton, sendIconContainer, tooltipText, fileInput,
    previewContainer, previewImg, removePreviewBtn, triggerUpload, recentChatsUl, greetingDiv;
let plusButton, plusDropdown, summarizeChatButton, suggestQuestionsButton,
    elaborateButton, changeToneButton, clearHistoryButton; // Also declare these globally here

let currentChatId = null; // Stores the ID of the currently active chat
let hasImage = false; // Moved to global to be consistent with other flags

// Helper to generate unique IDs (simple timestamp-based)
function generateUniqueId() {
    return 'chat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Helper to get chat data from localStorage
function getChatData() {
    const data = localStorage.getItem('geminiChatHistory');
    try {
        return data ? JSON.parse(data) : { chats: [], activeChatId: null };
    } catch (e) {
        console.error("Error parsing chat history from localStorage:", e);
        return { chats: [], activeChatId: null };
    }
}

// Helper to set chat data to localStorage
function setChatData(data) {
    localStorage.setItem('geminiChatHistory', JSON.stringify(data));
}

// Saves the current chat session to localStorage
function saveCurrentChatSession() {
    if (!currentChatId || !chatHistoryDiv) return;

    const currentMessages = [];
    chatHistoryDiv.querySelectorAll('.flex').forEach(messageDiv => {
        const isUser = messageDiv.classList.contains('justify-end');
        const textElement = messageDiv.querySelector('div:not(.absolute) > span');
        const textContent = textElement ? textElement.textContent : '';
        const imageElement = messageDiv.querySelector('img.max-w-\\[200px\\]');
        const imageUrl = imageElement ? imageElement.src : null;

        if (textContent.trim() || imageUrl) {
            currentMessages.push({
                text: textContent,
                isUser: isUser,
                imageUrl: imageUrl
            });
        }
    });

    if (currentMessages.length === 0) return;

    let data = getChatData();
    let chatIndex = data.chats.findIndex(chat => chat.id === currentChatId);

    let chatTitle = "New Chat";
    const firstUserMessage = currentMessages.find(msg => msg.isUser && msg.text.trim().length > 0);
    if (firstUserMessage) {
        chatTitle = firstUserMessage.text.trim().substring(0, 30);
        if (firstUserMessage.text.trim().length > 30) {
            chatTitle += "...";
        }
    } else if (currentMessages.some(msg => msg.imageUrl)) {
        chatTitle = "Image Chat";
    }

    if (chatIndex > -1) {
        // Update existing chat
        data.chats[chatIndex].messages = currentMessages;
        data.chats[chatIndex].title = chatTitle;
        data.chats[chatIndex].timestamp = Date.now();
    } else {
        // Add new chat
        data.chats.push({
            id: currentChatId,
            title: chatTitle,
            messages: currentMessages,
            timestamp: Date.now()
        });
    }

    // Ensure we don't exceed a reasonable number of saved chats
    if (data.chats.length > 50) {
        data.chats = data.chats.slice(-50); // Keep only the 50 most recent
    }

    data.activeChatId = currentChatId;
    setChatData(data);
}

// Loads a specific chat session by ID
function loadChatSession(chatId) {
    // Don't reload if we're already viewing this chat
    if (currentChatId === chatId) return;

    // Save the current chat before switching
    saveCurrentChatSession();

    const data = getChatData();
    const chatToLoad = data.chats.find(chat => chat.id === chatId);

    if (chatToLoad) {
        currentChatId = chatId;

        // Clear the chat history completely before loading
        chatHistoryDiv.innerHTML = '';

        if (greetingDiv) {
            greetingDiv.style.display = 'none';
        }

        // Load messages only once
        chatToLoad.messages.forEach(msg => {
            addMessage(msg.text, msg.isUser, msg.imageUrl, false, true);
        });

        // Update active chat in storage
        data.activeChatId = currentChatId;
        setChatData(data);

        // Highlight the active chat
        updateActiveChatUI(chatId);

        // Scroll to bottom after loading
        setTimeout(() => {
            chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
        }, 50);
    } else {
        console.error("Chat not found:", chatId);
        createNewChat();
    }
}


// Global variable to track if we're currently loading a chat
let isLoadingChat = false;

function loadChatSession(chatId) {
    // Prevent multiple loads of the same chat
    if (currentChatId === chatId || isLoadingChat) return;
    
    isLoadingChat = true;
    
    // Save current chat before switching
    saveCurrentChatSession();

    const data = getChatData();
    const chatToLoad = data.chats.find(chat => chat.id === chatId);

    if (chatToLoad) {
        currentChatId = chatId;
        
        // COMPLETELY clear the chat history
        while (chatHistoryDiv.firstChild) {
            chatHistoryDiv.removeChild(chatHistoryDiv.firstChild);
        }
        
        // Hide greeting if present
        if (greetingDiv) {
            greetingDiv.style.display = 'none';
        }

        // Load messages - ensure no duplicates
        const uniqueMessages = [];
        const seenMessages = new Set();
        
        chatToLoad.messages.forEach(msg => {
            const messageKey = `${msg.isUser ? 'user' : 'gemini'}-${msg.text}-${msg.imageUrl || ''}`;
            if (!seenMessages.has(messageKey)) {
                seenMessages.add(messageKey);
                uniqueMessages.push(msg);
            }
        });

        // Add messages to chat
        uniqueMessages.forEach(msg => {
            addMessage(msg.text, msg.isUser, msg.imageUrl, false, true);
        });

        // Update active chat
        data.activeChatId = currentChatId;
        setChatData(data);
        
        // Update UI
        updateActiveChatUI(chatId);
        
        // Scroll to bottom after slight delay
        setTimeout(() => {
            chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
            isLoadingChat = false;
        }, 50);
    } else {
        console.error("Chat not found:", chatId);
        createNewChat();
        isLoadingChat = false;
    }
}

function addMessage(text, isUser, imageUrl = null, autoScroll = true, instantDisplay = false) {
    if (!chatHistoryDiv) return;

    // Hide greeting if showing
    if (greetingDiv && greetingDiv.style.display !== 'none') {
        greetingDiv.style.display = 'none';
    }

    // Create message container
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;

    // Create message bubble
    const bubble = document.createElement('div');
    bubble.className = `p-3 max-w-[80%] break-words whitespace-pre-wrap ${
        isUser ? 'bg-[var(--user-bubble-bg)] text-[var(--user-bubble-text)] rounded-lg shadow-sm' 
               : 'text-[var(--gemini-bubble-text)] text-base'
    }`;

    if (isUser) {
        bubble.style.borderRadius = '24px 4px 24px 24px';
        const messageTextElement = document.createElement('span');
        messageTextElement.textContent = text;
        bubble.appendChild(messageTextElement);
        
        if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.className = 'max-w-[200px] max-h-[200px] rounded-md mt-2';
            bubble.appendChild(document.createElement('br'));
            bubble.appendChild(img);
        }
    } else {
        // For Gemini responses, ensure we don't duplicate
        const existingMessages = chatHistoryDiv.querySelectorAll('.flex.justify-start');
        const isDuplicate = Array.from(existingMessages).some(msg => {
            return msg.textContent.trim() === text.trim();
        });

        if (!isDuplicate) {
            const inlineContainer = document.createElement('div');
            inlineContainer.className = 'flex items-center gap-4';

            const avatar = document.createElement('img');
            avatar.src = 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/gemini-color.png';
            avatar.alt = 'Gemini';
            avatar.className = 'w-6 h-6 rounded-full';

            inlineContainer.appendChild(avatar);
            
            const messageTextElement = document.createElement('span');
            if (instantDisplay) {
                messageTextElement.textContent = text;
            } else {
                typewriterEffect(messageTextElement, text, autoScroll);
            }
            
            inlineContainer.appendChild(messageTextElement);
            bubble.appendChild(inlineContainer);
        } else {
            return; // Skip adding duplicate Gemini message
        }
    }

    messageDiv.appendChild(bubble);
    chatHistoryDiv.appendChild(messageDiv);

    if (autoScroll) {
        chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
    }
}   

function updateActiveChatUI(activeChatId) {
    document.querySelectorAll('#recent-chats li').forEach(li => {
        li.classList.remove('active-chat');
        if (li.dataset.chatId === activeChatId) {
            li.classList.add('active-chat');
        }
    });
} 


function createNewChat() {
    saveCurrentChatSession();

    currentChatId = generateUniqueId();
    chatHistoryDiv.innerHTML = '';
    userInput.value = '';

    if (greetingDiv) {
        greetingDiv.style.display = 'flex';
    }

    // Reset other UI elements
    resetChatUI();

    // Update localStorage
    let data = getChatData();
    data.activeChatId = currentChatId;
    setChatData(data);

    updateActiveChatUI(currentChatId);
}
function resetChatUI() {
    userInput.style.height = 'auto';
    if (previewImg) previewImg.src = '';
    if (previewContainer) previewContainer.classList.add("hidden");
    if (fileInput) fileInput.value = '';
    hasImage = false;

    // Simplified send button icon (removed microphone states)
    if (sendIconContainer) {
        sendIconContainer.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                <path d="M120-160v-80l528-168v-304L120-880v-80l720 320v80L120-160Z"/>
            </svg>
        `;
    }
    if (tooltipText) {
        tooltipText.textContent = "Send message";
    }
}


// Add this outside the function to avoid multiple listeners
if (!window.kebabOutsideClickInitialized) {
    document.addEventListener('click', () => {
        document.querySelectorAll('.kebab-dropdown').forEach(dropdown => {
            dropdown.classList.add('hidden');
        });
    });
    window.kebabOutsideClickInitialized = true;
}

// Renders the list of recent chats in the sidebar

let showAllChats = false; // default state
function renderRecentChats() {
    if (!recentChatsUl) return;

    recentChatsUl.innerHTML = '';
    const data = getChatData();

    // Sort by timestamp (newest first)
    data.chats.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    // Remove duplicates by chat ID
    const uniqueChats = [];
    const seenIds = new Set();

    data.chats.forEach(chat => {
        if (!seenIds.has(chat.id)) {
            seenIds.add(chat.id);
            uniqueChats.push(chat);
        }
    });

    const chatsToShow = showAllChats ? uniqueChats : uniqueChats.slice(0, 5);

    chatsToShow.forEach(chat => {
        const li = document.createElement('li');
        li.dataset.chatId = chat.id;
        li.className = 'flex items-center gap-4 cursor-pointer text-ellipsis relative group';

        if (chat.id === data.activeChatId) {
            li.classList.add('active-chat');
        }

        const icon = document.createElement('a');
        icon.className = 'material-symbols-outlined text-xl flex-shrink-0';
        icon.textContent = 'chat_bubble';

        const span = document.createElement('span');
        span.textContent = chat.title || "Untitled Chat";
        span.className = 'flex-grow text-ellipsis overflow-hidden';

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
    renderViewToggle(data.chats.length);
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
// `instantDisplay` parameter controls if the message is typed out or appears instantly
function addMessage(text, isUser, imageUrl = null, autoScroll = true, instantDisplay = false) {
    if (!chatHistoryDiv) return;

    if (greetingDiv && greetingDiv.style.display !== 'none') {
        greetingDiv.style.display = 'none';
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;

    const bubble = document.createElement('div');
    bubble.className = `p-3 max-w-[80%] break-words whitespace-pre-wrap ${isUser ? 'bg-[var(--user-bubble-bg)] text-[var(--user-bubble-text)] rounded-lg shadow-sm' : 'text-[var(--gemini-bubble-text)] text-base'
        }`;

    const messageTextElement = document.createElement('span');

    if (isUser) {
        bubble.style.borderRadius = '24px 4px 24px 24px';
        messageTextElement.textContent = text; // User messages are always instant
        bubble.appendChild(messageTextElement);
        if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.className = 'max-w-[200px] max-h-[200px] rounded-md mt-2';
            bubble.appendChild(document.createElement('br'));
            bubble.appendChild(img);
        }
    } else {
        // Gemini response logic
        const inlineContainer = document.createElement('div');
        inlineContainer.className = 'flex items-center gap-4';

        const avatar = document.createElement('img');
        avatar.src = 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/gemini-color.png';
        avatar.alt = 'Gemini';
        avatar.className = 'w-6 h-6 rounded-full';

        inlineContainer.appendChild(avatar);
        bubble.appendChild(inlineContainer); // Append inlineContainer here

        if (instantDisplay) {
            messageTextElement.textContent = text; // Display instantly for loaded history
            inlineContainer.appendChild(messageTextElement); // Append to inlineContainer
        } else {
            inlineContainer.appendChild(messageTextElement); // Append to inlineContainer
            typewriterEffect(messageTextElement, text, autoScroll); // Type out for new Gemini responses
        }
    }

    messageDiv.appendChild(bubble);
    chatHistoryDiv.appendChild(messageDiv);

    if (isUser && autoScroll) { // Auto-scroll immediately for user's message
        chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
    }
}

// New typewriter effect function
function typewriterEffect(element, fullText, autoScroll) {
    let i = 0;
    const speed = 20; // typing speed in milliseconds per character

    function type() {
        if (i < fullText.length) {
            element.textContent += fullText.charAt(i);
            i++;
            if (autoScroll) {
                chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight; // Scroll during typing
            }
            setTimeout(type, speed);
        } else {
            // Once typing is complete, ensure final scroll
            if (autoScroll) {
                chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
            }
        }
    }
    type();
}


// Function to call Gemini API
async function getGeminiResponse(promptContent, imageData = null) {
    const chatHistory = [];

    const parts = [];
    if (typeof promptContent === 'string' && promptContent.trim() !== '') {
        parts.push({ text: promptContent });
    } else if (Array.isArray(promptContent)) { // Handle array of messages for summarization/suggestion
        promptContent.forEach(msg => {
            if (msg.text) parts.push({ text: msg.text });
            if (msg.imageUrl) {
                const base64Data = msg.imageUrl.split(',')[1];
                parts.push({
                    inlineData: {
                        mimeType: "image/png", // Assuming PNG, adjust if other types are supported
                        data: base64Data
                    }
                });
            }
        });
    }

    // Add image data if provided (for the current user input)
    if (imageData) {
        const base64Data = imageData.split(',')[1]; // Extract base64 part
        parts.push({
            inlineData: {
                mimeType: "image/png", // Assuming PNG, adjust if other types are supported
                data: base64Data
            }
        });
    }

    // Ensure there's at least one part, otherwise API might reject
    if (parts.length === 0) {
        console.warn("No content to send to Gemini API.");
        return "I need more information to respond. Please provide text or an image.";
    }

    chatHistory.push({ role: "user", parts: parts });

    const payload = { contents: chatHistory };
    // IMPORTANT: Replace "" with your actual Gemini API Key here.
    // You can obtain one from Google AI Studio: https://aistudio.google.com/app/apikey
    const apiKey = "AIzaSyDMZvV2eF4oCYXOk8gaS9GWh2u0jLv1OcU"; // YOUR_API_KEY_HERE

    // Use gemini-2.0-flash for text generation and image understanding
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        // Add a loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-indicator';
        loadingDiv.textContent = 'Gemini is thinking...';
        chatHistoryDiv.appendChild(loadingDiv);
        chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight; // Scroll to see loading

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Remove loading indicator
        chatHistoryDiv.removeChild(loadingDiv);

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini API error:", errorData);
            return `Error from Gemini: ${errorData.error ? errorData.error.message : 'Unknown error'}`;
        }

        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            return "No response from Gemini. Please try again.";
        }
    } catch (error) {
        // Ensure loading indicator is removed even on network error
        const loadingDiv = chatHistoryDiv.querySelector('.loading-indicator');
        if (loadingDiv) {
            chatHistoryDiv.removeChild(loadingDiv);
        }
        console.error("Network or parsing error calling Gemini API:", error);
        return `An error occurred while connecting to Gemini: ${error.message}`;
    }
}

// Send function for regular chat messages
async function sendMessage() {
    const message = userInput.value.trim();
    const imageUrl = hasImage && previewImg.src ? previewImg.src : null;

    if (!message && !imageUrl) {
        return;
    }

    // Display user message instantly
    addMessage(message, true, imageUrl, true, true);

    // Call Gemini API
    const geminiResponse = await getGeminiResponse(message, imageUrl);
    // Display Gemini response with typing effect
    addMessage(geminiResponse, false, null, true, false);

    // Save the full interaction (user message + Gemini response) to localStorage
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

    // Append the user's message
    currentChat.messages.push({
        text: message,
        isUser: true,
        imageUrl: imageUrl,
        timestamp: Date.now()
    });
    // Append the Gemini's response
    currentChat.messages.push({
        text: geminiResponse,
        isUser: false,
        timestamp: Date.now()
    });

    setChatData(data);
    renderRecentChats();

    // Clear input and preview area
    userInput.value = '';
    updateSendButtonState();
    userInput.style.height = 'auto';
    previewImg.src = '';
    previewContainer.classList.add("hidden");
    fileInput.value = '';
    hasImage = false;

    
}


// LLM Feature: Summarize Chat History
async function summarizeChatHistory() {
    const currentChatData = getChatData().chats.find(chat => chat.id === currentChatId);
    if (!currentChatData || currentChatData.messages.length === 0) {
        addMessage("There's no conversation to summarize yet.", false);
        return;
    }

    let fullConversation = "";
    currentChatData.messages.forEach(msg => {
        fullConversation += `${msg.isUser ? 'User' : 'Gemini'}: ${msg.text}\n`;
    });

    const prompt = `Please summarize the following conversation concisely:\n\n${fullConversation}`;
    const summary = await getGeminiResponse(prompt);
    addMessage(`✨ Summary of Chat: ${summary}`, false);
}

// LLM Feature: Suggest Next Questions
async function suggestNextQuestions() {
    const currentChatData = getChatData().chats.find(chat => chat.id === currentChatId);
    if (!currentChatData || currentChatData.messages.length === 0) {
        addMessage("There's no conversation to base suggestions on yet.", false);
        return;
    }

    // Get last 5 messages for context, ignoring images for this specific prompt
    const recentMessages = currentChatData.messages.slice(-5).map(msg => `${msg.isUser ? 'User' : 'Gemini'}: ${msg.text}`).join('\n');

    const prompt = `Based on the following recent conversation, suggest 3 concise, relevant follow-up questions to ask:\n\n${recentMessages}\n\nProvide the questions as a numbered list.`;
    const suggestions = await getGeminiResponse(prompt);

    addMessage(`✨ Here are some follow-up questions:\n${suggestions}`, false);
}

// LLM Feature: Elaborate on Topic
async function elaborateOnTopic() {
    const currentChatData = getChatData().chats.find(chat => chat.id === currentChatId);
    if (!currentChatData || currentChatData.messages.length === 0) {
        addMessage("There's no previous response to elaborate on.", false);
        return;
    }

    // Find the last Gemini message
    const lastGeminiMessage = currentChatData.messages.slice().reverse().find(msg => !msg.isUser);

    if (!lastGeminiMessage || lastGeminiMessage.text.trim() === "") {
        addMessage("I need a previous Gemini response to elaborate on.", false);
        return;
    }

    const prompt = `Please elaborate on the following text, providing more details and explanations:\n\n"${lastGeminiMessage.text}"`;
    const elaboration = await getGeminiResponse(prompt);
    addMessage(`✨ Elaboration: ${elaboration}`, false);
}

// LLM Feature: Change Tone
async function changeTone() {
    const currentChatData = getChatData().chats.find(chat => chat.id === currentChatId);
    if (!currentChatData || currentChatData.messages.length === 0) {
        addMessage("There's no previous response to change the tone of.", false);
        return;
    }

    // Find the last Gemini message
    const lastGeminiMessage = currentChatData.messages.slice().reverse().find(msg => !msg.isUser);

    if (!lastGeminiMessage || lastGeminiMessage.text.trim() === "") {
        addMessage("I need a previous Gemini response to change the tone of.", false);
        return;
    }

    // Using a custom modal-like prompt for tone input
    const tonePromptModal = document.createElement('div');
    tonePromptModal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000]';
    tonePromptModal.innerHTML = `
        <div class="bg-[var(--dropdown-bg)] p-6 rounded-lg shadow-lg text-center" style="color: var(--dropdown-text); border: 1px solid var(--dropdown-border);">
            <p class="mb-4 text-lg">Enter the desired tone (e.g., 'formal', 'casual', 'humorous', 'professional'):</p>
            <input type="text" id="tone-input" class="w-full p-2 border rounded-md mb-4" style="background-color: var(--input-bg); color: var(--text-main); border-color: var(--border-color);" placeholder="e.g., professional">
            <div class="flex justify-center gap-4">
                <button id="cancel-tone" class="px-4 py-2 rounded-md hover:bg-[var(--sidebar-hover)]" style="background-color: var(--bg-main); color: var(--text-main);">Cancel</button>
                <button id="submit-tone" class="px-4 py-2 rounded-md bg-[var(--accent-blue)] text-white hover:bg-[var(--input-border-focus)]">Submit</button>
            </div>
        </div>
    `;
    document.body.appendChild(tonePromptModal);

    const toneInput = document.getElementById('tone-input');
    toneInput.focus();

    document.getElementById('cancel-tone').addEventListener('click', () => {
        document.body.removeChild(tonePromptModal);
    });

    document.getElementById('submit-tone').addEventListener('click', async () => {
        const desiredTone = toneInput.value.trim();
        if (!desiredTone) {
            addMessage("No tone specified. Please try again with a valid tone.", false);
        } else {
            const promptText = `Rewrite the following text in a ${desiredTone} tone:\n\n"${lastGeminiMessage.text}"`;
            const rewrittenText = await getGeminiResponse(promptText);
            addMessage(`✨ Rewritten (${desiredTone} tone): ${rewrittenText}`, false);
        }
        document.body.removeChild(tonePromptModal);
    });
}

// New function to clear all chat history
function clearAllHistory() {
    // Using a custom modal-like confirmation instead of `confirm()`
    const confirmClear = document.createElement('div');
    confirmClear.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000]';
    confirmClear.innerHTML = `
        <div class="bg-[var(--dropdown-bg)] p-6 rounded-lg shadow-lg text-center" style="color: var(--dropdown-text); border: 1px solid var(--dropdown-border);">
            <p class="mb-4 text-lg">Are you sure you want to delete all chat history?</p>
            <div class="flex justify-center gap-4">
                <button id="cancel-clear" class="px-4 py-2 rounded-md hover:bg-[var(--sidebar-hover)]" style="background-color: var(--bg-main); color: var(--text-main);">Cancel</button>
                <button id="confirm-clear" class="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Delete All</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmClear);

    document.getElementById('cancel-clear').addEventListener('click', () => {
        document.body.removeChild(confirmClear);
    });

    document.getElementById('confirm-clear').addEventListener('click', () => {
        localStorage.removeItem('geminiChatHistory');
        createNewChat(); // Resets the UI and creates a fresh chat
        renderRecentChats(); // Re-render to show empty recent chats
        document.body.removeChild(confirmClear);
    });
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
    plusButton = document.getElementById('plus-button');
    plusDropdown = document.getElementById('plus-dropdown');

    // Attach LLM feature functions to buttons
    if (summarizeChatButton) summarizeChatButton.addEventListener('click', summarizeChatHistory);
    if (suggestQuestionsButton) suggestQuestionsButton.addEventListener('click', suggestNextQuestions);
    if (elaborateButton) elaborateButton.addEventListener('click', elaborateOnTopic);
    if (changeToneButton) changeToneButton.addEventListener('click', changeTone);
    if (clearHistoryButton) clearHistoryButton.addEventListener('click', clearAllHistory);


    // Initial load logic
    const chatData = getChatData();
    if (chatData.chats.length > 0 && chatData.activeChatId) {
        loadChatSession(chatData.activeChatId);
    } else {
        createNewChat();
    }
    renderRecentChats();
    // Sidebar toggle functionality
    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            if (window.innerWidth < 768) {
                // Mobile behavior - toggle sidebar visibility
                mainContent.classList.toggle('sidebar-open');
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
        }
    });

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

    if (summarizeChatButton) {
        summarizeChatButton.addEventListener('click', summarizeChatHistory);
    }
    if (suggestQuestionsButton) {
        suggestQuestionsButton.addEventListener('click', suggestNextQuestions);
    }
    if (elaborateButton) {
        elaborateButton.addEventListener('click', elaborateOnTopic);
    }
    if (changeToneButton) {
        changeToneButton.addEventListener('click', changeTone);
    }
    if (clearHistoryButton) {
        clearHistoryButton.addEventListener('click', clearAllHistory);
    }
});

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

// Theme management
function applyTheme(theme) {
    document.body.classList.remove('light', 'dark');

    if (theme === 'system') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);

    // Update UI to show active theme
    document.querySelectorAll('.theme-options li').forEach(li => {
        li.textContent = li.textContent.replace(' ✔', '').trim();
        if (li.dataset.theme === theme) {
            li.textContent += ' ✔';
        }
    });
}

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'system';
    applyTheme(savedTheme);

    // Watch for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem('theme') === 'system') {
            applyTheme('system');
        }
    });
}

// Set up theme switcher
function setupThemeSwitcher() {
    document.querySelectorAll('.theme-options li').forEach(option => {
        option.addEventListener('click', function () {
            const theme = this.dataset.theme;
            applyTheme(theme);
        });
    });
}

// Call these when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupThemeSwitcher();
});
