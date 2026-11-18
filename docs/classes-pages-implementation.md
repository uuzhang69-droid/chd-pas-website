# Classes pages implementation — 17 November 2026

## Export pipeline

The general exporter omitted Classes text fields such as summary, formatsNote and instructorHeading, and serialised imported Events objects inline. It now recognises the existing three independent Events modules and preserves their imports/references. Classes text fields and supporting-image alt text are exported.

Use `npm run content:export -- --classes` for a Classes-only update. This replaces only pages.classes in site.structure.ts, pages.classes.* copy entries and matching CSV rows. All other source bytes/records are retained. A full export was tested only in a temporary directory; unrelated existing full-export drift was not accepted.

Dry run: `npm run content:export -- --classes --output-dir node_modules/.cache/classes-preview`. Inspect the three output files before applying the scoped export. Do not use the general full export to overwrite unrelated local content without review.

The page retains Hero, About, Our Classes, What to Expect, Instructor and Final CTA. Optional about.image and formats[].image fields use the existing ImageAsset shape and Next Image, with natural proportions. Canonical URLs, structured data, breadcrumbs, timetable/contact destinations and search integration are retained. SEO titles use the full discipline title and descriptions were refreshed.

## Files changed in this implementation

- scripts/extract-copy.mts
- scripts/lib/scoped-content-export.mts (new)
- scripts/test-content-export.mts (new)
- src/app/classes/[slug]/page.tsx
- src/content/types.ts
- src/content/site.source.ts
- src/content/site.structure.ts (generated Classes subtree only)
- src/content/copy.ts (generated Classes entries only)
- content/website-copy.csv (generated Classes rows only)
- docs/classes-pages-implementation.md (this report)
- The four supporting images below (new)

## Supporting images

| Original under public/images/temp | Copy under public/images/classes |
| --- | --- |
| 5574.jpg | yoga/yoga-class.jpg |
| 5648.jpg | tango/argentine-tango-class.jpg |
| 6156.jpg | chinese-dance/chinese-dance-soft-training.jpg |
| 6246.jpg | chinese-dance/chinese-classical-dance-class.jpg |

All four copies are byte-identical to their originals. No originals, hero/cover photographs or instructor photographs were changed. No unapproved Contemporary or Tai Chi photographs were added.

## Validation

- Scoped content export: passed; 148 text entries exported.
- Classes, Search and content-export regression tests: 23 passed, 0 failed.
- TypeScript (npx tsc --noEmit): passed.
- Production build (npm run build -- --webpack): passed; all five class routes generated.
- Targeted ESLint: zero errors; one pre-existing unused rootLabels warning in the exporter.
- Full ESLint: three unrelated existing errors remain in scripts/import-existing-data.mts (explicit any), MembershipSection.tsx and TimetableGrid.tsx (state updates in effects). The new exporter naming error was fixed and targeted lint rerun.
- git diff --check: passed. Git reports existing LF/CRLF conversion notices, not whitespace errors.
- Desktop 1440px and mobile 390px reviews: all five pages rendered, all six sections and existing formats present; no mobile horizontal overflow. Supporting images loaded at natural proportions.
- Baseline hash comparison: only the seven intended existing files changed; every other pre-existing tracked/untracked file remained byte-identical.
- Source comparison: all non-Classes content unchanged; instructor values, original hero assets and CTA values unchanged. Instructor JSX block byte-identical.
- Events module references, unrelated copy values and unrelated CSV records are covered by regression tests. No Event descriptions, booking links, dates, imagery or metadata were edited.

No commit, push, merge, deployment, Sanity import or staging was performed. Existing unrelated uncommitted work was preserved.

## Remaining unconfirmed information

Soft Training's exact syllabus, exercises, intensity and level remain unconfirmed. No specific Tai Chi style/form, teacher qualifications or partner-rotation policy has been invented. These unknowns do not prevent publishing the conservative copy.

## Final editorial copy

The following records contain the final changed English copy. Instructor text is intentionally excluded because it is unchanged. Existing timetable and contact button destinations are unchanged.

### yoga

**metaDescription**

Explore Gentle Flow, Vinyasa Flow and Inside Flow yoga at County Hall Dance & Performing Arts School in London. View the timetable and booking information.

**hero / overline**

Breath and movement

**hero / title**

Yoga

**hero / subtitle**

Find a rhythm that suits the way you want to practise, with Gentle Flow, Vinyasa Flow and Inside Flow at County Hall.

**about / paragraphs 1**

Yoga brings physical practice together with attention to the breath and the body. In a movement-based class, that might mean noticing how you balance in a posture, how you move between positions, or where you are holding unnecessary effort. The physical practice is one part of a much broader tradition.

