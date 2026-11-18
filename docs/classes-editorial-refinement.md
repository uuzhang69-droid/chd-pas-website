# Classes editorial refinement — 17 November 2026

This report supersedes the editorial copy and fixed six-section layout in classes-pages-implementation.md. That earlier report is preserved as the implementation history.

## Revised structures and reasons

- Contemporary: Hero → Movement with room for expression (two introductory paragraphs plus the actual weekly class description) → unchanged instructors → Join the class. The redundant single-format card and repeated movement explanations were merged into the introduction.
- Tai Chi: Hero → The detail in a slower movement (introduction plus weekly class description) → unchanged instructor → Practise Tai Chi with us. The single-format card is integrated into the introduction.
- Yoga: Hero → Space for your practice + existing photograph → Three ways to flow (three original formats) → unchanged instructor → Make time for yoga.
- Tango: Hero → A conversation on the dance floor + existing photograph → Beginner and Advanced classes → unchanged instructors → Join us for tango. The no-partner-required information appears once, in the introduction.
- Chinese Dance: Hero → Expression in every gesture + existing Classical Dance photograph → Two distinct sessions (Class 1 and Soft Training, retaining its photograph) → unchanged instructor → Join our Chinese Dance programme.

All five repeated What to Expect sections and repeated timetable notes were removed after useful information was integrated into the introduction, format summaries or final invitation. No class data was deleted. Single-format summaries render in the introduction and remain searchable. Optional additional sections remain supported for future genuinely useful content, but empty sections do not render. Original section anchors on remaining sections, responsive styling and colour palette are retained.

## Exact files modified this round

- src/app/classes/[slug]/page.tsx
- src/content/types.ts
- src/content/site.source.ts
- src/content/site.structure.ts
- src/content/copy.ts
- content/website-copy.csv
- src/lib/search/build-index.ts (explicit ClassStylePage typing for optional fields only)
- scripts/test-classes.mts
- scripts/test-content-export.mts
- docs/classes-editorial-refinement.md (new, this report)

## Export and preservation

A Classes-only dry run was generated in node_modules/.cache/classes-preview. Regression checks compared non-Classes structure, copy and CSV records before the scoped export was accepted. Applied command: npm run content:export -- --classes (123 strings). No full export was applied to the working tree. The existing full-export regression runs only in an isolated temporary output directory.

All existing Events module references and unrelated content were preserved. No exporter implementation changes were required. Instructor markup and content, all original and supporting images, hero titles, metadata descriptions, canonical URLs, CTA destinations and timetable data were preserved. Baseline hashes confirmed all unrelated files, including Newsletter Admin security changes, remained unchanged. No commit, staging, push, merge, deployment or CMS operation was performed.

## Validation

- Classes, Search and content-export regression tests: 24 passed, zero failures.
- TypeScript: passed.
- Targeted ESLint: passed with zero errors/warnings.
- Production build: passed, all five class routes generated. The first attempt encountered a local write-permission error; the authorised rerun succeeded.
- git diff --check: passed; existing Git LF/CRLF notices are not whitespace failures.
- Desktop 1440px and mobile 390px: all five pages reviewed. Four sections on single-format pages and five on multiple-format pages, no empty headings/cards, no horizontal overflow, all format names and original timetable/contact links present.
- No videos, external embeds or placeholders added.

## Future video placement — planning only

Use one authentic, user-controlled clip per page initially; do not autoplay or add a separate video section merely to fill space.

- Yoga: a brief real Inside Flow class clip alongside its description would clarify the music-led format. A 9:16 clip can sit within the card's width; avoid adding footage for every format at once.
- Tango: a 16:9 social-dance or class demonstration after the introduction would show the partnership and musical response. Retain both level cards below it.
- Contemporary: a short 16:9 performance or real-class phrase between the introduction and instructors would convey movement more directly than extra copy. A 9:16 real-class clip is an alternative, not an additional block.
- Chinese Dance: one 16:9 Classical Dance performance near the introduction would show phrasing and expression. Only use Soft Training footage specifically confirmed as that session; do not imply an unconfirmed syllabus.
- Tai Chi: a short real-class sequence after the introduction, framed to show the whole body and weight shifts. Either orientation works if hands and feet remain visible.

