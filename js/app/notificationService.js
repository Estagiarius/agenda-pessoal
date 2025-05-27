// notificationService.js

(function(window) {
    'use strict';

    /**
     * Requests permission from the user to show browser notifications.
     */
    function requestNotificationPermission() {
        console.log('notificationService: Verificando/solicitando permissão de notificação. Status atual:', Notification.permission);
        if (!("Notification" in window)) {
            console.error("This browser does not support desktop notification.");
            // Optionally, inform the user via UI element
            return;
        }

        const currentPermission = Notification.permission;

        if (currentPermission === 'granted') {
            console.log("Notification permission already granted.");
            return;
        }

        if (currentPermission === 'denied') {
            console.warn("Notification permission has been denied by the user. They will need to change browser settings to enable them.");
            // Optionally, guide user on how to unblock
            return;
        }

        if (currentPermission === 'default') {
            console.log("Requesting notification permission...");
            Notification.requestPermission().then(permission => {
                console.log('notificationService: Permissão de notificação concedida/negada:', permission);
                if (permission === 'granted') {
                    console.log("Notification permission granted!");
                    // Optionally, show a welcome notification
                    // showEventNotification("Permissions Granted", "You will now receive event reminders.", "System");
                } else if (permission === 'denied') {
                    console.warn("Notification permission denied by the user.");
                } else {
                    console.log("Notification permission request dismissed (neither granted nor denied).");
                }
            }).catch(err => {
                console.error("Error requesting notification permission:", err);
            });
        }
    }

    /**
     * Shows an event notification.
     * @param {string} eventTitle - The title of the event.
     * @param {string} eventTime - The time of the event (e.g., "HH:MM").
     * @param {string} eventCategory - The category of the event.
     * @param {string} eventId - A unique ID for the event (for tagging).
     * @param {string} reminderId - A unique ID for the reminder (for tagging).
     */
    function showEventNotification(eventTitle, eventTime, eventCategory, eventId, reminderId) {
        console.log('notificationService: Tentando mostrar notificação para:', eventTitle, 'às', eventTime, 'ID Lembrete:', reminderId);
        if (window.settingsService && typeof window.settingsService.getNotificationSettings === 'function') {
            const settings = window.settingsService.getNotificationSettings();
            console.log('notificationService: Configuração de som ao mostrar notificação:', settings.enableSound);
        } else {
            console.warn('settingsService not available to check sound preferences at showEventNotification.');
        }

        if (!("Notification" in window)) {
            console.error("Browser does not support notifications.");
            return;
        }
        if (Notification.permission !== 'granted') {
            console.warn("Notification permission not granted. Cannot show notification.");
            // Optionally, re-request permission or guide user.
            // requestNotificationPermission(); // Could be an option here if permission is 'default'
            return;
        }

        const title = `Event Reminder: ${eventCategory ? '[' + eventCategory + '] ' : ''}${eventTitle}`;
        const options = {
            body: `Time: ${eventTime}`,
            icon: 'images/calendar-icon.png', // Assuming you might add this path later
            tag: eventId && reminderId ? `event-${eventId}-${reminderId}` : `event-${eventId || Date.now()}`, // Unique tag
            renotify: true, // Allow re-notification for the same tag if needed (e.g., updated reminder)
            // requireInteraction: true, // Optional: keeps notification visible until user interacts
        };

        // Check sound setting
        if (window.settingsService && typeof window.settingsService.getNotificationSettings === 'function') {
            const currentSettings = window.settingsService.getNotificationSettings();
            if (currentSettings.enableSound) {
                console.log("Notification sound should play (based on settings).");
                // Actual sound playback would go here in a future task.
                // options.sound = 'path/to/sound.mp3'; // Not standard, but some browsers might support
                // Or use Audio API: new Audio('path/to/sound.mp3').play();
            }
        } else {
            console.warn('settingsService not available to check sound preferences.');
        }

        try {
            const notification = new Notification(title, options);

            notification.onclick = () => {
                console.log(`Notification for "${eventTitle}" clicked.`);
                window.focus(); // Bring the application's tab to the front
                // Optionally, navigate to the specific event or close notification
                // notification.close();
            };

            notification.onerror = (err) => {
                console.error("Notification API error:", err);
            };

        } catch (error) {
            console.error("Error creating notification:", error);
        }
    }

    // Expose functions to the global window object (or a specific namespace)
    window.notificationService = {
        requestNotificationPermission: requestNotificationPermission,
        showEventNotification: showEventNotification
    };

    // Request permission when the service loads (once per page load if permission is 'default')
    requestNotificationPermission();

    /**
     * Checks for pending event reminders and shows notifications if due.
     */
    function checkReminders() {
        console.log('notificationService: Executando checkReminders...', new Date().toLocaleTimeString());
        if (!window.eventService || typeof window.eventService.getEvents !== 'function') {
            console.warn('eventService not available or not fully initialized for checking reminders.'); // Changed to warn and updated message
            return; // Wait for next interval
        }
        if (!window.moment) {
            console.error('moment.js is not available for date calculations.');
            return; // moment.js is crucial for date/time manipulation here
        }

        const allEvents = window.eventService.getEvents();
        const now = new Date();

        allEvents.forEach(event => {
            if (!event.reminders || !Array.isArray(event.reminders)) {
                return; // Skip if no reminders or reminders is not an array
            }

            let eventModified = false; // Flag to track if event needs updating

            event.reminders.forEach(reminder => {
                if (reminder.shown) {
                    return; // Skip if reminder already shown
                }

                if (!event.date || !event.startTime) {
                    // console.warn(`Event "${event.title}" (ID: ${event.id}) is missing date or startTime, cannot process reminder.`);
                    return; // Skip if event date or time is missing
                }

                try {
                    const eventDateTimeString = `${event.date} ${event.startTime}`;
                    const eventMoment = moment(eventDateTimeString, 'YYYY-MM-DD HH:mm');

                    if (!eventMoment.isValid()) {
                        // console.warn(`Invalid date/time for event "${event.title}" (ID: ${event.id}): ${eventDateTimeString}`);
                        return;
                    }
                    
                    // Calculate reminder time using moment.js
                    // moment.subtract mutates the original moment object, so clone it first.
                    const reminderTime = eventMoment.clone().subtract(reminder.value, reminder.unit).toDate();

                    // console.log(`Event: ${event.title}, Reminder: ${reminder.value} ${reminder.unit} before. Calculated time: ${reminderTime}, Current time: ${now}`);
                    const calculatedReminderTime = reminderTime; // Alias for clarity in log

                    if (now >= calculatedReminderTime) {
                        console.log('notificationService: Disparando lembrete para evento:', event.title, 'Lembrete ID:', reminder.id, 'Horário calculado:', calculatedReminderTime.toLocaleString());
                        showEventNotification(
                            event.title,
                            event.startTime,
                            event.category,
                            event.id.toString(), // Ensure ID is string for tag
                            reminder.id.toString() // Ensure ID is string for tag
                        );
                        reminder.shown = true;
                        eventModified = true;
                        console.log('notificationService: Marcando lembrete como mostrado e atualizando evento:', event.id, 'Lembrete ID:', reminder.id);
                    }
                } catch (e) {
                    console.error(`Error processing reminder for event "${event.title}" (ID: ${event.id}):`, e);
                }
            });

            if (eventModified) {
                if (window.eventService.updateEvent) {
                    window.eventService.updateEvent(event);
                    // console.log(`Event "${event.title}" (ID: ${event.id}) updated in localStorage with shown reminders.`);
                } else {
                    console.error('eventService.updateEvent is not available to save reminder status.');
                }
            }
        });
    }

    // Start the reminder checking loop
    // For a real application, consider if the loop should run if notifications are denied.
    // For this exercise, we'll start it regardless, as showEventNotification checks permission.
    const REMINDER_CHECK_INTERVAL = 30000; // 30 seconds for more responsive testing, 60000 for 1 minute in production
    setInterval(checkReminders, REMINDER_CHECK_INTERVAL);
    console.log(`Reminder check loop started. Interval: ${REMINDER_CHECK_INTERVAL / 1000} seconds.`);

    // Optionally, run once on load after a short delay to catch immediate reminders
    setTimeout(checkReminders, 2000); // Run after 2 seconds

})(window);