**about / paragraphs 2**

Our timetable lists three flow formats. They share an interest in connecting movement and breath, but differ in pace and emphasis. The descriptions below introduce those differences; individual sessions can vary.

**formats 1 / name**

Gentle Flow

**formats 1 / summary**

A slower approach to flowing practice, with more time to notice posture and transitions. It may appeal if you prefer an unhurried pace. “Gentle” describes the approach, rather than a guarantee that every movement will suit everyone.

**formats 2 / name**

Vinyasa Flow

**formats 2 / summary**

Movement from one posture to another is coordinated with the breath. The transitions are part of the practice, rather than simply a way to reach the next pose; pace and sequences vary between classes.

**formats 3 / name**

Inside Flow

**formats 3 / summary**

A music-led form of flowing yoga, connecting movement and breath to the rhythm of a song. Sequences are built up through the class, giving it a different character from a practice centred on holding individual postures.

**expect / items 1 / title**

Attention to transitions

**expect / items 1 / description**

How you arrive in and leave a posture can be as interesting as the posture itself. Flow practice gives those movements a place of their own.

**expect / items 2 / title**

Different rhythms

**expect / items 2 / description**

A preference for slower movement, flowing sequences or music-led practice can help you choose a format. Ask us if you would like help deciding where to start.

**expect / items 3 / title**

Planning your visit

**expect / items 3 / description**

Check the timetable for current sessions and follow the booking information. Contact us if you need to confirm what to bring or discuss access requirements.

**closing / title**

Choose your next practice

**closing / body**

See which yoga sessions are listed this month, then follow the booking information for your chosen class.

### tango

**metaDescription**

Get to know Argentine tango at County Hall Dance & Performing Arts School in London, with Beginner and Advanced classes. View the timetable.

**hero / overline**

Music and connection

**hero / title**

Argentine Tango

**hero / subtitle**

A social partner dance shaped by listening: to the music, to the person dancing with you, and to the space around you.

**about / paragraphs 1**

Argentine tango grew from the dance cultures of the Río de la Plata region of Argentina and Uruguay. In social dancing, partners make choices together as the music unfolds. A walk, a change of direction or a pause can carry as much expression as a more elaborate step.

**about / paragraphs 2**

It is distinct from ballroom tango, with its own musical traditions, embrace and movement vocabulary. Improvisation does not mean moving without technique: balance, clear weight changes and responsive leading and following give dancers the means to make choices in the moment.

**formats 1 / name**

Argentine Tango: Beginner

**formats 1 / summary**

Start with the foundations of Argentine tango: walking, balance and the communication between leading and following. You are welcome to attend on your own, without bringing a dance partner.

**formats 2 / name**

Argentine Tango: Advanced

**formats 2 / summary**

Our Advanced class is for dancers with tango experience. You can join individually without bringing a partner. If you are returning after a break or moving from another class, ask us about the experience expected.

**expect / items 1 / title**

Musical decisions

**expect / items 1 / description**

Tango is not only about which step comes next. The timing of a step or a pause changes how a dance relates to the music.

**expect / items 2 / title**

A shared dance

**expect / items 2 / description**

Leading and following depend on both partners paying attention. Connection is a continuing exchange rather than one person moving the other through a routine.

**expect / items 3 / title**

Come on your own

**expect / items 3 / description**

You do not need to bring a partner. Both Beginner and Advanced classes welcome individual bookings; choose the session that matches your experience.

**closing / title**

Find your tango class

**closing / body**

View the Beginner and Advanced sessions on the timetable. If you are unsure which class to choose, send us a question before booking.

### contemporary

**metaDescription**

Explore contemporary dance, movement and expression at County Hall Dance & Performing Arts School in London. Find class and booking information.

**hero / overline**

Weight, space and expression

**hero / title**

Contemporary Dance

**hero / subtitle**

Explore how movement changes when you shift its weight, timing or direction, and how those choices become dance.

**about / paragraphs 1**

Contemporary dance is a broad field rather than one fixed style. Different approaches work with weight, momentum, breath and the body's relationship to the floor. A phrase can feel very different when it is sustained, interrupted, released or driven through space.

**about / paragraphs 2**

Technique and creative exploration sit alongside one another. Contemporary practice can include taught movement phrases as well as improvisation; it is not simply a matter of making up movements without structure. The particular balance depends on the teacher and the class.

**formats 1 / name**

Contemporary Dance

**formats 1 / summary**

