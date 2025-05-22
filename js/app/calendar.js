function initCalendar() {
    const calendarDiv = document.querySelector('#calendar');
    if (!calendarDiv) {
        // console.warn('Calendar div #calendar not found for initialization.');
        return;
    }
    if (calendarDiv.classList.contains('datepickk-initialized')) {
        // console.log('Calendar already initialized on #calendar.');
        return;
    }

    var now = new Date();
    // Initializing the calendar
    var calendar = new Datepickk({
        container: calendarDiv,
        inline: true,
        range: true,
        tooltips: {
            date: new Date(),
            text: 'Tooltip'
        },
        highlight: {
            start: new Date(now.getFullYear(), now.getMonth(), 4),
            end: new Date(now.getFullYear(), now.getMonth(), 6),
            backgroundColor: '#05676E',
            color: '#fff',
            legend: 'Highlight'
        },
        onSelect: function(isSelected) {
            console.log('Datepickk onSelect triggered:');
            console.log('Selected Date:', this); // 'this' refers to the date object
            console.log('Is Selected (checked state):', isSelected);
        }
    });
    calendarDiv.classList.add('datepickk-initialized');
}
