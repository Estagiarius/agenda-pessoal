document.addEventListener('DOMContentLoaded', function() {
  var dateDisplayElement = document.getElementById('current-date-display');
  if (dateDisplayElement) {
    dateDisplayElement.textContent = moment().format('MMMM Do YYYY');
  }
});
