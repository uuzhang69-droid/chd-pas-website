# Courses: public display plan for the start-up stage (analysis only)

Date: 14 November 2026. Nothing in the website, data, Sanity or CMS schema was changed.
This replaces step 3 of `docs/course-consistency-audit.md`. The `/courses` section stays public: it stays in the
footer, the sitemap and search results. Nothing below hides, removes or de-indexes it.

## 1. Principles (as confirmed)

1. Courses is the long-term home for showing and managing programmes.
2. Classes introduces dance styles, teaching approach and teachers.
3. Timetable shows what is actually scheduled. `schedule.json` is the early-stage source for that, not a test of whether a course or service exists.
4. A course with no timetable slot still belongs on the website.
5. The site has just opened, so Courses should show the programme direction.

The real risk is narrower than "unscheduled courses exist". It is that the pages currently read as if the course is
open for booking.

## 2. What the Courses pages currently promise

Listing card: a **term** line (Autumn Term 2026, Rolling enrolment, Spring Term 2027), title, level, excerpt.
Detail page: term, level, three boxes (**Duration**, **Schedule**, **Price**), description, "What's included", and a
primary button **"Enrol via timetable"** that goes to `/timetable`.

Two things combine to mislead: every course has an enrolment button, and the Timetable page sends visitors back
with "For course enrolment, visit our courses page" and a "Browse courses" button. Visitors go in a circle, and
none of these courses is on the timetable.

## 3. Course by course

Items below come from the content data. "Direction" means a statement that can stay as programme description
without implying a date. "Specifics" are details a visitor would rely on when deciding to enrol.

| Course | Direction that can stay | Specifics that look like samples | Needs your confirmation |
|--------|-------------------------|----------------------------------|-------------------------|
| **Junior Ballet Foundation** | Introduction to classical ballet; posture, port de bras, basic allegro; nurturing environment | "Autumn Term 2026" (already under way), Saturdays 10:00–11:00, 12 weeks, £168 per term, ages 6–9, handbook and end-of-term sharing | Whether children's classes are planned at all (the rest of the site is adult-only, and the safeguarding and age policy would need to apply). Teacher. Real age range |
| **Teen Contemporary Intensive** | Contemporary technique, release, improvisation, choreographic tasks for teens | "Autumn Term 2026", Wednesdays 17:30–19:00, 10 weeks but priced "per term", £195, "school showcases and optional audition pieces", guest artist Q&A | Whether teens are in scope; relation to the Contemporary style and its teachers; whether it is really a term course or a short intensive |
| **Adult Ballet Open** | A welcoming adult ballet class for beginners and returners; barre and centre work; new enchaînements each block | **"Rolling enrolment"** (states that enrolment is open), Mondays 19:00–20:15, six-week blocks, £96 per block, "technique notes via email", "optional class video" | Whether ballet will be offered; teacher; whether recording and email notes are real |
| **Musical Theatre Performance** | Triple-threat training that ends in a small sharing | "Spring Term 2027", Saturdays 13:00–16:00, 14 weeks, £320, vocal coaching, costume hire | Teacher and vocal coach (nothing else on the site mentions them); whether the course is planned for 2027 |

Placeholder images: all four use the `/images/courses/*.svg` illustrations. Keep them until real photos exist; they
are not a problem in themselves, but they look like drafts on a public page.

Sorting the fields, for all four courses:

- **Safe as programme direction:** title, level (as a guide), excerpt, description paragraphs, the general course format ("weekly class", "end-of-term sharing" as an intention).
- **Probably sample data:** term or dates, weekday and time, duration in weeks, price, ages, "Rolling enrolment", the extras under "What's included" (handbook, class video, email notes, vocal coaching, costume hire, guest Q&A).
- **Needs a person to confirm:** whether each course is real and intended, who teaches it, ages, the term it is aimed at, and the price, if one is shown at all.

## 4. How the other sections relate

