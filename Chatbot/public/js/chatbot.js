// Optimized chat functionality for better performance
let chatCache = new Map(); // Cache user data to avoid repeated API calls
let isProcessing = false; // Prevent multiple simultaneous requests

function sendMessage() {
    const userInput = document.getElementById('userInput').value.trim();
    if (!userInput || isProcessing) return;
    
    isProcessing = true;
    const chatbox = document.getElementById('chatbox');
    const currentTime = new Date().toLocaleTimeString();
    
    // Show user message immediately
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user';
    userMessageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-text">${userInput}</div>
            <div class="message-time">${currentTime}</div>
        </div>
    `;
    chatbox.appendChild(userMessageDiv);
    
    // Clear input immediately
    document.getElementById('userInput').value = '';
    
    // Show instant typing indicator
    showTypingIndicator();
    
    // Check cache first
    if (chatCache.has(userInput)) {
        const cachedData = chatCache.get(userInput);
        setTimeout(() => {
            displayUserInfo(cachedData, userInput, currentTime);
            isProcessing = false;
        }, 300); // Small delay for better UX
        return;
    }
    
    // Fetch user info from backend
    fetch(`/api/user/${userInput}`)
        .then(res => res.json())
        .then(data => {
            // Cache the result
            chatCache.set(userInput, data);
            
            // Remove typing indicator
            removeTypingIndicator();
            
            if (data.success) {
                displayUserInfo(data, userInput, currentTime);
            } else {
                displayErrorMessage(currentTime);
            }
            
            // Smooth scroll
            smoothScrollToBottom(chatbox);
            isProcessing = false;
        })
        .catch(() => {
            removeTypingIndicator();
            displayErrorMessage(currentTime);
            smoothScrollToBottom(chatbox);
            isProcessing = false;
        });
}

function displayUserInfo(data, userInput, currentTime) {
    const chatbox = document.getElementById('chatbox');
    const { name, carNumber, whatsapp, privateCall, chatLink, phone } = data;
                
                let buttons = '';
                if (chatLink) {
                    buttons += `<button onclick="openPrivateChat('${name}', '${userInput}')" class="action-btn chat-btn" style="flex: 1; padding: 0.8rem;"><i class='fas fa-comments'></i> Private Chat</button>`;
                }
    if (privateCall) {
        buttons += `<button onclick="initiatePrivateCall('${name}', '${userInput}', '${phone}')" class="action-btn call-btn" style="flex: 1; padding: 0.8rem;"><i class='fas fa-phone'></i> Private Call</button>`;
                }
    if (whatsapp) {
        buttons += `<button onclick="window.open('${whatsapp}', '_blank')" class="action-btn whatsapp-btn" style="flex: 1; padding: 0.8rem;"><i class='fab fa-whatsapp'></i> WhatsApp</button>`;
                }
                
    // Create bot response with optimized DOM creation
                const botMessageDiv = document.createElement('div');
                botMessageDiv.className = 'message bot';
                botMessageDiv.innerHTML = `
                    <div class="customer-details-card">
                        <div class="customer-avatar">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="customer-info">
                            <div class="customer-name">${name}</div>
                            <div class="customer-car">
                                <i class="fas fa-car"></i>
                                <span class="car-number">${carNumber}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        ${buttons}
                    </div>
                    
                    <div class="message-time">${currentTime}</div>
                `;
                
                chatbox.appendChild(botMessageDiv);
}

function displayErrorMessage(currentTime) {
    const chatbox = document.getElementById('chatbox');
                const errorMessageDiv = document.createElement('div');
                errorMessageDiv.className = 'message bot error-message';
                errorMessageDiv.innerHTML = `
                    <div class="message-text">
                        <p>Sorry, I couldn't find a user with that ID. Please check the ID and try again.</p>
                    </div>
                    
                    <div class="message-time">${currentTime}</div>
                `;
                
                chatbox.appendChild(errorMessageDiv);
            }
            
function showTypingIndicator() {
    const chatbox = document.getElementById('chatbox');
    
    // Remove existing typing indicators
    const existingTyping = chatbox.querySelectorAll('.typing-indicator');
    existingTyping.forEach(indicator => indicator.remove());
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing-indicator';
    typingDiv.innerHTML = `
        <div class="typing-dots">
            <i class="fas fa-circle"></i>
            <i class="fas fa-circle"></i>
            <i class="fas fa-circle"></i>
                </div>
    `;
    chatbox.appendChild(typingDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function removeTypingIndicator() {
    const chatbox = document.getElementById('chatbox');
    const typingIndicator = chatbox.querySelector('.typing-indicator');
    if (typingIndicator) typingIndicator.remove();
}

function smoothScrollToBottom(element) {
    element.scrollTo({
        top: element.scrollHeight,
                behavior: 'smooth'
        });
}

function openPrivateChat(memberName, memberID) {
    // Send WhatsApp notification asynchronously (don't wait for it)
    sendWhatsAppNotification(memberName, memberID);
    
    // Create chat window with optimized DOM structure
    const chatWindow = createChatWindow(memberName, memberID);
    document.body.appendChild(chatWindow);
    
    // Focus input after minimal delay
    setTimeout(() => {
        const input = document.getElementById(`privateMessage-${memberID}`);
        if (input) input.focus();
    }, 50);
    
    // Set up event listeners
    setupChatWindowEvents(chatWindow, memberID);
}

function createChatWindow(memberName, memberID) {
    const chatWindow = document.createElement('div');
    chatWindow.className = 'private-chat-window';
    chatWindow.innerHTML = `
        <div class="chat-window-header">
            <div class="chat-header-info">
                <i class="fas fa-lock"></i>
                <span>Private Chat</span>
            </div>
            <button class="close-chat-btn" id="closeChatBtn-${memberID}">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="chat-window-body">
            <div class="customer-info-section">
                <div class="info-header">
                    <i class="fas fa-user-circle"></i>
                    <span>Customer Information</span>
                </div>
                <div class="info-content">
                    <div class="info-item">
                        <strong>ID:</strong> ${memberID}
                    </div>
                </div>
                <div class="whatsapp-notification-section">
                    <div class="notification-status">
                        <i class="fas fa-check-circle"></i>
                        <span>WhatsApp notification sent automatically to customer</span>
                    </div>
                </div>
            </div>
            <div class="private-chat-messages" id="privateChatMessages-${memberID}">
            </div>
            <div class="chat-input-area" id="chatInputArea-${memberID}">
                <input type="text" 
                       id="privateMessage-${memberID}" 
                       placeholder="Type your message..." 
                       class="private-message-input">
                <button onclick="sendPrivateMessage('${memberID}')" class="send-private-btn">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
    
    return chatWindow;
}

