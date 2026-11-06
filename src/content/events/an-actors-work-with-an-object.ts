import type { EventCard } from "../types";

/** Official Eventbrite page. Single source for every Book Now button for this event. */
export const AN_ACTORS_WORK_WITH_AN_OBJECT_BOOKING_URL =
    "https://www.eventbrite.co.uk/e/an-actors-work-with-an-object-tickets-2004432897755";

const IMAGE_DIR = "/images/events/2026/an-actors-work-with-an-object";

const mainImage = {
    src: `${IMAGE_DIR}/workshop-umbrella-exercise.jpg`,
    alt: "Workshop participants reaching towards an umbrella held overhead during an object exercise",
    width: 736,
    height: 935,
};

const bookNow = {
    label: "Book Now",
    href: AN_ACTORS_WORK_WITH_AN_OBJECT_BOOKING_URL,
    variant: "primary",
    external: true,
} as const;

/** Full event page for the 28 November 2026 Acting Workshop. */
export const anActorsWorkWithAnObjectEvent: EventCard = {
    id: "2026-an-actors-work-with-an-object",
    slug: "an-actors-work-with-an-object",
    listingCategory: "workshop",
    title: "An Actor's Work with an Object",
    subtitle: "An Intensive Acting Workshop & Live Performance",
    category: "Workshop",
    discipline: "Acting / Theatre",
    teacher: "Oleg Mirochnikov",
    date: "Saturday 28 November 2026, 3:00pm – 6:00pm",
    dateIso: "2026-11-28",
    time: "15:00–18:00",
    location:
        "County Hall Dance & Performing Arts School, Riverside Building, Belvedere Road, 2nd Floor, London SE1 7PB",
    excerpt:
        "An intensive acting workshop and live performance led by Vakhtangov specialist Oleg Mirochnikov, exploring how an everyday object can become a living scene partner.",
    description: [
        "# About the Workshop",
        "“The actor must not merely use an object; the actor must give the object a soul.” — Yevgeny Vakhtangov",
        "Led by internationally renowned acting coach Oleg Mirochnikov, the UK’s leading specialist in the Vakhtangov acting methodology.",
        "What happens when an object stops being a passive piece of stage furniture and becomes your living, breathing scene partner?",
        "In the revolutionary tradition of Yevgeny Vakhtangov’s Fantastic Realism, an object on stage is never just a prop; it is a catalyst for imagination and a partner in theatrical truth. Developed through years of dedicated teaching and deep immersion in the Vakhtangov technique, this intensive masterclass invites actors to bridge the gap between psychological depth and bold physical transformation.",
        "Guided by Oleg Mirochnikov, you will explore how an ordinary everyday item — whether a folding fan, an umbrella or a mat — can radically alter your physicality, expose your psychological state, and transform entirely before the audience’s eyes.",
        "More than a conventional workshop, this experience combines hands-on exploration with live performance. In the final section, participants will present their creative explorations through a live performance presentation within the workshop space itself, transforming the creative process into a shared theatrical experience. The event will conclude with a 15-minute Q&A session with Oleg Mirochnikov.",
    ],
    image: mainImage,
    photoCarousel: {
        label: "Workshop photos",
        images: [
            {
                src: `${IMAGE_DIR}/workshop-rehearsal-01.jpg`,
                alt: "Participants moving around the studio with everyday objects including an umbrella and a cushion",
                width: 1645,
                height: 956,
            },
            {
                src: `${IMAGE_DIR}/workshop-rehearsal-02.jpg`,
                alt: "Participants running between objects scattered across a wooden studio floor",
                width: 1306,
                height: 917,
            },
            {
                src: `${IMAGE_DIR}/oleg-mirochnikov-teaching.jpg`,
                alt: "Oleg Mirochnikov gesturing while teaching a workshop",
                width: 1371,
                height: 951,
            },
            {
                src: `${IMAGE_DIR}/oleg-mirochnikov-teaching-cane.jpg`,
                alt: "Oleg Mirochnikov holding a wooden cane while leading a workshop",
                width: 1423,
                height: 1105,
            },
        ],
    },
    teacherBio: {
        heading: "About Oleg Mirochnikov",
        name: "Oleg Mirochnikov",
        role: "Actor, director and acting educator",
        paragraphs: [
            "Oleg Mirochnikov is a London-based actor, director, and acting educator. He is currently Senior Lecturer on the Performance programme at Central Saint Martins, University of the Arts London. He has also taught and conducted workshops at leading drama institutions including the Royal Academy of Dramatic Art and the Royal Central School of Speech and Drama.",
            "Trained at the Belarusian Academy of Theatre and Arts in Minsk, Oleg’s practice is grounded in the Russian theatrical tradition. His work draws on the methodologies of Stanislavski, Meyerhold, and Vakhtangov, with a particular focus on Vakhtangov’s approach to imagination, physicality, and expressive performance.",
            "Alongside his teaching, Oleg continues to work internationally as an actor, director, and voice artist across theatre, film, television, and audio productions, bringing over twenty-five years of professional experience to his practice.",
        ],
        image: {
            src: `${IMAGE_DIR}/oleg-mirochnikov-portrait.jpg`,
            alt: "Portrait of Oleg Mirochnikov",
            width: 1346,
            height: 2048,
        },
    },
    bookingUrl: AN_ACTORS_WORK_WITH_AN_OBJECT_BOOKING_URL,
    bookNow,
};

/** Compact card for the home page "What's On" grid. */
export const homeAnActorsWorkWithAnObject: EventCard = {
    id: anActorsWorkWithAnObjectEvent.id,
    slug: anActorsWorkWithAnObjectEvent.slug,
    listingCategory: "workshop",
    title: anActorsWorkWithAnObjectEvent.title,
    date: anActorsWorkWithAnObjectEvent.date,
    dateIso: anActorsWorkWithAnObjectEvent.dateIso,
    location: "County Hall Dance & Performing Arts School",
    image: anActorsWorkWithAnObjectEvent.image,
    bookingUrl: AN_ACTORS_WORK_WITH_AN_OBJECT_BOOKING_URL,
    bookNow,
};
