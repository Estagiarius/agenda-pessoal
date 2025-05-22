document.addEventListener('DOMContentLoaded', function() {
  var now = new Date();
  //Initializing the calendar (Just to remember: It's a JSON file.)
  var calendar = new Datepickk({
    container: document.querySelector('#calendar'),
    inline:true,
    range: true,
    //Function marking the number of appointments (e.g. 2 apointments for today).
    tooltips: {
        //In that example, using the function date, the appointment is marked for today.
        date: new Date(),
        text: 'Tooltip'
    },
    //Function to highlight the events marked in the calendar.
    highlight:{
        //In that example, the events highlighted is the first week of the month.
        start: new Date(now.getFullYear(),now.getMonth(), 4),
        end: new Date(now.getFullYear(),now.getMonth(), 6),
        backgroundColor:'#05676E',
        color:'#fff',
        legend: 'Highlight'
    }
  });
});
