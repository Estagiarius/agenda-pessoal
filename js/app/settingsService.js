// js/app/settingsService.js
(function(window) {
    'use strict';

    const SETTINGS_KEY = 'appSettings'; // Renamed
    const DEFAULT_SETTINGS = {
        enableSound: false, // Default sound to disabled
        theme: 'light'      // Default theme
    };

    /**
     * Loads app settings from localStorage.
     * @returns {object} The app settings.
     */
    function loadSettings() { // Renamed and modified
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
            console.error('Error loading app settings from localStorage:', error); // Log updated
            // Fallback to default settings in case of error
            loadedSettings = { ...DEFAULT_SETTINGS };
        }
        console.log('settingsService: Carregando configurações do aplicativo. Encontrado:', JSON.stringify(loadedSettings)); // Log updated
        return loadedSettings;
    }

    /**
     * Saves app settings to localStorage.
     * @param {object} newSettings - The partial or complete settings object to save.
     */
    function saveSettings(newSettings) { // Renamed and modified
        if (typeof newSettings !== 'object' || newSettings === null) {
            console.error('Invalid settings object provided to saveSettings.');
            return;
        }
        try {
            const currentSettings = loadSettings(); // Load current settings
            const updatedSettings = { ...currentSettings, ...newSettings }; // Merge
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
            console.log('settingsService: Salvando configurações do aplicativo:', JSON.stringify(updatedSettings)); // Log updated
        } catch (error) {
            console.error('Error saving app settings to localStorage:', error); // Log updated
        }
    }

    /**
     * A getter function for app settings.
     * @returns {object} The current app settings.
     */
    function getSettings() { // Renamed
        return loadSettings();
    }

    /**
     * Applies the current theme preference (light/dark) to the document body.
     */
    function applyThemePreference() {
        const currentSettings = loadSettings(); // Use the internal loadSettings
        if (currentSettings.theme === 'dark') {
            document.body.classList.add('dark-theme');
            console.log('Dark theme applied.');
        } else {
            document.body.classList.remove('dark-theme');
            console.log('Light theme applied.');
        }
    }

    // Expose public functions
    window.settingsService = { // Updated
        loadSettings: loadSettings,
        saveSettings: saveSettings,
        getSettings: getSettings,
        applyThemePreference: applyThemePreference // New function
    };

})(window);
