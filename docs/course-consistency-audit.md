# Course data and public page consistency (analysis only, nothing changed)

Date: 14 November 2026. Source of truth for what is running: `public/schedule.json`.
CHDC (County Hall Dance Centre) and CHDPAS (County Hall Dance & Performing Arts School) are one organisation.

## 1. What `schedule.json` contains

`schedule.json` has **no teacher field**. Teachers can only be matched through the Classes pages, so a teacher
appearing on a Classes page does not prove they teach a given scheduled class.

Weekly classes active on or after 14 November (November block, ends 30 November):

| Style | Class | Day and time |
|-------|-------|--------------|
| Tai Chi | Tai Chi | Tue 18:30–19:30 |
| Contemporary | Contemporary Dance | Tue 19:40–20:40 |
| Yoga | Yoga (Gentle Flow) | Wed 18:30–19:30 |
| Tango | Argentine Tango (Beginner) | Wed 19:30–20:30 |
| Tango | Argentine Tango (Advanced) | Wed 20:30–21:30 |
| Chinese Dance | Chinese Dance (Class 1) | Thu 19:30–20:00 |
| Chinese Dance | Chinese Dance (Soft Training) | Thu 20:00–21:30 |
| Yoga | Yoga (Vinyasa Flow) | Fri 18:30–19:20 |
| Yoga | Yoga (Inside Flow) | Sat 13:00–14:30 |

October only (ended): Tango Intermediate, Tango Advanced (Sat), Tango Milonga (Sat 20:00–23:00), Yoga (Therapeutic Yoga, Thu), Chinese Dance Class 1/2.
One-off in the September trial week (past): Broadway Jazz (18 Sep), Sound Healing with Yoga, Yoga (Basic Flow / Flow Yoga / Ground Exploration).
One-off workshops: ¡Ojito! Workshops & Practilonga, 14 and 21 November (external booking page).

## 2. Comparison table

| Course | In schedule? | Teacher (from Classes page) | Classes page | Membership page (visible) | Courses page | Suggested status |
|--------|--------------|-----------------------------|--------------|---------------------------|--------------|------------------|
| Contemporary | Yes, Tue 19:40–20:40 | Christina & Yvonne | Yes | Yes | No | Currently Running |
| Chinese Dance | Yes, Thu (two classes) | Lisa Lin (RCDance) | Yes | Yes | No | Currently Running |
| Tango (Argentine) | Yes, Wed (Beginner, Advanced) | Rene | Yes | Yes | No | Currently Running |
| Yoga | Yes, Wed / Fri / Sat (three classes); Therapeutic Yoga was October only | Kasen Zhao (Sen Yoga) | Yes | Yes | No | Currently Running |
| Tai Chi | Yes, Tue 18:30–19:30 | Xintian Zhao (bio never mentions Tai Chi) | Yes | Yes | No | Currently Running (teacher to confirm) |
| K-Pop | **No** | None | No | Not shown on the page; in unseen content data (intro, style list, FAQ) | No | **Not Confirmed** |
| Meditation | **No** | None | No | **Yes** (style strip) | No | **Not Confirmed** |
| Broadway Jazz | One-off on 18 Sep only | None | No | No | No | Not Confirmed (not running) |
| Junior Ballet Foundation | **No** | None | No | No | Yes (sample) | **Not Confirmed** |
| Teen Contemporary Intensive | **No** (Wed 17:30 clashes with Yoga 18:30) | None | No | No | Yes (sample) | **Not Confirmed** |
| Adult Ballet Open | **No** (no Monday classes exist) | None | No | No | Yes (sample) | **Not Confirmed** |
| Musical Theatre Performance | **No** (Sat 13:00 clashes with Yoga Inside Flow) | None | No | No | Yes (sample) | **Not Confirmed** |

No course is currently suitable for "Coming Soon": nothing in the data says a future class is definitely planned.
K-Pop is deliberately **not** marked Coming Soon.

## 3. Where unconfirmed offers are promoted

- **K-Pop**
  - Home `<meta description>`, Open Graph and Twitter descriptions, and the **Organization JSON-LD description** (all come from `meta.defaultDescription`).
  - Private Lessons visible text: "a K-Pop routine" in Group Experiences.
  - Membership content data (not shown on the page): intro, style list item, FAQ "Which classes are included?".
- **Meditation**: Membership page style strip (hard-coded in `MembershipSection.tsx`), followed by "and more…".
- **Ballet / musical theatre**: only on `/courses` and its four detail pages. `/private-lessons` also reuses the placeholder `junior-ballet.svg` as a gallery image (alt "Ballet foundation class").
- **Broadway Jazz and "Performance"**: offered as Calendar filter options although no current session uses them.
- **Milonga**: Classes → Tango says "Join our social dance nights" and the (noindex) Milonga category says "regular milongas". The only Milonga in the schedule was in October; November has the two ¡Ojito! workshops.

## 4. `/courses` is almost certainly sample data

- No teacher, none appear in the schedule, Classes page or Membership page, and two clash with real classes.
- Placeholder SVG images; prices and terms such as "£168 per term" and "Spring Term 2027".
- Child ballet (ages 6–9), against an adult-classes positioning.
- Still public: Footer "Explore → Courses", Timetable page ("Browse courses" button and the sentence "For course enrolment, visit our courses page"), the sitemap, and breadcrumbs. Not in the main navigation.

## 5. Minimal change plan (proposed, not applied)

1. Remove K-Pop from the home meta description (this also fixes Open Graph, Twitter and the Organization description), Private Lessons, and the Membership content data. Keep K-Pop out of everything until a teacher and timetable slot are confirmed.
2. Membership style strip: replace "Meditation" and "and more…" with only the five scheduled styles, or remove the strip until you confirm.
3. `/courses`: **superseded.** Courses stays fully public (footer, sitemap, search). See `docs/course-display-plan.md` for the status-based display plan.
4. Replace the placeholder `junior-ballet.svg` image in Private Lessons with an existing real photo.
5. Do not add any "Coming Soon" label until a class is confirmed.
6. Optional, later: add an optional status field to class content (running / coming soon / not confirmed) so future classes are labelled in one place.

Not touched under any option: Calendar ordering, exceptions and booking logic, Sanity and the import/export scripts.

## 6. Questions for you

1. Are the four `/courses` courses real? If not, which option in step 3?
2. Is any K-Pop group experience offered through Private Lessons, or should that sentence go too?
3. Is Meditation offered, or should it leave the Membership page?
4. Which teacher runs Yoga Gentle Flow, and who teaches Tai Chi (the current bio is a ballet and choreography biography)?
5. Should Broadway Jazz stay in the Calendar filter even though it has no sessions?
6. Are regular Milongas planned after October?
