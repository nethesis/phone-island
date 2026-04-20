// Phone Island Integration Script
// This file handles all event communication with the phone-island widget

'use strict';

const DEMO_STORAGE_KEYS = {
    language: 'phoneIslandDemoLanguage',
    theme: 'phoneIslandDemoTheme'
};

const DEBUG_STATUS_ACTIONS = [
    { buttonId: 'debugCallStatus', eventName: 'phone-island-call-status' },
    { buttonId: 'debugUserStatus', eventName: 'phone-island-user-status' },
    { buttonId: 'debugAllUsersStatus', eventName: 'phone-island-all-users-status' },
    { buttonId: 'debugIslandStatus', eventName: 'phone-island-status' },
    { buttonId: 'debugWebrtcStatus', eventName: 'phone-island-webrtc-status' },
    { buttonId: 'debugPlayerStatus', eventName: 'phone-island-player-status' },
    { buttonId: 'debugConferenceStatus', eventName: 'phone-island-conference-status' },
    { buttonId: 'debugStreamingStatus', eventName: 'phone-island-streaming-status' },
    { buttonId: 'debugParamUrlStatus', eventName: 'phone-island-paramurl-status' },
    { buttonId: 'debugQueueStatus', eventName: 'phone-island-queue-status' }
];

const VIEW_ACTIONS = [
    { buttonId: 'viewCall', view: 'call' },
    { buttonId: 'viewSettings', view: 'settings' },
    { buttonId: 'viewKeypad', view: 'keypad' },
    { buttonId: 'viewConference', view: 'conference' },
    { buttonId: 'viewOperatorBusy', view: 'operatorBusy' },
    { buttonId: 'viewPlayer', view: 'player' },
    { buttonId: 'viewRecorder', view: 'recorder' },
    { buttonId: 'viewVideo', view: 'videoView' }
];

