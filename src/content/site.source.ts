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
      "A refined London dance and performing arts school offering ballet, contemporary, jazz, drama, and more — for every age and stage.",
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
        label: "+44 20 7946 0958",
        href: "tel:+442079460958",
      },
      email: {
        label: "hello@countyhalldance.co.uk",
        href: "mailto:hello@countyhalldance.co.uk",
      },
      findUs: {
        label: "Find us",
        href: "https://maps.google.com/?q=County+Hall+London",
        external: true,
      },
      social: [
        {
          platform: "instagram",
          href: "https://instagram.com/countryhalldance",
          label: "Follow us on Instagram",
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
          label: "Studio Hire",
          href: "/studio-hire",
          children: [
            { label: "Our Space", href: "/studio-hire/our-space" },
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
          href: "/membership/member-benefits",
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
          label: "Shop",
          href: "/shop",
          children: [
            { label: "Dancewear", href: "/shop" },
            { label: "T-Shirts", href: "/shop" },
            { label: "Accessories", href: "/shop" },
            { label: "County Hall Merchandise", href: "/shop" },
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
          children: [
            { label: "Milonga", href: "/events/milonga" },
            { label: "Social Dance Nights", href: "/events/social-dance-nights" },
            { label: "Workshops", href: "/events/workshops" },
            { label: "Masterclasses", href: "/events/masterclasses" },
            { label: "Performances", href: "/events/performances" },
            { label: "Cross-Arts Events", href: "/events/cross-arts-events" },
          ] satisfies Link[],
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
        "County Hall Dance & Performing Arts School nurtures confidence, artistry, and joy through exceptional training in the heart of London.",
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
          "County Hall Dance Studio",
          "Belvedere Road",
          "London SE1 7GP",
        ],
        phone: "+44 20 7946 0958",
        email: "hello@countyhalldance.co.uk",
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
            alt: "Contemporary dancers in a bright studio with ballet barres",
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
          id: "hero-studio-hire",
          headline: "Studio Hire",
          blurb:
            "A South Bank space for dance, theatre and film rehearsals, castings, workshops and events.",
          cta: { label: "Studio Hire", href: "/contact?subject=studio-hire", variant: "primary" },
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
            alt: "Group dance class in a sunlit studio",
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
          description: "View the weekly timetable and reserve your place.",
        },
        {
          label: "Book an Event",
          href: "/events",
          description: "Term-length programmes with clear progression.",
        },
        {
          label: "Free Trial",
          href: "https://my.classmanager.com/county-hall-dance-centre/classes?mode=enrol",
          external: true,
          description: "Try a class with no obligation — we welcome newcomers.",
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
          location: "Studio A",
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
          location: "Studio B",
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
        "Adult classes in Contemporary, Chinese Dance, Tango, Yoga and Tai Chi — beginners welcome.",
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
        alt: "Students and teachers in the County Hall studio corridor",
      },
    },

    privateEvents: {
      overline: "Celebrate with us",
      title: "Private events & parties",
      body: "Host an unforgettable birthday, hen party, or team celebration in our beautiful studios. Choose a theme, bring your guests, and leave the choreography to us.",
      cta: { label: "Enquire", href: "/contact?subject=private-events", variant: "primary" },
      image: {
        src: "/images/private-events/promo.svg",
        alt: "Private dance party celebration in studio",
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
          "Browse classes by day and age group, then reserve through our secure booking partner.",
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
          "Adult classes in Contemporary, Chinese Dance, Tango, Yoga and Tai Chi at County Hall Dance Centre.",
      },
      hero: {
        overline: "Find your style",
        title: "Classes",
        subtitle:
          "Adult dance and movement classes for every background and level — beginners welcome.",
      } satisfies PageHeroContent,
      intro:
        "Explore adult classes in Contemporary, Chinese Dance, Tango, Yoga and Tai Chi. Every class is clearly labelled Beginner, Open Level or Intermediate.",
      cta: { label: "View timetable", href: "/timetable", variant: "primary" },
      detailLabels: {
        ageGroups: "Age groups",
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
            "End-of-term studio sharing",
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
          location: "Studio A",
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
          location: "Studio B",
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
            subtitle: "Social tango evenings with live and recorded music in our South Bank studio.",
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
            subtitle: "Learn from visiting artists and specialists in intimate studio settings.",
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

    studioHire: {
      overview: {
        meta: {
          title: "Studio Hire",
          description:
            "Hire a flexible dance and performing-arts space at County Hall on the South Bank.",
        },
        hero: {
          overline: "South Bank studios",
          title: "Studio Hire",
          subtitle:
            "A multi-purpose space for classes, rehearsals, workshops, social dances, cultural events and private hire.",
        },
        intro:
          "A flexible, multi-purpose dance and performing-arts space of around 300 m² (first phase), suitable for regular classes, rehearsals, workshops, social dances, cultural events and private hire.",
        sections: [
          { id: "space", title: "Space & facilities" },
          { id: "pricing", title: "Pricing" },
          { id: "enquiries", title: "Booking & enquiries" },
        ],
      } satisfies SectionedPageContent,
      subpages: [
        {
          slug: "our-space",
          meta: {
            title: "Our Space",
            description: "Studio space and facilities at County Hall Dance Centre.",
          },
          hero: {
            overline: "Studio Hire",
            title: "Our Space",
            subtitle:
              "Main dance and events space with wood floor, dance vinyl, mirrors, barres and flexible seating.",
          },
          intro:
            "Main dance and events space — around 300 m² in total, planned to include approx. 200 m² of wood floor and approx. 60 m² of professional dance vinyl, a mirrored wall, dance barres, a sound system, event lighting, a reception/lounge area and flexible seating.",
          sections: [
            { id: "facilities", title: "Facilities" },
            { id: "capacity", title: "Capacity" },
          ],
        },
        {
          slug: "space-booking",
          meta: {
            title: "Space Booking",
            description: "Enquire about studio hire at County Hall Dance Centre.",
          },
          hero: {
            overline: "Studio Hire",
            title: "Space Booking",
            subtitle: "Tell us your preferred date, activity and group size — we will respond with availability.",
          },
          intro:
            "Enquire via our Studio Hire form or email info@countyhalldancecentre.com. The form collects your preferred date and time, activity type, expected numbers, equipment needs and contact details.",
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
          "Private dance lessons and bespoke experiences at County Hall Dance Centre.",
      },
      hero: {
        overline: "Tailored for you",
        title: "Private Lessons & Experiences",
        subtitle:
          "One-to-one lessons, couples' dance, wedding first dances, group experiences, corporate events and school workshops.",
      },
      intro:
        "Services include private dance lessons; dance experiences for individuals, couples and groups; wedding first dances; corporate team experiences; school and organisation workshops; rehearsals, auditions, filming and private events; and Milonga and social dance events.",
      sections: [
        {
          id: "one-to-one",
          title: "One-to-One Lessons",
          body: "Personalised coaching tailored to your goals, level and schedule — from absolute beginners building confidence to experienced dancers refining technique.",
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
          body: "Learn together in a relaxed, supportive setting — whether you are preparing for a special occasion or simply want a shared creative experience.",
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
              alt: "Pair practising movement in the studio",
            },
          ],
        },
        {
          id: "wedding",
          title: "First Wedding Dance",
          body: "Choreography and coaching for your first dance — from a simple, elegant sway to a fully staged performance, paced to suit your timeline and comfort.",
          gallery: [
            {
              src: "/images/hero/slide-2.jpg",
              alt: "Couple practising a wedding dance",
            },
            {
              src: "/images/events/winter-showcase.svg",
              alt: "Performance lighting in the studio",
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
          body: "Celebrate with friends — hen parties, birthdays and social groups welcome themed sessions, from tango tasters to musical theatre and creative movement.",
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
              alt: "Group class in the studio",
            },
          ],
        },
        {
          id: "corporate",
          title: "Corporate Events",
          body: "Team-building through movement — energising, inclusive sessions designed for workplaces, away days and client hospitality at County Hall.",
          gallery: [
            {
              src: "/images/hero/slide-3.jpg",
              alt: "Corporate group movement session",
            },
            {
              src: "/images/hero/slide-1.jpg",
              alt: "Team workshop in the dance studio",
            },
            {
              src: "/images/events/contemporary-intensive.svg",
              alt: "Professional studio environment",
            },
          ],
        },
        {
          id: "schools",
          title: "School / Organisation Workshops",
          body: "School visits, youth groups and community organisations — curriculum-linked or enrichment workshops led by experienced educators and artists.",
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
    } satisfies SectionedPageContent,

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
        "Taster classes are a low-commitment way to experience our teaching, studio and community before enrolling.",
      sections: [
        { id: "available-tasters", title: "Available taster classes" },
        { id: "what-to-bring", title: "What to bring" },
      ],
    } satisfies SectionedPageContent,

    membership: {
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

    shop: {
      meta: {
        title: "Shop",
        description: "Dancewear, merchandise and accessories at County Hall Dance Centre.",
      },
      hero: {
        overline: "Merchandise",
        title: "Shop",
        subtitle: "Dancewear, T-shirts, accessories and County Hall merchandise.",
      },
      intro:
        "A Merchandise / Coming Soon page online, with sales also available at the front desk. Categories include dancewear, T-shirts, dance socks, tote and dance bags, water bottles, accessories and gift cards.",
      sections: [
        { id: "dancewear", title: "Dancewear" },
        { id: "t-shirts", title: "T-Shirts" },
        { id: "accessories", title: "Accessories" },
        { id: "merchandise", title: "County Hall Merchandise" },
      ],
    } satisfies SectionedPageContent,

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
        image: { src: "/images/about/teaser.svg", alt: "County Hall Dance studio" },
      } satisfies PageHeroContent,
      story: {
        title: "Our story",
        paragraphs: [
          "County Hall Dance Centre is a new home for dance, movement and creativity in the heart of London. Located inside the iconic County Hall on the South Bank, the Centre brings together the best dance classes, workshops, social dances, private experiences and special events. More than a dance studio, it is a welcoming creative community where people can move, learn, connect and enjoy the arts together.",
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
        body: "We would love to welcome you for a trial class or a tour of the studios.",
        button: { label: "Get in touch", href: "/contact", variant: "primary" },
      },
    },

    booking: {
      meta: {
        title: "Booking & Enquiries",
        description:
          "Send a booking or general enquiry to County Hall Dance Centre — studio hire, classes, membership and more.",
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
          "Tell us what you are looking for — studio hire, class booking, membership or a general question.",
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
              { label: "Studio Hire", value: "studio-hire" },
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
        title: "Studio details",
        address: [
          "County Hall Dance Studio",
          "Belvedere Road",
          "London SE1 7GP",
        ],
        phone: "+44 20 7946 0958",
        email: "hello@countyhalldance.co.uk",
        hours: "Office hours: Mon – Fri, 9:00 – 17:30",
      },
      map: {
        title: "Find us",
        embedUrl: "https://maps.google.com/maps?q=County+Hall+London&output=embed",
        directionsLabel: "Open in Google Maps →",
        directionsHref: "https://maps.google.com/?q=County+Hall+London",
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
              { label: "Courses", value: "courses" },
              { label: "Private events", value: "private-events" },
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
          question: "Can my child try a class before committing?",
          answer:
            "Yes. We offer a complimentary trial for new students on selected classes. Choose the trial option when booking through the timetable.",
        },
        {
          id: "faq-3",
          question: "What should my child wear to their first ballet class?",
          answer:
            "Comfortable activewear is fine for a trial. If they continue, we will provide a uniform list — typically leotard, tights, ballet shoes, and hair in a neat bun.",
        },
        {
          id: "faq-4",
          question: "How are courses different from regular classes?",
          answer:
            "Courses run for a fixed term with a structured syllabus and limited places. Regular classes can often be booked on a rolling basis via the timetable.",
        },
        {
          id: "faq-5",
          question: "Do you offer exams?",
          answer:
            "Optional examinations are available in ballet, tap, and drama through recognised awarding bodies. Your child's teacher will advise when they are ready.",
        },
        {
          id: "faq-6",
          question: "How do I book an event or masterclass?",
          answer:
            "Events are booked directly via the Book Now button on each event page. Payments are processed securely through Stripe.",
        },
        {
          id: "faq-7",
          question: "Is there parking nearby?",
          answer:
            "There is limited on-site parking by arrangement. We recommend public transport — Waterloo station is a short walk from County Hall.",
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