Our weekly Contemporary Dance class brings this varied discipline into a studio setting. If you are new to contemporary dance or coming from another style, ask us about the current class before booking.

**expect / items 1 / title**

Movement qualities

**expect / items 1 / description**

Weight and dynamics give a movement its character. The same gesture can feel light, grounded, sharp or sustained.

**expect / items 2 / title**

Space and phrasing

**expect / items 2 / description**

Direction, timing and the relationship between movements help shape a phrase. These are useful ideas to bring to both learning and watching contemporary dance.

**expect / items 3 / title**

Finding the right session

**expect / items 3 / description**

Use the timetable for current dates. If you are new to contemporary dance, or have experience in another style, ask us whether the class is a good starting point.

**closing / title**

Make space for contemporary dance

**closing / body**

Find the current class on the timetable and follow its booking information, or contact us to discuss joining.

### chinese-dance

**metaDescription**

Learn about Chinese dance and the Class 1 and Soft Training sessions listed at County Hall Dance & Performing Arts School in London.

**hero / overline**

Form and expression

**hero / title**

Chinese Dance

**hero / subtitle**

An introduction to a varied field of dance, where movement, rhythm and cultural context belong together.

**about / paragraphs 1**

Chinese dance includes distinct classical, folk and ethnic traditions. Chinese classical dance has developed as a stage discipline with its own technical training and expressive approaches. Folk and ethnic dances are rooted in particular communities and places, each with different rhythms, movement qualities and contexts.

**about / paragraphs 2**

Our Class 1 primarily focuses on Chinese Classical Dance, where coordinated movements of the torso, arms and gaze contribute to expressive phrasing. Soft Training is listed separately. The two sessions offer different points of focus within the programme, rather than interchangeable versions of the same class.

**formats 1 / name**

Chinese Dance: Class 1

**formats 1 / summary**

Primarily focused on Chinese Classical Dance. Coordinated movement of the torso, arms and gaze, shaped by rhythm and breath, gives this form its expressive character. Ask us about the current teaching focus if you are joining for the first time.

**formats 2 / name**

Chinese Dance: Soft Training

**formats 2 / summary**

A separate session within our Chinese Dance programme. Soft Training is commonly associated with flexibility and suppleness in dance, but the specific exercises and level of this class should be confirmed before booking.

**expect / items 1 / title**

Movement in context

**expect / items 1 / description**

A dance's style is more than its costume or an isolated gesture. Understanding where it comes from helps distinguish one tradition from another.

**expect / items 2 / title**

Coordination and expression

**expect / items 2 / description**

Relationships between the torso, arms, gaze and timing contribute to how movement is expressed. Their use differs between forms.

**expect / items 3 / title**

Choosing between sessions

**expect / items 3 / description**

Class 1 and Soft Training are separate timetable entries. Check the details for each rather than assuming one is a prerequisite for the other.

**closing / title**

Explore the Chinese dance programme

**closing / body**

View the two sessions on the timetable. For questions about their content or suitability, contact us before booking.

### tai-chi

**metaDescription**

Learn about Tai Chi and find the class timetable for County Hall Dance & Performing Arts School in London, with booking and contact information.

**hero / overline**

Attention in movement

**hero / title**

Tai Chi

**hero / subtitle**

Explore the relationship between balance, coordination and attention through a Chinese movement practice with martial roots.

**about / paragraphs 1**

Tai Chi, also known as Taijiquan, belongs to China's martial arts traditions. Many forms are practised through measured, connected sequences, with attention to posture, changes of weight and the coordination of the whole body.

**about / paragraphs 2**

A slow movement can ask for considerable attention: where your weight rests, how a turn begins, and how one position leads into another. Styles and teaching approaches differ, so Tai Chi should not be reduced to one fixed pace or a single sequence of exercises.

**formats 1 / name**

Tai Chi

**formats 1 / summary**

A weekly opportunity to practise Tai Chi at County Hall. The current listing does not specify a particular style or form; we can answer questions about the teaching approach before you join.

**expect / items 1 / title**

Noticing weight shifts

**expect / items 1 / description**

Moving weight from one foot to the other is a useful way to understand balance in motion, rather than only as a held position.

**expect / items 2 / title**

Connecting movements

**expect / items 2 / description**

Attention extends to the transitions between positions, helping you see a sequence as connected movement rather than separate shapes.

**expect / items 3 / title**

Questions before joining

**expect / items 3 / description**

Ask us about the class format and any access requirements you would like to discuss. The timetable provides dates and booking information.

**closing / title**

Take a closer look at Tai Chi

**closing / body**

Find the current session on the timetable, or get in touch to ask about the class before booking.
