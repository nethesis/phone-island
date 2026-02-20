// Phone Island Integration Script
// This file handles all event communication with the phone-island widget

'use strict';

// ===========================================
// EVENT FILTERING SYSTEM
// ===========================================

// Default filter configuration - only essential events enabled
const defaultFilters = {
    core: true,
    call: true,
    connection: true,
    ui: false,
    recording: false,
    video: false,
    screen_share: false,
    audio_player: false,
    transcription: true,
    system: false,
    errors: true,
    debug: false
};

// Event category mapping - maps event messages to their category
const eventCategories = {
    // Core events
    'expanded': 'core',
    'compressed': 'core',
    'attached': 'core',
    'detached': 'core',
    'initialized': 'core',
    'ATTACH': 'core',
    'DETACH': 'core',

    // Call events
    'Call started': 'call',
    'Call ringing': 'call',
    'Call answered': 'call',
    'Call ended': 'call',
    'Call muted': 'call',
    'Call unmuted': 'call',
    'Call held': 'call',
    'Call unheld': 'call',
    'CALL': 'call',

    // Connection events
    'Socket connected': 'connection',
    'Socket disconnected': 'connection',
    'Socket reconnected': 'connection',
    'Internet connection': 'connection',
    'Internet disconnected': 'connection',
    'Server reloaded': 'connection',
    'Server disconnected': 'connection',
    'Connected to Janus': 'connection',
    'registered': 'connection',

    // UI events
    'Theme changed': 'ui',
    'Side menu': 'ui',
    'Entered fullscreen': 'ui',
    'Exited fullscreen': 'ui',

    // Recording events
    'Recording started': 'recording',
    'Recording stopped': 'recording',
    'Recording saved': 'recording',

    // Video events
    'Video enabled': 'video',
    'Video disabled': 'video',

    // Screen share events
    'Screen sharing': 'screen_share',
    'screen share': 'screen_share',
    'Joined screen share': 'screen_share',
    'Left screen share': 'screen_share',

    // Audio player events
    'Audio player': 'audio_player',

    // Transcription events
    'Transcription': 'transcription',

    // System events
    'Presence': 'system',
    'Conversations': 'system',
    'Queue update': 'system',

    // Error/Alert events
    'Alert removed': 'errors',
    'Error': 'errors',
    'disconnected': 'errors',
    'connection lost': 'errors',

    // Debug events
    'Debug': 'debug',
    'STATUS': 'debug',
    'Status:': 'debug'
};

// Active filters - loaded from localStorage or defaults
let activeFilters = { ...defaultFilters };

// Load filter preferences from localStorage
function loadFilterPreferences() {
    try {
        const stored = localStorage.getItem('phoneIslandEventFilters');
        if (stored) {
            activeFilters = JSON.parse(stored);
            console.log('🎛️ Loaded event filters from localStorage:', activeFilters);
        }
    } catch (error) {
        console.error('Error loading filter preferences:', error);
        activeFilters = { ...defaultFilters };
    }
}

// Save filter preferences to localStorage
function saveFilterPreferences() {
    try {
        localStorage.setItem('phoneIslandEventFilters', JSON.stringify(activeFilters));
    } catch (error) {
        console.error('Error saving filter preferences:', error);
    }
}

// Check if an event should be logged based on active filters
function shouldLogEvent(message) {
    // Always log DISPATCHED events (user actions)
    if (message.includes('DISPATCHED')) {
        return true;
    }

    // Check each category
    for (const [keyword, category] of Object.entries(eventCategories)) {
        if (message.includes(keyword)) {
            return activeFilters[category] === true;
        }
    }

    // Default: log if no specific category found (backwards compatibility)
    return true;
}