| Section | Role | Relationship to Courses | Issue |
|---------|------|-------------------------|-------|
| Classes | Styles, approach, teachers (five styles) | Courses may later link to a style. Ballet and musical theatre have no style page or teacher yet | None needed: Courses does not require a Classes counterpart. Do not add Ballet or Musical Theatre to Classes until a teacher is confirmed |
| Timetable | Sessions that are actually scheduled | Only courses that are scheduled or enrolling should point here | Today's link in both directions creates the loop in section 2 |
| Membership | Discounts and benefits | The benefit "Workshop & masterclass discounts… and intensive courses" quietly assumes courses exist | Decide whether course fees get a member discount; until then leave as is. Separate issue (not about Courses): the style list on the Membership page includes Meditation, which is not offered anywhere else |
| Private Lessons | One-to-one, couples, wedding, groups, corporate, organisations | Independent of Courses. Its gallery reuses `junior-ballet.svg` for "Ballet foundation class" | Replace that placeholder image with a real photo at some point |
| `schedule.json` | What is on the timetable now | A course appearing in it is evidence that it is scheduled, but its absence means nothing | Nothing should be bound to it |

K-Pop and Meditation follow the same principle: they may be shown as programme ideas, but a Membership line that
says membership "covers" them promises classes. They need their own wording, decided by you.

## 5. Proposed status model

A status set by a person for each course, never derived from `schedule.json`.

| Status | Meaning | Shown to visitors | Button |
|--------|---------|-------------------|--------|
| **Enrolling Now** | Real dates, price and a working way to book | Term or dates, schedule, price, duration | "Enrol now" to the real booking route (Timetable, ClassManager, Eventbrite or email) |
| **Scheduled** | Sessions are fixed; booking has not opened yet, or opens on a date | Dates and times; price if final | "View timetable" or "Register your interest" until booking opens |
| **Planned** | The school intends to run it; dates are not fixed | Description, level, duration as a guide, expected term if you want | "Register your interest" |
| **Register Your Interest** | Showing the idea to gauge demand; no commitment | Description and level only | "Register your interest" |

Recommendation: keep the four labels but treat "Register your interest" as the **button** that Planned and
Register Your Interest share, because it is an action rather than a state. If you prefer fewer labels, three are
enough (Enrolling Now, Scheduled, Planned) with that button.

**No course is given a status in this analysis.** Each needs your decision.

**Safe default:** a course with no status set should behave as the most cautious option: show description and level
only, hide the Schedule and Price boxes and the term line, replace "Enrol via timetable" with "Register your
interest", and add one line: "Dates, times and fees will be confirmed." That keeps all four pages public and
informative while nothing says they are open. It also means editing a status later changes one value rather than
the layout.

## 6. Minimal changes (proposed, not applied)

1. Add an optional `status` field (and, if wanted, an optional short `statusNote`) to course content, plus a small label component. Existing data keeps working because the field is optional.
2. Course card and detail page: show the status label; show Duration, Schedule, Price and the term only when the status is Enrolling Now or Scheduled and the value is present; choose the button from the status.
3. "Register your interest" can use the existing contact form: `/contact?course=<course title>` is already supported by the contact prefill code, so no new form is required.
4. Wording: change the Timetable sentence "For course enrolment, visit our courses page" to "Explore our course programme", and keep the "Browse courses" button (it stays valid). Keep the footer link and the sitemap entries exactly as they are.
5. Keep course structured data (Schema.org `Course`) switched off until at least one course is Enrolling Now or Scheduled with confirmed details.
6. Course meta descriptions can stay: they describe the programme and do not claim enrolment.
7. Leave Membership, Private Lessons and Classes unchanged apart from the two small items in section 4 (decide the discount policy; replace one placeholder image).
8. Do not touch the Calendar, Sanity, the CMS schema or the import and export scripts.

## 7. Questions for you

1. For each of the four courses: is it a real programme you intend to offer? If so, which status, if any, should it carry now, and what should the button say?
2. Are children's classes (Junior Ballet, ages 6–9) and teen courses in scope?
3. Is ballet or musical theatre planned, and who would teach?
4. Should any price, day, time or term stay visible before a course is confirmed? (The proposal hides them by default.)
5. Is "Rolling enrolment" for Adult Ballet Open true today? (It currently says enrolment is open.)
6. Do member discounts apply to course fees?
7. Should "Register your interest" go to `/contact?course=…`, or do you prefer a different route (email, a form or a waiting list)?
