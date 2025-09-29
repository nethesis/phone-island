// Phone Island Integration Script
// This file handles all event communication with the phone-island widget

'use strict';

// ===========================================
// TRANSCRIPTION EVENT HANDLING
// ===========================================

let transcriptionMessages = [];
let autoScroll = true;
let messageCount = 0;

// Add transcription message to display
function addTranscriptionMessage(data) {
    console.log('Adding transcription message:', data);

    const message = {
        id: data.uniqueid || Date.now(),
        timestamp: data.timestamp || Date.now() / 1000,
        speaker: data.speaker_name || 'Unknown',
        speakerNumber: data.speaker_number || '',
        counterpart: data.speaker_counterpart_name || '',
        counterpartNumber: data.speaker_counterpart_number || '',
        text: data.transcription || '',
        isFinal: data.is_final || false
    };

    console.log('Processed message object:', message);

    const lastMessage = transcriptionMessages[transcriptionMessages.length - 1];

    if (!message.isFinal) {
        // INTERIM MESSAGE - Update if same speaker or create new message if is different
        if (lastMessage &&
            lastMessage.speaker === message.speaker &&
            !lastMessage.isFinal) {
            // Update message of the same speaker
            console.log('Updating existing interim message');
            transcriptionMessages[transcriptionMessages.length - 1] = message;
        } else {
            // Create new message for new speaker
            console.log('Creating new interim message');
            transcriptionMessages.push(message);
            messageCount++;
            updateMessageCount();
        }
    } else {
        // FINAL MESSAGE
        if (lastMessage &&
            lastMessage.speaker === message.speaker &&
            !lastMessage.isFinal) {
            // Finalize message
            console.log('Finalizing existing interim message');
            transcriptionMessages[transcriptionMessages.length - 1] = message;
        } else {
            // Crea new message after a new speaker
            console.log('Creating new final message');
            transcriptionMessages.push(message);
            messageCount++;
            updateMessageCount();
        }
    }

    console.log('Current messages array:', transcriptionMessages);
    renderTranscriptionMessages();
}