## Final English copy

The following is the actual page content. Instructor sections are reproduced unchanged for completeness. Existing timetable/contact buttons retain their destinations. SEO titles and descriptions are unchanged from the prior approved implementation.

### Contemporary Dance

**Hero overline:** Weight, space and expression

**Hero:** Contemporary Dance

Bring technique and imagination together through the many possibilities of movement.

**Movement with room for expression**

Contemporary dance finds expression in the way a body moves: the sweep of an arm, the momentum of a turn or a change of direction. It can be fluid, sharp, grounded or expansive, with space for different dancers to bring their own qualities to a phrase.

Technique and creativity work side by side. Learning movement gives you something to work with; playing with its timing, energy and intention can make it feel entirely different. That relationship is part of what makes contemporary dance so rewarding to learn.

Our weekly Contemporary Dance class brings this varied discipline into the studio at County Hall.

**Meet your instructors — unchanged**

Christina & Yvonne

Contemporary dance teacher

Ka Ki Christina Lai and Ying Yen (Yvonne) Wang are London-based contemporary dance artists, choreographers and co-founders of C(P)LAY. Both hold an MA in Dance Performance from the University of the Arts London and have worked with internationally recognised choreographers and directors, including Yeji Kim, Dickson Mbi, Hannes Langolf and Theo Clinkard. Their choreographic work explores human connection, physicality and contemporary experiences through movement, and has been presented internationally, including at FUSE International Festival, Pavilion Dance South West and Sadler’s Wells.



**Join the class**

Find the next session below. If you are new to contemporary dance, ask us about the experience expected before booking.

Buttons: View the timetable → /timetable; Ask us a question → /contact?subject=classes.

### Chinese Dance

**Hero overline:** Form and expression

**Hero:** Chinese Dance

Expressive movement and a rich dance tradition, with Chinese Classical Dance and Soft Training at County Hall.

**Expression in every gesture**

In Chinese Classical Dance, a glance, a curve of the arm and a turn of the torso can work together to give a movement its meaning. Rhythm and breath shape the phrasing, connecting technical detail with expression.

Chinese dance encompasses many classical, folk and ethnic traditions. Our Class 1 primarily focuses on Chinese Classical Dance, while Soft Training is a separate session within the programme.

**Two distinct sessions**

**Chinese Dance: Class 1**

Our main Chinese Classical Dance session, centred on this expressive form and its coordinated use of the body, arms and gaze.

**Chinese Dance: Soft Training**

A separate Chinese Dance session. For the current class content and advice on suitability, please speak with us before booking.

**Meet your instructor — unchanged**

RCDance Lisa

Chinese dance teacher

Lisa Lin from RCDance is a classically trained dance artist and educator specialising in traditional Chinese dance, ethnic and folk dance forms, choreography, and performance pedagogy. She earned her Bachelor’s degree in Dance and Practice from Nanjing University of the Arts and later completed her Master’s degree in Dance Practice and Performance at Roehampton University, London, where she further refined her artistic research and contemporary performance language.



**Join our Chinese Dance programme**

Find Class 1 and Soft Training on the timetable, or ask us which session would suit you.

Buttons: View the timetable → /timetable; Ask us a question → /contact?subject=classes.

### Argentine Tango

**Hero overline:** Music and connection

**Hero:** Argentine Tango

Music, connection and the pleasure of a dance that unfolds one step at a time.

**A conversation on the dance floor**

Argentine tango is a social, improvised dance with roots in Argentina and Uruguay. Partners respond to the music and to each other, finding expression in a walk, a turn or a well-timed pause. Its embrace, rhythms and movement vocabulary give it a character distinct from ballroom tango.

