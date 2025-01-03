function myFunction() {
  let leeCal = CalendarApp.getDefaultCalendar();

  const now = new Date();
  const future = new Date(now.getTime() + (20 * 86400 * 1000)); // + 20 days
  
  let events = [];
  let page = [];
  let startIndex = 0;
  do {
    page = CalendarApp.getDefaultCalendar().getEvents(
      now,
      future,
      {start: startIndex, max: 10000},
      );
    console.log("page length", page.length);
    events = events.concat(page);
    startIndex += page.length;

  } while( page.length > 0);

  let data = {};

  console.log("event length", events.length);
  for (let event of events) {
    if (event.isRecurringEvent) {
      
      let altEvent = Calendar.Events.get(
        leeCal.getId(),
        event.getId().split("@")[0]);


      let recurrence = altEvent.recurrence;

      if (recurrence !== undefined && recurrence.length > 1) {}
         data[event.getTitle()] = {
          recurrence: recurrence,
          duration: event.getEndTime() - event.getStartTime(),
         };
      }
      

  }
  
  console.log(JSON.stringify(data));
}

