document.addEventListener('DOMContentLoaded', function() {
    const mainContentArea = document.getElementById('main-content-area');

    const homeViewHtml = `
<div class="container" style="margin-top: 50px;">
    <div class="row">
        <div class="col-md-4" id="calendar">
            <!-- Calendar will be initialized here by calendar.js if this view is loaded -->
        </div>
        <div class="col-md-8 text-center">
            <!-- / College Timetable -->
            <div class='tab'>
                <table border='0' cellpadding='0' cellspacing='0'>
                    <caption class='title'>Today Events</caption>
                    <tr class='days'>
                        <th></th>
                        <th>Monday</th>
                        <th>Tuesday</th>
                        <th>Wednesday</th>
                        <th>Thursday</th>
                        <th>Friday</th>
                    </tr>
                    <tr>
                        <td class='time'>9.00</td>
                        <td class='cs335 blue' data-tooltip='Software Engineering &amp; Software Process'>CS335 [JH1]</td>
                        <td class='cs426 purple' data-tooltip='Computer Graphics'>CS426 [CS1]</td>
                        <td></td>
                        <td></td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td class='time'>10.00</td>
                        <td></td>
                        <td class='cs335 blue lab' data-tooltip='Software Engineering &amp; Software Process'>CS335 [Lab]</td>
                        <td class='md352 green' data-tooltip='Multimedia Production &amp; Management'>MD352 [Kairos]</td>
                        <td></td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td class='time'>11.00</td>
                        <td></td>
                        <td class='cs335 blue lab' data-tooltip='Software Engineering &amp; Software Process'>CS335 [Lab]</td>
                        <td class='md352 green' data-tooltip='Multimedia Production &amp; Management'>MD352 [Kairos]</td>
                        <td class='cs240 orange' data-tooltip='Operating Systems'>CS240 [CH]</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td class='time'>12.00</td>
                        <td></td>
                        <td class='md303 navy' data-tooltip='Media &amp; Globalisation'>MD303 [CS2]</td>
                        <td class='md313 red' data-tooltip='Special Topic: Multiculturalism &amp; Nationalism'>MD313 [Iontas]</td>
                        <td></td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td class='time'>13.00</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td class='time'>14.00</td>
                        <td></td>
                        <td></td>
                        <td class='cs426 purple' data-tooltip='Computer Graphics'>CS426 [CS2]</td>
                        <td class='cs240 orange' data-tooltip='Operating Systems'>CS240 [TH1]</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td class='time'>15.00</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td class='cs240 orange lab' data-tooltip='Operating Systems'>CS240 [Lab]</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td class='time'>16.00</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td class='cs240 orange lab' data-tooltip='Operating Systems'>CS240 [Lab]</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td class='time'>17.00</td>
                        <td class='cs335 blue' data-tooltip='Software Engineering &amp; Software Process'>CS335 [TH1]</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>-</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</div>
    `;

    const views = {
        '#/home': homeViewHtml,
        // Settings view HTML will be defined below
    };

    const settingsViewHtml = `
<div class="container" style="margin-top: 20px;">
    <h2>Notification Settings</h2>
    <form>
        <div class="form-group">
            <div class="checkbox">
                <label>
                    <input type="checkbox" id="enableSoundNotification">
                    Enable sound for notifications
                </label>
            </div>
        </div>
        <!-- <button type="button" id="saveSettingsButton" class="btn btn-primary">Save Settings</button> -->
        <p><small>Settings are saved automatically when changed.</small></p>
    </form>
</div>
    `;
    views['#/settings'] = settingsViewHtml; // Add settings view to the views object

    function initSettingsViewLogic() {
        const enableSoundCheckbox = document.getElementById('enableSoundNotification');
        
        if (enableSoundCheckbox && window.settingsService) {
            // Load initial settings
            const currentSettings = window.settingsService.getNotificationSettings();
            enableSoundCheckbox.checked = currentSettings.enableSound;

            // Save settings on change
            enableSoundCheckbox.addEventListener('change', function() {
                window.settingsService.saveNotificationSettings({ enableSound: this.checked });
                // console.log('Notification sound setting saved:', this.checked); // For debugging
            });
        } else {
            if (!enableSoundCheckbox) console.error('#enableSoundNotification checkbox not found.');
            if (!window.settingsService) console.error('settingsService not available.');
        }
    }

    function loadView(hash) {
        let viewKey = hash;
        if (hash === '#/' || hash === '' || !hash) {
            viewKey = '#/home'; // Default to home
        }

        if (views[viewKey]) {
            mainContentArea.innerHTML = views[viewKey];
            mainContentArea.style.display = 'block';
            
            if (viewKey === '#/home') {
                // Hide To-Do list when on home/calendar view if it exists
                const todoListContainer = document.getElementById('todo-list-container');
                if (todoListContainer) {
                    todoListContainer.style.display = 'none'; 
                }
                if (typeof initCalendar === 'function') {
                    initCalendar();
                } else {
                    console.error('initCalendar function is not defined. Make sure calendar.js is loaded before router.js.');
                }
            } else if (viewKey === '#/settings') {
                // Hide To-Do list when on settings view
                const todoListContainer = document.getElementById('todo-list-container');
                if (todoListContainer) {
                    todoListContainer.style.display = 'none'; 
                }
                initSettingsViewLogic();
            }
            // Potential: If To-Do list should be its own view, manage its visibility here too.
            // For now, it's part of the default content in index.html and hidden on other views.

        } else {
            mainContentArea.innerHTML = '<h2>404 - Page Not Found</h2><p>The page you requested could not be found.</p>';
            mainContentArea.style.display = 'block';
        }
    }

    window.addEventListener('hashchange', function() {
        loadView(window.location.hash);
    });

    // Load initial view based on current hash (or default if no hash)
    loadView(window.location.hash); 
});