const translations = {
    en: {
        meta: {
            title: 'Phone Island Widget Integration Example'
        },
        toolbar: {
            changeLanguage: 'Change language',
            lightTheme: 'Light theme',
            darkTheme: 'Dark theme'
        },
        login: {
            title: '📱 Phone Island Widget - Login',
            stepsTitle: 'Before pasting the configuration string:',
            step1: 'Log in to your CTI with your credentials, for example on <strong>cti.examplesite.it</strong>.',
            step2: 'Open <strong>Settings &gt; Integrations</strong> and click <strong>Get Phone Island configuration</strong>.',
            step3: 'Copy the generated Base64 configuration string and paste it in the field below.',
            tokenPrompt: 'Paste your Base64 token here to initialize the widget:',
            tokenPlaceholder: 'Base64 Token (e.g. Y3RpMy5kZW1vLWhlcm9uLnNmLm5ldGhzZXJ2ZXIubmV0OmxvcmVu...)',
            initialize: '🔐 Initialize Widget'
        },
        main: {
            title: '📱 Phone Island Widget Integration Example',
            userInfoTitle: '👤 User Information',
            logout: '🚪 Logout',
            usernameLabel: 'Username:',
            extensionLabel: 'Extension:',
            serverLabel: 'Server:',
            statusLabel: 'Status:',
            phoneNumberLabel: 'Phone Number:',
            phoneNumberPlaceholder: 'Enter phone number (e.g. 200)',
            call: '📞 Call',
            endCall: '📴 End Call',
            webrtcDeviceLabel: 'WebRTC Device:',
            attachWebrtc: '🔗 Attach WebRTC',
            detachWebrtc: '🔌 Detach WebRTC',
            tokenLabel: 'Token:',
            clickToReveal: 'Click to reveal',
            clickToHide: 'Click to hide',
            copyToken: 'Copy token',
            copyTokenDone: 'Token copied',
            debugActionsTitle: '🐛 Debug actions',
            debugCallStatus: '📞 Call Status',
            debugUserStatus: '👤 User Status',
            debugAllUsersStatus: '👥 All Users',
            debugIslandStatus: '🏝️ Island Status',
            debugWebrtcStatus: '🔗 WebRTC Status',
            debugPlayerStatus: '🎵 Player Status',
            debugConferenceStatus: '👥 Conference Status',
            debugStreamingStatus: '📺 Streaming Status',
            debugParamUrlStatus: '🔐 Param URL Status',
            debugQueueStatus: '📋 Queue Status',
            viewActionsTitle: '🪟 View actions',
            viewCall: '📞 Call View',
            viewSettings: '⚙️ Settings View',
            viewKeypad: '🔢 Keypad View',
            viewConference: '👥 Conference View',
            viewOperatorBusy: '🚫 Busy View',
            viewPlayer: '🎵 Player View',
            viewRecorder: '🎙️ Recorder View',
            viewVideo: '📹 Video View',
            audioVideoSettings: '🎧 Audio and Video Settings',
            audioInputLabel: '🎤 Microphone (Audio Input):',
            audioInputPlaceholder: 'Select audio input device...',
            audioOutputLabel: '🔊 Speaker (Audio Output):',
            audioOutputPlaceholder: 'Select audio output device...',
            videoInputLabel: '📹 Camera (Video Input):',
            videoInputPlaceholder: 'Select video input device...',
            eventFilters: '🎛️ Event Filters',
            filterCore: '📦 Core Events',
            filterCall: '📞 Call Events',
            filterConnection: '🌐 Connection',
            filterUi: '🎨 UI Events',
            filterRecording: '🎙️ Recording',
            filterVideo: '📹 Video',
            filterScreenShare: '🖥️ Screen Share',
            filterAudioPlayer: '🎵 Audio Player',
            filterTranscription: '💬 Transcription',
            filterSystem: '⚙️ System',
            filterErrors: '⚠️ Errors/Alerts',
            filterDebug: '🐛 Debug/Status',
            selectAllFilters: '✅ Select All',
            selectNoneFilters: '❌ Deselect All',
            defaultFilters: '🔧 Default',
            expand: '📏 Expand',
            compress: '📐 Compress',
            mute: '🔇 Mute',
            unmute: '🔊 Unmute',
            hold: '⏸️ Hold',
            unhold: '▶️ Unhold',
            openMenu: '📋 Open Menu',
            closeMenu: '❌ Close Menu',
            checkConnection: '🌐 Check Connection',
            debugStatus: '🐛 Debug Status',
            openTranscriptions: '💬 Open Transcriptions',
            openEventsReference: 'Explore Events Reference',
            openEventsReferenceHint: 'Browse all available events and ready-to-use JSON payloads.',
            eventLogTitle: '📡 Event Log:',
            clearLog: '🗑️ Clear Log',
            eventLogCleared: '📡 Event Log cleared - waiting for new events...',
            searchLogsPlaceholder: 'Search in logs...',
            eventLogEmpty: '📡 Event Log (real-time events will appear here)...',
            currentUserInfo: '👤 Current User Information (/me)',
            refresh: '🔄 Refresh',
            refreshPrompt: 'Click "Refresh" to load user information...'
        },
        transcription: {
            title: '💬 Live Transcriptions',
            clear: '🗑️ Clear',
            autoScroll: '📜 Auto-scroll',
            manualScroll: '📜 Manual',
            messagesLabel: 'Messages:',
            connecting: 'Connecting to transcription service...',
            waitingMessages: '🎙️ Waiting for transcription messages...',
            ready: '🟢 Ready to receive transcriptions',
            statusPrefix: 'Status: {{status}}',
            unknownSpeaker: 'Unknown'
        },
        eventsReference: {
            title: '🧭 Phone Island Events Reference',
            subtitle: 'Quick guide for the most useful integration events, with payload examples ready to dispatch or listen for.',
            listenTab: 'Phone Island → External',
            dispatchTab: 'External → Phone Island',
            fullDocs: 'Open full EVENTS.md',
            searchPlaceholder: 'Search event name, category or description...',
            exampleLabel: 'Example payload',
            noPayload: 'No payload',
            close: 'Close',
            filtersLabel: 'Quick filters',
            allCategories: 'All categories',
            resultsCount: '{{visible}} events shown out of {{total}}',
            noResults: 'No events match the current search or filters.',
            copied: 'Copied',
            copyPayload: 'Copy payload',
            copyPayloadEmpty: 'Copy empty payload',
            categories: {
                all: 'All categories',
                core: 'Core',
                device: 'Devices',
                ringtone: 'Ringtones',
                call: 'Calls',
                recording: 'Recording',
                summary: 'Summary & Transcription',
                player: 'Audio Player',
                video: 'Video & Screen Share',
                conference: 'Conference',
                debug: 'Debug',
                system: 'System',
                websocket: 'WebSocket & Server',
                ui: 'UI State',
                user: 'User Info'
            }
        },
        alerts: {
            enterValidToken: 'Please enter a valid token',
            enterPhoneNumber: 'Please enter a phone number',
            errorPrefix: 'Error'
        },
        status: {
            initializing: 'Initializing...',
            initializingShort: '🔄 Initializing...',
            widgetInitialized: '✅ Widget initialized successfully',
            themeChanged: '🎨 Theme changed',
            waitingJanus: '🔄 Waiting for Janus registration...',
            janusConnected: '✅ Connected to Janus server!',
            janusRegistered: '✅ Successfully registered on Janus as {{extension}}!'
        }
    },
    it: {
        meta: {
            title: 'Esempio di integrazione del widget Phone Island'
        },
        toolbar: {
            changeLanguage: 'Cambia lingua',
            lightTheme: 'Tema chiaro',
            darkTheme: 'Tema scuro'
        },
        login: {
            title: '📱 Phone Island Widget - Accesso',
            stepsTitle: 'Prima di incollare la stringa di configurazione:',
            step1: 'Accedi al tuo CTI con le tue credenziali, ad esempio su <strong>cti.examplesite.it</strong>.',
            step2: 'Apri <strong>Settings &gt; Integrations</strong> e clicca su <strong>Get Phone Island configuration</strong>.',
            step3: 'Copia la stringa Base64 generata e incollala nel campo qui sotto.',
            tokenPrompt: 'Incolla qui il token Base64 per inizializzare il widget:',
            tokenPlaceholder: 'Token Base64 (es. Y3RpMy5kZW1vLWhlcm9uLnNmLm5ldGhzZXJ2ZXIubmV0OmxvcmVu...)',
            initialize: '🔐 Inizializza widget'
        },
        main: {
            title: '📱 Esempio di integrazione del widget Phone Island',
            userInfoTitle: '👤 Informazioni utente',
            logout: '🚪 Esci',
            usernameLabel: 'Username:',
            extensionLabel: 'Interno:',
            serverLabel: 'Server:',
            statusLabel: 'Stato:',
            phoneNumberLabel: 'Numero di telefono:',
            phoneNumberPlaceholder: 'Inserisci il numero di telefono (es. 200)',
            call: '📞 Chiama',
            endCall: '📴 Termina chiamata',
            webrtcDeviceLabel: 'Dispositivo WebRTC:',
            attachWebrtc: '🔗 Collega WebRTC',
            detachWebrtc: '🔌 Scollega WebRTC',
            tokenLabel: 'Token:',
            clickToReveal: 'Clicca per mostrare',
            clickToHide: 'Clicca per nascondere',
            copyToken: 'Copia token',
            copyTokenDone: 'Token copiato',
            debugActionsTitle: '🐛 Azioni debug',
            debugCallStatus: '📞 Stato call',
            debugUserStatus: '👤 Stato utente',
            debugAllUsersStatus: '👥 Stato tutti utenti',
            debugIslandStatus: '🏝️ Stato island',
            debugWebrtcStatus: '🔗 Stato WebRTC',
            debugPlayerStatus: '🎵 Stato player',
            debugConferenceStatus: '👥 Stato conferenza',
            debugStreamingStatus: '📺 Stato streaming',
            debugParamUrlStatus: '🔐 Stato param URL',
            debugQueueStatus: '📋 Stato queue',
            viewActionsTitle: '🪟 Azioni vista',
            viewCall: '📞 Vista call',
            viewSettings: '⚙️ Vista settings',
            viewKeypad: '🔢 Vista keypad',
            viewConference: '👥 Vista conference',
            viewOperatorBusy: '🚫 Vista busy',
            viewPlayer: '🎵 Vista player',
            viewRecorder: '🎙️ Vista recorder',
            viewVideo: '📹 Vista video',
            audioVideoSettings: '🎧 Impostazioni audio e video',
            audioInputLabel: '🎤 Microfono (ingresso audio):',
            audioInputPlaceholder: 'Seleziona un dispositivo di ingresso audio...',
            audioOutputLabel: '🔊 Altoparlante (uscita audio):',
            audioOutputPlaceholder: 'Seleziona un dispositivo di uscita audio...',
            videoInputLabel: '📹 Fotocamera (ingresso video):',
            videoInputPlaceholder: 'Seleziona un dispositivo di ingresso video...',
            eventFilters: '🎛️ Filtri eventi',
            filterCore: '📦 Eventi core',
            filterCall: '📞 Eventi chiamata',
            filterConnection: '🌐 Connessione',
            filterUi: '🎨 Eventi interfaccia',
            filterRecording: '🎙️ Registrazione',
            filterVideo: '📹 Video',
            filterScreenShare: '🖥️ Condivisione schermo',
            filterAudioPlayer: '🎵 Player audio',
            filterTranscription: '💬 Trascrizione',
            filterSystem: '⚙️ Sistema',
            filterErrors: '⚠️ Errori/avvisi',
            filterDebug: '🐛 Debug/stato',
            selectAllFilters: '✅ Seleziona tutto',
            selectNoneFilters: '❌ Deseleziona tutto',
            defaultFilters: '🔧 Predefiniti',
            expand: '📏 Espandi',
            compress: '📐 Comprimi',
            mute: '🔇 Muto',
            unmute: '🔊 Audio attivo',
            hold: '⏸️ Metti in attesa',
            unhold: '▶️ Riprendi',
            openMenu: '📋 Apri menu',
            closeMenu: '❌ Chiudi menu',
            checkConnection: '🌐 Verifica connessione',
            debugStatus: '🐛 Stato debug',
            openTranscriptions: '💬 Apri trascrizioni',
            openEventsReference: 'Esplora reference eventi',
            openEventsReferenceHint: 'Consulta tutti gli eventi disponibili e i payload JSON già pronti.',
            eventLogTitle: '📡 Log eventi:',
            clearLog: '🗑️ Svuota log',
            eventLogCleared: '📡 Log eventi svuotato - in attesa di nuovi eventi...',
            searchLogsPlaceholder: 'Cerca nei log...',
            eventLogEmpty: '📡 Log eventi (gli eventi in tempo reale compariranno qui)...',
            currentUserInfo: '👤 Informazioni utente correnti (/me)',
            refresh: '🔄 Aggiorna',
            refreshPrompt: 'Clicca su "Aggiorna" per caricare le informazioni utente...'
        },
        transcription: {
            title: '💬 Trascrizioni live',
            clear: '🗑️ Svuota',
            autoScroll: '📜 Scorrimento automatico',
            manualScroll: '📜 Manuale',
            messagesLabel: 'Messaggi:',
            connecting: 'Connessione al servizio di trascrizione...',
            waitingMessages: '🎙️ In attesa dei messaggi di trascrizione...',
            ready: '🟢 Pronto a ricevere le trascrizioni',
            statusPrefix: 'Stato: {{status}}',
            unknownSpeaker: 'Sconosciuto'
        },
        eventsReference: {
            title: '🧭 Reference eventi Phone Island',
            subtitle: 'Guida rapida agli eventi di integrazione più utili, con payload JSON pronti da inviare o ascoltare.',
            listenTab: 'Phone Island → Esterno',
            dispatchTab: 'Esterno → Phone Island',
            fullDocs: 'Apri EVENTS.md completo',
            searchPlaceholder: 'Cerca per nome evento, categoria o descrizione...',
            exampleLabel: 'Payload di esempio',
            noPayload: 'Nessun payload',
            close: 'Chiudi',
            filtersLabel: 'Filtri rapidi',
            allCategories: 'Tutte le categorie',
            resultsCount: '{{visible}} eventi visibili su {{total}}',
            noResults: 'Nessun evento corrisponde ai filtri o alla ricerca corrente.',
            copied: 'Copiato',
            copyPayload: 'Copia payload',
            copyPayloadEmpty: 'Copia payload vuoto',
            categories: {
                all: 'Tutte le categorie',
                core: 'Core',
                device: 'Dispositivi',
                ringtone: 'Suonerie',
                call: 'Chiamate',
                recording: 'Registrazione',
                summary: 'Summary e trascrizione',
                player: 'Player audio',
                video: 'Video e condivisione schermo',
                conference: 'Conferenza',
                debug: 'Debug',
                system: 'Sistema',
                websocket: 'WebSocket e server',
                ui: 'Stato interfaccia',
                user: 'Informazioni utente'
            }
        },
        alerts: {
            enterValidToken: 'Inserisci un token valido',
            enterPhoneNumber: 'Inserisci un numero di telefono',
            errorPrefix: 'Errore'
        },
        status: {
            initializing: 'Inizializzazione...',
            initializingShort: '🔄 Inizializzazione...',
            widgetInitialized: '✅ Widget inizializzato correttamente',
            themeChanged: '🎨 Tema cambiato',
            waitingJanus: '🔄 In attesa della registrazione su Janus...',
            janusConnected: '✅ Connesso al server Janus!',
            janusRegistered: '✅ Registrazione su Janus completata come {{extension}}!'
        }
    }
};

let currentLanguage = localStorage.getItem(DEMO_STORAGE_KEYS.language) === 'it' ? 'it' : 'en';
let currentTheme = localStorage.getItem(DEMO_STORAGE_KEYS.theme) === 'dark' ? 'dark' : 'light';
let activeEventsReferenceTab = 'incoming';
let activeEventsReferenceCategory = 'all';
let eventsReferenceSearch = '';
let copiedEventsReferenceName = '';
let isTokenVisible = false;
let tokenCopyResetTimeout = null;

function createEventReferenceItem(category, name, descriptionEn, descriptionIt, payload = {}, tags = []) {
    return {
        category,
        name,
        description: {
            en: descriptionEn,
            it: descriptionIt
        },
        payload,
        tags
    };
}

