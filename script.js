/* Wedding invitation — countdown, calendar and sharing.
   Everything runs in the browser; no build step, no dependencies. */

(() => {
  "use strict";

  const clock = document.getElementById("clock");
  const el = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds"),
  };

  const TARGET = new Date(clock?.dataset.target || "2027-03-27T19:00:00+02:00");
  const EVENT = {
    title: "Wedding of Ahmed & Menna Allah",
    start: "20270327T170000Z", // 19:00 Cairo (UTC+2)
    end: "20270328T000000Z",
    location: "Diva Talkha Hall, Talkha, Dakahlia, Egypt",
    description: "Here begins a lifetime of love, laughter and light.",
  };

  /* ------------------------------------------------------- countdown */
  const pad = (n) => String(n).padStart(2, "0");

  function tick() {
    const now = Date.now();
    let diff = TARGET.getTime() - now;

    if (diff <= 0) {
      el.days.textContent = "00";
      el.hours.textContent = "00";
      el.minutes.textContent = "00";
      el.seconds.textContent = "00";
      document.getElementById("countdown-title").textContent =
        "Today is the day — we are married!";
      return true;
    }

    const sec = Math.floor(diff / 1000);
    el.days.textContent = String(Math.floor(sec / 86400));
    el.hours.textContent = pad(Math.floor((sec % 86400) / 3600));
    el.minutes.textContent = pad(Math.floor((sec % 3600) / 60));
    el.seconds.textContent = pad(sec % 60);
    return false;
  }

  if (clock && el.days) {
    const finished = tick();
    if (!finished) {
      const timer = setInterval(() => {
        if (tick()) clearInterval(timer);
      }, 1000);
      // keep it honest after device sleep / tab switch
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) tick();
      });
    }
  }

  /* -------------------------------------------------- .ics download */
  function stamp(d) {
    return d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  }

  function buildIcs() {
    const now = stamp(new Date());
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Ahmed & Menna Allah//Wedding Invitation//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${now}-wedding-ahmed-menna@invitation`,
      `DTSTAMP:${now}`,
      `DTSTART:${EVENT.start}`,
      `DTEND:${EVENT.end}`,
      `SUMMARY:${EVENT.title}`,
      `DESCRIPTION:${EVENT.description}`,
      `LOCATION:${EVENT.location}`,
      "GEO:31.0553;31.3767",
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      "DESCRIPTION:Tomorrow — Ahmed & Menna Allah's wedding",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    return lines.join("\r\n");
  }

  document.getElementById("add-calendar")?.addEventListener("click", () => {
    const blob = new Blob([buildIcs()], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ahmed-and-menna-wedding.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  });

})();