// Initialize filter UI checkboxes
function initializeFilterUI() {
    // Set checkbox states from active filters
    Object.keys(activeFilters).forEach(filterKey => {
        const checkbox = document.getElementById(`filter_${filterKey}`);
        if (checkbox) {
            checkbox.checked = activeFilters[filterKey];
        }
    });

    // Add change listeners to all filter checkboxes
    Object.keys(activeFilters).forEach(filterKey => {
        const checkbox = document.getElementById(`filter_${filterKey}`);
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                activeFilters[filterKey] = e.target.checked;
                saveFilterPreferences();
                console.log(`🎛️ Filter "${filterKey}" ${e.target.checked ? 'enabled' : 'disabled'}`);
            });
        }
    });

    // Toggle filter panel
    const filterHeader = document.getElementById('filterHeader');
    const filterContent = document.getElementById('filterContent');
    const filterToggleIcon = document.getElementById('filterToggleIcon');

    if (filterHeader && filterContent && filterToggleIcon) {
        filterHeader.addEventListener('click', () => {
            filterContent.classList.toggle('expanded');
            filterToggleIcon.classList.toggle('expanded');
        });
    }

    // Select All button
    const selectAllBtn = document.getElementById('selectAllFilters');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            Object.keys(activeFilters).forEach(key => {
                activeFilters[key] = true;
                const checkbox = document.getElementById(`filter_${key}`);
                if (checkbox) checkbox.checked = true;
            });
            saveFilterPreferences();
            console.log('✅ All event filters enabled');
        });
    }

    // Select None button
    const selectNoneBtn = document.getElementById('selectNoneFilters');
    if (selectNoneBtn) {
        selectNoneBtn.addEventListener('click', () => {
            Object.keys(activeFilters).forEach(key => {
                activeFilters[key] = false;
                const checkbox = document.getElementById(`filter_${key}`);
                if (checkbox) checkbox.checked = false;
            });
            saveFilterPreferences();
            console.log('❌ All event filters disabled');
        });
    }

    // Default filters button
    const selectDefaultBtn = document.getElementById('selectDefaultFilters');
    if (selectDefaultBtn) {
        selectDefaultBtn.addEventListener('click', () => {
            activeFilters = { ...defaultFilters };
            Object.keys(activeFilters).forEach(key => {
                const checkbox = document.getElementById(`filter_${key}`);
                if (checkbox) checkbox.checked = activeFilters[key];
            });
            saveFilterPreferences();
            console.log('🔧 Event filters reset to defaults');
        });
    }
}

// Load filters on script load
loadFilterPreferences();

// ===========================================
// DEVICE MANAGEMENT
// ===========================================

let selectedAudioInput = '';
let selectedAudioOutput = '';
let selectedVideoInput = '';
let audioInputDevices = [];
let audioOutputDevices = [];
let videoInputDevices = [];

// Filter out virtual/HDMI audio outputs that cannot be used
function filterUsableAudioOutputs(devices) {
    return devices.filter((device) => {
        const label = device.label.toLowerCase();
        const isVirtualOutput =
            label.includes('hdmi') ||
            label.includes('displayport') ||
            (label.includes('display') && !label.includes('speaker'));
        return !isVirtualOutput;
    });
}

// Get stored device values from localStorage
function getStoredDeviceValues() {
    try {
        const audioInputStored = localStorage.getItem('phone-island-audio-input-device');
        const audioOutputStored = localStorage.getItem('phone-island-audio-output-device');
        const videoInputStored = localStorage.getItem('phone-island-video-input-device');

        return {
            audioInput: audioInputStored ? JSON.parse(audioInputStored) : null,
            audioOutput: audioOutputStored ? JSON.parse(audioOutputStored) : null,
            videoInput: videoInputStored ? JSON.parse(videoInputStored) : null,
        };
    } catch (error) {
        console.error('Error parsing stored device values:', error);
        return { audioInput: null, audioOutput: null, videoInput: null };
    }
}

// Save device to localStorage
function saveDeviceToStorage(key, deviceId) {
    try {
        localStorage.setItem(key, JSON.stringify({ deviceId }));
    } catch (error) {
        console.error('Error saving device to localStorage:', error);
    }
}