function setupChatWindowEvents(chatWindow, memberID) {
    // Close button event
    const closeBtn = chatWindow.querySelector(`#closeChatBtn-${memberID}`);
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closePrivateChat(closeBtn));
    }
    
    // Escape key handler
    const escapeHandler = (event) => {
        if (event.key === 'Escape') {
                closePrivateChat(closeBtn);
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Store for cleanup
    chatWindow.escapeHandler = escapeHandler;
}

function closePrivateChat(closeBtn) {
    const chatWindow = closeBtn.closest('.private-chat-window');
    if (chatWindow) {
        // Clean up event listeners
        if (chatWindow.escapeHandler) {
            document.removeEventListener('keydown', chatWindow.escapeHandler);
        }
        chatWindow.remove();
    }
}

function sendPrivateMessage(memberID) {
    const messageInput = document.getElementById(`privateMessage-${memberID}`);
    const messagesContainer = document.getElementById(`privateChatMessages-${memberID}`);
    
    if (!messageInput || !messagesContainer) return;
    
    const message = messageInput.value.trim();
    if (!message) return;

    // Create and display user message immediately
    const userMsg = createMessageElement(message, 'user-private-message');
    messagesContainer.appendChild(userMsg);
    
    // Clear input and maintain focus
    messageInput.value = '';
    messageInput.focus();
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Simulate instant bot response (reduced delay for better UX)
    setTimeout(() => {
        const botMsg = createMessageElement('Message received securely. This is a demo response from the private chat system.', 'bot-private-message');
        messagesContainer.appendChild(botMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Re-focus input
                messageInput.focus();
    }, 500); // Reduced from 1000ms to 500ms
}

function createMessageElement(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `private-message ${className}`;
    msgDiv.innerHTML = `
        <div class="message-content">
            <span class="message-text">${text}</span>
            <span class="message-time">${new Date().toLocaleTimeString()}</span>
        </div>
    `;
    return msgDiv;
}

function sendWhatsAppNotification(memberName, memberID) {
    const chatLink = `${window.location.origin}${window.location.pathname}?chat=${memberID}`;
    
    // Show instant notification
    showNotification('Sending WhatsApp notification...', 'info');
    
    // Send asynchronously without blocking UI
    fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            memberName: memberName,
            memberID: memberID,
            chatLink: chatLink
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showNotification('WhatsApp notification sent successfully!', 'success');
        } else {
            showNotification(`Failed to send WhatsApp: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        console.error('WhatsApp error:', error);
        showNotification('WhatsApp notification failed - chat will still work', 'info');
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds (reduced from 5 seconds)
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Optimized event listeners
document.addEventListener('DOMContentLoaded', function() {
    const userInput = document.getElementById("userInput");
    if (userInput) {
        // Use single event listener for better performance
        userInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter" && !isProcessing) {
                sendMessage();
            }
        });
    }
  
    // Global key handler for private chat
    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && event.target.id.startsWith('privateMessage-')) {
            const memberID = event.target.id.replace('privateMessage-', '');
            sendPrivateMessage(memberID);
        }
    });
});

// Add keyboard shortcuts for better UX
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + Enter to send message
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.id === 'userInput') {
            sendMessage();
        } else if (activeElement.id.startsWith('privateMessage-')) {
            const memberID = activeElement.id.replace('privateMessage-', '');
            sendPrivateMessage(memberID);
        }
    }
});