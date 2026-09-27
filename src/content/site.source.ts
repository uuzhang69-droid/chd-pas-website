import type {
  BookingEmbed,
  ClassStylePage,
  ClassStyleTile,
  CourseDetail,
  CtaButton,
  EventCard,
  FaqItem,
  FacultyMember,
  FormField,
  GiftCardOption,
  HeroSlide,
  Link,
  NavItem,
  PageHeroContent,
  SectionedPageContent,
  SocialLink,
} from "./types";

/** Central content store — edit text, images, and lists here. Components read from this file only. */

export const siteSource = {
  meta: {
    siteName: "County Hall Dance & Performing Arts School",
    shortName: "CHD PAS",
    defaultDescription:
      "Adult dance and movement classes at London's iconic County Hall on the South Bank — Contemporary, Chinese Dance, Tango, Yoga, Tai Chi and K-Pop, plus workshops, private lessons and venue hire.",
  },

  global: {
    logo: {
      src: "/logo.png",
      headerSrc: "/header-logo-clear.png",
      footerSrc: "/header-logo-clear.png",
      alt: "County Hall Dance & Performing Arts School",
      minHeight: 105,
      nameLine1: "County Hall",
      nameLine2: "Dance & Performing Arts School",
    },
    utilityBar: {
      phone: {
        label: "+44 7728 617531",
        href: "tel:+447728617531",
      },
      email: {
        label: "info@countyhalldancecentre.com",
        href: "mailto:info@countyhalldancecentre.com",
      },
      findUs: {
        label: "Find us",
        href: "https://share.google/7weL1s5w3ItPjJyAZ",
        external: true,
      },
      social: [
        {
          platform: "instagram",
          href: "https://www.instagram.com/countyhalldancecentre",
          label: "@countyhalldancecentre",
        },
        {
          platform: "facebook",
          href: "https://facebook.com/countryhalldance",
          label: "Follow us on Facebook",
        },
        {
          platform: "youtube",
          href: "https://youtube.com/@countyhalldance",
          label: "Watch us on YouTube",
        },
      ] satisfies SocialLink[],
    },
    navigation: {
      items: [
        {
          label: "Venue Hire",
          href: "/venue-hire",
          children: [
            { label: "Space Booking", href: "/booking" },
          ] satisfies Link[],
        },
        {
          label: "Classes",
          href: "/classes",
          children: [
            { label: "Timetable", href: "/timetable" },
            { label: "Class Descriptions", href: "/classes-info" },
            { label: "Instructors", href: "/classes-info" },
            { label: "Booking", href: "/booking" },
            { label: "Taster Classes", href: "/taster-classes" },
          ] satisfies Link[],
        },
        {
          label: "Membership",
          href: "/membership",
          children: [
            { label: "Member Benefits", href: "/membership/member-benefits" },
            { label: "Monthly Passes", href: "/membership/monthly-passes" },
            { label: "Booking Access", href: "/booking" },
          ] satisfies Link[],
        },
        {
          label: "Private Lessons",
          href: "/private-lessons",
          children: [
            { label: "One-to-One Lessons", href: "/private-lessons" },
            { label: "Couples' Dance", href: "/private-lessons" },
            { label: "First Wedding Dance", href: "/private-lessons" },
            { label: "Group Experiences", href: "/private-lessons" },
            { label: "Corporate Events", href: "/private-lessons" },
            { label: "School / Organisation Workshops", href: "/private-lessons" },
          ] satisfies Link[],
        },
        {
          label: "About Us",
          href: "/about",
          children: [
            { label: "About Us", href: "/about" },
            { label: "Contact", href: "/booking" },
            { label: "Join Us", href: "/join-us" },
            { label: "FAQs", href: "/faq" },
            { label: "Gift Cards", href: "/gift-cards" },
            { label: "Membership Terms", href: "/membership-terms" },
          ] satisfies Link[],
        },
        {
          label: "Events",
          href: "/events",
        },
      ] satisfies NavItem[],
      bookTrial: {
        label: "Book a Trial",
        href: "/timetable#trial",
        variant: "primary",
      } satisfies CtaButton,
      search: {
        label: "Search",
        placeholder: "Search classes, courses, events…",
        action: "/search",
      },
    },
    footer: {
      intro:
        "A home for dance, movement and creativity at County Hall on the South Bank. Move. Create. Connect. Belong.",
      columns: {
        explore: {
          title: "Explore",
          links: [
            { label: "Classes", href: "/classes" },
            { label: "Courses", href: "/courses" },
            { label: "Events", href: "/events" },
            { label: "Gift Cards", href: "/gift-cards" },
            { label: "FAQ", href: "/faq" },
          ] satisfies Link[],
        },
        school: {
          title: "The School",
          links: [
            { label: "About Us", href: "/about" },
            { label: "Our Faculty", href: "/about#faculty" },
            { label: "Private Events", href: "/private-events" },
            { label: "Careers", href: "/careers" },
          ] satisfies Link[],
        },
      },
      contact: {
        title: "Visit Us",
        address: [
          "2nd Floor, County Hall Main Entrance",
          "Belvedere Road",
          "London SE1 7PB",
        ],
        phone: "+44 7728 617531",
        wechat: "WeChat: 18518614868",
        email: "info@countyhalldancecentre.com",
      },
      newsletter: {
        title: "Stay in touch",
        description: "Occasional news on classes, masterclasses, and performances.",
        placeholder: "Your email address",
        submitLabel: "Subscribe",
        privacyNote: "We respect your privacy. Unsubscribe anytime.",
      },
      legal: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Safeguarding", href: "/safeguarding" },
        { label: "Cookie Policy", href: "/cookies" },
      ] satisfies Link[],
      copyright: "© {year} County Hall Dance & Performing Arts School. All rights reserved.",
    },
  },

  home: {
    hero: {
      autoplayIntervalMs: 7000,
      previousLabel: "Previous",
      nextLabel: "Next",
      slides: [
        {
          id: "hero-intro",
          headline:
            "Discover dance, movement and creative experiences at London's iconic County Hall.",
          blurb:
            "Dance, movement and creative experiences at London's iconic County Hall on the South Bank — classes, workshops and events for adults of every background and level of experience.",
          cta: { label: "Explore Classes", href: "/classes", variant: "primary" },
          image: {
            src: "/images/hero/slide-1.jpg",
            alt: "Dancers taking a bow after an outdoor performance on the South Bank",
          },
        },
        {
          id: "hero-classes",
          headline: "Classes",
          blurb:
            "Explore adult classes in Contemporary, Chinese Dance, Tango, Yoga and Tai Chi.",
          cta: { label: "View Classes", href: "/classes", variant: "primary" },
          image: {
            src: "/images/hero/slide-2.jpg",
            alt: "Couple performing Argentine tango on an outdoor dance floor",
          },
        },
        {
          id: "hero-events",
          headline: "Events",
          blurb:
            "Milongas, themed social nights, masterclasses and cross-arts events.",
          cta: { label: "View Events", href: "/events", variant: "primary" },
          image: {
            src: "/images/hero/slide-3.jpg",
            alt: "Contemporary dancers in a bright venue with ballet barres",
          },
        },
        {
          id: "hero-private-lessons",
          headline: "Private Lessons & Experiences",
          blurb:
            "Tailored sessions for individuals, couples, wedding first dances and small groups.",
          cta: { label: "Enquire", href: "/contact?subject=private-lessons", variant: "primary" },
          image: {
            src: "/images/hero/slide-4.png",
            alt: "Instructor guiding a student in a one-to-one dance session",
          },
        },
        {
          id: "hero-venue-hire",
          headline: "Venue Hire",
          blurb:
            "A South Bank space for dance, theatre and film rehearsals, castings, workshops and events.",
          cta: { label: "Venue Hire", href: "/venue-hire", variant: "primary" },
          image: {
            src: "/images/hero/slide-5.jpg",
            alt: "Outdoor community dance performance with audience on the South Bank",
          },
        },
        {
          id: "hero-membership",
          headline: "Membership",
          blurb:
            "A more flexible way to keep dancing, join events and belong to the community.",
          cta: { label: "Membership", href: "/contact?subject=membership", variant: "primary" },
          image: {
            src: "/images/hero/slide-6.jpg",
            alt: "Group dance class in a sunlit venue",
          },
        },
      ] satisfies HeroSlide[],
    },

    quickActions: {
      overline: "Get started",
      linkSuffix: "Learn more →",
      items: [
        {
          label: "Book a Class",
          href: "/timetable",
          description: "See the weekly timetable and reserve your place.",
        },
        {
          label: "Book an Event",
          href: "/events",
          description:
            "Workshops, masterclasses, social nights and performances — see what's on and book your place.",
        },
        {
          label: "Join Now",
          href: "/membership",
          description:
            "Become a member and enjoy monthly, quarterly or annual plans with exclusive benefits.",
        },
      ] satisfies Array<{
        label: string;
        href: string;
        description: string;
        external?: boolean;
      }>,
    },

    events: {
      overline: "What's on",
      title: "Upcoming masterclasses & events",
      viewAll: { label: "View all events", href: "/events" },
      items: [
        {
          id: "event-1",
          slug: "contemporary-intensive-maya-chen",
          title: "Contemporary Intensive with Maya Chen",
          date: "Saturday 18 October 2026",
          dateIso: "2026-10-18",
          location: "Venue A",
          image: {
            src: "/images/events/contemporary-intensive.svg",
            alt: "Contemporary dance intensive workshop",
          },
          bookNow: {
            label: "Book Now",
            href: "https://buy.stripe.com/example-contemporary-intensive",
            external: true,
            variant: "primary",
          },
        },
        {
          id: "event-2",
          slug: "junior-ballet-masterclass",
          title: "Junior Ballet Masterclass",
          date: "Sunday 26 October 2026",
          dateIso: "2026-10-26",
          location: "Venue B",
          image: {
            src: "/images/events/ballet-masterclass.svg",
            alt: "Junior ballet masterclass in progress",
          },
          bookNow: {
            label: "Book Now",
            href: "https://buy.stripe.com/example-ballet-masterclass",
            external: true,
            variant: "primary",
          },
        },
        {
          id: "event-3",
          slug: "musical-theatre-workshop-day",
          title: "Musical Theatre Workshop Day",
          date: "Saturday 8 November 2026",
          dateIso: "2026-11-08",
          location: "Main Hall",
          image: {
            src: "/images/events/musical-theatre.svg",
            alt: "Musical theatre workshop participants on stage",
          },
          bookNow: {
            label: "Book Now",
            href: "https://buy.stripe.com/example-musical-theatre",
            external: true,
            variant: "primary",
          },
        },
        {
          id: "event-4",
          slug: "winter-showcase",
          title: "Winter Showcase — Tickets On Sale",
          date: "Friday 12 December 2026",
          dateIso: "2026-12-12",
          location: "County Hall Theatre",
          image: {
            src: "/images/events/winter-showcase.svg",
            alt: "Winter showcase performance lighting",
          },
          bookNow: {
            label: "Book Now",
            href: "https://buy.stripe.com/example-winter-showcase",
            external: true,
            variant: "primary",
          },
        },
      ] satisfies EventCard[],
    },

    classStyles: {
      overline: "Our disciplines",
      title: "Class styles",
      subtitle:
        "Adult classes in Contemporary, Chinese Dance, Tango, Yoga, Tai Chi and K-Pop — beginners welcome.",
      items: [
        {
          id: "style-contemporary",
          name: "Contemporary",
          slug: "contemporary",
          href: "/classes/contemporary",
          image: { src: "/images/styles/contemporary.jpg", alt: "Contemporary dance class" },
        },
        {
          id: "style-chinese-dance",
          name: "Chinese Dance",
          slug: "chinese-dance",
          href: "/classes/chinese-dance",
          image: { src: "/images/styles/chinese-dance.jpg", alt: "Chinese dance class" },
        },
        {
          id: "style-tango",
          name: "Tango",
          slug: "tango",
          href: "/classes/tango",
          image: { src: "/images/styles/tango.jpg", alt: "Tango class" },
        },
        {
          id: "style-yoga",
          name: "Yoga",
          slug: "yoga",
          href: "/classes/yoga",
          image: { src: "/images/styles/yoga.jpg", alt: "Yoga class" },
        },
        {
          id: "style-tai-chi",
          name: "Tai Chi",
          slug: "tai-chi",
          href: "/classes/tai-chi",
          image: { src: "/images/styles/tai-chi.jpg", alt: "Tai Chi class" },
        },
        {
          id: "style-k-pop",
          name: "K-Pop",
          slug: "k-pop",
          href: "/classes/k-pop",
          image: { src: "/images/hero/slide-3.jpg", alt: "K-Pop dance class" },
        },
      ] satisfies ClassStyleTile[],
    },

    aboutTeaser: {
      overline: "Our story",
      title: "Rooted in London, reaching for excellence",
      body: [
        "Founded at the historic County Hall, our school brings together rigorous technical training and a deeply supportive community.",
        "Whether you are taking your first plié or preparing for vocational study, our faculty guides every student with patience and precision.",
      ],
      cta: { label: "About the school", href: "/about", variant: "secondary" },
      image: {
        src: "/images/about/teaser.svg",
        alt: "Students and teachers in the County Hall venue corridor",
      },
    },

    privateEvents: {
      overline: "Celebrate with us",
      title: "Private events & parties",
      body: "Host an unforgettable birthday, hen party, or team celebration in our beautiful venues. Choose a theme, bring your guests, and leave the choreography to us.",
      cta: { label: "Enquire", href: "/contact?subject=private-events", variant: "primary" },
      image: {
        src: "/images/private-events/promo.svg",
        alt: "Private dance party celebration in venue",
      },
    },

    newsletter: {
      overline: "Join our circle",
      title: "Newsletter & social",
      description:
        "Follow our journey and receive curated updates on classes, performances, and exclusive offers.",
      placeholder: "Email address",
      submitLabel: "Sign up",
      socialHeading: "Connect with us",
    },
  },

  pages: {
    common: {
      viewCourseLink: "View course →",
      eventDetailsLink: "Details →",
    },

    timetable: {
      meta: {
        title: "Timetable & Booking",
        description:
          "View the weekly class timetable and book your place at County Hall Dance & Performing Arts School.",
      },
      hero: {
        overline: "Plan your week",
        title: "Timetable & Booking",
        subtitle:
          "Browse this week's classes by day and style, then reserve your place through our secure booking system.",
      } satisfies PageHeroContent,
      trial: {
        id: "trial",
        overline: "New to CHD PAS?",
        title: "Book a taster trial",
        body: "Select a suitable class from the timetable below, then choose the trial option at checkout. Our team will welcome you on arrival.",
        cta: {
          label: "Book",
          href: "https://my.classmanager.com/county-hall-dance-centre/classes?mode=enrol",
          variant: "secondary",
          external: true,
        },
      },
      booking: {
        title: "Class timetable",
        description:
          "Browse this week's classes below. For course enrolment, visit our courses page.",
        placeholderLabel: "Booking widget placeholder",
        placeholderHint:
          "Replace this container with your ClassForKids, bsport, or other embed code.",
        providerNote:
          "Real-time booking is handled by our external provider. CHD PAS does not process class payments on this website.",
        image: {
          src: "/images/timetable/class-schedule.jpg",
          alt: "Class schedule for 14–20 September 2026 at County Hall Dance & Performing Arts School",
          width: 853,
          height: 1024,
        },
      } satisfies BookingEmbed,
      grid: {
        prevWeek: "Previous week",
        thisWeek: "This week",
        nextWeek: "Next week",
        goToDate: "Go to date",
        legend: "Class styles",
        venueNote:
          "The venue can be used privately when there are no classes. Reservations are possible.",
      },
      newcomerNote:
        "New to the Centre? Get in touch and we'll help you choose the right class — WeChat: 18518614868.",
      helpLinks: [
        { label: "Browse courses", href: "/courses" },
        { label: "Frequently asked questions", href: "/faq" },
        { label: "Contact us", href: "/contact" },
      ] satisfies Link[],
    },

    classes: {
      meta: {
        title: "Classes",
        description:
          "Adult classes in Contemporary, Chinese Dance, Tango, Yoga, Tai Chi and K-Pop at County Hall Dance Centre.",
      },
      hero: {
        overline: "Find your style",
        title: "Classes",
        subtitle:
          "Adult dance and movement classes for every background and level — beginners welcome.",
      } satisfies PageHeroContent,
      intro:
        "Explore adult classes in Contemporary, Chinese Dance, Tango, Yoga, Tai Chi and K-Pop. Every class is clearly labelled Beginner, Open Level or Intermediate.",
      cta: { label: "View timetable", href: "/timetable", variant: "primary" },
      detailLabels: {
        ageGroups: "Who it's for",
        backLink: "Classes",
      },
      styles: [
        {
          slug: "contemporary",
          name: "Contemporary",
          metaDescription:
            "Contemporary dance classes for adults at County Hall Dance Centre — flow, space and physical expression.",
          hero: {
            overline: "Modern dance",
            title: "Contemporary",
            subtitle: "Develop coordination, strength and creativity through flow, space and physical expression.",
            image: { src: "/images/styles/contemporary.jpg", alt: "Contemporary dance class" },
          },
          intro: [
            "Develop coordination, strength and creativity through flow, space and physical expression.",
            "Ideal for adults keen to explore the language of modern dance.",
          ],
          highlights: [
            { title: "Creative movement", description: "Explore space, dynamics and personal expression." },
            { title: "Strength & coordination", description: "Build physical confidence through structured practice." },
            { title: "All levels", description: "Classes labelled Beginner, Open Level or Intermediate." },
          ],
          ageGroups: [
            { label: "Adults", description: "Open to all backgrounds — no dance experience needed." },
          ],
          cta: { label: "Book a class", href: "/timetable", variant: "primary" },
        },
        {
          slug: "chinese-dance",
          name: "Chinese Dance",
          metaDescription:
            "Chinese dance classes blending classical grace, line and cultural expression for adults.",
          hero: {
            overline: "Grace & line",
            title: "Chinese Dance",
            subtitle: "Classical Chinese dance to build body control, flexibility and stage presence.",
            image: { src: "/images/styles/chinese-dance.jpg", alt: "Chinese dance class" },
          },
          intro: [
            "Blending the grace, line and cultural expression of classical Chinese dance to build body control, flexibility and stage presence.",
          ],
          highlights: [
            { title: "Cultural expression", description: "Discover the artistry of classical Chinese movement." },
            { title: "Flexibility & control", description: "Develop line, poise and body awareness." },
            { title: "All levels", description: "Beginners welcome — check the level on each class." },
          ],
          ageGroups: [
            { label: "Adults", description: "Designed for adult learners at every stage." },
          ],
          cta: { label: "Book a class", href: "/timetable", variant: "primary" },
        },
        {
          slug: "tango",
          name: "Tango",
          metaDescription: "Tango classes for adults — connection, musicality and social dance etiquette.",
          hero: {
            overline: "Connection & musicality",
            title: "Tango",
            subtitle: "Learn lead and follow, musicality and the etiquette of social dance.",
            image: { src: "/images/styles/tango.jpg", alt: "Tango class" },
          },
          intro: [
            "Learn connection, lead and follow, musicality and the etiquette of social dance, building confidence from the very first steps.",
          ],
          highlights: [
            { title: "Social dance skills", description: "Lead, follow and floor etiquette from day one." },
            { title: "Musicality", description: "Move with confidence to live and recorded tango music." },
            { title: "Milongas & events", description: "Join our social dance nights and themed events." },
          ],
          ageGroups: [
            { label: "Adults", description: "No partner or experience required to begin." },
          ],
          cta: { label: "Book a class", href: "/timetable", variant: "primary" },
        },
        {
          slug: "yoga",
          name: "Yoga",
          metaDescription: "Yoga classes for adults — flexibility, breath and wellbeing at County Hall Dance Centre.",
          hero: {
            overline: "Breath & stretch",
            title: "Yoga",
            subtitle: "Improve flexibility and overall wellbeing through breath, stretch and focused practice.",
            image: { src: "/images/styles/yoga.jpg", alt: "Yoga class" },
          },
          intro: [
            "Improve flexibility and overall wellbeing through breath, stretch and focused, music-guided practice.",
          ],
          highlights: [
            { title: "Wellbeing focus", description: "Stretch, breathe and restore balance." },
            { title: "Music-guided practice", description: "A calm, focused environment for every body." },
            { title: "All levels", description: "Check class information for level and format details." },
          ],
          ageGroups: [
            { label: "Adults", description: "Open to beginners and returning practitioners." },
          ],
          cta: { label: "Book a class", href: "/timetable", variant: "primary" },
        },
        {
          slug: "tai-chi",
          name: "Tai Chi",
          metaDescription: "Tai Chi classes for adults — balance, relaxation and body awareness.",
          hero: {
            overline: "Flow & balance",
            title: "Tai Chi",
            subtitle: "Cultivate balance, relaxation and body awareness through slow, flowing movement.",
            image: { src: "/images/styles/tai-chi.jpg", alt: "Tai Chi class" },
          },
          intro: [
            "Cultivate balance, relaxation and body awareness through slow, flowing movement, breath and shifts of weight.",
          ],
          highlights: [
            { title: "Mind-body practice", description: "Slow, intentional movement for calm and focus." },
            { title: "Balance & awareness", description: "Develop stability and gentle strength." },
            { title: "All levels", description: "Welcoming to complete beginners." },
          ],
          ageGroups: [
            { label: "Adults", description: "Suitable for every age and fitness level." },
          ],
          cta: { label: "Book a class", href: "/timetable", variant: "primary" },
        },
        {
          slug: "k-pop",
          name: "K-Pop",
          metaDescription:
            "K-Pop dance classes for adults at County Hall Dance Centre — learn high-energy routines inspired by today's biggest K-Pop hits.",
          hero: {
            overline: "Energy & style",
            title: "K-Pop",
            subtitle: "High-energy choreography inspired by the world of K-Pop.",
            image: { src: "/images/hero/slide-3.jpg", alt: "K-Pop dance class" },
          },
          intro: [
            "Learn sharp, stylish routines inspired by the choreography of popular K-Pop songs. Classes break each routine into clear steps, building your coordination, stamina and performance confidence while you have a great time with a friendly group.",
          ],
          highlights: [
            { title: "Full routines", description: "Learn choreography step by step." },
            { title: "Performance skills", description: "Work on style, precision and expression." },
            { title: "Fitness & fun", description: "A full-body workout that doesn't feel like one." },
          ],
          ageGroups: [
            { label: "Adults of all levels", description: "No previous dance experience needed." },
          ],
          cta: { label: "Book a class", href: "/timetable", variant: "primary" },
        },
      ] satisfies ClassStylePage[],
    },

    courses: {
      meta: {
        title: "Courses",
        description:
          "Term-length dance and performing arts courses with structured progression at CHD PAS.",
      },
      hero: {
        overline: "Structured progression",
        title: "Courses",
        subtitle:
          "Immersive term programmes designed to deepen technique, artistry, and performance readiness.",
      } satisfies PageHeroContent,
      intro:
        "Courses differ from drop-in classes — they follow a curated syllabus across a full term, culminating in an informal sharing or assessment where appropriate.",
      detailLabels: {
        duration: "Duration",
        schedule: "Schedule",
        price: "Price",
        includes: "What's included",
        backLink: "All courses",
      },
      items: [
        {
          id: "course-1",
          slug: "junior-ballet-foundation",
          title: "Junior Ballet Foundation",
          term: "Autumn Term 2026",
          level: "Beginner – Elementary",
          excerpt: "A twelve-week introduction to classical ballet for ages 6–9.",
          image: { src: "/images/courses/junior-ballet.svg", alt: "Junior ballet foundation course" },
          href: "/courses/junior-ballet-foundation",
          metaDescription: "Twelve-week junior ballet foundation course for ages 6–9 at CHD PAS.",
          duration: "12 weeks",
          schedule: "Saturdays, 10:00 – 11:00",
          price: "£168 per term",
          description: [
            "This course introduces young dancers to the fundamentals of ballet posture, port de bras, and basic allegro.",
            "Classes are taught in a nurturing environment with clear expectations and plenty of encouragement.",
          ],
          includes: [
            "Weekly 60-minute class",
            "Course handbook and practice notes",
            "End-of-term venue sharing",
          ],
          cta: { label: "Enrol via timetable", href: "/timetable", variant: "primary" },
        },
        {
          id: "course-2",
          slug: "teen-contemporary-intensive",
          title: "Teen Contemporary Intensive",
          term: "Autumn Term 2026",
          level: "Intermediate",
          excerpt: "Develop contemporary technique, improvisation, and performance skills.",
          image: { src: "/images/courses/teen-contemporary.svg", alt: "Teen contemporary intensive course" },
          href: "/courses/teen-contemporary-intensive",
          metaDescription: "Intermediate contemporary course for teens at County Hall Dance.",
          duration: "10 weeks",
          schedule: "Wednesdays, 17:30 – 19:00",
          price: "£195 per term",
          description: [
            "Students explore release technique, contact principles, and choreographic tasks across a focused ten-week block.",
            "The course prepares dancers for school showcases and optional audition pieces.",
          ],
          includes: [
            "Weekly 90-minute class",
            "Guest artist Q&A session",
            "Performance workshop",
          ],
          cta: { label: "Enrol via timetable", href: "/timetable", variant: "primary" },
        },
        {
          id: "course-3",
          slug: "adult-ballet-open",
          title: "Adult Ballet Open",
          term: "Rolling enrolment",
          level: "All levels",
          excerpt: "A welcoming ballet class for adults — beginners and returners alike.",
          image: { src: "/images/courses/adult-ballet.svg", alt: "Adult ballet open course" },
          href: "/courses/adult-ballet-open",
          metaDescription: "Open-level adult ballet course at CHD PAS, London.",
          duration: "6-week blocks",
          schedule: "Mondays, 19:00 – 20:15",
          price: "£96 per block",
          description: [
            "Rebuild strength and grace at the barre and in centre, with modifications offered throughout.",
            "Each block introduces new enchaînements while revisiting core principles.",
          ],
          includes: [
            "Weekly 75-minute class",
            "Technique notes via email",
            "Optional end-of-block class video",
          ],
          cta: { label: "Enrol via timetable", href: "/timetable", variant: "primary" },
        },
        {
          id: "course-4",
          slug: "musical-theatre-performance",
          title: "Musical Theatre Performance",
          term: "Spring Term 2027",
          level: "Intermediate – Advanced",
          excerpt: "Triple-threat training culminating in a staged musical excerpt.",
          image: { src: "/images/courses/musical-theatre.svg", alt: "Musical theatre performance course" },
          href: "/courses/musical-theatre-performance",
          metaDescription: "Musical theatre performance course for intermediate and advanced students.",
          duration: "14 weeks",
          schedule: "Saturdays, 13:00 – 16:00",
          price: "£320 per term",
          description: [
            "Sing, dance, and act your way through a selected musical number, rehearsed for a small invited audience.",
            "Vocal coaching and ensemble work are integrated throughout the term.",
          ],
          includes: [
            "Weekly 3-hour session",
            "Vocal warm-up resources",
            "Costume hire for final sharing",
          ],
          cta: { label: "Enrol via timetable", href: "/timetable", variant: "primary" },
        },
      ] satisfies CourseDetail[],
    },

    events: {
      meta: {
        title: "Events & Masterclasses",
        description:
          "Masterclasses, workshops, and performances at County Hall Dance & Performing Arts School.",
      },
      hero: {
        overline: "What's on",
        title: "Events & Masterclasses",
        subtitle:
          "One-off workshops, guest artist intensives, and ticketed performances throughout the year.",
      } satisfies PageHeroContent,
      intro:
        "Book directly via the links below. Event payments are processed securely through Stripe — class bookings remain on our timetable system.",
      items: [
        {
          id: "event-1",
          slug: "contemporary-intensive-maya-chen",
          title: "Contemporary Intensive with Maya Chen",
          date: "Saturday 18 October 2026",
          dateIso: "2026-10-18",
          location: "Venue A",
          excerpt: "A full-day intensive exploring release technique and repertory with guest artist Maya Chen.",
          description: [
            "Join internationally recognised choreographer Maya Chen for a day of contemporary training at intermediate level and above.",
            "The morning focuses on floor work and release principles; the afternoon introduces excerpts from Maya's touring repertory.",
            "Please bring knee pads and water. Places are limited to 24 participants.",
          ],
          image: {
            src: "/images/events/contemporary-intensive.svg",
            alt: "Contemporary dance intensive workshop",
          },
          bookNow: {
            label: "Book Now",
            href: "https://buy.stripe.com/example-contemporary-intensive",
            external: true,
            variant: "primary",
          },
        },
        {
          id: "event-2",
          slug: "junior-ballet-masterclass",
          title: "Junior Ballet Masterclass",
          date: "Sunday 26 October 2026",
          dateIso: "2026-10-26",
          location: "Venue B",
          excerpt: "A special masterclass for junior ballet students aged 8–12.",
          description: [
            "Led by a guest RAD examiner, this masterclass refines alignment, épaulement, and petite allegro.",
            "Suitable for students currently studying Grade 2–4 or equivalent.",
          ],
          image: {
            src: "/images/events/ballet-masterclass.svg",
            alt: "Junior ballet masterclass in progress",
          },
          bookNow: {
            label: "Book Now",
            href: "https://buy.stripe.com/example-ballet-masterclass",
            external: true,
            variant: "primary",
          },
        },
        {
          id: "event-3",
          slug: "musical-theatre-workshop-day",
          title: "Musical Theatre Workshop Day",
          date: "Saturday 8 November 2026",
          dateIso: "2026-11-08",
          location: "Main Hall",
          excerpt: "Sing, dance, and act through a full musical theatre workshop day.",
          description: [
            "A lively day of triple-threat training, ending with a short sharing for friends and family.",
            "Open to ages 10–16 with some prior dance or drama experience recommended.",
          ],
          image: {
            src: "/images/events/musical-theatre.svg",
            alt: "Musical theatre workshop participants on stage",
          },
          bookNow: {
            label: "Book Now",
            href: "https://buy.stripe.com/example-musical-theatre",
            external: true,
            variant: "primary",
          },
        },
        {
          id: "event-4",
          slug: "winter-showcase",
          title: "Winter Showcase — Tickets On Sale",
          date: "Friday 12 December 2026",
          dateIso: "2026-12-12",
          location: "County Hall Theatre",
          excerpt: "Our annual winter showcase featuring students from every discipline.",
          description: [
            "Celebrate the talent of the CHD PAS community in an evening of ballet, contemporary, jazz, and musical theatre.",
            "Doors open at 18:30; performance begins at 19:00. Running time approximately 90 minutes including interval.",
          ],
          image: {
            src: "/images/events/winter-showcase.svg",
            alt: "Winter showcase performance lighting",
          },
          bookNow: {
            label: "Book Now",
            href: "https://buy.stripe.com/example-winter-showcase",
            external: true,
            variant: "primary",
          },
        },
      ] satisfies EventCard[],
      categories: [
        {
          slug: "milonga",
          meta: {
            title: "Milonga",
            description: "Tango milonga social dance events at County Hall Dance Centre.",
          },
          hero: {
            overline: "Events",
            title: "Milonga",
            subtitle: "Social tango evenings with live and recorded music in our South Bank venue.",
          },
          intro:
            "Join us for regular milongas — welcoming social dance nights for tango dancers of every level.",
          sections: [
            { id: "upcoming", title: "Upcoming milongas" },
            { id: "what-to-expect", title: "What to expect" },
          ],
        },
        {
          slug: "social-dance-nights",
          meta: {
            title: "Social Dance Nights",
            description: "Themed social dance evenings at County Hall Dance Centre.",
          },
          hero: {
            overline: "Events",
            title: "Social Dance Nights",
            subtitle: "Themed evenings celebrating dance styles, music and community.",
          },
          intro:
            "From salsa socials to cross-style celebrations, our social nights are open to adults who love to move and connect.",
          sections: [
            { id: "upcoming", title: "Upcoming social nights" },
            { id: "how-to-join", title: "How to join" },
          ],
        },
        {
          slug: "workshops",
          meta: {
            title: "Workshops",
            description: "Dance and movement workshops at County Hall Dance Centre.",
          },
          hero: {
            overline: "Events",
            title: "Workshops",
            subtitle: "One-off intensives and taster sessions with guest artists and faculty.",
          },
          intro:
            "Workshops offer a focused opportunity to explore a style, technique or theme in a single session or short series.",
          sections: [
            { id: "upcoming", title: "Upcoming workshops" },
            { id: "booking", title: "Booking" },
          ],
        },
        {
          slug: "masterclasses",
          meta: {
            title: "Masterclasses",
            description: "Guest artist masterclasses at County Hall Dance Centre.",
          },
          hero: {
            overline: "Events",
            title: "Masterclasses",
            subtitle: "Learn from visiting artists and specialists in intimate venue settings.",
          },
          intro:
            "Masterclasses bring professional artists to County Hall for intensive teaching sessions across styles and levels.",
          sections: [
            { id: "upcoming", title: "Upcoming masterclasses" },
            { id: "levels", title: "Levels & requirements" },
          ],
        },
        {
          slug: "performances",
          meta: {
            title: "Performances",
            description: "Performances and showcases at County Hall Dance Centre.",
          },
          hero: {
            overline: "Events",
            title: "Performances",
            subtitle: "Ticketed showcases, sharings and performance events throughout the year.",
          },
          intro:
            "Celebrate the work of our community in performances ranging from informal sharings to ticketed showcase evenings.",
          sections: [
            { id: "upcoming", title: "Upcoming performances" },
            { id: "tickets", title: "Tickets" },
          ],
        },
        {
          slug: "cross-arts-events",
          meta: {
            title: "Cross-Arts Events",
            description: "Dance Meets Arts cross-disciplinary events at County Hall Dance Centre.",
          },
          hero: {
            overline: "Events",
            title: "Cross-Arts Events",
            subtitle: "Where dance meets music, visual art and international cultural exchange.",
          },
          intro:
            "Our Dance Meets Arts programme brings together movement, live music, visual art and cultural celebration.",
          sections: [
            { id: "programme", title: "Programme" },
            { id: "upcoming", title: "Upcoming events" },
          ],
        },
      ] satisfies (SectionedPageContent & { slug: string })[],
      detailLabels: {
        date: "Date",
        location: "Location",
        backLink: "← All events",
      },
      categoryLabels: {
        backLink: "← All events",
      },
    },

    venueHire: {
      overview: {
        meta: {
          title: "Venue Hire",
          description:
            "Hire a 70 m² vinyl-floor venue or a 200 m² wooden-floor hall at County Hall on the South Bank. From £200 per hour, member rates available.",
        },
        hero: {
          overline: "County Hall arts space",
          title: "Venue Hire",
          subtitle:
            "Two flexible spaces inside London's iconic County Hall — for rehearsals, classes, meetings, filming, parties, exhibitions and live events.",
          image: {
            src: "/images/hero/slide-5.jpg",
            alt: "Venue space available for hire at County Hall",
          },
        },
        intro:
          "Set on the 2nd floor of County Hall on the South Bank, our venue offers around 300 m² of bright, versatile space with 4.5-metre ceilings. Hire the whole venue or book one of our two spaces separately — the 70 m² vinyl-floor venue for classes, rehearsals and smaller sessions, or the 200 m² wooden-floor hall for workshops, performances, parties and larger events. With Waterloo and Westminster stations each just a five-minute walk away, it's easy for your team, cast or guests to reach.",
        spaces: {
          title: "Our spaces",
          items: [
            {
              id: "vinyl-venue",
              title: "Vinyl-Floor Venue",
              size: "70 m²",
              floor: "Dance vinyl",
              idealFor:
                "Classes, rehearsals, auditions, small workshops and one-to-one sessions",
              body: "A focused, practical venue with a professional vinyl dance floor — well suited to regular classes, rehearsals, auditions and smaller group sessions.",
              image: {
                src: "/images/hero/slide-3.jpg",
                alt: "Venue set up for classes and workshops",
              },
            },
            {
              id: "wooden-hall",
              title: "Wooden-Floor Hall",
              size: "200 m²",
              floor: "Wooden floor",
              idealFor:
                "Workshops, social dances, performances, parties, exhibitions and corporate events",
              body: "Our largest space, with a wooden floor and generous 4.5-metre ceilings — room to move, perform, present or celebrate with larger groups.",
              image: {
                src: "/images/hero/slide-4.png",
                alt: "Spacious dance venue at County Hall",
              },
            },
          ],
          wholeVenue:
            "Book both spaces together for approx. 300 m² and up to 120 guests.",
        },
        facts: {
          title: "Key facts",
          items: [
            "Approx. 300 m² in total",
            "4.5 m ceiling height",
            "Up to 120 guests",
            "5 minutes' walk from Waterloo and Westminster",
          ],
        },
        facilities: {
          title: "Facilities & equipment",
          includedNote: "Included in every booking at no extra charge:",
          items: [
            "Tables and chairs",
            "Wi-Fi",
            "Power sockets",
            "Lighting",
            "Sound system",
            "4 microphones",
            "Kitchen",
            "Tea and refreshment facilities",
            "Toilets",
            "Changing rooms",
          ],
          extraNote:
            "You are welcome to bring your own equipment, set up and decorate the space, and bring your own catering and drinks.",
        },
        suitableFor: {
          title: "Suitable for",
          items: [
            "Meetings",
            "Training sessions",
            "Rehearsals",
            "Classes & workshops",
            "Photo & film shoots",
            "Live streams",
            "Parties & celebrations",
            "Exhibitions",
            "Cultural events",
          ],
        },
        pricing: {
          title: "Pricing",
          columns: ["", "Standard rate", "Member rate"],
          rows: [
            { label: "Weekday, per hour", standard: "£200", member: "£100" },
            { label: "Weekend daytime, per hour", standard: "£200", member: "£150" },
            { label: "Half day", standard: "£1,000", member: "£500" },
          ],
          notes: [
            "Minimum booking: 1 hour.",
            "Bookings are available until 18:00; evening bookings after 18:00 are not available.",
            "Refundable security deposit: £100.",
            "Prices are final — no additional taxes or fees. All equipment is included.",
            "Members of County Hall Dance Centre receive reduced hire rates.",
          ],
          membershipLink: {
            label: "Learn about membership",
            href: "/membership",
            variant: "text",
          },
        },
        howToBook: {
          title: "How to book",
          steps: [
            {
              title: "Enquire",
              body: "Contact us through this website, our official WeChat (18518614868) or Instagram (@countyhalldancecentre). Please book at least one week in advance.",
            },
            {
              title: "Confirm",
              body: "We'll check availability and confirm your date, space and hours.",
            },
            {
              title: "Pay",
              body: "Full payment is due no later than three days before your booking, by bank transfer to our company account.",
            },
            {
              title: "Arrive",
              body: "Our on-site manager will welcome you and be available throughout your hire.",
            },
          ],
        },
        terms: {
          title: "Booking terms",
          items: [
            {
              title: "Cancellations and date changes",
              body: "must be made at least three days before your booking. Cancellations made with less notice are non-refundable.",
            },
            {
              title: "Extra time or changes to guest numbers",
              body: "must be confirmed at least one day in advance.",
            },
            {
              title: "Deposit:",
              body: "your £100 deposit is refunded in full after your hire provided there is no damage. Any damage to the venue, furniture or equipment will be charged at cost.",
            },
            {
              title: "House rules:",
              body: "no pets, no smoking, no open flames and no illegal activity. Under-18s are not permitted. Maximum capacity is 120 people.",
            },
            {
              title: "On-site support:",
              body: "a venue manager is present during every booking.",
            },
          ],
        },
        cta: {
          title: "Plan your booking",
          body: "Tell us your preferred date, times, space and group size and we'll come back to you with availability.",
          button: {
            label: "Enquire about hire",
            href: "/contact?subject=venue-hire",
            variant: "primary",
          },
          secondaryButton: {
            label: "Check availability",
            href: "/timetable",
            variant: "secondary",
          },
          secondary:
            "Or message us on WeChat: 18518614868 · Instagram: @countyhalldancecentre",
        },
      },
      subpages: [
        {
          slug: "space-booking",
          meta: {
            title: "Space Booking",
            description: "Enquire about venue hire at County Hall Dance Centre.",
          },
          hero: {
            overline: "Venue Hire",
            title: "Space Booking",
            subtitle: "Tell us your preferred date, activity and group size — we will respond with availability.",
          },
          intro:
            "Enquire via our Venue Hire form or email info@countyhalldancecentre.com. The form collects your preferred date and time, activity type, expected numbers, equipment needs and contact details.",
          sections: [
            { id: "how-to-book", title: "How to book" },
            { id: "enquiry-form", title: "Enquiry form" },
          ],
        },
      ] satisfies (SectionedPageContent & { slug: string })[],
    },

    privateLessons: {
      meta: {
        title: "Private Lessons & Experiences",
        description:
          "Private dance lessons and bespoke experiences at County Hall — one-to-one coaching, couples' dance, wedding first dances, group experiences, corporate events and workshops.",
      },
      hero: {
        overline: "Tailored for you",
        title: "Private Lessons & Experiences",
        subtitle:
          "Personal coaching and bespoke dance experiences for individuals, couples, groups and organisations — in a beautiful venue at County Hall.",
      },
      intro:
        "Whether you want focused one-to-one coaching, a first dance to remember or a celebration your guests will talk about for years, we'll design a session around your goals, your group and your schedule. Every experience is led by experienced teachers and artists, and takes place in our venues on the South Bank.",
      sections: [
        {
          id: "one-to-one",
          title: "One-to-One Lessons",
          body: "Our one-to-one lessons are built entirely around you. Every journey begins with a goal assessment, where your teacher gets to know your experience, strengths and ambitions, then designs a personalised training plan to match. Sessions can focus on technique — strength, flexibility, control and precision — or on performance quality, musicality and stage presence. We also offer targeted preparation for dance exams and auditions, helping you refine your repertoire, build confidence and walk into the room ready. Whether you're an absolute beginner who prefers to learn privately or an experienced dancer refining the details, you'll progress faster with undivided attention and honest, supportive feedback.",
          cta: { label: "Enquire", href: "/contact?subject=private-lessons", variant: "secondary" },
          gallery: [
            {
              src: "/images/hero/slide-4.png",
              alt: "One-to-one private dance lesson",
            },
            {
              src: "/images/hero/slide-1.jpg",
              alt: "Dancer in a private contemporary session",
            },
            {
              src: "/images/hero/slide-6.jpg",
              alt: "Instructor working with an individual student",
            },
          ],
        },
        {
          id: "couples",
          title: "Couples' Dance",
          body: "Dancing together is one of the most joyful ways to connect. Our couples' sessions offer a relaxed, private setting where you can learn side by side — no experience needed. Celebrate an anniversary or special occasion with a memorable shared experience, surprise your partner with something new, or take your first steps into social dance and learn the essentials of leading, following and moving to music together. Your teacher will tailor the style and pace to you, whether you'd like a light-hearted one-off session or a series of lessons that builds real confidence on the dance floor. Many couples find it becomes a favourite ritual of their week.",
          cta: { label: "Enquire", href: "/contact?subject=private-lessons", variant: "secondary" },
          gallery: [
            {
              src: "/images/hero/slide-2.jpg",
              alt: "Couple learning partner dance",
            },
            {
              src: "/images/private-events/promo.svg",
              alt: "Couples dance experience at County Hall",
            },
            {
              src: "/images/hero/slide-5.jpg",
              alt: "Pair practising movement in the venue",
            },
          ],
        },
        {
          id: "wedding",
          title: "First Wedding Dance",
          body: "Your first dance should feel like you — and we'll help you make it unforgettable. We start by helping you choose or edit your song, then create choreography that suits your music, your style and your comfort level, from a simple, elegant sway to a fully staged performance with lifts and flourishes. We'll recommend how many rehearsals you need based on your wedding date and experience, and plan a clear schedule so there's no last-minute stress. Short on time? Our pre-wedding intensive sessions are designed to get you polished and confident in the final weeks. On the day, all you need to do is enjoy the moment.",
          cta: { label: "Enquire", href: "/contact?subject=private-lessons", variant: "secondary" },
          gallery: [
            {
              src: "/images/hero/slide-2.jpg",
              alt: "Couple practising a wedding dance",
            },
            {
              src: "/images/events/winter-showcase.svg",
              alt: "Performance lighting in the venue",
            },
            {
              src: "/images/hero/slide-4.png",
              alt: "Private lesson for wedding preparation",
            },
          ],
        },
        {
          id: "groups",
          title: "Group Experiences",
          body: "Celebrate with the people who matter most. Our group experiences are perfect for hen and stag parties, birthdays, reunions and friendship groups, and can welcome up to 120 guests. Choose from themed sessions across our styles — a tango taster, a K-Pop routine, a Chinese dance experience or a creative movement workshop — and our teachers will lead a fun, inclusive session that everyone can enjoy, whatever their experience. You're welcome to bring your own music and drinks to make the occasion truly yours, and we can help you plan timings, the space and the flow of the day so you can relax and enjoy the celebration with your guests.",
          cta: { label: "Enquire", href: "/contact?subject=private-lessons", variant: "secondary" },
          gallery: [
            {
              src: "/images/private-events/promo.svg",
              alt: "Group dance experience",
            },
            {
              src: "/images/events/musical-theatre.svg",
              alt: "Musical theatre themed workshop",
            },
            {
              src: "/images/hero/slide-3.jpg",
              alt: "Group class in the venue",
            },
          ],
        },
        {
          id: "corporate",
          title: "Corporate Events",
          body: "Bring your team together through movement. Our corporate sessions are an energising, inclusive alternative to the usual away day — no dance experience required. We design each event around your goals, whether that's building trust and communication, sparking creativity, welcoming new starters or simply giving your people a well-earned reward. Choose a short, high-energy session to open a conference, a half-day team-building workshop, or a full event combining movement with meetings in our fully equipped spaces, complete with sound system, microphones, tables and chairs. Sessions can be tailored to group size and schedule, and our team will handle the planning so you can focus on your people.",
          cta: { label: "Enquire", href: "/contact?subject=private-lessons", variant: "secondary" },
          gallery: [
            {
              src: "/images/hero/slide-3.jpg",
              alt: "Corporate group movement session",
            },
            {
              src: "/images/hero/slide-1.jpg",
              alt: "Team workshop in the dance venue",
            },
            {
              src: "/images/events/contemporary-intensive.svg",
              alt: "Professional venue environment",
            },
          ],
        },
        {
          id: "schools",
          title: "Workshops for Organisations",
          body: "We offer tailored dance and movement workshops for universities, colleges, community groups and cultural organisations. Led by experienced teachers and artists, workshops can introduce a new style, explore the cultural roots of forms such as classical Chinese dance and Tai Chi, or support creative, wellbeing and performance programmes. Every session is planned around your group's size, level and learning goals, and can be delivered as a one-off experience or a series. Tell us about your group and what you hope to achieve, and we'll put together a programme and quote that fits.",
          cta: { label: "Enquire", href: "/contact?subject=private-lessons", variant: "secondary" },
          gallery: [
            {
              src: "/images/events/ballet-masterclass.svg",
              alt: "Young dancers in a workshop",
            },
            {
              src: "/images/hero/slide-6.jpg",
              alt: "Workshop session with students",
            },
            {
              src: "/images/courses/junior-ballet.svg",
              alt: "Ballet foundation class",
            },
          ],
        },
      ],
      howItWorks: {
        title: "How it works",
        steps: [
          {
            title: "Tell us your plans",
            body: "the occasion, group size and preferred dates.",
          },
          {
            title: "We design your session",
            body: "style, teacher, length and a clear quote.",
          },
          {
            title: "Enjoy the experience",
            body: "arrive, relax and dance.",
          },
        ],
      },
      cta: {
        title: "Plan your experience",
        body: "Send us a few details and our team will be in touch.",
        button: {
          label: "Enquire now",
          href: "/contact?subject=private-lessons",
          variant: "primary",
        },
        secondary: "WeChat: 18518614868 · Instagram: @countyhalldancecentre",
      },
    },

    classesInfo: {
      meta: {
        title: "Class Descriptions & Instructors",
        description:
          "Class descriptions and instructor profiles for adult classes at County Hall Dance Centre.",
      },
      hero: {
        overline: "Classes",
        title: "Class Descriptions & Instructors",
        subtitle: "Explore our adult dance and movement programme and meet the teaching team.",
      },
      intro:
        "Every class is clearly labelled Beginner, Open Level or Intermediate. Beginners welcome — no dance experience needed.",
      sections: [
        { id: "descriptions", title: "Class Descriptions" },
        { id: "instructors", title: "Instructors" },
      ],
    } satisfies SectionedPageContent,

    classBooking: {
      meta: {
        title: "Class Booking",
        description: "Book adult dance and movement classes at County Hall Dance Centre.",
      },
      hero: {
        overline: "Classes",
        title: "Booking",
        subtitle: "View live availability and reserve your place through our booking partner.",
      },
      intro:
        "Choose a class from the timetable and follow the booking link. Advance booking is recommended.",
      sections: [
        { id: "how-to-book", title: "How to book" },
        { id: "policies", title: "Booking policies" },
      ],
    } satisfies SectionedPageContent,

    tasterClasses: {
      meta: {
        title: "Taster Classes",
        description: "Try a taster class at County Hall Dance Centre.",
      },
      hero: {
        overline: "Classes",
        title: "Taster Classes",
        subtitle: "New to the Centre? Start with a taster and find the class that suits you.",
      },
      intro:
        "Taster classes are a low-commitment way to experience our teaching, venue and community before enrolling.",
      sections: [
        { id: "available-tasters", title: "Available taster classes" },
        { id: "what-to-bring", title: "What to bring" },
      ],
    } satisfies SectionedPageContent,

    membership: {
      overview: {
        meta: {
          title: "Membership",
          description:
            "County Hall Dance Centre membership — monthly, quarterly and annual plans with member discounts, priority booking, community events and reduced venue hire rates.",
        },
        hero: {
          overline: "Dance more, belong more",
          title: "Membership",
          subtitle:
            "Make dance part of your week — and become part of a creative community at London's iconic County Hall.",
        },
        intro:
          "Membership is the best way to experience County Hall Dance Centre. Choose a plan that suits your routine and enjoy classes across Contemporary, Chinese Dance, Tango, Yoga, Tai Chi and K-Pop — plus exclusive discounts, priority access to events and a friendly community of fellow movers. Whether you're starting out or deepening your practice, our members get more from every visit.",
        plans: {
          title: "Plans",
          items: [
            {
              id: "monthly",
              title: "Monthly Membership",
              price: "£[TBC] / month",
              body: "Flexible and easy to start. Ideal if you want to build a regular practice without a long commitment.",
            },
            {
              id: "quarterly",
              title: "Quarterly Membership",
              price: "£[TBC] / quarter",
              body: "Three months of classes and member benefits — a great way to see real progress.",
            },
            {
              id: "annual",
              title: "Annual Membership",
              price: "£[TBC] / year",
              body: "Our best value. A full year of dance, community and member-only perks.",
            },
          ],
          cta: {
            label: "Join now",
            href: "mailto:membership@countyhalldancecentre.com?subject=Membership%20enquiry",
            variant: "primary",
            external: true,
          },
        },
        styles: {
          title: "Class styles included",
          items: [
            "Contemporary",
            "Chinese Dance",
            "Tango",
            "Yoga",
            "Tai Chi",
            "K-Pop",
          ],
        },
        benefits: {
          title: "Member benefits",
          items: [
            {
              title: "Workshop & masterclass discounts",
              body: "Save on workshops, masterclasses and intensive courses.",
            },
            {
              title: "Priority registration",
              body: "Be first to sign up for performances, showcases and special events.",
            },
            {
              title: "Event ticket discounts",
              body: "Reduced prices on performance and event tickets.",
            },
            {
              title: "Merchandise discounts",
              body: "Savings on County Hall merchandise, dancewear and dance shoes.",
            },
            {
              title: "Reduced venue hire",
              body: "Member rates on venue and practice-space hire (from £100 per hour on weekdays).",
            },
            {
              title: "Partner offers",
              body: "Exclusive discounts with our partner businesses.",
            },
            {
              title: "Members-only events",
              body: "Community classes, parties, theatre trips and social gatherings.",
            },
            {
              title: "Member community",
              body: "Join our private members' group to stay connected.",
            },
            {
              title: "Refer a friend",
              body: "Earn rewards when a friend joins.",
            },
            {
              title: "Points & rewards",
              body: "Collect points for attendance and redeem them for rewards.",
            },
          ],
        },
        howToJoin: {
          title: "How to join",
          steps: [
            "Choose your plan.",
            "Email us at membership@countyhalldancecentre.com with the plan you'd like.",
            "Complete your registration and payment.",
            "Start booking classes and enjoying your member benefits.",
          ],
        },
        faq: {
          title: "Membership FAQ",
          items: [
            {
              id: "membership-faq-trial",
              question: "Do you offer free trial classes?",
              answer:
                "We don't offer free trial classes, but you're welcome to book a trial class before you join. Email membership@countyhalldancecentre.com and we'll gladly help you choose the class and plan that's right for you.",
            },
            {
              id: "membership-faq-styles",
              question: "Which classes are included?",
              answer:
                "Membership covers our class styles: Contemporary, Chinese Dance, Tango, Yoga, Tai Chi and K-Pop.",
            },
            {
              id: "membership-faq-hire",
              question: "How do I get member rates for venue hire?",
              answer: "Simply mention your membership when you enquire.",
            },
          ],
        },
        cta: {
          title: "Ready to join?",
          body: "Email our membership team and we'll help you find the plan that suits you best.",
          button: {
            label: "Join now",
            href: "mailto:membership@countyhalldancecentre.com?subject=Membership%20enquiry",
            variant: "primary",
            external: true,
          },
          secondary: "membership@countyhalldancecentre.com",
        },
      },
      subpages: [
        {
          slug: "member-benefits",
          meta: {
            title: "Member Benefits",
            description: "Benefits of membership at County Hall Dance Centre.",
          },
          hero: {
            overline: "Membership",
            title: "Member Benefits",
            subtitle: "A more flexible way to keep dancing, join events and belong to the community.",
          },
          intro:
            "Membership offers ongoing access to classes, events and community benefits — details to be confirmed before launch.",
          sections: [
            { id: "benefits", title: "What's included" },
            { id: "how-to-join", title: "How to join" },
          ],
        },
        {
          slug: "monthly-passes",
          meta: {
            title: "Monthly Passes",
            description: "Monthly pass options at County Hall Dance Centre.",
          },
          hero: {
            overline: "Membership",
            title: "Monthly Passes",
            subtitle: "Flexible monthly options for regular class attendance.",
          },
          intro:
            "Monthly passes will be published with validity, cancellation policy and transferability before online booking opens.",
          sections: [
            { id: "pass-options", title: "Pass options" },
            { id: "terms", title: "Terms" },
          ],
        },
        {
          slug: "booking-access",
          meta: {
            title: "Booking Access",
            description: "Member booking access at County Hall Dance Centre.",
          },
          hero: {
            overline: "Membership",
            title: "Booking Access",
            subtitle: "How members reserve classes and events through our booking system.",
          },
          intro:
            "Members will receive booking access through our online timetable and companion app — details to follow via our app partner.",
          sections: [
            { id: "member-booking", title: "Member booking" },
            { id: "support", title: "Support" },
          ],
        },
      ] satisfies (SectionedPageContent & { slug: string })[],
    },

    joinUs: {
      meta: {
        title: "Join Us",
        description: "Join the team at County Hall Dance Centre.",
      },
      hero: {
        overline: "About Us",
        title: "Join Us",
        subtitle: "Teaching, creative and operational opportunities at County Hall Dance Centre.",
      },
      intro:
        "We are building a welcoming creative community on the South Bank. Expressions of interest from teachers, artists and collaborators are welcome.",
      sections: [
        { id: "opportunities", title: "Opportunities" },
        { id: "apply", title: "How to apply" },
      ],
    } satisfies SectionedPageContent,

    membershipTerms: {
      meta: {
        title: "Membership Terms",
        description: "Membership terms and conditions at County Hall Dance Centre.",
      },
      hero: {
        overline: "About Us",
        title: "Membership Terms",
        subtitle: "Terms governing membership passes, booking access and cancellation.",
      },
      intro:
        "Final membership terms, including validity, cancellation policy and transferability, will be published before online booking opens.",
      sections: [
        { id: "general", title: "General terms" },
        { id: "cancellation", title: "Cancellation policy" },
      ],
    } satisfies SectionedPageContent,

    about: {
      meta: {
        title: "About Us",
        description:
          "Learn about County Hall Dance & Performing Arts School — our history, values, and faculty.",
      },
      hero: {
        overline: "Our school",
        title: "About County Hall Dance & Performing Arts School",
        subtitle:
          "Discover dance, movement and creative experiences at London's iconic County Hall",
        image: { src: "/images/about/teaser.svg", alt: "County Hall Dance venue" },
      } satisfies PageHeroContent,
      story: {
        title: "Our story",
        paragraphs: [
          "County Hall Dance Centre is a new home for dance, movement and creativity in the heart of London. Located inside the iconic County Hall on the South Bank, the Centre brings together the best dance classes, workshops, social dances, private experiences and special events. More than a dance venue, it is a welcoming creative community where people can move, learn, connect and enjoy the arts together.",
        ],
      },
      values: {
        overline: "What guides us",
        title: "Our values",
        items: [
          { title: "Mission", description: "To make high-quality dance and mind-body classes open, welcoming, and connected in the heart of London." },
          { title: "Vision", description: "To grow from a dedicated professional dance space into a creative destination that brings together dance, performing arts, music, visual arts, and international cultural exchange." },
          { title: "Philosophy", description: "Move. Create. Connect. Belong. — helping adults of every background and level of experience build confidence, wellbeing, and a sense of belonging through the arts." },
          { title: "Safeguarding", description: "Robust policies ensuring every student feels secure and supported." },
        ],
      },
      faculty: {
        id: "faculty",
        overline: "Meet the team",
        title: "Our faculty",
        intro: "Our teachers are working artists and experienced educators, selected for both technical expertise and pastoral care.",
        members: [
          {
            id: "faculty-kiki",
            name: "Kiki",
            role: "Company Director and Artistic Director",
            bio: "A highly experienced choreographer and large-scale performance director, Kiki shapes the Centre's artistic programme and its connection between dance, music, visual art and culture.",
            image: { src: "/images/faculty/kiki.svg", alt: "Kiki" },
          },
          {
            id: "faculty-michael",
            name: "Michael",
            role: "Company Director and Management and Marketing Lead",
            bio: "Michael brings extensive international film, television and production-management experience, leading operations, partnerships, communications and business development.",
            image: { src: "/images/faculty/michael.svg", alt: "Michael" },
          },
        ] satisfies FacultyMember[],
      },
      cta: {
        title: "Visit us",
        body: "We would love to welcome you for a trial class or a tour of the venues.",
        button: { label: "Get in touch", href: "/contact", variant: "primary" },
      },
    },

    booking: {
      meta: {
        title: "Booking & Enquiries",
        description:
          "Send a booking or general enquiry to County Hall Dance Centre — venue hire, classes, membership and more.",
      },
      hero: {
        overline: "We'd love to hear from you",
        title: "Booking & Enquiries",
        subtitle:
          "Complete the form below and our team will respond by email within two working days.",
      } satisfies PageHeroContent,
      form: {
        title: "Send an enquiry",
        description:
          "Tell us what you are looking for — venue hire, class booking, membership or a general question.",
        submitLabel: "Send message",
        successMessage:
          "Thank you — your enquiry has been received. We will be in touch shortly.",
        selectPlaceholder: "Select an option",
        action: "#",
        fields: [
          {
            name: "name",
            label: "Full name",
            type: "text",
            placeholder: "Your name",
            required: true,
          },
          {
            name: "email",
            label: "Email address",
            type: "email",
            placeholder: "you@example.com",
            required: true,
          },
          {
            name: "phone",
            label: "Phone (optional)",
            type: "tel",
            placeholder: "+44 …",
          },
          {
            name: "about",
            label: "Enquiry about",
            type: "select",
            required: true,
            options: [
              { label: "Venue Hire", value: "venue-hire" },
              { label: "Classes Booking", value: "classes-booking" },
              { label: "Membership Booking", value: "membership-booking" },
              { label: "General Enquire", value: "general-enquire" },
            ],
          },
          {
            name: "message",
            label: "Message",
            type: "textarea",
            placeholder: "Please include any relevant details — dates, class names, group size, etc.",
            required: true,
          },
        ] satisfies FormField[],
      },
    },

    contact: {
      meta: {
        title: "Contact",
        description: "Get in touch with County Hall Dance & Performing Arts School.",
      },
      hero: {
        overline: "We'd love to hear from you",
        title: "Contact",
        subtitle: "Questions about classes, courses, private events, or anything else — send us a message.",
      } satisfies PageHeroContent,
      details: {
        title: "Venue details",
        address: [
          "2nd Floor, County Hall Main Entrance",
          "Belvedere Road",
          "London SE1 7PB",
        ],
        phone: "+44 7728 617531",
        email: "info@countyhalldancecentre.com",
        hours: "Office hours: Mon – Fri, 9:00 – 17:30",
        wechat: "WeChat: 18518614868",
        instagramLabel: "Instagram: @countyhalldancecentre",
        instagramHref: "https://www.instagram.com/countyhalldancecentre",
        membershipLabel: "Membership enquiries: membership@countyhalldancecentre.com",
        membershipHref: "mailto:membership@countyhalldancecentre.com",
        gettingHere:
          "Getting here: a five-minute walk from Waterloo and Westminster stations.",
      },
      map: {
        title: "Find us",
        embedUrl: "https://maps.google.com/maps?q=County+Hall+Main+Entrance,+Belvedere+Road,+London+SE1+7PB&output=embed",
        directionsLabel: "Open in Google Maps →",
        directionsHref: "https://share.google/7weL1s5w3ItPjJyAZ",
      },
      form: {
        title: "Send an enquiry",
        description: "Complete the form below and we will respond within two working days.",
        submitLabel: "Send message",
        successMessage: "Thank you — your message has been received. We will be in touch shortly.",
        selectPlaceholder: "Select an option",
        action: "#",
        fields: [
          { name: "name", label: "Full name", type: "text", placeholder: "Your name", required: true },
          { name: "email", label: "Email address", type: "email", placeholder: "you@example.com", required: true },
          { name: "phone", label: "Phone (optional)", type: "tel", placeholder: "+44 …" },
          {
            name: "subject",
            label: "Subject",
            type: "select",
            required: true,
            options: [
              { label: "General enquiry", value: "general" },
              { label: "Classes & timetable", value: "classes" },
              { label: "Membership", value: "membership" },
              { label: "Private lessons & experiences", value: "private-lessons" },
              { label: "Venue hire", value: "venue-hire" },
              { label: "Events", value: "events" },
              { label: "Gift cards", value: "gift-cards" },
            ],
          },
          { name: "message", label: "Message", type: "textarea", placeholder: "How can we help?", required: true },
        ] satisfies FormField[],
      },
    },

    faq: {
      meta: {
        title: "FAQ",
        description: "Frequently asked questions about classes, courses, and bookings at CHD PAS.",
      },
      hero: {
        overline: "Help centre",
        title: "Frequently asked questions",
        subtitle: "Quick answers to common questions. Still unsure? Contact our friendly team.",
      } satisfies PageHeroContent,
      items: [
        {
          id: "faq-1",
          question: "How do I book a class?",
          answer:
            "Visit our Timetable & Booking page and use the booking widget to select a class. You will be directed to our external booking partner to complete registration and payment.",
        },
        {
          id: "faq-2",
          question: "Can I try a class before committing?",
          answer:
            "Yes — you can book a trial class from our Timetable page. Please note that trial classes are not free. If you're unsure which class suits you, contact us and we'll help you choose.",
        },
        {
          id: "faq-4",
          question: "How are courses different from regular classes?",
          answer:
            "Courses run for a fixed term with a structured syllabus and limited places. Regular classes can often be booked on a rolling basis via the timetable.",
        },
        {
          id: "faq-6",
          question: "How do I book an event or masterclass?",
          answer:
            "Events are booked directly via the Book Now button on each event page. Payments are processed securely through Stripe.",
        },
        {
          id: "faq-hire",
          question: "Can I hire the venue?",
          answer:
            "Yes — our 70 m² vinyl-floor venue and 200 m² wooden-floor hall can be hired separately or together, from £200 per hour (member rates available). See Venue Hire for details.",
        },
        {
          id: "faq-7",
          question: "How do I get there?",
          answer:
            "We're a five-minute walk from both Waterloo and Westminster stations.",
        },
      ] satisfies FaqItem[],
      cta: {
        text: "Can't find what you need?",
        button: { label: "Contact us", href: "/contact", variant: "primary" },
      },
    },

    giftCards: {
      meta: {
        title: "Gift Cards",
        description: "Give the gift of dance with a CHD PAS gift card.",
      },
      hero: {
        overline: "A thoughtful gift",
        title: "Gift Cards",
        subtitle: "Perfect for birthdays, holidays, or encouraging someone to take their first class.",
      } satisfies PageHeroContent,
      intro:
        "Gift cards can be redeemed against classes, courses, workshops, and merchandise. They are delivered by email and valid for twelve months from purchase.",
      options: [
        {
          id: "gift-25",
          title: "£25 Gift Card",
          amount: "£25",
          description: "Ideal for a single workshop or as a contribution towards term fees.",
          cta: {
            label: "Buy £25 card",
            href: "https://buy.stripe.com/example-gift-25",
            external: true,
            variant: "secondary",
          },
        },
        {
          id: "gift-50",
          title: "£50 Gift Card",
          amount: "£50",
          description: "Covers several drop-in classes or part of a term enrolment.",
          cta: {
            label: "Buy £50 card",
            href: "https://buy.stripe.com/example-gift-50",
            external: true,
            variant: "secondary",
          },
        },
        {
          id: "gift-100",
          title: "£100 Gift Card",
          amount: "£100",
          description: "A generous gift towards a full course or multiple masterclasses.",
          cta: {
            label: "Buy £100 card",
            href: "https://buy.stripe.com/example-gift-100",
            external: true,
            variant: "primary",
          },
        },
      ] satisfies GiftCardOption[],
      terms:
        "Gift cards are non-refundable and cannot be exchanged for cash. Remaining balances stay on the card until used. Contact us for custom amounts.",
    },
  },

  ui: {
    sectionedPage: {
      comingSoon: "Content for this section is coming soon.",
    },
    header: {
      mainNavigation: "Main navigation",
      mobileNavigation: "Mobile navigation",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      submenuSuffix: " submenu",
    },
    hero: {
      featuredHighlights: "Featured highlights",
      slideNavigation: "Slide navigation",
      slidePrefix: "Slide",
    },
    booking: {
      preferDirectPrefix: "Prefer to reach us directly? Email",
      orCall: "or call",
    },
    form: {
      requiredMarker: " *",
    },
  },
} as const;

export type SiteSource = typeof siteSource;
