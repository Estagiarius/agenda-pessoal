// js/app/settingsService.js
(function(window) {
    'use strict';

    const NOTIFICATION_SETTINGS_KEY = 'notificationSettings';
    const THEME_SETTINGS_KEY = 'themeSettings';
    const DEFAULT_NOTIFICATION_SETTINGS = {
        enableSound: false // Default sound to disabled
    };
    const DEFAULT_THEME_SETTINGS = {
        theme: 'light'
    };

    /**
     * Loads settings from localStorage.
     * @param {string} key - The key to load settings from.
     * @param {object} defaultSettings - The default settings to use if nothing is found or an error occurs.
     * @returns {object} The loaded settings.
     */
    function loadSettings(key, defaultSettings) {
        let loadedSettings;
        try {
            const storedSettings = localStorage.getItem(key);
            if (storedSettings) {
                const parsedSettings = JSON.parse(storedSettings);
                // Ensure all default keys are present
                loadedSettings = { ...defaultSettings, ...parsedSettings };
            } else {
                loadedSettings = { ...defaultSettings };
            }
        } catch (error) {
            console.error(`Error loading settings for key "${key}" from localStorage:`, error);
            // Fallback to default settings in case of error
            loadedSettings = { ...defaultSettings };
        }
        console.log(`settingsService: Carregando configurações para a chave "${key}". Encontrado:`, JSON.stringify(loadedSettings));
        return loadedSettings;
    }

    /**
     * Saves settings to localStorage.
     * @param {string} key - The key to save settings under.
     * @param {object} settings - The settings object to save.
     */
    function saveSettings(key, settings) {
        if (typeof settings !== 'object' || settings === null) {
            console.error(`Invalid settings object provided to saveSettings for key "${key}".`);
            return;
        }
        try {
            localStorage.setItem(key, JSON.stringify(settings));
            console.log(`settingsService: Salvando configurações para a chave "${key}":`, JSON.stringify(settings));
        } catch (error) {
            console.error(`Error saving settings for key "${key}" to localStorage:`, error);
        }
    }

    function loadNotificationSettings() {
        return loadSettings(NOTIFICATION_SETTINGS_KEY, DEFAULT_NOTIFICATION_SETTINGS);
    }

    function saveNotificationSettings(settings) {
        saveSettings(NOTIFICATION_SETTINGS_KEY, settings);
    }

    function getNotificationSettings() {
        return loadNotificationSettings();
    }

    function loadThemeSettings() {
        return loadSettings(THEME_SETTINGS_KEY, DEFAULT_THEME_SETTINGS);
    }

    function saveThemeSettings(theme) {
        saveSettings(THEME_SETTINGS_KEY, { theme: theme });
    }

    function getThemeSettings() {
        const settings = loadThemeSettings();
        return settings.theme; // Return the theme string directly
    }

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.documentElement.classList.add('dark-theme-active');
        } else {
            document.body.classList.remove('dark-theme');
            document.documentElement.classList.remove('dark-theme-active');
        }
        console.log(`settingsService: Tema aplicado: ${theme}`);
    }

    // Expose public functions
    window.settingsService = {
        loadNotificationSettings: loadNotificationSettings,
        saveNotificationSettings: saveNotificationSettings,
        getNotificationSettings: getNotificationSettings,
        loadThemeSettings: loadThemeSettings,
        saveThemeSettings: saveThemeSettings,
        getThemeSettings: getThemeSettings,
        applyTheme: applyTheme
    };

})(window);
