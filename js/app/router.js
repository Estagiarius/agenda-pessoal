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

    const todoViewHtml = `
<div class="container-fluid">
  <h2>My To-Do List</h2>
  <form id="addTodoForm">
    <div class="form-group">
      <label for="todoTextInput">Task Description</label>
      <input type="text" id="todoTextInput" class="form-control" placeholder="What needs to be done?" required>
    </div>
    <div class="form-group">
      <label for="todoPriorityInput">Priority</label>
      <select id="todoPriorityInput" class="form-control">
        <option value="High">High</option>
        <option value="Medium" selected>Medium</option>
        <option value="Low">Low</option>
      </select>
    </div>
    <div class="form-group">
      <label for="todoDueDateInput">Due Date (Optional)</label>
      <input type="date" id="todoDueDateInput" class="form-control">
    </div>
    <button type="submit" class="btn btn-primary">Add Task</button>
  </form>

  <h3 style="margin-top: 20px;">Open Tasks</h3>
  <ul id="openTasksList" class="list-group">
    <!-- Open tasks will be rendered here -->
  </ul>

  <h3 style="margin-top: 20px;">Completed Tasks</h3>
  <ul id="completedTasksList" class="list-group">
    <!-- Completed tasks will be rendered here -->
  </ul>
</div>
`;

    const assignmentsViewHtml = `
<div class="container-fluid">
  <h2>Assignment & Homework Tracker</h2>

  <!-- Grading Completion Panel -->
  <div class="panel panel-default" style="margin-top: 20px;">
    <div class="panel-body">
      <div class="form-group">
        <label for="classFilterSelect">Filter by Class / Mark Grading Complete:</label>
        <select id="classFilterSelect" class="form-control">
          <!-- Options will be populated by JS -->
        </select>
      </div>
      <button id="markClassGradedButton" class="btn btn-success" style="margin-top: 10px;">Mark All Assignments as Graded for Selected Class</button>
    </div>
  </div>

  <!-- Add New Assignment Form -->
  <h3 style="margin-top: 30px;">Add New Assignment</h3>
  <form id="addAssignmentForm">
    <div class="form-group">
      <label for="assignmentClassSelect">Class</label>
      <select id="assignmentClassSelect" class="form-control" required>
        <!-- Options will be populated by JS -->
      </select>
    </div>
    <div class="form-group">
      <label for="assignmentTitleInput">Title</label>
      <input type="text" id="assignmentTitleInput" class="form-control" placeholder="Assignment Title" required>
    </div>
    <div class="form-group">
      <label for="assignmentDescriptionInput">Description</label>
      <textarea id="assignmentDescriptionInput" class="form-control" placeholder="Assignment Description"></textarea>
    </div>
    <div class="form-group">
      <label for="assignmentDueDateInput">Due Date</label>
      <input type="date" id="assignmentDueDateInput" class="form-control" required>
    </div>
    <button type="submit" class="btn btn-primary">Add Assignment</button>
  </form>

  <!-- Assignment Display Area -->
  <h3 style="margin-top: 30px;">Assignments for <span id="selectedClassNameDisplay">[Selected Class]</span></h3>
  <div id="assignmentsListArea" style="margin-top: 20px;">
    <!-- Assignments will be rendered here by JS -->
  </div>
</div>
`;

    const views = {
        '#/home': homeViewHtml,
        '#/settings': '<h2>Settings Page</h2><p>Settings will go here. This is loaded by the router.</p>',
        '#/todos': todoViewHtml,
        '#/assignments': assignmentsViewHtml
    };

    function loadView(hash) {
        let viewKey = hash;
        if (hash === '#/' || hash === '' || !hash) {
            viewKey = '#/home'; // Default to home
        }

        if (views[viewKey]) {
            mainContentArea.innerHTML = views[viewKey];
            mainContentArea.style.display = 'block';
            
            if (viewKey === '#/home') {
                if (typeof initCalendar === 'function') {
                    initCalendar();
                } else {
                    console.error('initCalendar function is not defined. Make sure calendar.js is loaded before router.js.');
                }
            } else if (viewKey === '#/todos') { 
                if (typeof initTodoPage === 'function') {
                    initTodoPage();
                } else {
                    console.error('initTodoPage function not defined. Make sure todo.js is loaded before router.js.');
                }
            } else if (viewKey === '#/assignments') {
                if (typeof initAssignmentsPage === 'function') {
                    initAssignmentsPage();
                } else {
                    console.error('initAssignmentsPage function not defined. Make sure assignment.js is loaded before router.js.');
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
