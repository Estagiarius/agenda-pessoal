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
        // Always try to hide the question bank first if ui.js is loaded
        if (typeof ui !== 'undefined' && typeof ui.hideQuestionBank === 'function') {
            ui.hideQuestionBank();
        }
        if (typeof ui !== 'undefined' && typeof ui.hideQuizConfigView === 'function') { 
            ui.hideQuizConfigView();
        }
        if (typeof ui !== 'undefined' && typeof ui.hideQuizTakingView === 'function') { 
            ui.hideQuizTakingView();
        }
        if (typeof ui !== 'undefined' && typeof ui.hideQuizResultsView === 'function') { // New hide call
            ui.hideQuizResultsView();
        }
        // Fallback hiding for views if ui object or specific hide functions are not yet available
        // This helps prevent multiple views from showing during initial load or if scripts are out of sync.
        const qbView = document.getElementById('question-bank-view');
        if (qbView && (!ui || !ui.hideQuestionBank)) qbView.style.display = 'none';
        const qcView = document.getElementById('quiz-config-view');
        if (qcView && (!ui || !ui.hideQuizConfigView)) qcView.style.display = 'none';
        const qtkView = document.getElementById('quiz-taking-view'); // Fallback for quiz taking view
        if (qtkView && (!ui || !ui.hideQuizTakingView)) qtkView.style.display = 'none';
        const qrsView = document.getElementById('quiz-results-view'); // Fallback for quiz results view
        if (qrsView && (!ui || !ui.hideQuizResultsView)) qrsView.style.display = 'none';


        let viewKey = hash;
        if (hash === '#/' || hash === '' || !hash) {
            viewKey = '#/home'; // Default to home
        }

        if (viewKey === '#/questions') {
            mainContentArea.innerHTML = ''; // Clear the area used by other views
            mainContentArea.style.display = 'none'; // Hide it
            if (typeof ui !== 'undefined' && typeof ui.showQuestionBank === 'function') {
                ui.showQuestionBank();
            } else {
                console.error('ui.showQuestionBank() is not available. Check script loading order and ui.js implementation.');
                // Show a fallback message in mainContentArea if Question Bank UI can't be loaded
                mainContentArea.innerHTML = '<h2>Error</h2><p>Could not load Question Bank.</p>';
                mainContentArea.style.display = 'block';
            }
        } else if (viewKey === '#/quiz-config') {
            mainContentArea.innerHTML = ''; // Clear the area used by other HTML-string views
            mainContentArea.style.display = 'none'; // Hide it
     
            // Call a new function in ui.js to show this specific view
            if (typeof ui !== 'undefined' && typeof ui.showQuizConfigView === 'function') {
                ui.showQuizConfigView();
            } else {
                console.error('ui.showQuizConfigView() is not available.');
                mainContentArea.innerHTML = '<h2>Error</h2><p>Could not load Quiz Configuration.</p>';
                mainContentArea.style.display = 'block';
            }
        } else if (viewKey === '#/quiz/take') { 
            mainContentArea.innerHTML = ''; 
            mainContentArea.style.display = 'none';
            if (typeof ui !== 'undefined' && typeof ui.showQuizTakingView === 'function') {
                ui.showQuizTakingView();
            } else {
                console.error('ui.showQuizTakingView() is not available.');
                mainContentArea.innerHTML = '<h2>Error</h2><p>Could not load Quiz.</p>';
                mainContentArea.style.display = 'block';
            }
        } else if (viewKey === '#/quiz/results') { // New route
            mainContentArea.innerHTML = ''; 
            mainContentArea.style.display = 'none';
            if (typeof ui !== 'undefined' && typeof ui.showQuizResultsView === 'function') {
                ui.showQuizResultsView();
            } else {
                console.error('ui.showQuizResultsView() is not available.');
                mainContentArea.innerHTML = '<h2>Error</h2><p>Could not load Quiz Results.</p>';
                mainContentArea.style.display = 'block';
            }
        } else if (views[viewKey]) {
            mainContentArea.innerHTML = views[viewKey];
            mainContentArea.style.display = 'block';
            
            if (viewKey === '#/home') {
                // Initialize calendar only if home view is active and initCalendar is defined
                if (typeof initCalendar === 'function') {
                    initCalendar();
                } else {
                    console.error('initCalendar function is not defined. Make sure calendar.js is loaded before router.js.');
                }
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
