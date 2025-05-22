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
        '#/settings': '<h2>Settings Page</h2><p>Settings will go here. This is loaded by the router.</p>',
    };

    function loadView(hash) {
        let viewKey = hash;
        if (hash === '#/' || hash === '' || !hash) {
            viewKey = '#/home'; // Default to home
        }

        if (views[viewKey]) {
            mainContentArea.innerHTML = views[viewKey];
            mainContentArea.style.display = 'block';
            
            // Attempt to re-initialize calendar if home view is loaded and calendar script exists
            if (viewKey === '#/home') {
                // This is a simplified approach. A more robust solution would be for calendar.js
                // to expose an init function that can be called here.
                // For now, we rely on calendar.js running on DOMContentLoaded and finding the #calendar div
                // if it's part of the dynamically loaded HTML.
                // If calendar.js was already run, and the #calendar div was not present, this won't
                // automatically re-run it. This might need further adjustment in a later step.
                // However, calendar.js is included after router.js, so it should run after this initial loadView.
                // If Datepickk is already initialized on a previous #calendar div, it might cause issues.
                // A simple way to try and force re-init (if Datepickk allows) is to clear and re-add,
                // or call its init function if available.
                
                // The Datepickk constructor is in calendar.js.
                // If the calendar div is now loaded, and calendar.js runs after this,
                // it *should* find it.
                // Let's ensure the calendar script itself can handle being called if the div is ready.
                // The existing calendar.js wraps its logic in DOMContentLoaded.
                // When we set innerHTML, the scripts inside homeViewHtml are NOT automatically executed.
                // The calendar.js is loaded via <script> tag in index.html.
                // The calendar.js initialization needs to be called MANUALLY after loading homeViewHtml.
                // This is a more complex part.
                // For this step, the subtask asks to focus on HTML movement.
                // "A simple solution for the calendar for now is to ensure calendar.js still runs *after*
                // the router has potentially loaded the home view."
                // "Let's simplify for this subtask: Assume calendar.js will still find its #calendar div
                // if the home view is loaded by default."
                // The calendar.js is already loaded in index.html. It runs once.
                // We need to make sure it can re-initialize.
                // The simplest path for *this specific subtask* is to assume calendar.js will handle it,
                // or it's a known limitation for now.
                // The problem statement says: "Assume calendar.js will still find its #calendar div if the home view is loaded by default."
                // If navigating to #/home from another route, it will need re-initialization.
                // This is where an exposed init function in calendar.js would be ideal.
                // For now, I will proceed without manual re-initialization in the router, per subtask guidance.
            }
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
