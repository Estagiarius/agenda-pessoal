// js/app/settingsService.js
(function(window) {
    'use strict';

    const SETTINGS_KEY = 'notificationSettings';
    const DEFAULT_SETTINGS = {
        enableSound: false // Default sound to disabled
    };

    /**
     * Loads notification settings from localStorage.
     * @returns {object} The notification settings.
     */
    function loadNotificationSettings() {
        let loadedSettings;
        try {
            const storedSettings = localStorage.getItem(SETTINGS_KEY);
            if (storedSettings) {
                const parsedSettings = JSON.parse(storedSettings);
                // Ensure all default keys are present
                loadedSettings = { ...DEFAULT_SETTINGS, ...parsedSettings };
            } else {
                loadedSettings = { ...DEFAULT_SETTINGS };
            }
        } catch (error) {
            console.error('Error loading notification settings from localStorage:', error);
            // Fallback to default settings in case of error
            loadedSettings = { ...DEFAULT_SETTINGS };
        }
        console.log('settingsService: Carregando configurações de notificação. Encontrado:', JSON.stringify(loadedSettings));
        return loadedSettings;
    }

    /**
     * Saves notification settings to localStorage.
     * @param {object} settings - The settings object to save.
     */
    function saveNotificationSettings(settings) {
        if (typeof settings !== 'object' || settings === null) {
            console.error('Invalid settings object provided to saveNotificationSettings.');
            return;
        }
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            console.log('settingsService: Salvando configurações de notificação:', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving notification settings to localStorage:', error);
        }
    }

    /**
     * A getter function for notification settings.
     * @returns {object} The current notification settings.
     */
    function getNotificationSettings() {
        return loadNotificationSettings();
    }

    // Expose public functions
    window.settingsService = {
        loadNotificationSettings: loadNotificationSettings,
        saveNotificationSettings: saveNotificationSettings,
        getNotificationSettings: getNotificationSettings
    };

})(window);
