// js/app/settingsService.js
(function(window) {
    'use strict';

    // All settings data is now managed by the backend API.

    async function getSettings() {
        try {
            const response = await fetch('/api/configuracoes');
            if (!response.ok) {
                console.error('Erro ao buscar configurações, retornando padrões.');
                // Return default settings on error
                return {
                    theme: 'light',
                    notifications: {
                        enabled: true,
                        reminders: [10, 30],
                        enableSound: false
                    },
                    language: 'pt-BR'
                };
            }
            return response.json();
        } catch (e) {
            console.error('Falha na requisição de configurações:', e);
            return {
                theme: 'light',
                notifications: {
                    enabled: true,
                    reminders: [10, 30],
                    enableSound: false
                },
                language: 'pt-BR'
            };
        }
    }

    async function saveSettings(newSettings) {
        const response = await fetch('/api/configuracoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSettings)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao salvar configurações.');
        }
        return response.json();
    }

    // The old functions are deprecated, but we can keep them for compatibility
    // by making them call the new functions.
    async function loadNotificationSettings() {
        const settings = await getSettings();
        return settings.notifications || { enableSound: false }; // a default structure
    }

    async function saveNotificationSettings(notificationSettings) {
        const currentSettings = await getSettings();
        // Ensure currentSettings.notifications exists
        if (!currentSettings.notifications) {
            currentSettings.notifications = {};
        }
        // Merge new settings into the notifications object
        const newNotificationSettings = { ...currentSettings.notifications, ...notificationSettings };
        currentSettings.notifications = newNotificationSettings;
        return saveSettings(currentSettings);
    }

    function getNotificationSettings() {
        // This is tricky because the original was synchronous.
        // The calling code expects an immediate return, not a promise.
        // This is a breaking change that might require refactoring the calling code.
        // For now, this will return a promise. The UI code must be adapted.
        console.warn('getNotificationSettings is now async. Please use getSettings() and handle the promise.');
        return getSettings().then(settings => settings.notifications);
    }

    // Expose public functions
    window.settingsService = {
        getSettings,
        saveSettings,
        // Keep old functions for a transition period, though their sync/async nature has changed.
        loadNotificationSettings,
        saveNotificationSettings,
        getNotificationSettings
    };

})(window);
