import type { EventSession } from "./types";

/** Shared programme source. Unknown times and rental arrangements are deliberately omitted. */
export const eventSessions: EventSession[] = [
  {
    "id": "leaves-2026-1",
    "eventSlug": "four-seasons-festival",
    "title": "Folk Music, Irish Dance & Opening Celebration",
    "date": "2026-10-24",
    "start": "11:00",
    "end": "12:00",
    "venueId": "county-hall-dance-school",
    "type": "event",
    "subtype": "performance",
    "organiser": "County Hall Arts",
    "published": true,
    "relationship": "hosted",
    "hostedAt": "County Hall Dance & Performing Arts School"
  },
  {
    "id": "leaves-2026-2",
    "eventSlug": "four-seasons-festival",
    "title": "Art and Craft and Movement Workshop for Children",
    "date": "2026-10-24",
    "start": "14:00",
    "end": "15:30",
    "venueId": "county-hall-dance-school",
    "type": "workshop",
    "subtype": "arts",
    "organiser": "County Hall Arts",
    "published": true,
    "relationship": "hosted",
    "hostedAt": "County Hall Dance & Performing Arts School"
  },
  {
    "id": "leaves-2026-3",
    "eventSlug": "four-seasons-festival",
    "title": "Autumn Flow and Sound",
    "date": "2026-10-24",
    "start": "16:00",
    "end": "17:30",
    "venueId": "county-hall-dance-school",
    "type": "workshop",
    "subtype": "wellness",
    "organiser": "County Hall Arts",
    "published": true,
    "relationship": "collaboration",
    "partners": [
      "County Hall Dance & Performing Arts School",
      "Sen Yoga"
    ],
    "style": "Yoga",
    "venueBooking": false
  },
  {
    "id": "leaves-2026-4",
    "eventSlug": "four-seasons-festival",
    "title": "Around the World Ticket",
    "date": "2026-10-24",
    "start": "18:00",
    "end": "19:00",
    "venueId": "county-hall-atrium",
    "type": "event",
    "subtype": "concert",
    "organiser": "County Hall Arts",
    "published": true
  },
  {
    "id": "leaves-2026-5",
    "eventSlug": "four-seasons-festival",
    "title": "Loom: Folk Traditions & Early Music",
    "date": "2026-10-25",
    "start": "11:00",
    "end": "12:00",
    "venueId": "county-hall-atrium",
    "type": "event",
    "subtype": "concert",
    "organiser": "County Hall Arts",
    "published": true
  },
  {
    "id": "leaves-2026-6",
    "eventSlug": "four-seasons-festival",
    "title": "Young Leaves Concert",
    "date": "2026-10-25",
    "start": "13:00",
    "end": "14:00",
    "venueId": "county-hall-atrium",
    "type": "event",
    "subtype": "concert",
    "organiser": "County Hall Arts",
    "published": true
  },
  {
    "id": "leaves-2026-7",
    "eventSlug": "four-seasons-festival",
    "title": "Autumn Leaf Pressing Clay Workshop",
    "date": "2026-10-25",
    "start": "15:00",
    "end": "17:00",
    "venueId": "kiln-courtyard",
    "type": "workshop",
    "subtype": "arts",
    "organiser": "County Hall Arts",
    "published": true
  },
  {
    "id": "leaves-2026-8",
    "eventSlug": "four-seasons-festival",
    "title": "Music That Dances",
    "date": "2026-10-25",
    "start": "18:00",
    "end": "19:00",
    "venueId": "county-hall-atrium",
    "type": "event",
    "subtype": "concert",
    "organiser": "County Hall Arts",
    "published": true
  },
  {
    "id": "leaves-2026-9",
    "eventSlug": "four-seasons-festival",
    "title": "Short Film Screening",
    "date": "2026-10-25",
    "start": "19:30",
    "end": "20:30",
    "venueId": "private-cinema",
    "type": "event",
    "subtype": "screening",
    "organiser": "County Hall Arts",
    "published": true
  },
  {
    "id": "concert-2026-10-23",
    "eventSlug": "lunchtime-concert-series",
    "title": "Fandango! Italian Virtuosity Meets Spanish Dance",
    "date": "2026-10-23",
    "start": "13:00",
    "venueId": "county-hall-dance-school",
    "type": "event",
    "subtype": "concert",
    "organiser": "County Hall Arts",
    "published": true,
    "description": [
      "The programme explored the virtuosity, lyricism and operatic flair of Italian composers including Paganini, Rossini and Boccherini, with a flamenco twist from two dancers from the London School of Flamenco.",
      "Guest performers included Santy Masciarò on guitar and Mika Enjo on flute. Violinist Juan Manuel Gonzalez Hernandez joined the ensemble for the Fandango, expanding the group into the quintet for which the work was written.",
      "The concert marked the beginning of As the Leaves Turn (24–25 October), exploring folk traditions, transformation, memory and the ways music and art are continually reshaped across cultures and generations."
    ],
    "relationship": "hosted",
    "hostedAt": "County Hall Dance & Performing Arts School"
  },
  {
    "id": "concert-2026-09-25",
    "eventSlug": "lunchtime-concert-series",
    "title": "Encounters",
    "date": "2026-09-25",
    "start": "13:00",
    "venueId": "county-hall-atrium",
    "type": "event",
    "subtype": "concert",
    "organiser": "County Hall Arts",
    "published": true,
    "description": [
      "A relaxed afternoon of chamber music with the County Hall Quartet. The ensemble welcomed cellist Meera Priyanka Raja, who opened the concert with a special solo performance."
    ]
  },
  {
    "id": "memory-2026-03",
    "relationship": "organised",
    "organiser": "County Hall Dance & Performing Arts School",
    "eventSlug": "memory-of-china",
    "title": "Memory of China",
    "date": "2026-10-03",
    "venueId": "members-terrace",
    "type": "event",
    "published": true
  },
  {
    "id": "memory-2026-04",
    "relationship": "organised",
    "organiser": "County Hall Dance & Performing Arts School",
    "eventSlug": "memory-of-china",
    "title": "Memory of China",
    "date": "2026-10-04",
    "venueId": "members-terrace",
    "type": "event",
    "published": true
  },
  {
    "id": "dance-meets-arts-2026",
    "relationship": "organised",
    "organiser": "County Hall Dance & Performing Arts School",
    "eventSlug": "dance-meets-arts",
    "title": "Dance Meets Arts",
    "date": "2026-08-08",
    "start": "19:00",
    "end": "20:30",
    "venueId": "members-terrace",
    "type": "event",
    "published": true
  },
  {
    "id": "halloween-2026",
    "eventSlug": "halloween-pumpkin-carving-workshop",
    "title": "Halloween Pumpkin Carving Workshop",
    "date": "2026-10-31",
    "start": "13:00",
    "end": "17:00",
    "venueId": "county-hall-dance-school",
    "type": "workshop",
    "organiser": "County Hall Dance & Performing Arts School",
    "relationship": "organised",
    "published": true
  },
  {
    id: "opening-day-2026",
    eventSlug: "county-hall-dance-centre-opening-day",
    title: "Opening Day",
    date: "2026-09-10",
    venueId: "county-hall",
    type: "event",
    relationship: "organised",
    organiser: "County Hall Dance & Performing Arts School",
    published: true,
  }
];

/** Export only public programme details: generated copy is also used by client components. */
export function publicSessionsForEvent(slug: string): EventSession[] {
  return eventSessions.filter((session) => session.eventSlug === slug && session.published === true && !session.cancelled && !session.private);
}