// Enumerate and populate device selectors
function enumerateDevices() {
    navigator.mediaDevices
        .enumerateDevices()
        .then((deviceInfos) => {
            // Categorize devices
            audioInputDevices = deviceInfos.filter((device) => device.kind === 'audioinput');
            const allAudioOutputs = deviceInfos.filter((device) => device.kind === 'audiooutput');
            audioOutputDevices = filterUsableAudioOutputs(allAudioOutputs);
            videoInputDevices = deviceInfos.filter((device) => device.kind === 'videoinput');

            // Populate select elements
            populateDeviceSelect('audioInputSelect', audioInputDevices, 'audioinput');
            populateDeviceSelect('audioOutputSelect', audioOutputDevices, 'audiooutput');
            populateDeviceSelect('videoInputSelect', videoInputDevices, 'videoinput');

            // Restore stored values
            restoreStoredDevices();
        })
        .catch((error) => {
            console.error('Error enumerating devices:', error);
        });
}

// Populate device select element
function populateDeviceSelect(selectId, devices, kind) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) return;

    // Clear existing options except first one
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }

    // Add device options
    devices.forEach((device) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        const deviceType = kind === 'audioinput' ? 'Microphone' : 
                          kind === 'audiooutput' ? 'Speaker' : 'Camera';
        option.textContent = device.label || `${deviceType} ${device.deviceId.slice(0, 8)}`;
        selectElement.appendChild(option);
    });
}

// Restore stored device selections
function restoreStoredDevices() {
    const storedValues = getStoredDeviceValues();

    if (storedValues.audioInput && audioInputDevices.length > 0) {
        const device = audioInputDevices.find(
            (d) => d.deviceId === storedValues.audioInput.deviceId
        );
        if (device) {
            selectedAudioInput = device.deviceId;
            const select = document.getElementById('audioInputSelect');
            if (select) select.value = device.deviceId;
        }
    }

    if (storedValues.audioOutput && audioOutputDevices.length > 0) {
        const device = audioOutputDevices.find(
            (d) => d.deviceId === storedValues.audioOutput.deviceId
        );
        if (device) {
            selectedAudioOutput = device.deviceId;
            const select = document.getElementById('audioOutputSelect');
            if (select) select.value = device.deviceId;
        }
    }

    if (storedValues.videoInput && videoInputDevices.length > 0) {
        const device = videoInputDevices.find(
            (d) => d.deviceId === storedValues.videoInput.deviceId
        );
        if (device) {
            selectedVideoInput = device.deviceId;
            const select = document.getElementById('videoInputSelect');
            if (select) select.value = device.deviceId;
        }
    }
}

// Initialize device monitoring
function initializeDeviceManagement() {
    // Initial enumeration
    enumerateDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);

    // Setup change handlers
    const audioInputSelect = document.getElementById('audioInputSelect');
    if (audioInputSelect) {
        audioInputSelect.addEventListener('change', (e) => {
            const deviceId = e.target.value;
            selectedAudioInput = deviceId;
            saveDeviceToStorage('phone-island-audio-input-device', deviceId);
            dispatchPhoneIslandEvent('phone-island-audio-input-change', { deviceId });
            logEvent('🎤 Audio input changed');
        });
    }

    const audioOutputSelect = document.getElementById('audioOutputSelect');
    if (audioOutputSelect) {
        audioOutputSelect.addEventListener('change', (e) => {
            const deviceId = e.target.value;
            selectedAudioOutput = deviceId;
            saveDeviceToStorage('phone-island-audio-output-device', deviceId);
            dispatchPhoneIslandEvent('phone-island-audio-output-change', { deviceId });
            logEvent('🔊 Audio output changed');
        });
    }

    const videoInputSelect = document.getElementById('videoInputSelect');
    if (videoInputSelect) {
        videoInputSelect.addEventListener('change', (e) => {
            const deviceId = e.target.value;
            selectedVideoInput = deviceId;
            saveDeviceToStorage('phone-island-video-input-device', deviceId);
            dispatchPhoneIslandEvent('phone-island-video-input-change', { deviceId });
            logEvent('📹 Video input changed');
        });
    }
}

// ===========================================
// USER INFORMATION (/me)
// ===========================================