// Render all transcription messages
function renderTranscriptionMessages() {
    console.log('Rendering transcription messages. Count:', transcriptionMessages.length);
    const container = document.getElementById('transcriptionMessages');
    if (!container) {
        console.error('transcriptionMessages container not found!');
        return;
    }

    if (transcriptionMessages.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #6c757d; padding: 20px;">
                🎙️ Waiting for transcription messages...
            </div>
        `;
        return;
    }

    container.innerHTML = transcriptionMessages.map(message => {
        const time = new Date(message.timestamp * 1000).toLocaleTimeString();
        const speaker = message.speaker || 'Unknown';
        const speakerInfo = message.speakerNumber ? `${speaker} (${message.speakerNumber})` : speaker;

        // Determine message type based on speaker - use first message to establish roles
        const firstMessage = transcriptionMessages[0];
        const messageClass = firstMessage && message.speaker === firstMessage.speaker ? 'speaker' : 'counterpart';

        return `
            <div class="transcription-message ${messageClass}">
                <div class="transcription-meta">
                    <span class="transcription-speaker">${speakerInfo}</span>
                    <span class="transcription-timestamp">${time}</span>
                </div>
                <div class="transcription-text ${message.isFinal ? '' : 'interim'}">
                    ${message.text}
                </div>
            </div>
        `;
    }).join('');

    // Auto-scroll to bottom if enabled
    if (autoScroll) {
        container.scrollTop = container.scrollHeight;
    }
}

// Update transcription status
function updateTranscriptionStatus(status) {
    const statusElement = document.getElementById('transcriptionStatus');
    if (statusElement) {
        statusElement.textContent = `Status: ${status}`;
    }
}

// Update message count
function updateMessageCount() {
    const countElement = document.getElementById('messageCount');
    if (countElement) {
        countElement.textContent = messageCount;
    }
}

// Clear all transcription messages
function clearTranscriptionMessages() {
    transcriptionMessages = [];
    messageCount = 0;
    updateMessageCount();
    renderTranscriptionMessages();
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

// Helper function to dispatch events to phone-island
function dispatchPhoneIslandEvent(eventName, data = {}) {
    const event = new CustomEvent(eventName, {
        detail: data
    });
    window.dispatchEvent(event);
    logEvent(`🚀 DISPATCHED: ${eventName}`, data);
}

// Helper function to update status
function updateStatus(message) {
    const statusElement = document.getElementById('statusContent');
    if (statusElement) {
        statusElement.innerHTML = message;
    }
    logEvent(`📊 STATUS: ${message}`);
}

// Helper function to log events
function logEvent(message, data = null) {
    const logElement = document.getElementById('eventLog');
    if (logElement) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
        logEntry.innerHTML = `[${timestamp}] ${message}${dataStr}`;
        logElement.appendChild(logEntry);
        logElement.scrollTop = logElement.scrollHeight;
    }
    console.log(message, data);
}

// ===========================================
// PHONE-ISLAND EVENT LISTENERS
// ===========================================

// Core phone-island status events
window.addEventListener('phone-island-expanded', (event) => {
    updateStatus('📏 Phone Island expanded');
});

window.addEventListener('phone-island-compressed', (event) => {
    updateStatus('📐 Phone Island compressed');
});

// Call status events
window.addEventListener('phone-island-call-started', (event) => {
    updateStatus('📞 Call started');
});

window.addEventListener('phone-island-call-ringing', (event) => {
    updateStatus('📳 Call ringing...');
});

window.addEventListener('phone-island-call-answered', (event) => {
    const data = event.detail;
    if (data && data.extensionType) {
        updateStatus(`✅ Call answered on ${data.extensionType}`);
    } else {
        updateStatus('✅ Call answered');
    }
});

window.addEventListener('phone-island-call-ended', (event) => {
    updateStatus('📴 Call ended');
});

window.addEventListener('phone-island-call-muted', (event) => {
    updateStatus('🔇 Call muted');
});

window.addEventListener('phone-island-call-unmuted', (event) => {
    updateStatus('🔊 Call unmuted');
});

window.addEventListener('phone-island-call-held', (event) => {
    updateStatus('⏸️ Call held');
});

window.addEventListener('phone-island-call-unheld', (event) => {
    updateStatus('▶️ Call unheld');
});

// Device and connection events
window.addEventListener('phone-island-attached', (event) => {
    updateStatus('🔗 WebRTC device attached');
});

window.addEventListener('phone-island-detached', (event) => {
    updateStatus('🔌 WebRTC device detached');
});

window.addEventListener('phone-island-socket-connected', (event) => {
    updateStatus('🌐 Socket connected');
});

window.addEventListener('phone-island-socket-disconnected', (event) => {
    updateStatus('❌ Socket disconnected');
});

window.addEventListener('phone-island-socket-reconnected', (event) => {
    updateStatus('🔄 Socket reconnected');
});

// Theme events
window.addEventListener('phone-island-theme-changed', (event) => {
    updateStatus('🎨 Theme changed');
});

// UI events
window.addEventListener('phone-island-sideview-opened', (event) => {
    updateStatus('📋 Side menu opened');
});

window.addEventListener('phone-island-sideview-closed', (event) => {
    updateStatus('❌ Side menu closed');
});

window.addEventListener('phone-island-fullscreen-entered', (event) => {
    updateStatus('🔍 Entered fullscreen mode');
});

window.addEventListener('phone-island-fullscreen-exited', (event) => {
    updateStatus('🔍 Exited fullscreen mode');
});

// System events
window.addEventListener('phone-island-main-presence', (event) => {
    const data = event.detail;
    logEvent('👤 Presence update received', data);
});

window.addEventListener('phone-island-conversations', (event) => {
    const data = event.detail;
    logEvent('💭 Conversations update received', data);
});

window.addEventListener('phone-island-queue-update', (event) => {
    const data = event.detail;
    logEvent('📋 Queue update received', data);
});

// Connection status events
window.addEventListener('phone-island-internet-disconnected', (event) => {
    updateStatus('⚠️ Internet connection lost');
});

window.addEventListener('phone-island-internet-connected', (event) => {
    updateStatus('✅ Internet connection restored');
});

// Error and alert events
window.addEventListener('phone-island-alert-removed', (event) => {
    logEvent('🗑️ Alert removed');
});

// Server events
window.addEventListener('phone-island-server-reloaded', (event) => {
    updateStatus('🔄 Server reloaded');
});

window.addEventListener('phone-island-server-disconnected', (event) => {
    updateStatus('🔌 Server disconnected');
});

// Recording events
window.addEventListener('phone-island-recording-started', (event) => {
    updateStatus('🎙️ Recording started');
});

window.addEventListener('phone-island-recording-stopped', (event) => {
    updateStatus('⏹️ Recording stopped');
});

window.addEventListener('phone-island-recording-saved', (event) => {
    const data = event.detail;
    updateStatus('💾 Recording saved');
    logEvent('💾 Recording saved', data);
});

// Audio player events
window.addEventListener('phone-island-audio-player-started', (event) => {
    updateStatus('🎵 Audio player started');
});

window.addEventListener('phone-island-audio-player-closed', (event) => {
    updateStatus('🔇 Audio player closed');
});

// Video events
window.addEventListener('phone-island-video-enabled', (event) => {
    updateStatus('📹 Video enabled');
});

window.addEventListener('phone-island-video-disabled', (event) => {
    updateStatus('📹 Video disabled');
});

// Transcription events (new event from phone-island)
window.addEventListener('phone-island-conversation-transcription', (event) => {
    const transcriptionData = event.detail;
    logEvent('💬 Transcription received', transcriptionData);
    addTranscriptionMessage(transcriptionData);
});

// Screen share events
window.addEventListener('phone-island-screen-share-started', (event) => {
    updateStatus('🖥️ Screen sharing started');
});

window.addEventListener('phone-island-screen-share-stopped', (event) => {
    updateStatus('🖥️ Screen sharing stopped');
});

window.addEventListener('phone-island-screen-share-joined', (event) => {
    updateStatus('🖥️ Joined screen share');
});

window.addEventListener('phone-island-screen-share-left', (event) => {
    updateStatus('🖥️ Left screen share');
});

// ===========================================
// UI EVENT HANDLERS
// ===========================================

function init() {
    // Call controls
    const callBtn = document.getElementById('callBtn');
    if (callBtn) {
        callBtn.addEventListener('click', () => {
            const phoneNumber = document.getElementById('phoneNumber').value;
            if (phoneNumber) {
                dispatchPhoneIslandEvent('phone-island-call-start', {
                    number: phoneNumber
                });
            } else {
                alert('Please enter a phone number');
            }
        });
    }

    const endCallBtn = document.getElementById('endCallBtn');
    if (endCallBtn) {
        endCallBtn.addEventListener('click', () => {
            dispatchPhoneIslandEvent('phone-island-call-end');
        });
    }

    // Expand/Compress controls
    const expandBtn = document.getElementById('expandBtn');
    if (expandBtn) {
        expandBtn.addEventListener('click', () => {
            dispatchPhoneIslandEvent('phone-island-expand');
        });
    }

    const compressBtn = document.getElementById('compressBtn');
    if (compressBtn) {
        compressBtn.addEventListener('click', () => {
            dispatchPhoneIslandEvent('phone-island-compress');
        });
    }

    // Mute controls
    const muteBtn = document.getElementById('muteBtn');
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            dispatchPhoneIslandEvent('phone-island-call-mute');
        });
    }

    const unmuteBtn = document.getElementById('unmuteBtn');
    if (unmuteBtn) {
        unmuteBtn.addEventListener('click', () => {
            dispatchPhoneIslandEvent('phone-island-call-unmute');
        });
    }

    // Hold controls
    const holdBtn = document.getElementById('holdBtn');
    if (holdBtn) {
        holdBtn.addEventListener('click', () => {
            dispatchPhoneIslandEvent('phone-island-call-hold');
        });
    }

    const unholdBtn = document.getElementById('unholdBtn');
    if (unholdBtn) {
        unholdBtn.addEventListener('click', () => {
            dispatchPhoneIslandEvent('phone-island-call-unhold');
        });
    }

    // Device management
    const attachDevice = document.getElementById('attachDevice');
    if (attachDevice) {
        attachDevice.addEventListener('click', () => {
            // Example WebRTC device configuration
            const webrtcConfig = {
                id: "269",
                type: "webrtc",
                secret: "your-secret-here",
                username: "269",
                description: "WebRTC Device",
                actions: {
                    answer: true,
                    dtmf: true,
                    hold: true
                }
            };
            dispatchPhoneIslandEvent('phone-island-attach', webrtcConfig);
        });
    }

    const detachDevice = document.getElementById('detachDevice');
    if (detachDevice) {
        detachDevice.addEventListener('click', () => {
            dispatchPhoneIslandEvent('phone-island-detach');
        });
    }

    // Theme controls
    const lightTheme = document.getElementById('lightTheme');
    if (lightTheme) {
        lightTheme.addEventListener('click', () => {
            dispatchPhoneIslandEvent('phone-island-theme-change', {
                selectedTheme: 'light'
            });
            setActiveTheme('light');
        });
    }

    const darkTheme = document.getElementById('darkTheme');
    if (darkTheme) {
        darkTheme.addEventListener('click', () => {
            dispatchPhoneIslandEvent('phone-island-theme-change', {
                selectedTheme: 'dark'
            });
            setActiveTheme('dark');
        });
    }

    // UI controls
    const openSideview = document.getElementById('openSideview');
    if (openSideview) {
        openSideview.addEventListener('click', () => {
            dispatchPhoneIslandEvent('phone-island-sideview-open');
        });
    }

    const closeSideview = document.getElementById('closeSideview');
    if (closeSideview) {
        closeSideview.addEventListener('click', () => {
            dispatchPhoneIslandEvent('phone-island-sideview-close');
        });
    }

    const fullscreenEnter = document.getElementById('fullscreenEnter');
    if (fullscreenEnter) {
        fullscreenEnter.addEventListener('click', () => {
            dispatchPhoneIslandEvent('phone-island-fullscreen-enter');
        });
    }

    const fullscreenExit = document.getElementById('fullscreenExit');
    if (fullscreenExit) {
        fullscreenExit.addEventListener('click', () => {
            dispatchPhoneIslandEvent('phone-island-fullscreen-exit');
        });
    }

    // Utility controls
    const checkConnection = document.getElementById('checkConnection');
    if (checkConnection) {
        checkConnection.addEventListener('click', () => {
            dispatchPhoneIslandEvent('phone-island-check-connection');
        });
    }

    const debugStatus = document.getElementById('debugStatus');
    if (debugStatus) {
        debugStatus.addEventListener('click', () => {
            dispatchPhoneIslandEvent('phone-island-status');
        });
    }

    // Transcription window controls
    const openTranscription = document.getElementById('openTranscription');
    if (openTranscription) {
        openTranscription.addEventListener('click', () => {
            openTranscriptionWindow();
        });
    }

    const transcriptionClose = document.getElementById('transcriptionClose');
    if (transcriptionClose) {
        transcriptionClose.addEventListener('click', () => {
            closeTranscriptionWindow();
        });
    }

    const transcriptionOverlay = document.getElementById('transcriptionOverlay');
    if (transcriptionOverlay) {
        transcriptionOverlay.addEventListener('click', () => {
            closeTranscriptionWindow();
        });
    }

    const clearTranscriptions = document.getElementById('clearTranscriptions');
    if (clearTranscriptions) {
        clearTranscriptions.addEventListener('click', () => {
            clearTranscriptionMessages();
        });
    }

    const autoScrollToggle = document.getElementById('autoScrollToggle');
    if (autoScrollToggle) {
        autoScrollToggle.addEventListener('click', () => {
            autoScroll = !autoScroll;
            autoScrollToggle.classList.toggle('active', autoScroll);
            autoScrollToggle.textContent = autoScroll ? '📜 Auto-scroll' : '📜 Manual';
        });
    }

    // Initialize
    updateStatus('🚀 Phone Island integration ready');
    logEvent('🎯 Integration script loaded and ready');
}

// ===========================================
// TRANSCRIPTION WINDOW CONTROLS
// ===========================================

function openTranscriptionWindow() {
    const container = document.getElementById('transcriptionContainer');
    const overlay = document.getElementById('transcriptionOverlay');

    if (container && overlay) {
        container.classList.add('visible');
        overlay.classList.add('visible');

        // Update status to show we're ready to receive transcriptions
        updateTranscriptionStatus('🟢 Ready to receive transcriptions');

        logEvent('💬 Transcription window opened');
    }
}

function closeTranscriptionWindow() {
    const container = document.getElementById('transcriptionContainer');
    const overlay = document.getElementById('transcriptionOverlay');

    if (container && overlay) {
        container.classList.remove('visible');
        overlay.classList.remove('visible');

        logEvent('❌ Transcription window closed');
    }
}

// ===========================================
// ADDITIONAL UTILITY FUNCTIONS
// ===========================================

function setActiveTheme(theme) {
    const lightBtn = document.getElementById('lightTheme');
    const darkBtn = document.getElementById('darkTheme');

    if (lightBtn) lightBtn.classList.toggle('active', theme === 'light');
    if (darkBtn) darkBtn.classList.toggle('active', theme === 'dark');
}

// Audio device management functions
function changeAudioInput(deviceId) {
    dispatchPhoneIslandEvent('phone-island-audio-input-change', {
        deviceId: deviceId
    });
}

function changeAudioOutput(deviceId) {
    dispatchPhoneIslandEvent('phone-island-audio-output-change', {
        deviceId: deviceId
    });
}

// Call management functions
function transferCall(number) {
    dispatchPhoneIslandEvent('phone-island-call-transfer', {
        number: number
    });
}

function sendDTMF(key) {
    dispatchPhoneIslandEvent('phone-island-call-keypad-send', {
        key: key
    });
}

// Recording functions
function startRecording() {
    dispatchPhoneIslandEvent('phone-island-recording-start');
}

function stopRecording() {
    dispatchPhoneIslandEvent('phone-island-recording-stop');
}

// Video functions
function enableVideo() {
    dispatchPhoneIslandEvent('phone-island-video-enable');
}

function disableVideo() {
    dispatchPhoneIslandEvent('phone-island-video-disable');
}

// Screen share functions
function startScreenShare() {
    dispatchPhoneIslandEvent('phone-island-screen-share-start');
}

function stopScreenShare() {
    dispatchPhoneIslandEvent('phone-island-screen-share-stop');
}

// Make functions available globally for console testing
window.PhoneIslandIntegration = {
    dispatchEvent: dispatchPhoneIslandEvent,
    changeAudioInput,
    changeAudioOutput,
    transferCall,
    sendDTMF,
    startRecording,
    stopRecording,
    enableVideo,
    disableVideo,
    startScreenShare,
    stopScreenShare
};

// Wait for content to be rendered
document.addEventListener('DOMContentLoaded', init);

console.log('📚 Phone Island Integration loaded! Available functions:');
console.log('- window.PhoneIslandIntegration.dispatchEvent(eventName, data)');
console.log('- window.PhoneIslandIntegration.changeAudioInput(deviceId)');
console.log('- window.PhoneIslandIntegration.transferCall(number)');
console.log('- window.PhoneIslandIntegration.sendDTMF(key)');
console.log('- window.PhoneIslandIntegration.startRecording()');
console.log('- window.PhoneIslandIntegration.enableVideo()');
console.log('- window.PhoneIslandIntegration.startScreenShare()');