Learning tango means developing balance, musicality and clear communication through movement. You are welcome to join our Beginner or Advanced class on your own; there is no need to bring a dance partner.

**Beginner and Advanced classes**

**Argentine Tango: Beginner**

Begin with the foundations: walking, balance and the communication between leading and following. These are the building blocks of an improvised social dance.

**Argentine Tango: Advanced**

For dancers with Argentine tango experience who want to continue learning. If you are returning after a break or joining from another class, we can help you decide whether this is the right session.

**Meet your instructor — unchanged**

Rene

Tango teacher

Rene is an experienced Argentine Tango dancer, instructor and performer. With a background in Ballroom and Latin dance, he has spent many years developing his expertise in Argentine Tango, studying with some of the most renowned and influential teachers in Argentina and Europe.

In 2008, Rene co-founded Tango-Fever in London with his dance partner Hiba. Since then, they have taught and performed internationally, including at the renowned DNI Tango School in Buenos Aires.

**Join us for tango**

Choose your class and find the next session on the timetable.

Buttons: View the timetable → /timetable; Ask us a question → /contact?subject=classes.

### Yoga

**Hero overline:** Breath and movement

**Hero:** Yoga

Find your pace with Gentle Flow, Vinyasa Flow and music-led Inside Flow at County Hall.

**Space for your practice**

Yoga offers time to pay attention to how you move and how you feel in the moment. Rooted in a tradition that extends beyond physical exercise, its movement practice brings posture, breath and concentration together.

At County Hall, you can choose from three flow formats, each with a different rhythm. You might prefer the unhurried pace of Gentle Flow, the continuity of Vinyasa or the musical choreography of Inside Flow.

**Three ways to flow**

**Gentle Flow**

A slower-paced flowing practice, with time to settle into postures and move thoughtfully between them.

**Vinyasa Flow**

A flowing sequence in which movement is coordinated with the breath. The emphasis is on the connection between postures as well as the postures themselves.

**Inside Flow**

Music shapes this practice. A choreographed sequence builds towards a song, bringing the rhythm of the music, movement and breath together.

**Meet your instructor — unchanged**

Kasen

Yoga teacher

Kasen Zhao is the founder of Sen Yoga, a certified Yoga Alliance instructor and Stott Pilates instructor with over eight years of experience. Specialising in Vinyasa, Inside Flow and Yin Yoga, he combines mindful movement, breathwork and alignment to help students build strength, find balance and cultivate inner peace.



**Make time for yoga**

Find a session that suits your week. If you have questions about what to bring or access to the studio, we are happy to help.

Buttons: View the timetable → /timetable; Ask us a question → /contact?subject=classes.

### Tai Chi

**Hero overline:** Attention in movement

**Hero:** Tai Chi

Give your attention to balance, coordination and the way one movement leads into the next.

**The detail in a slower movement**

Tai Chi, or Taijiquan, has its roots in Chinese martial arts. Its connected movements draw attention to posture and balance: how weight passes from one foot to the other, how a turn begins and how the whole body moves together.

A slower pace gives you time to notice details that are easy to miss. A small adjustment can change the feel of a movement, making the practice an absorbing study of coordination rather than simply a sequence to remember.

Our weekly Tai Chi class offers a regular opportunity to practise at County Hall.

**Meet your instructor — unchanged**

Xintian Zhao

Tai Chi teacher

Xintian is a dancer and choreographer based in London. She graduated from the Northern School of Contemporary Dance in 2024. Prior to that, she received seven years of professional ballet training at the Shanghai Ballet School, before switching her major to choreography at university. She is currently working as a freelance artist in London, and also teaches and performs at the Confucius Institute at Goldsmiths, University of London.



**Practise Tai Chi with us**

View the next session and booking details below. For questions about the class or joining, get in touch.

Buttons: View the timetable → /timetable; Ask us a question → /contact?subject=classes.
