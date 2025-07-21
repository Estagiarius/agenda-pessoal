document.addEventListener('DOMContentLoaded', function() {
    const mainContentArea = document.getElementById('main-content-area');
    const views = {}; // Removed direct HTML content

    function initSettingsViewLogic() {
        const enableSoundCheckbox = document.getElementById('enableSoundNotification');
        
        if (enableSoundCheckbox && window.settingsService) {
            const currentSettings = window.settingsService.getNotificationSettings();
            enableSoundCheckbox.checked = currentSettings.enableSound;
            enableSoundCheckbox.addEventListener('change', function() {
                window.settingsService.saveNotificationSettings({ enableSound: this.checked });
            });
        } else {
            if (!enableSoundCheckbox) console.error('#enableSoundNotification checkbox not found.');
            if (!window.settingsService) console.error('settingsService not available.');
        }
    }

    function fetchView(viewPath, callback) {
        fetch(viewPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                mainContentArea.innerHTML = html;
                mainContentArea.style.display = 'block';
                if (callback) {
                    callback();
                }
                // Focus Management
                const firstHeading = mainContentArea.querySelector('h1, h2');
                if (firstHeading) {
                    firstHeading.setAttribute('tabindex', -1); // Make it focusable
                    firstHeading.focus();
                } else {
                    console.warn(`No main heading (h1 or h2) found in view ${viewPath} to set focus.`);
                }
            })
            .catch(error => {
                console.error('Error fetching view:', viewPath, error);
                mainContentArea.innerHTML = '<h2>Erro ao Carregar Visualização</h2><p>Não foi possível carregar o conteúdo solicitado. Por favor, tente novamente mais tarde.</p>';
                mainContentArea.style.display = 'block';
            });
    }

    function loadView(hash) {
        // Existing hide calls - kept as per instructions
        if (typeof ui !== 'undefined' && typeof ui.hideQuestionBank === 'function') {
            ui.hideQuestionBank();
        }
        if (typeof ui !== 'undefined' && typeof ui.hideQuizConfigView === 'function') { 
            ui.hideQuizConfigView();
        }
        if (typeof ui !== 'undefined' && typeof ui.hideQuizTakingView === 'function') { 
            ui.hideQuizTakingView();
        }
        if (typeof ui !== 'undefined' && typeof ui.hideQuizResultsView === 'function') { 
            ui.hideQuizResultsView();
        }
        // Fallback hiding for views if ui object or specific hide functions are not yet available
        const qbView = document.getElementById('question-bank-view');
        if (qbView && (!ui || !ui.hideQuestionBank)) qbView.style.display = 'none';
        const qcView = document.getElementById('quiz-config-view');
        if (qcView && (!ui || !ui.hideQuizConfigView)) qcView.style.display = 'none';
        const qtkView = document.getElementById('quiz-taking-view');
        if (qtkView && (!ui || !ui.hideQuizTakingView)) qtkView.style.display = 'none';
        const qrsView = document.getElementById('quiz-results-view');
        if (qrsView && (!ui || !ui.hideQuizResultsView)) qrsView.style.display = 'none';
        
        // Ensure mainContentArea is cleared for views not using fetchView (e.g. if ui.show... handles its own content)
        // However, with the new approach, most will use fetchView.
        // mainContentArea.innerHTML = ''; // Clearing it here might be too soon for ui.show... methods if they expect a container

        let viewKey = hash;
        if (hash === '#/' || hash === '' || !hash) {
            viewKey = '#/home'; // Default to home
        }

        if (viewKey === '#/home') {
            fetchView('views/home.html', () => {
                if (typeof initCalendar === 'function') {
                    initCalendar();
                } else {
                    console.error('A função initCalendar não está definida.');
                }
            });
        } else if (viewKey === '#/settings') {
            fetchView('views/settings.html', initSettingsViewLogic);
        } else if (viewKey === '#/tasks') {
            fetchView('views/tasks.html');
        } else if (viewKey === '#/questions') {
            fetchView('views/question_bank.html', () => {
                if (typeof ui !== 'undefined' && typeof ui.showQuestionBank === 'function') {
                    ui.showQuestionBank(); // This function might need to target the newly injected content
                } else {
                    console.error('ui.showQuestionBank() não está disponível.');
                }
            });
        } else if (viewKey === '#/quiz-config') {
            fetchView('views/quiz_config.html', () => {
                if (typeof ui !== 'undefined' && typeof ui.showQuizConfigView === 'function') {
                    ui.showQuizConfigView();
                } else {
                    console.error('ui.showQuizConfigView() não está disponível.');
                }
            });
        } else if (viewKey === '#/quiz/take') {
            fetchView('views/quiz_take.html', () => {
                if (typeof ui !== 'undefined' && typeof ui.showQuizTakingView === 'function') {
                    ui.showQuizTakingView();
                } else {
                    console.error('ui.showQuizTakingView() não está disponível.');
                }
            });
        } else if (viewKey === '#/quiz/results') {
            fetchView('views/quiz_results.html', () => {
                if (typeof ui !== 'undefined' && typeof ui.showQuizResultsView === 'function') {
                    ui.showQuizResultsView();
                } else {
                    console.error('ui.showQuizResultsView() não está disponível.');
                }
            });
        } else if (viewKey === '#/all-events') {
            fetchView('views/all_events.html', () => {
                if (typeof initAllEventsView === 'function') {
                    initAllEventsView();
                } else {
                    console.error('initAllEventsView function not defined. Page may not load correctly.');
                    // Optionally, display a message in all-events-container if function is missing
                    const container = document.getElementById('all-events-container');
                    if (container) {
                        container.innerHTML = '<p>Erro ao inicializar a visualização da agenda completa.</p>';
                    }
                }
            });
        } else if (viewKey === '#/chat') {
            fetchView('views/chat.html', () => {
                if (typeof initChatApp === 'function') {
                    initChatApp();
                } else {
                    console.error('A função initChatApp não está definida.');
                }
            });
        } else {
            mainContentArea.innerHTML = '<h2>404 - Página Não Encontrada</h2><p>A página que você solicitou não pôde ser encontrada.</p>';
            mainContentArea.style.display = 'block';
        }
    }

    window.addEventListener('hashchange', function() {
        loadView(window.location.hash);
    });

    loadView(window.location.hash); 

    // Auto-collapse navbar on link click (for mobile view)
    const navLinks = document.querySelectorAll('#navbarCollapse .nav a');
    const navbarCollapseDiv = document.getElementById('navbarCollapse');
    const navbarToggleButton = document.querySelector('.navbar-toggle[data-target="#navbarCollapse"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Check if the navbar is actually open/expanded (Bootstrap 3 uses 'in' class)
            const isNavbarCollapsedAndOpen = navbarCollapseDiv && navbarCollapseDiv.classList.contains('in');
            
            if (isNavbarCollapsedAndOpen) {
                // Prefer jQuery's collapse('hide') if available, as it's Bootstrap's native way
                if (typeof $ !== 'undefined' && typeof $.fn.collapse !== 'undefined') {
                    $('#navbarCollapse').collapse('hide');
                } else if (navbarToggleButton) {
                    // Fallback: programmatically click the toggle button
                    // This is generally more robust than directly manipulating classes if Bootstrap's JS is active
                    navbarToggleButton.click(); 
                }
            }
        });
    });
});