const eventReferenceData = {
    incoming: [
        createEventReferenceItem('core', 'phone-island-expand', 'Expand the widget popup.', 'Espande il popup del widget.', {}, ['popup', 'open']),
        createEventReferenceItem('core', 'phone-island-compress', 'Compress the widget popup.', 'Comprimi il popup del widget.', {}, ['popup', 'close']),
        createEventReferenceItem('core', 'phone-island-attach', 'Attach a WebRTC device to Phone Island.', 'Collega un dispositivo WebRTC a Phone Island.', {
            id: '269',
            type: 'webrtc',
            secret: '<secret>',
            username: '269',
            description: 'WebRTC Device',
            actions: {
                answer: true,
                dtmf: true,
                hold: true
            }
        }, ['webrtc', 'device']),
        createEventReferenceItem('core', 'phone-island-detach', 'Detach the current WebRTC device and return to the previous endpoint.', 'Scollega il dispositivo WebRTC corrente e torna all’endpoint precedente.', {
            id: '92269',
            type: 'physical',
            description: 'Fanvil X6U-V2',
            actions: {
                answer: false,
                dtmf: false,
                hold: false
            }
        }, ['webrtc', 'device']),
        createEventReferenceItem('core', 'phone-island-theme-change', 'Switch Phone Island between light and dark theme.', 'Cambia il tema di Phone Island tra chiaro e scuro.', {
            selectedTheme: 'dark'
        }, ['theme', 'ui']),
        createEventReferenceItem('core', 'phone-island-default-device-change', 'Set the default endpoint used by the widget.', 'Imposta l’endpoint predefinito usato dal widget.', {
            id: '269',
            type: 'webrtc',
            secret: '<secret>',
            username: '269',
            description: 'Primary device',
            actions: {
                answer: true,
                dtmf: true,
                hold: true
            },
            proxy_port: null
        }, ['device', 'default']),
        createEventReferenceItem('core', 'phone-island-check-connection', 'Trigger a manual internet connectivity check.', 'Avvia un controllo manuale della connettività internet.', {}, ['network']),
        createEventReferenceItem('core', 'phone-island-sideview-open', 'Open the right side panel.', 'Apre il pannello laterale destro.', {}, ['menu', 'ui']),
        createEventReferenceItem('core', 'phone-island-sideview-close', 'Close the right side panel.', 'Chiude il pannello laterale destro.', {}, ['menu', 'ui']),
        createEventReferenceItem('core', 'phone-island-reset-position', 'Reset the saved widget position and center it again.', 'Azzera la posizione salvata del widget e lo recentra.', {}, ['position', 'ui']),
        createEventReferenceItem('device', 'phone-island-audio-input-change', 'Select the default microphone device.', 'Seleziona il microfono predefinito.', {
            deviceId: '756ada2c6b10546e28808c13062982d66cae723eba1e03fe3834f8df79f794ee'
        }, ['microphone']),
        createEventReferenceItem('device', 'phone-island-audio-output-change', 'Select the default speaker device.', 'Seleziona l’altoparlante predefinito.', {
            deviceId: '2d331f699ec92b95000f3a656ab1d6ff9f17b3c9502c4a8db1d3f91905b5743f'
        }, ['speaker']),
        createEventReferenceItem('device', 'phone-island-video-input-change', 'Select the default camera device.', 'Seleziona la fotocamera predefinita.', {
            deviceId: '116ada2c6b10546e28808c13062982d66cae723eba1e03fe3834f8df79f794ee'
        }, ['camera']),
        createEventReferenceItem('ringtone', 'phone-island-ringing-tone-list', 'Request the ringtone catalog available in the widget.', 'Richiede il catalogo delle suonerie disponibili nel widget.', {}, ['audio']),
        createEventReferenceItem('ringtone', 'phone-island-ringing-tone-select', 'Select the ringtone used for incoming calls.', 'Seleziona la suoneria usata per le chiamate in ingresso.', {
            name: 'default'
        }, ['audio']),
        createEventReferenceItem('ringtone', 'phone-island-ringing-tone-output', 'Choose the output device used for ringtone playback.', 'Sceglie il dispositivo di uscita usato per riprodurre la suoneria.', {
            deviceId: '2d331f699ec92b95000f3a656ab1d6ff9f17b3c9502c4a8db1d3f91905b5743f'
        }, ['audio', 'speaker']),
        createEventReferenceItem('call', 'phone-island-call-start', 'Start a new outbound call.', 'Avvia una nuova chiamata in uscita.', {
            number: '200'
        }, ['dial']),
        createEventReferenceItem('call', 'phone-island-call-answer', 'Answer the current ringing call.', 'Risponde alla chiamata in arrivo corrente.', {}, ['answer']),
        createEventReferenceItem('call', 'phone-island-call-end', 'Terminate the current call.', 'Termina la chiamata corrente.', {}, ['hangup']),
        createEventReferenceItem('call', 'phone-island-call-hold', 'Put the active call on hold.', 'Mette in attesa la chiamata attiva.', {}, ['hold']),
        createEventReferenceItem('call', 'phone-island-call-unhold', 'Resume a held call.', 'Riprende una chiamata in attesa.', {}, ['hold']),
        createEventReferenceItem('call', 'phone-island-call-mute', 'Mute the current call.', 'Disattiva il microfono della chiamata corrente.', {}, ['mute']),
        createEventReferenceItem('call', 'phone-island-call-unmute', 'Unmute the current call.', 'Riattiva il microfono della chiamata corrente.', {}, ['mute']),
        createEventReferenceItem('call', 'phone-island-call-transfer-open', 'Open the transfer panel.', 'Apre il pannello di trasferimento.', {}, ['transfer', 'ui']),
        createEventReferenceItem('call', 'phone-island-call-transfer-close', 'Close the transfer panel.', 'Chiude il pannello di trasferimento.', {}, ['transfer', 'ui']),
        createEventReferenceItem('call', 'phone-island-call-transfer-switch', 'Switch the leg selected in the transfer panel.', 'Cambia la gamba selezionata nel pannello di trasferimento.', {}, ['transfer']),
        createEventReferenceItem('call', 'phone-island-call-transfer-cancel', 'Abort the in-progress transfer.', 'Annulla il trasferimento in corso.', {}, ['transfer']),
        createEventReferenceItem('call', 'phone-island-call-transfer', 'Transfer the current call to another number.', 'Trasferisce la chiamata corrente verso un altro numero.', {
            number: '200'
        }, ['transfer']),
        createEventReferenceItem('call', 'phone-island-call-keypad-open', 'Open the in-call keypad.', 'Apre il tastierino durante la chiamata.', {}, ['dtmf', 'ui']),
        createEventReferenceItem('call', 'phone-island-call-keypad-close', 'Close the in-call keypad.', 'Chiude il tastierino durante la chiamata.', {}, ['dtmf', 'ui']),
        createEventReferenceItem('call', 'phone-island-call-keypad-send', 'Send a DTMF key during the active call.', 'Invia un tasto DTMF durante la chiamata attiva.', {
            key: '1'
        }, ['dtmf']),
        createEventReferenceItem('call', 'phone-island-call-park', 'Park the active call.', 'Parcheggia la chiamata attiva.', {}, ['park']),
        createEventReferenceItem('call', 'phone-island-call-intrude', 'Intrude on a call for the provided number.', 'Si inserisce in una chiamata per il numero indicato.', {
            number: '200'
        }, ['barge']),
        createEventReferenceItem('call', 'phone-island-call-listen', 'Listen to a call for the provided number.', 'Ascolta una chiamata per il numero indicato.', {
            number: '200'
        }, ['monitor']),
        createEventReferenceItem('call', 'phone-island-call-audio-input-switch', 'Switch microphone while a call is active.', 'Cambia microfono mentre una chiamata è attiva.', {
            deviceId: '756ada2c6b10546e28808c13062982d66cae723eba1e03fe3834f8df79f794ee'
        }, ['microphone', 'call']),
        createEventReferenceItem('call', 'phone-island-call-audio-output-switch', 'Switch speaker while a call is active.', 'Cambia altoparlante mentre una chiamata è attiva.', {
            deviceId: '2d331f699ec92b95000f3a656ab1d6ff9f17b3c9502c4a8db1d3f91905b5743f'
        }, ['speaker', 'call']),
        createEventReferenceItem('call', 'phone-island-call-video-input-switch', 'Switch camera while a call is active.', 'Cambia fotocamera mentre una chiamata è attiva.', {
            deviceId: '116ada2c6b10546e28808c13062982d66cae723eba1e03fe3834f8df79f794ee'
        }, ['camera', 'call']),
        createEventReferenceItem('call', 'phone-island-call-actions-open', 'Open the in-call actions panel.', 'Apre il pannello azioni in chiamata.', {}, ['actions', 'ui']),
        createEventReferenceItem('call', 'phone-island-call-actions-close', 'Close the in-call actions panel.', 'Chiude il pannello azioni in chiamata.', {}, ['actions', 'ui']),
        createEventReferenceItem('recording', 'phone-island-recording-open', 'Open the call recording view.', 'Apre la vista di registrazione chiamata.', {}, ['recording', 'ui']),
        createEventReferenceItem('recording', 'phone-island-recording-close', 'Close the call recording view.', 'Chiude la vista di registrazione chiamata.', {}, ['recording', 'ui']),
        createEventReferenceItem('recording', 'phone-island-recording-start', 'Start call recording.', 'Avvia la registrazione della chiamata.', {}, ['recording']),
        createEventReferenceItem('recording', 'phone-island-recording-stop', 'Stop call recording.', 'Ferma la registrazione della chiamata.', {}, ['recording']),
        createEventReferenceItem('recording', 'phone-island-recording-play', 'Play the current recording preview.', 'Riproduce l’anteprima della registrazione corrente.', {}, ['recording']),
        createEventReferenceItem('recording', 'phone-island-recording-pause', 'Pause the current recording preview.', 'Mette in pausa l’anteprima della registrazione corrente.', {}, ['recording']),
        createEventReferenceItem('recording', 'phone-island-recording-save', 'Persist the current recording and expose file metadata.', 'Salva la registrazione corrente ed espone i metadati del file.', {}, ['recording']),
        createEventReferenceItem('recording', 'phone-island-recording-delete', 'Delete the current recording.', 'Elimina la registrazione corrente.', {}, ['recording']),
        createEventReferenceItem('recording', 'phone-island-physical-recording-view', 'Open the physical device recording flow.', 'Apre il flusso di registrazione del dispositivo fisico.', {}, ['recording', 'physical']),
        createEventReferenceItem('recording', 'phone-island-physical-recording-open', 'Start physical device recording.', 'Avvia la registrazione del dispositivo fisico.', {}, ['recording', 'physical']),
        createEventReferenceItem('summary', 'phone-island-summary-call-check', 'Check if a summary or transcription already exists for the given linked call id.', 'Controlla se esiste già un summary o una trascrizione per il linkedid indicato.', {
            linkedid: '1769179547.799'
        }, ['transcription', 'summary']),
        createEventReferenceItem('summary', 'phone-island-call-summary-notify', 'Register interest in being notified when a summary becomes ready.', 'Registra l’interesse a ricevere una notifica quando il summary sarà pronto.', {
            linkedid: '1769179547.799'
        }, ['transcription', 'summary', 'watch']),
        createEventReferenceItem('player', 'phone-island-audio-player-start', 'Open the audio player and play a file.', 'Apre il player audio e riproduce un file.', {
            base64_audio_file: 'UklGRiQAAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZGF0YYIAAAAAA==',
            type: 'announcement',
            id: '1',
            description: 'My Audio File'
        }, ['audio']),
        createEventReferenceItem('player', 'phone-island-audio-player-play', 'Resume audio player playback.', 'Riprende la riproduzione del player audio.', {}, ['audio']),
        createEventReferenceItem('player', 'phone-island-audio-player-pause', 'Pause audio player playback.', 'Mette in pausa la riproduzione del player audio.', {}, ['audio']),
        createEventReferenceItem('player', 'phone-island-audio-player-close', 'Close the audio player.', 'Chiude il player audio.', {}, ['audio']),
        createEventReferenceItem('player', 'phone-island-emergency-stop-ringtone', 'Force stop any ringtone still playing.', 'Forza l’arresto di qualsiasi suoneria ancora in riproduzione.', {}, ['audio', 'ringtone']),
        createEventReferenceItem('video', 'phone-island-fullscreen-enter', 'Enter fullscreen mode.', 'Entra in modalità schermo intero.', {}, ['ui']),
        createEventReferenceItem('video', 'phone-island-fullscreen-exit', 'Exit fullscreen mode.', 'Esce dalla modalità schermo intero.', {}, ['ui']),
        createEventReferenceItem('video', 'phone-island-video-enable', 'Enable the current video stream.', 'Abilita il flusso video corrente.', {}, ['camera']),
        createEventReferenceItem('video', 'phone-island-video-disable', 'Disable the current video stream.', 'Disabilita il flusso video corrente.', {}, ['camera']),
        createEventReferenceItem('video', 'phone-island-screen-share-join', 'Join a screen share started by another user.', 'Entra in una condivisione schermo avviata da un altro utente.', {}, ['screen', 'share']),
        createEventReferenceItem('video', 'phone-island-screen-share-leave', 'Leave a joined screen share.', 'Esce da una condivisione schermo a cui si è collegato.', {}, ['screen', 'share']),
        createEventReferenceItem('video', 'phone-island-screen-share-start', 'Start screen sharing.', 'Avvia la condivisione schermo.', {}, ['screen', 'share']),
        createEventReferenceItem('video', 'phone-island-screen-share-stop', 'Stop screen sharing.', 'Ferma la condivisione schermo.', {}, ['screen', 'share']),
        createEventReferenceItem('conference', 'phone-island-owner-conference-enter', 'Notify Phone Island that the conference owner entered the room.', 'Notifica a Phone Island che il proprietario della conferenza è entrato nella stanza.', {}, ['conference']),
        createEventReferenceItem('debug', 'phone-island-view-changed', 'Force the widget to render a specific view for debugging.', 'Forza il widget a mostrare una vista specifica per debug.', {
            viewType: 'call'
        }, ['debug', 'ui']),
        createEventReferenceItem('debug', 'phone-island-call-status', 'Retrieve the current call state snapshot.', 'Recupera lo snapshot dello stato chiamata corrente.', {}, ['debug', 'status']),
        createEventReferenceItem('debug', 'phone-island-user-status', 'Retrieve the main user status snapshot.', 'Recupera lo snapshot dello stato dell’utente principale.', {}, ['debug', 'status']),
        createEventReferenceItem('debug', 'phone-island-all-users-status', 'Retrieve the snapshot of all known users.', 'Recupera lo snapshot di tutti gli utenti noti.', {}, ['debug', 'status']),
        createEventReferenceItem('debug', 'phone-island-status', 'Request a full debug snapshot of Phone Island state.', 'Richiede uno snapshot completo dello stato di Phone Island.', {}, ['debug', 'status']),
        createEventReferenceItem('debug', 'phone-island-webrtc-status', 'Retrieve WebRTC status information.', 'Recupera le informazioni di stato WebRTC.', {}, ['debug', 'webrtc']),
        createEventReferenceItem('debug', 'phone-island-screen-share-status', 'Retrieve screen sharing status information.', 'Recupera le informazioni sullo stato della condivisione schermo.', {}, ['debug', 'screen', 'share']),
        createEventReferenceItem('debug', 'phone-island-player-status', 'Retrieve audio player status information.', 'Recupera le informazioni sullo stato del player audio.', {}, ['debug', 'audio']),
        createEventReferenceItem('debug', 'phone-island-player-force-stop', 'Force stop all audio playback.', 'Forza l’arresto di tutta la riproduzione audio.', {}, ['debug', 'audio'])
    ],
    outgoing: [
        createEventReferenceItem('core', 'phone-island-expanded', 'Phone Island popup has been expanded.', 'Il popup di Phone Island è stato espanso.', {}, ['popup']),
        createEventReferenceItem('core', 'phone-island-compressed', 'Phone Island popup has been compressed.', 'Il popup di Phone Island è stato compresso.', {}, ['popup']),
        createEventReferenceItem('core', 'phone-island-attached', 'WebRTC device is attached and active.', 'Il dispositivo WebRTC è collegato e attivo.', {}, ['webrtc', 'device']),
        createEventReferenceItem('core', 'phone-island-detached', 'WebRTC device has been detached.', 'Il dispositivo WebRTC è stato scollegato.', {}, ['webrtc', 'device']),
        createEventReferenceItem('core', 'phone-island-theme-changed', 'Theme has been updated inside the widget.', 'Il tema è stato aggiornato all’interno del widget.', {}, ['theme', 'ui']),
        createEventReferenceItem('core', 'phone-island-default-device-changed', 'The default endpoint has changed.', 'L’endpoint predefinito è cambiato.', {}, ['device', 'default']),
        createEventReferenceItem('core', 'phone-island-presence-changed', 'Operator presence has changed.', 'La presenza dell’operatore è cambiata.', {}, ['presence']),
        createEventReferenceItem('core', 'phone-island-all-alerts-removed', 'All widget alerts have been cleared.', 'Tutti gli alert del widget sono stati rimossi.', {}, ['alerts']),
        createEventReferenceItem('core', 'phone-island-extensions-update', 'Extensions list has been updated.', 'La lista degli interni è stata aggiornata.', {}, ['extensions']),
        createEventReferenceItem('device', 'phone-island-audio-input-changed', 'Default microphone has changed.', 'Il microfono predefinito è cambiato.', {}, ['microphone']),
        createEventReferenceItem('device', 'phone-island-audio-output-changed', 'Default speaker has changed.', 'L’altoparlante predefinito è cambiato.', {}, ['speaker']),
        createEventReferenceItem('device', 'phone-island-video-input-changed', 'Default camera has changed.', 'La fotocamera predefinita è cambiata.', {}, ['camera']),
        createEventReferenceItem('ringtone', 'phone-island-ringing-tone-list-response', 'Widget returned the full ringtone catalog.', 'Il widget ha restituito il catalogo completo delle suonerie.', {
            ringtones: [
                {
                    name: 'default',
                    displayName: 'Default'
                },
                {
                    name: 'modern',
                    displayName: 'Modern'
                }
            ]
        }, ['audio', 'ringtone']),
        createEventReferenceItem('ringtone', 'phone-island-ringing-tone-selected', 'The ringtone used for incoming calls has changed.', 'La suoneria usata per le chiamate in ingresso è cambiata.', {
            name: 'default'
        }, ['audio', 'ringtone']),
        createEventReferenceItem('ringtone', 'phone-island-ringing-tone-output-changed', 'Ringtone output device has changed.', 'Il dispositivo di uscita della suoneria è cambiato.', {
            deviceId: '2d331f699ec92b95000f3a656ab1d6ff9f17b3c9502c4a8db1d3f91905b5743f'
        }, ['audio', 'ringtone']),
        createEventReferenceItem('call', 'phone-island-call-ringing', 'There is an incoming or outgoing ringing call.', 'È presente una chiamata in ingresso o in uscita che sta squillando.', {}, ['call']),
        createEventReferenceItem('call', 'phone-island-call-started', 'A call has started successfully.', 'Una chiamata è iniziata correttamente.', {}, ['call']),
        createEventReferenceItem('call', 'phone-island-outgoing-call-started', 'A new outbound call attempt has started.', 'È iniziato un nuovo tentativo di chiamata in uscita.', {}, ['call']),
        createEventReferenceItem('call', 'phone-island-call-answered', 'A call has been answered, optionally by another device.', 'Una chiamata è stata risposta, eventualmente da un altro dispositivo.', {
            extensionType: 'mobile'
        }, ['call']),
        createEventReferenceItem('call', 'phone-island-call-ended', 'The current call has ended.', 'La chiamata corrente è terminata.', {}, ['call']),
        createEventReferenceItem('call', 'phone-island-call-held', 'The active call has been placed on hold.', 'La chiamata attiva è stata messa in attesa.', {}, ['hold']),
        createEventReferenceItem('call', 'phone-island-call-unheld', 'A held call has been resumed.', 'Una chiamata in attesa è stata ripresa.', {}, ['hold']),
        createEventReferenceItem('call', 'phone-island-call-muted', 'The current call has been muted.', 'La chiamata corrente è stata silenziata.', {}, ['mute']),
        createEventReferenceItem('call', 'phone-island-call-unmuted', 'The current call has been unmuted.', 'La chiamata corrente è stata riattivata.', {}, ['mute']),
        createEventReferenceItem('call', 'phone-island-call-transfer-opened', 'Transfer panel has been opened.', 'Il pannello di trasferimento è stato aperto.', {}, ['transfer', 'ui']),
        createEventReferenceItem('call', 'phone-island-call-transfer-closed', 'Transfer panel has been closed.', 'Il pannello di trasferimento è stato chiuso.', {}, ['transfer', 'ui']),
        createEventReferenceItem('call', 'phone-island-call-transfer-switched', 'The transfer panel switched to another call leg.', 'Il pannello di trasferimento è passato a un’altra gamba della chiamata.', {}, ['transfer']),
        createEventReferenceItem('call', 'phone-island-call-transfer-canceled', 'The transfer flow has been canceled.', 'Il flusso di trasferimento è stato annullato.', {}, ['transfer']),
        createEventReferenceItem('call', 'phone-island-call-transfered', 'The call has been transferred.', 'La chiamata è stata trasferita.', {}, ['transfer']),
        createEventReferenceItem('call', 'phone-island-call-conferenced', 'The call has been converted into a conference.', 'La chiamata è stata convertita in conferenza.', {}, ['conference']),
        createEventReferenceItem('call', 'phone-island-call-transfer-successfully-popup-open', 'A successful transfer message was shown while the popup was open.', 'È stato mostrato il messaggio di trasferimento riuscito mentre il popup era aperto.', {}, ['transfer', 'ui']),
        createEventReferenceItem('call', 'phone-island-call-transfer-successfully-popup-close', 'A successful transfer message was shown while the popup was closed.', 'È stato mostrato il messaggio di trasferimento riuscito mentre il popup era chiuso.', {}, ['transfer', 'ui']),
        createEventReferenceItem('call', 'phone-island-call-transfer-failed', 'The transfer operation failed.', 'L’operazione di trasferimento è fallita.', {}, ['transfer', 'error']),
        createEventReferenceItem('call', 'phone-island-call-keypad-opened', 'In-call keypad has been opened.', 'Il tastierino in chiamata è stato aperto.', {}, ['dtmf', 'ui']),
        createEventReferenceItem('call', 'phone-island-call-keypad-closed', 'In-call keypad has been closed.', 'Il tastierino in chiamata è stato chiuso.', {}, ['dtmf', 'ui']),
        createEventReferenceItem('call', 'phone-island-call-keypad-sent', 'A DTMF key has been sent.', 'È stato inviato un tasto DTMF.', {}, ['dtmf']),
        createEventReferenceItem('call', 'phone-island-call-parked', 'The call has been parked.', 'La chiamata è stata parcheggiata.', {}, ['park']),
        createEventReferenceItem('call', 'phone-island-call-listened', 'A listening action has been executed.', 'È stata eseguita un’azione di ascolto.', {}, ['monitor']),
        createEventReferenceItem('call', 'phone-island-call-intruded', 'An intrude action has been executed.', 'È stata eseguita un’azione di intrusione.', {}, ['barge']),
        createEventReferenceItem('call', 'phone-island-call-audio-input-switched', 'The in-call microphone has been switched.', 'Il microfono in chiamata è stato cambiato.', {}, ['microphone', 'call']),
        createEventReferenceItem('call', 'phone-island-call-audio-output-switched', 'The in-call speaker has been switched.', 'L’altoparlante in chiamata è stato cambiato.', {}, ['speaker', 'call']),
        createEventReferenceItem('call', 'phone-island-call-video-input-switched', 'The in-call camera has been switched.', 'La fotocamera in chiamata è stata cambiata.', {}, ['camera', 'call']),
        createEventReferenceItem('call', 'phone-island-call-actions-opened', 'In-call actions panel has been opened.', 'Il pannello azioni in chiamata è stato aperto.', {}, ['actions', 'ui']),
        createEventReferenceItem('call', 'phone-island-call-actions-closed', 'In-call actions panel has been closed.', 'Il pannello azioni in chiamata è stato chiuso.', {}, ['actions', 'ui']),
        createEventReferenceItem('call', 'phone-island-call-switched', 'An active call has been switched to another device.', 'Una chiamata attiva è stata spostata su un altro dispositivo.', {}, ['device', 'call']),
        createEventReferenceItem('call', 'phone-island-action-physical', 'A physical device action or call URL is available.', 'È disponibile un’azione o URL per dispositivo fisico.', {
            url: 'http://username:password@phone/cgi-bin/ConfigManApp.com?key=numberCalled;ENTER',
            urlType: 'call'
        }, ['physical']),
        createEventReferenceItem('recording', 'phone-island-recording-opened', 'Recording panel has been opened.', 'Il pannello registrazione è stato aperto.', {}, ['recording', 'ui']),
        createEventReferenceItem('recording', 'phone-island-recording-closed', 'Recording panel has been closed.', 'Il pannello registrazione è stato chiuso.', {}, ['recording', 'ui']),
        createEventReferenceItem('recording', 'phone-island-recording-started', 'Recording has started.', 'La registrazione è iniziata.', {}, ['recording']),
        createEventReferenceItem('recording', 'phone-island-recording-stopped', 'Recording has stopped.', 'La registrazione si è fermata.', {}, ['recording']),
        createEventReferenceItem('recording', 'phone-island-recording-played', 'Recording playback has started.', 'La riproduzione della registrazione è iniziata.', {}, ['recording']),
        createEventReferenceItem('recording', 'phone-island-recording-paused', 'Recording playback has been paused.', 'La riproduzione della registrazione è stata messa in pausa.', {}, ['recording']),
        createEventReferenceItem('recording', 'phone-island-recording-saved', 'Recording has been saved and the file metadata is available.', 'La registrazione è stata salvata e sono disponibili i metadati del file.', {
            tempFileName: 'user-cti-1686824454167.wav',
            audioFileURL: 'blob:http://localhost:6006/3897f2da-2411-4e38-a024-56bbeab72a91'
        }, ['recording']),
        createEventReferenceItem('recording', 'phone-island-recording-deleted', 'Recording has been deleted.', 'La registrazione è stata eliminata.', {}, ['recording']),
        createEventReferenceItem('recording', 'phone-island-physical-recording-opened', 'Physical recording flow has been opened.', 'Il flusso di registrazione fisica è stato aperto.', {}, ['recording', 'physical']),
        createEventReferenceItem('recording', 'phone-island-physical-recording-saved', 'Physical recording has been saved.', 'La registrazione fisica è stata salvata.', {}, ['recording', 'physical']),
        createEventReferenceItem('player', 'phone-island-audio-player-started', 'Audio player opened and playback started.', 'Il player audio si è aperto e la riproduzione è iniziata.', {}, ['audio']),
        createEventReferenceItem('player', 'phone-island-audio-player-played', 'Audio player playback resumed.', 'La riproduzione del player audio è ripresa.', {}, ['audio']),
        createEventReferenceItem('player', 'phone-island-audio-player-paused', 'Audio player playback paused.', 'La riproduzione del player audio è stata messa in pausa.', {}, ['audio']),
        createEventReferenceItem('player', 'phone-island-audio-player-closed', 'Audio player has been closed.', 'Il player audio è stato chiuso.', {}, ['audio']),
        createEventReferenceItem('player', 'phone-island-emergency-stop-ringtone-completed', 'The emergency ringtone stop completed successfully.', 'L’arresto di emergenza della suoneria è stato completato con successo.', {}, ['audio', 'ringtone']),
        createEventReferenceItem('video', 'phone-island-fullscreen-entered', 'Phone Island entered fullscreen mode.', 'Phone Island è entrato in modalità schermo intero.', {}, ['ui']),
        createEventReferenceItem('video', 'phone-island-fullscreen-exited', 'Phone Island exited fullscreen mode.', 'Phone Island è uscito dalla modalità schermo intero.', {}, ['ui']),
        createEventReferenceItem('video', 'phone-island-video-enabled', 'Video has been enabled during the current call.', 'Il video è stato abilitato durante la chiamata corrente.', {}, ['camera']),
        createEventReferenceItem('video', 'phone-island-video-disabled', 'Video has been disabled during the current call.', 'Il video è stato disabilitato durante la chiamata corrente.', {}, ['camera']),
        createEventReferenceItem('video', 'phone-island-screen-share-started', 'Screen sharing has started.', 'La condivisione schermo è iniziata.', {}, ['screen', 'share']),
        createEventReferenceItem('video', 'phone-island-screen-share-stopped', 'Screen sharing has stopped.', 'La condivisione schermo si è fermata.', {}, ['screen', 'share']),
        createEventReferenceItem('video', 'phone-island-screen-share-joined', 'User joined a screen share initiated by another party.', 'L’utente si è collegato a una condivisione schermo avviata dall’altra parte.', {}, ['screen', 'share']),
        createEventReferenceItem('video', 'phone-island-screen-share-left', 'User left a joined screen share.', 'L’utente ha lasciato una condivisione schermo a cui si era collegato.', {}, ['screen', 'share']),
        createEventReferenceItem('conference', 'phone-island-conference-finished', 'A conference has finished.', 'Una conferenza è terminata.', {}, ['conference']),
        createEventReferenceItem('conference', 'phone-island-owner-conference-finished', 'The owner conference session has finished.', 'La sessione di conferenza del proprietario è terminata.', {}, ['conference']),
        createEventReferenceItem('system', 'phone-island-user-already-login', 'User logged in from another window or session.', 'L’utente ha effettuato l’accesso da un’altra finestra o sessione.', {}, ['session']),
        createEventReferenceItem('system', 'phone-island-main-presence', 'Presence update received from the backend.', 'Aggiornamento presenza ricevuto dal backend.', {
            foo1: {
                mainPresence: 'ringing'
            }
        }, ['presence']),
        createEventReferenceItem('system', 'phone-island-conversations', 'Conversation data has been updated from the backend.', 'I dati delle conversazioni sono stati aggiornati dal backend.', {
            foo1: {
                conversations: {}
            }
        }, ['conversation']),
        createEventReferenceItem('system', 'phone-island-queue-update', 'Queue information has changed.', 'Le informazioni della coda sono cambiate.', {
            401: {
                name: 'QueueOne',
                queue: '401',
                avgHoldTime: '0',
                avgTalkTime: '0'
            }
        }, ['queue']),
        createEventReferenceItem('system', 'phone-island-queue-member-update', 'A queue member status has changed.', 'Lo stato di un membro di coda è cambiato.', {
            212: {
                name: 'foo 2',
                queue: '302',
                member: '212'
            }
        }, ['queue']),
        createEventReferenceItem('system', 'phone-island-current-user-queue-call-waiting', 'Current user has a queue call still waiting or ringing.', 'L’utente corrente ha una chiamata di coda ancora in attesa o in squillo.', {
            conversationId: '1671557974.4928',
            queueId: '410',
            queueName: 'Customer care',
            queuePosition: '1'
        }, ['queue', 'call']),
        createEventReferenceItem('system', 'phone-island-current-user-queue-call-connected', 'Current user answered a queue call and the conversation is connected.', 'L’utente corrente ha risposto a una chiamata di coda e la conversazione è connessa.', {
            conversationId: '1671557974.4928',
            queueId: '410',
            queueName: 'Customer care'
        }, ['queue', 'call']),
        createEventReferenceItem('system', 'phone-island-parking-update', 'Parking slots or parked calls have changed.', 'Gli slot di parcheggio o le chiamate parcheggiate sono cambiati.', {}, ['park']),
        createEventReferenceItem('system', 'phone-island-presence-change', 'Presence change data has been emitted.', 'Sono stati emessi dati di cambio presenza.', {
            status: 'dnd'
        }, ['presence']),
        createEventReferenceItem('system', 'phone-island-default-device-updated', 'User default device has been updated.', 'Il dispositivo predefinito dell’utente è stato aggiornato.', {
            id: '91204'
        }, ['device', 'default']),
        createEventReferenceItem('system', 'phone-island-internet-connected', 'Internet connectivity has been restored.', 'La connettività internet è stata ripristinata.', {}, ['network']),
        createEventReferenceItem('system', 'phone-island-internet-disconnected', 'Internet connectivity has been lost.', 'La connettività internet è stata persa.', {}, ['network']),
        createEventReferenceItem('system', 'phone-island-voicemail-received', 'A new voicemail has been received.', 'È stato ricevuto un nuovo messaggio vocale.', {
            voicemail: '228',
            counter: '14'
        }, ['voicemail']),
        createEventReferenceItem('system', 'phone-island-streaming-information-received', 'Streaming device information has been updated.', 'Le informazioni dei dispositivi di streaming sono state aggiornate.', {}, ['streaming']),
        createEventReferenceItem('system', 'phone-island-alert-removed', 'An alert has been dismissed.', 'Un alert è stato chiuso.', {}, ['alerts']),
        createEventReferenceItem('system', 'phone-island-url-parameter-opened', 'The user opened an URL parameter action.', 'L’utente ha aperto un’azione basata su URL parameter.', {
            counterpartNum: '1234',
            counterpartName: 'Antonio test',
            owner: '91269',
            uniqueId: '21234',
            url: 'www.google.it/$CALLER_NUMBER-$CALLER_NAME-$CALLED-$UNIQUEID'
        }, ['url']),
        createEventReferenceItem('websocket', 'phone-island-server-reloaded', 'Server reloaded notification received.', 'Ricevuta notifica di riavvio server.', {}, ['server']),
        createEventReferenceItem('websocket', 'phone-island-server-disconnected', 'Server connection has been lost.', 'La connessione al server è stata persa.', {}, ['server', 'error']),
        createEventReferenceItem('websocket', 'phone-island-socket-connected', 'WebSocket connection is established.', 'La connessione WebSocket è stabilita.', {}, ['socket']),
        createEventReferenceItem('websocket', 'phone-island-socket-disconnected', 'WebSocket connection has been lost.', 'La connessione WebSocket è stata persa.', {}, ['socket', 'error']),
        createEventReferenceItem('websocket', 'phone-island-socket-reconnected', 'WebSocket connection has been re-established.', 'La connessione WebSocket è stata ristabilita.', {}, ['socket']),
        createEventReferenceItem('websocket', 'phone-island-socket-disconnected-popup-open', 'Socket disconnected popup has been shown.', 'È stato mostrato il popup di socket disconnesso.', {}, ['socket', 'ui']),
        createEventReferenceItem('websocket', 'phone-island-socket-disconnected-popup-close', 'Socket disconnected popup has been closed.', 'Il popup di socket disconnesso è stato chiuso.', {}, ['socket', 'ui']),
        createEventReferenceItem('websocket', 'phone-island-socket-authorized', 'Socket authorization completed successfully.', 'L’autorizzazione del socket è stata completata con successo.', {}, ['socket']),
        createEventReferenceItem('ui', 'phone-island-sideview-opened', 'Right side panel is open.', 'Il pannello laterale destro è aperto.', {}, ['menu']),
        createEventReferenceItem('ui', 'phone-island-sideview-closed', 'Right side panel is closed.', 'Il pannello laterale destro è chiuso.', {}, ['menu']),
        createEventReferenceItem('ui', 'phone-island-size-change', 'Widget size and chrome metrics changed.', 'Le dimensioni e i parametri grafici del widget sono cambiati.', {
            width: '348px',
            height: '304px',
            borderRadius: '20px',
            padding: '24px'
        }, ['resize']),
        createEventReferenceItem('user', 'phone-island-user-informations-update', 'Fresh main user data has been emitted.', 'Sono stati emessi nuovi dati dell’utente principale.', {
            name: 'test',
            username: 'user',
            mainPresence: 'online',
            settings: {}
        }, ['user']),
        createEventReferenceItem('user', 'phone-island-conversation-transcription', 'A real-time transcription message has been received for an active conversation.', 'È stato ricevuto un messaggio di trascrizione in tempo reale per una conversazione attiva.', {
            uniqueid: '1759147339.1198',
            transcription: 'Hello, how can I help you today?',
            timestamp: 25.55,
            speaker_name: 'Antonio Colapietro',
            speaker_number: '202',
            is_final: true
        }, ['transcription', 'user']),
        createEventReferenceItem('summary', 'phone-island-summary-not-ready', 'Summary is not available yet for the requested linked call id.', 'Il summary non è ancora disponibile per il linkedid richiesto.', {
            linkedid: '1769179547.799'
        }, ['summary', 'transcription']),
        createEventReferenceItem('summary', 'phone-island-summary-call-notified', 'Summary watch request has been registered.', 'La richiesta di watch per il summary è stata registrata.', {
            linkedid: '1769179547.799'
        }, ['summary', 'transcription']),
        createEventReferenceItem('summary', 'phone-island-summary-ready', 'Summary is ready and available to the host application.', 'Il summary è pronto e disponibile per l’applicazione host.', {
            linkedid: '1769185498.1004',
            display_name: 'Mario Rossi',
            display_number: '+39021234567'
        }, ['summary', 'transcription'])
    ]
};

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
        filterContent.classList.add('expanded');
        filterToggleIcon.classList.add('expanded');
        filterHeader.setAttribute('aria-expanded', 'true');

        filterHeader.addEventListener('click', () => {
            filterContent.classList.toggle('expanded');
            filterToggleIcon.classList.toggle('expanded');
            filterHeader.setAttribute('aria-expanded', String(filterContent.classList.contains('expanded')));
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
        <table class="user-info-table">
            <tbody>
                <tr>
                    <td class="user-info-table__label">Username</td>
                    <td class="user-info-table__value">${userInfo.username || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="user-info-table__label">Name</td>
                    <td class="user-info-table__value">${userInfo.name || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="user-info-table__label">Main Presence</td>
                    <td class="user-info-table__value">
                        <span class="presence-badge" style="background-color: ${getPresenceColor(userInfo.mainPresence)};">
                            ${userInfo.mainPresence || 'N/A'}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td class="user-info-table__label">Presence</td>
                    <td class="user-info-table__value">
                        <span class="presence-badge" style="background-color: ${getPresenceColor(userInfo.presence)};">
                            ${userInfo.presence || 'N/A'}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td class="user-info-table__label">Default Device</td>
                    <td class="user-info-table__value">${userInfo.default_device?.id || 'Not set'} <span class="user-info-table__muted">(${userInfo.default_device?.type || 'N/A'})</span></td>
                </tr>
                <tr>
                    <td class="user-info-table__label">Endpoints</td>
                    <td class="user-info-table__value">${formatEndpoints(userInfo.endpoints)}</td>
                </tr>
                <tr>
                    <td class="user-info-table__label">Presence on Busy</td>
                    <td class="user-info-table__value">${userInfo.presenceOnBusy || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="user-info-table__label">Presence on Unavailable</td>
                    <td class="user-info-table__value">${userInfo.presenceOnUnavailable || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="user-info-table__label">Recall on Busy</td>
                    <td class="user-info-table__value">${userInfo.recallOnBusy || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="user-info-table__label">Profile</td>
                    <td class="user-info-table__value">${userInfo.profile?.macro_permissions?.length || 0} macro permission(s)</td>
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
        return '<span class="user-info-table__muted">No endpoints</span>';
    }

    const endpointsList = endpoints.extension
        .map(endpoint => `<span class="endpoint-badge">${endpoint.id} (${endpoint.type})</span>`)
        .join('');

    return `<div class="endpoint-badges">${endpointsList}</div>`;
}

// Render error message
function renderUserInfoError(errorMessage) {
    const container = document.getElementById('userInfoTableContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="user-info-feedback user-info-feedback--error">
            <strong>⚠️ Error loading user information</strong><br>
            <span>${errorMessage}</span>
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
                container.innerHTML = '<div class="user-info-feedback user-info-feedback--loading">🔄 Loading...</div>';
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
                ${t('transcription.waitingMessages')}
            </div>
        `;
        return;
    }

    container.innerHTML = transcriptionMessages.map(message => {
        const time = new Date(message.timestamp * 1000).toLocaleTimeString();
        const speaker = message.speaker || t('transcription.unknownSpeaker');
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
        statusElement.textContent = t('transcription.statusPrefix', { status });
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
    updateTokenVisibility();
}

function getStoredTokenValue() {
    return sessionStorage.getItem('phoneIslandToken') || '';
}

function updateTokenVisibility(forceVisible) {
    if (typeof forceVisible === 'boolean') {
        isTokenVisible = forceVisible;
    }

    const token = getStoredTokenValue();
    const tokenValue = document.getElementById('userTokenValue');
    const revealTokenBtn = document.getElementById('revealTokenBtn');
    const copyTokenBtn = document.getElementById('copyTokenBtn');
    const hint = revealTokenBtn ? revealTokenBtn.querySelector('.token-chip__hint') : null;

    if (tokenValue) {
        tokenValue.textContent = token || '-';
    }

    if (revealTokenBtn) {
        revealTokenBtn.classList.toggle('is-hidden', !isTokenVisible);
        revealTokenBtn.setAttribute('aria-expanded', isTokenVisible ? 'true' : 'false');
        revealTokenBtn.title = isTokenVisible ? t('main.clickToHide') : t('main.clickToReveal');
        revealTokenBtn.setAttribute('aria-label', revealTokenBtn.title);
    }

    if (hint) {
        hint.textContent = isTokenVisible ? t('main.clickToHide') : t('main.clickToReveal');
    }

    if (copyTokenBtn) {
        copyTokenBtn.disabled = !token || !isTokenVisible;
    }
}

async function copyStoredToken() {
    const token = getStoredTokenValue();
    if (!token) {
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(token);
        return;
    }

    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = token;
    tempTextarea.setAttribute('readonly', 'readonly');
    tempTextarea.style.position = 'absolute';
    tempTextarea.style.left = '-9999px';
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextarea);
}

function markTokenCopied() {
    const copyTokenBtn = document.getElementById('copyTokenBtn');
    if (!copyTokenBtn) {
        return;
    }

    copyTokenBtn.classList.add('is-active');
    copyTokenBtn.textContent = '✓';
    copyTokenBtn.title = t('main.copyTokenDone');
    copyTokenBtn.setAttribute('aria-label', t('main.copyTokenDone'));

    if (tokenCopyResetTimeout) {
        window.clearTimeout(tokenCopyResetTimeout);
    }

    tokenCopyResetTimeout = window.setTimeout(() => {
        copyTokenBtn.classList.remove('is-active');
        copyTokenBtn.textContent = '⧉';
        copyTokenBtn.title = t('main.copyToken');
        copyTokenBtn.setAttribute('aria-label', t('main.copyToken'));
    }, 1600);
}

function t(key, replacements = {}) {
    const fallback = translations.en;
    const scopedTranslations = translations[currentLanguage] || fallback;
    const segments = key.split('.');

    let value = segments.reduce((accumulator, segment) => accumulator && accumulator[segment], scopedTranslations);
    if (typeof value !== 'string') {
        value = segments.reduce((accumulator, segment) => accumulator && accumulator[segment], fallback);
    }

    if (typeof value !== 'string') {
        return key;
    }

    return value.replace(/\{\{(.*?)\}\}/g, (_, token) => replacements[token.trim()] ?? '');
}

function updateStaticStatusTexts() {
    const statusContent = document.getElementById('statusContent');
    if (statusContent && lastStatus === '') {
        statusContent.textContent = t('status.initializing');
    }

    const janusStatus = document.getElementById('janusStatus');
    if (janusStatus && !janusStatus.classList.contains('success') && !janusStatus.classList.contains('error')) {
        janusStatus.textContent = t('status.waitingJanus');
    }

    const transcriptionStatus = document.getElementById('transcriptionStatus');
    if (transcriptionStatus && transcriptionMessages.length === 0) {
        updateTranscriptionStatus(t('transcription.connecting'));
    }
}

function updateAutoScrollButtonText() {
    const autoScrollToggle = document.getElementById('autoScrollToggle');
    if (autoScrollToggle) {
        autoScrollToggle.innerHTML = autoScroll ? t('transcription.autoScroll') : t('transcription.manualScroll');
    }
}

function applyTranslations() {
    document.documentElement.lang = currentLanguage;
    document.title = t('meta.title');

    document.querySelectorAll('[data-i18n]').forEach((element) => {
        element.textContent = t(element.dataset.i18n);
    });

    document.querySelectorAll('[data-i18n-html]').forEach((element) => {
        element.innerHTML = t(element.dataset.i18nHtml);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
        element.setAttribute('placeholder', t(element.dataset.i18nPlaceholder));
    });

    document.querySelectorAll('[data-i18n-title]').forEach((element) => {
        const translatedTitle = t(element.dataset.i18nTitle);
        element.setAttribute('title', translatedTitle);
        element.setAttribute('aria-label', translatedTitle);
    });

    const languageToggleLabel = document.getElementById('languageToggleLabel');
    if (languageToggleLabel) {
        languageToggleLabel.textContent = currentLanguage.toUpperCase();
    }

    updateAutoScrollButtonText();
    updateStaticStatusTexts();
    updateTokenVisibility();
    renderEventsReference();

    if (transcriptionMessages.length === 0) {
        renderTranscriptionMessages();
    }
}

function setLanguage(language) {
    if (!translations[language]) {
        return;
    }

    currentLanguage = language;
    localStorage.setItem(DEMO_STORAGE_KEYS.language, language);
    applyTranslations();
}

function applyTheme(theme, dispatchToWidget = true) {
    currentTheme = theme === 'dark' ? 'dark' : 'light';
    localStorage.setItem(DEMO_STORAGE_KEYS.theme, currentTheme);
    document.body.dataset.theme = currentTheme;
    setActiveTheme(currentTheme);

    if (dispatchToWidget) {
        dispatchPhoneIslandEvent('phone-island-theme-change', {
            selectedTheme: currentTheme
        });
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getEventsReferenceCategoryLabel(category) {
    const categories = translations[currentLanguage]?.eventsReference?.categories || {};
    return categories[category] || category;
}

function getEventsReferenceDescription(eventItem) {
    if (!eventItem?.description) {
        return '';
    }

    if (typeof eventItem.description === 'string') {
        return eventItem.description;
    }

    return eventItem.description[currentLanguage] || eventItem.description.en || '';
}

function getFilteredEventsReferenceItems() {
    const items = eventReferenceData[activeEventsReferenceTab] || [];
    const normalizedSearch = eventsReferenceSearch.trim().toLowerCase();

    return items.filter((eventItem) => {
        const matchesCategory = activeEventsReferenceCategory === 'all' || eventItem.category === activeEventsReferenceCategory;

        if (!matchesCategory) {
            return false;
        }

        if (!normalizedSearch) {
            return true;
        }

        const haystack = [
            eventItem.name,
            getEventsReferenceCategoryLabel(eventItem.category),
            getEventsReferenceDescription(eventItem),
            ...(eventItem.tags || [])
        ].join(' ').toLowerCase();

        return haystack.includes(normalizedSearch);
    });
}

async function copyEventsReferencePayload(eventName) {
    const allItems = Object.values(eventReferenceData).flat();
    const eventItem = allItems.find((item) => item.name === eventName);

    if (!eventItem) {
        return;
    }

    const payload = JSON.stringify(eventItem.payload || {}, null, 2);

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(payload);
        } else {
            const tempTextarea = document.createElement('textarea');
            tempTextarea.value = payload;
            tempTextarea.setAttribute('readonly', 'readonly');
            tempTextarea.style.position = 'absolute';
            tempTextarea.style.left = '-9999px';
            document.body.appendChild(tempTextarea);
            tempTextarea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextarea);
        }

        copiedEventsReferenceName = eventName;
        renderEventsReference();
        window.setTimeout(() => {
            if (copiedEventsReferenceName === eventName) {
                copiedEventsReferenceName = '';
                renderEventsReference();
            }
        }, 1800);
    } catch (error) {
        console.error('Unable to copy payload:', error);
    }
}

function renderEventsReference() {
    const content = document.getElementById('eventsReferenceContent');
    const incomingTab = document.getElementById('eventsReferenceIncomingTab');
    const outgoingTab = document.getElementById('eventsReferenceOutgoingTab');
    const categoryFilters = document.getElementById('eventsReferenceFilters');
    const searchInput = document.getElementById('eventsReferenceSearchInput');
    const resultsCounter = document.getElementById('eventsReferenceResultsCounter');

    if (!content) {
        return;
    }

    if (incomingTab) {
        incomingTab.classList.toggle('active', activeEventsReferenceTab === 'incoming');
    }

    if (outgoingTab) {
        outgoingTab.classList.toggle('active', activeEventsReferenceTab === 'outgoing');
    }

    const allEvents = eventReferenceData[activeEventsReferenceTab] || [];
    const categories = ['all', ...new Set(allEvents.map((eventItem) => eventItem.category))];
    const events = getFilteredEventsReferenceItems();

    if (searchInput && searchInput.value !== eventsReferenceSearch) {
        searchInput.value = eventsReferenceSearch;
    }

    if (categoryFilters) {
        categoryFilters.innerHTML = categories.map((category) => `
            <button
                type="button"
                class="events-reference-filter-chip${category === activeEventsReferenceCategory ? ' active' : ''}"
                data-events-category="${escapeHtml(category)}"
            >${escapeHtml(getEventsReferenceCategoryLabel(category))}</button>
        `).join('');
    }

    if (resultsCounter) {
        resultsCounter.textContent = t('eventsReference.resultsCount', {
            visible: String(events.length),
            total: String(allEvents.length)
        });
    }

    if (events.length === 0) {
        content.innerHTML = `<div class="events-reference-empty">${escapeHtml(t('eventsReference.noResults'))}</div>`;
        return;
    }

    content.innerHTML = events.map((eventItem) => {
        const payload = JSON.stringify(eventItem.payload || {}, null, 2);
        const hasPayload = payload !== '{}';
        const copyLabel = copiedEventsReferenceName === eventItem.name
            ? t('eventsReference.copied')
            : hasPayload
                ? t('eventsReference.copyPayload')
                : t('eventsReference.copyPayloadEmpty');

        return `
            <article class="events-reference-card">
                <div class="events-reference-card__top">
                    <div class="events-reference-card__meta">${escapeHtml(getEventsReferenceCategoryLabel(eventItem.category))}</div>
                    <button
                        type="button"
                        class="events-reference-copy-button${copiedEventsReferenceName === eventItem.name ? ' copied' : ''}"
                        data-copy-payload="${escapeHtml(eventItem.name)}"
                    >${escapeHtml(copyLabel)}</button>
                </div>
                <h4 class="events-reference-card__title">${escapeHtml(eventItem.name)}</h4>
                <p class="events-reference-card__description">${escapeHtml(getEventsReferenceDescription(eventItem))}</p>
                <div class="events-reference-card__label">${escapeHtml(t('eventsReference.exampleLabel'))}</div>
                <pre class="events-reference-card__json"><code>${escapeHtml(payload)}</code></pre>
            </article>
        `;
    }).join('');
}

function openEventsReference() {
    const modal = document.getElementById('eventsReferenceModal');
    const overlay = document.getElementById('eventsReferenceOverlay');

    if (modal && overlay) {
        renderEventsReference();
        modal.classList.add('visible');
        overlay.classList.add('visible');
        document.body.classList.add('events-reference-open');

        const searchInput = document.getElementById('eventsReferenceSearchInput');
        if (searchInput) {
            window.setTimeout(() => {
                searchInput.focus();
            }, 40);
        }
    }
}

function closeEventsReference() {
    const modal = document.getElementById('eventsReferenceModal');
    const overlay = document.getElementById('eventsReferenceOverlay');

    if (modal && overlay) {
        modal.classList.remove('visible');
        overlay.classList.remove('visible');
        document.body.classList.remove('events-reference-open');
    }
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
    updateStatus(t('status.themeChanged'));
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

window.addEventListener('phone-island-view-changed', (event) => {
    const view = event && event.detail ? (event.detail.viewType || event.detail.view || event.detail.selectedView) : '';
    if (view) {
        updateStatus(`🪟 View changed to ${view}`);
    } else {
        logEvent('🪟 View changed', event.detail);
    }
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
        registrationStatus.textContent = `❌ ${t('alerts.errorPrefix')}: ${error.message}`;
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
        logElement.innerHTML = `<div>${t('main.eventLogCleared')}</div>`;
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
    applyTranslations();
    applyTheme(currentTheme, false);

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

    const openEventsReferenceBtn = document.getElementById('openEventsReference');
    if (openEventsReferenceBtn) {
        openEventsReferenceBtn.addEventListener('click', () => {
            openEventsReference();
        });
    }

    const closeEventsReferenceBtn = document.getElementById('closeEventsReference');
    if (closeEventsReferenceBtn) {
        closeEventsReferenceBtn.addEventListener('click', () => {
            closeEventsReference();
        });
    }

    const eventsReferenceOverlay = document.getElementById('eventsReferenceOverlay');
    if (eventsReferenceOverlay) {
        eventsReferenceOverlay.addEventListener('click', () => {
            closeEventsReference();
        });
    }

    const incomingEventsTab = document.getElementById('eventsReferenceIncomingTab');
    if (incomingEventsTab) {
        incomingEventsTab.addEventListener('click', () => {
            activeEventsReferenceTab = 'incoming';
            activeEventsReferenceCategory = 'all';
            renderEventsReference();
        });
    }

    const outgoingEventsTab = document.getElementById('eventsReferenceOutgoingTab');
    if (outgoingEventsTab) {
        outgoingEventsTab.addEventListener('click', () => {
            activeEventsReferenceTab = 'outgoing';
            activeEventsReferenceCategory = 'all';
            renderEventsReference();
        });
    }

    const eventsReferenceSearchInput = document.getElementById('eventsReferenceSearchInput');
    if (eventsReferenceSearchInput) {
        eventsReferenceSearchInput.addEventListener('input', (event) => {
            eventsReferenceSearch = event.target.value || '';
            renderEventsReference();
        });
    }

    const eventsReferenceFilters = document.getElementById('eventsReferenceFilters');
    if (eventsReferenceFilters) {
        eventsReferenceFilters.addEventListener('click', (event) => {
            const button = event.target.closest('[data-events-category]');
            if (!button) {
                return;
            }

            activeEventsReferenceCategory = button.dataset.eventsCategory || 'all';
            renderEventsReference();
        });
    }

    const eventsReferenceContent = document.getElementById('eventsReferenceContent');
    if (eventsReferenceContent) {
        eventsReferenceContent.addEventListener('click', (event) => {
            const button = event.target.closest('[data-copy-payload]');
            if (!button) {
                return;
            }

            copyEventsReferencePayload(button.dataset.copyPayload);
        });
    }

    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
        languageToggle.addEventListener('click', () => {
            const nextLanguage = currentLanguage === 'en' ? 'it' : 'en';
            setLanguage(nextLanguage);
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
        updateTokenVisibility(false);

        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('mainPanel').classList.remove('hidden');

        updateStatus(t('status.widgetInitialized'));
        logEvent('🔐 Widget initialized with user:', tokenData.username);
    }

    // Login handler
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const tokenInput = document.getElementById('tokenInput');
            const token = tokenInput.value.trim();

            if (!token) {
                alert(t('alerts.enterValidToken'));
                return;
            }

            const registrationStatus = document.getElementById('registrationStatus');
            registrationStatus.textContent = t('status.initializingShort');
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
            isTokenVisible = false;

            // Reload page to show login screen
            window.location.reload();
        });
    }

    const revealTokenBtn = document.getElementById('revealTokenBtn');
    if (revealTokenBtn) {
        revealTokenBtn.addEventListener('click', () => {
            updateTokenVisibility(!isTokenVisible);
        });
    }

    const copyTokenBtn = document.getElementById('copyTokenBtn');
    if (copyTokenBtn) {
        copyTokenBtn.addEventListener('click', async () => {
            try {
                await copyStoredToken();
                markTokenCopied();
                logEvent('⧉ Token copied to clipboard');
            } catch (error) {
                console.warn('Unable to copy token:', error);
                logEvent('⚠️ Unable to copy token', {
                    error: error && error.message ? error.message : String(error)
                });
            }
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
                alert(t('alerts.enterPhoneNumber'));
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
            applyTheme('light');
        });
    }

    const darkTheme = document.getElementById('darkTheme');
    if (darkTheme) {
        darkTheme.addEventListener('click', () => {
            applyTheme('dark');
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

    DEBUG_STATUS_ACTIONS.forEach(({ buttonId, eventName }) => {
        const button = document.getElementById(buttonId);
        if (!button) {
            return;
        }

        button.addEventListener('click', () => {
            dispatchPhoneIslandEvent(eventName);
        });
    });

    VIEW_ACTIONS.forEach(({ buttonId, view }) => {
        const button = document.getElementById(buttonId);
        if (!button) {
            return;
        }

        button.addEventListener('click', () => {
            dispatchPhoneIslandEvent('phone-island-view-changed', { viewType: view });
        });
    });

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
            updateAutoScrollButtonText();
        });
    }

    // Initialize - Login screen is shown by default
    logEvent('🎯 Integration script loaded - waiting for token input');
}

// Listen for Janus registration success
window.addEventListener('phone-island-socket-connected', (event) => {
    const janusStatus = document.getElementById('janusStatus');
    if (janusStatus) {
        janusStatus.textContent = t('status.janusConnected');
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
            janusStatus.textContent = t('status.janusRegistered', { extension });
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
        updateTranscriptionStatus(t('transcription.ready'));

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

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeEventsReference();
    }
});

console.log('📚 Phone Island Integration loaded! Available functions:');
console.log('- window.PhoneIslandIntegration.dispatchEvent(eventName, data)');
console.log('- window.PhoneIslandIntegration.changeAudioInput(deviceId)');
console.log('- window.PhoneIslandIntegration.transferCall(number)');
console.log('- window.PhoneIslandIntegration.sendDTMF(key)');
console.log('- window.PhoneIslandIntegration.startRecording()');
console.log('- window.PhoneIslandIntegration.enableVideo()');
console.log('- window.PhoneIslandIntegration.startScreenShare()');