let currentUserInfo = null;

// Storage key for API mode
const API_MODE_STORAGE_KEY = 'phone_island_api_mode';

// Function to get saved API mode from localStorage
const getSavedApiMode = (username) => {
    try {
        const saved = localStorage.getItem(`${API_MODE_STORAGE_KEY}_${username}`);
        if (saved === 'new' || saved === 'legacy') {
            return saved;
        }
    } catch (error) {
        console.warn('Failed to read API mode from localStorage:', error);
    }
    return 'unknown';
};

// Function to save API mode to localStorage
const saveApiMode = (username, mode) => {
    try {
        localStorage.setItem(`${API_MODE_STORAGE_KEY}_${username}`, mode);
    } catch (error) {
        console.warn('Failed to save API mode to localStorage:', error);
    }
};

// Fetch user information from /user/me endpoint
async function fetchCurrentUserInfo() {
    try {
        // Get token from session storage
        const storedToken = sessionStorage.getItem('phoneIslandToken');
        if (!storedToken) {
            throw new Error('No token available');
        }

        // Decode token to get server information
        const tokenData = decodeToken(storedToken);
        const hostName = tokenData.server;
        const username = tokenData.username;
        const authToken = tokenData.secret;

        let currentApiMode = getSavedApiMode(username);
        let response;
        let data;

        // If mode is unknown, probe the API
        if (currentApiMode === 'unknown') {
            // First time or after reset: test new API format
            try {
                response = await fetch(`https://${hostName}/api/user/me`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (response.ok) {
                    // New API format works
                    currentApiMode = 'new';
                    saveApiMode(username, 'new');
                    data = await response.json();
                } else if (response.status === 404 || response.status === 401) {
                    // Fallback to legacy API format
                    currentApiMode = 'legacy';
                    saveApiMode(username, 'legacy');
                    
                    // Make request with legacy format
                    response = await fetch(`https://${hostName}/webrest/user/me`, {
                        headers: {
                            Authorization: `${username}:${authToken}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    data = await response.json();
                } else {
                    throw new Error(`API test failed with status: ${response.status}`);
                }
            } catch (error) {
                // Network error or other issues, try legacy API
                currentApiMode = 'legacy';
                saveApiMode(username, 'legacy');
                
                response = await fetch(`https://${hostName}/webrest/user/me`, {
                    headers: {
                        Authorization: `${username}:${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                data = await response.json();
            }
        } else {
            // Use saved API mode
            if (currentApiMode === 'new') {
                response = await fetch(`https://${hostName}/api/user/me`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });
            } else {
                response = await fetch(`https://${hostName}/webrest/user/me`, {
                    headers: {
                        Authorization: `${username}:${authToken}`,
                    },
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            data = await response.json();
        }

        currentUserInfo = data;
        renderUserInfoTable(data);
        logEvent(`✅ User information loaded successfully (API mode: ${currentApiMode})`);
        return data;
    } catch (error) {
        console.error('Error fetching user information:', error);
        renderUserInfoError(error.message);
        logEvent(`❌ Error loading user information: ${error.message}`);
        throw error;
    }
}

// Render user information as a table
function renderUserInfoTable(userInfo) {
    const container = document.getElementById('userInfoTableContainer');
    if (!container) return;

    // Create table HTML
    const tableHTML = `
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tbody>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold; background-color: #f8f9fa; width: 30%;">Username</td>
                    <td style="padding: 10px;">${userInfo.username || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold; background-color: #f8f9fa;">Name</td>
                    <td style="padding: 10px;">${userInfo.name || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold; background-color: #f8f9fa;">Main Presence</td>
                    <td style="padding: 10px;">
                        <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; background-color: ${getPresenceColor(userInfo.mainPresence)}; color: white; font-size: 12px; font-weight: bold;">
                            ${userInfo.mainPresence || 'N/A'}
                        </span>
                    </td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold; background-color: #f8f9fa;">Presence</td>
                    <td style="padding: 10px;">
                        <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; background-color: ${getPresenceColor(userInfo.presence)}; color: white; font-size: 12px; font-weight: bold;">
                            ${userInfo.presence || 'N/A'}
                        </span>
                    </td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold; background-color: #f8f9fa;">Default Device</td>
                    <td style="padding: 10px;">${userInfo.default_device?.id || 'Not set'} <span style="color: #6c757d;">(${userInfo.default_device?.type || 'N/A'})</span></td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold; background-color: #f8f9fa;">Endpoints</td>
                    <td style="padding: 10px;">${formatEndpoints(userInfo.endpoints)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold; background-color: #f8f9fa;">Presence on Busy</td>
                    <td style="padding: 10px;">${userInfo.presenceOnBusy || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold; background-color: #f8f9fa;">Presence on Unavailable</td>
                    <td style="padding: 10px;">${userInfo.presenceOnUnavailable || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold; background-color: #f8f9fa;">Recall on Busy</td>
                    <td style="padding: 10px;">${userInfo.recallOnBusy || 'N/A'}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; font-weight: bold; background-color: #f8f9fa;">Profile</td>
                    <td style="padding: 10px;">${userInfo.profile?.macro_permissions?.length || 0} macro permission(s)</td>
                </tr>
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;
}

// Get color for presence status
function getPresenceColor(presence) {
    const colors = {
        'online': '#28a745',
        'busy': '#dc3545',
        'dnd': '#dc3545',
        'cellphone': '#17a2b8',
        'callforward': '#ffc107',
        'voicemail': '#6c757d',
        'offline': '#6c757d',
        'ringing': '#007bff',
        'incoming': '#007bff',
        'outgoing': '#007bff'
    };
    return colors[presence?.toLowerCase()] || '#6c757d';
}

// Format endpoints for display
function formatEndpoints(endpoints) {
    if (!endpoints || !endpoints.extension || endpoints.extension.length === 0) {
        return 'No endpoints';
    }

    const endpointsList = endpoints.extension
        .map(endpoint => `<span style="display: inline-block; margin: 2px 5px 2px 0; padding: 4px 8px; background-color: #e9ecef; border-radius: 4px; font-size: 12px;">${endpoint.id} (${endpoint.type})</span>`)
        .join('');

    return `<div>${endpointsList}</div>`;
}

// Render error message
function renderUserInfoError(errorMessage) {
    const container = document.getElementById('userInfoTableContainer');
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #dc3545; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">
            <strong>⚠️ Error loading user information</strong><br>
            <span style="font-size: 14px;">${errorMessage}</span>
        </div>
    `;
}

// Initialize user information management
function initializeUserInformation() {
    const refreshBtn = document.getElementById('refreshUserInfoBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const container = document.getElementById('userInfoTableContainer');
            if (container) {
                container.innerHTML = '<p style="color: #6c757d; text-align: center; padding: 20px;">🔄 Loading...</p>';
            }
            fetchCurrentUserInfo();
        });
    }
}

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
// TOKEN DECODING AND USER DATA
// ===========================================

// Decode Base64 token and extract user information
function decodeToken(base64Token) {
    try {
        // Decode Base64
        const decodedString = atob(base64Token);
        console.log('Decoded token string:', decodedString);

        // Format: server:username:jwt_token:extension:token_id:host:port
        // Example: cti3.demo-heron.sf.nethserver.net:lorenzo:eyJhbG...W4:204:79938b8a...:127.0.0.1:20107
        const parts = decodedString.split(':');

        if (parts.length !== 7) {
            throw new Error(`Invalid token format - expected 7 parts, got ${parts.length}`);
        }

        const server = parts[0];
        const username = parts[1];
        const jwt = parts[2];
        const extension = parts[3];
        const tokenId = parts[4];
        const host = parts[5];
        const port = parts[6];

        console.log('Parsed token:', { server, username, extension, host, port });

        return {
            server: server,
            username: username,
            secret: jwt, // This is the JWT token
            extension: extension,
            token: tokenId,
            host: host,
            port: port
        };
    } catch (error) {
        console.error('Error decoding token:', error);
        throw new Error('Failed to decode token');
    }
}

// Display user information from token
function displayUserInfo(tokenData) {
    document.getElementById('userUsername').textContent = tokenData.username;
    document.getElementById('userExtension').textContent = tokenData.extension;
    document.getElementById('userServer').textContent = tokenData.server;
    document.getElementById('userInfo').classList.remove('hidden');
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

// Track last status to avoid duplicate updates
let lastStatus = '';
let lastStatusTime = 0;

// Helper function to update status
function updateStatus(message, force = false) {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastStatusTime;

    // Avoid duplicate status updates within 2 seconds unless forced
    if (!force && message === lastStatus && timeSinceLastUpdate < 2000) {
        return;
    }

    const statusElement = document.getElementById('statusContent');
    if (statusElement) {
        statusElement.innerHTML = message;
    }
    logEvent(`📊 STATUS: ${message}`);

    lastStatus = message;
    lastStatusTime = now;
}

// Helper function to log events (with filtering)
function logEvent(message, data = null) {
    // Check if event should be logged based on active filters
    if (!shouldLogEvent(message)) {
        return; // Skip logging this event
    }

    const logElement = document.getElementById('eventLog');
    if (logElement) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
        logEntry.innerHTML = `[${timestamp}] ${message}${dataStr}`;
        logElement.appendChild(logEntry);
        logElement.scrollTop = logElement.scrollHeight;
        
        // Update counter and apply current search filter
        updateLogSearchCounter();
        filterEventLog();
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
    updateStatus('📋 Side menu opened', true);
});

window.addEventListener('phone-island-sideview-closed', (event) => {
    // Only log, don't update status for menu close
    logEvent('📋 Side menu closed');
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
    updateStatus('⚠️ Internet connection lost', true); // Force update for disconnection
});

window.addEventListener('phone-island-internet-connected', (event) => {
    // Only log, don't update status for repeated connection events
    logEvent('🌐 Internet connection restored');
});

// Error and alert events
window.addEventListener('phone-island-alert-removed', (event) => {
    // Don't log every alert removal, it's too noisy
    // logEvent('🗑️ Alert removed');
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

// User information events
window.addEventListener('phone-island-user-informations-update', (event) => {
    const data = event.detail;
    logEvent('👤 User information updated', data);
});

// ===========================================
// LOGIN AND INITIALIZATION
// ===========================================

function initializeWidget(base64Token) {
    try {
        // Decode token and get user data
        const tokenData = decodeToken(base64Token);
        console.log('Token data:', tokenData);

        // Set the token in the widget BEFORE the script loads
        const phoneIslandWidget = document.getElementById('phoneIslandWidget');
        phoneIslandWidget.setAttribute('data-config', base64Token);

        // Display user info
        displayUserInfo(tokenData);

        // Hide login container and show main panel
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('mainPanel').classList.remove('hidden');

        // Reload the page to initialize the widget with the new token
        // We need to store the token in sessionStorage so it persists after reload
        sessionStorage.setItem('phoneIslandToken', base64Token);
        sessionStorage.setItem('phoneIslandUserData', JSON.stringify(tokenData));

        // Reload the page
        window.location.reload();

        return true;
    } catch (error) {
        console.error('Initialization error:', error);
        const registrationStatus = document.getElementById('registrationStatus');
        registrationStatus.textContent = `❌ Error: ${error.message}`;
        registrationStatus.classList.remove('hidden');
        registrationStatus.classList.add('error');
        return false;
    }
}

// ===========================================
// UI EVENT HANDLERS
// ===========================================

// Clear event log
function clearEventLog() {
    const logElement = document.getElementById('eventLog');
    if (logElement) {
        logElement.innerHTML = '<div>📡 Event Log cleared - waiting for new events...</div>';
        logEvent('🗑️ Event log cleared by user');
        updateLogSearchCounter();
    }
}

// Search/filter event log
function filterEventLog() {
    const searchInput = document.getElementById('logSearchInput');
    const logElement = document.getElementById('eventLog');
    
    if (!searchInput || !logElement) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    const logEntries = Array.from(logElement.children);
    
    let visibleCount = 0;
    
    logEntries.forEach(entry => {
        const text = entry.textContent.toLowerCase();
        
        if (searchTerm === '' || text.includes(searchTerm)) {
            entry.classList.remove('hidden');
            visibleCount++;
        } else {
            entry.classList.add('hidden');
        }
    });
    
    updateLogSearchCounter();
}

// Update search counter
function updateLogSearchCounter() {
    const logElement = document.getElementById('eventLog');
    const counter = document.getElementById('logSearchCounter');
    
    if (!logElement || !counter) return;
    
    const allEntries = Array.from(logElement.children);
    const visibleEntries = allEntries.filter(entry => !entry.classList.contains('hidden'));
    
    counter.textContent = `${visibleEntries.length} / ${allEntries.length}`;
}

function init() {
    // Initialize event filter UI
    initializeFilterUI();

    // Initialize device management
    initializeDeviceManagement();

    // Initialize user information
    initializeUserInformation();

    // Clear log button
    const clearLogBtn = document.getElementById('clearLogBtn');
    if (clearLogBtn) {
        clearLogBtn.addEventListener('click', () => {
            clearEventLog();
        });
    }

    // Search log input
    const logSearchInput = document.getElementById('logSearchInput');
    if (logSearchInput) {
        logSearchInput.addEventListener('input', () => {
            filterEventLog();
        });
        
        // Also filter on Enter key
        logSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                filterEventLog();
            }
        });
    }

    // Check if we have a stored token from a previous session
    const storedToken = sessionStorage.getItem('phoneIslandToken');
    const storedUserData = sessionStorage.getItem('phoneIslandUserData');

    if (storedToken && storedUserData) {
        // Token exists, set it and show main panel
        const phoneIslandWidget = document.getElementById('phoneIslandWidget');
        phoneIslandWidget.setAttribute('data-config', storedToken);

        const tokenData = JSON.parse(storedUserData);
        displayUserInfo(tokenData);

        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('mainPanel').classList.remove('hidden');

        updateStatus('✅ Widget initialized successfully');
        logEvent('🔐 Widget initialized with user:', tokenData.username);
    }

    // Login handler
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const tokenInput = document.getElementById('tokenInput');
            const token = tokenInput.value.trim();

            if (!token) {
                alert('Please enter a valid token');
                return;
            }

            const registrationStatus = document.getElementById('registrationStatus');
            registrationStatus.textContent = '🔄 Initializing...';
            registrationStatus.classList.remove('hidden', 'error', 'success');

            // Initialize widget with token
            initializeWidget(token);
        });
    }

    // Allow Enter key to submit
    const tokenInput = document.getElementById('tokenInput');
    if (tokenInput) {
        tokenInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginBtn.click();
            }
        });
    }

    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear session storage
            sessionStorage.removeItem('phoneIslandToken');
            sessionStorage.removeItem('phoneIslandUserData');

            // Reload page to show login screen
            window.location.reload();
        });
    }

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

    // Initialize - Login screen is shown by default
    logEvent('🎯 Integration script loaded - waiting for token input');
}

// Listen for Janus registration success
window.addEventListener('phone-island-socket-connected', (event) => {
    const janusStatus = document.getElementById('janusStatus');
    if (janusStatus) {
        janusStatus.textContent = '✅ Connected to Janus server!';
        janusStatus.classList.add('success');
    }
});

// Listen for registration messages from console (if available)
const originalLog = console.log;
console.log = function(...args) {
    originalLog.apply(console, args);

    // Check for Janus registration messages
    const message = args.join(' ');
    if (message.includes('Successfully registered as')) {
        const janusStatus = document.getElementById('janusStatus');
        if (janusStatus) {
            const match = message.match(/registered as (\d+)/);
            const extension = match ? match[1] : 'unknown';
            janusStatus.textContent = `✅ Successfully registered on Janus as ${extension}!`;
            janusStatus.classList.add('success');
        }
    }
};

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