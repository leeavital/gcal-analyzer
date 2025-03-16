function crawlCalendars() {
  let leeCal = CalendarApp.getDefaultCalendar();

  const now = new Date();
  const future = new Date(now.getTime() + 20 * 86400 * 1000); // + 20 days

  let events = [];
  let page = [];
  let startIndex = 0;
  do {
    page = CalendarApp.getDefaultCalendar().getEvents(now, future, {
      start: startIndex,
      max: 10000,
    });
    console.log("page length", page.length);
    events = events.concat(page);
    startIndex += page.length;
  } while (page.length > 0);

  let data = {};

  console.log("event length", events.length);
  console.log(JSON.stringify(events));
  for (let event of events) {
    if (event.isRecurringEvent) {
      try {
        let altEvent = Calendar.Events.get(
          leeCal.getId(),
          event.getId().split("@")[0],
        );

        let recurrence = altEvent.recurrence;
        console.log(altEvent);

        if (recurrence !== undefined && recurrence.length > 0) {
          data[event.getTitle()] = {
            recurrence: recurrence[0],
            duration: (event.getEndTime() - event.getStartTime()) / 60000,
          };
        }
      } catch (e) {
        console.error(e);
      }
    }

    // if (Object.keys(data).length > 10) {
    //   break; // TODO
    // }
  }

  let ss = SpreadsheetApp.getActiveSheet();

  ss.setActiveRange(ss.getRange("A1:A1"));
  for (title in data) {
    if (data.hasOwnProperty(title)) {
      console.log(title, data[title]);
      ss.appendRow([
        title,
        getTimesPerWeek(data[title]["recurrence"]),
        data[title]["duration"],
      ]);
    }
  }
}

function getTimesPerWeek(rrule) {
  let segments = rrule.replace(/RRULE:/, "").split(";");

  let freq = "";
  let numDays = 1;
  let interval = 1;

  for (let segment in segments) {
    let [key, value] = segments[segment].split("=");

    switch (key) {
      case "FREQ":
        freq = value;
        break;
      case "BYDAY":
        numDays = value.split(",").length;
        break;
      case "INTERVAL":
        interval = parseInt(value);
      default:
        break;
    }
  }

  switch (freq) {
    case "WEEKLY":
      return numDays / interval;
    case "MONTHLY":
      return numDays / (4 * interval);
    case "YEARLY":
      return 0; // effectively never
  }

  return 0;
}
