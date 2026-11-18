// Case study content, transcribed from "Portfolio Case Studies" (PORTFOLIO ASSETS,
// 17 Nov 2026). Text is Aayudh's; do not add facts that aren't in the doc.
// Correction from Aayudh (2026-11-18): MemorEase was built in UIKit, not SwiftUI.
// scripts/build-case-studies.mjs turns this into /work/<slug>/index.html.
//
// Inline markup: **bold**, *italic*. Block types: p, impact, ol (bold lead +
// text), ul, table, fig, grid, compare, video. Image names refer to
// content/case-studies/media.json (made by `ONLY=cases node scripts/optimize-images.mjs`).

export const ORDER = ['memorease', 'tedx', 'path-of-stillness']; // same as the Work row

export const CASES = {
  memorease: {
    name: 'MemorEase',
    title: 'MemorEase: dementia care iOS app',
    kicker: 'Case study · iOS app · 2025–2026',
    description: 'How I led UX for MemorEase, an iOS app for dementia patients and their caregivers.',
    line: 'Dementia care iOS app for patients and caregivers.',
    lead: 'I led UX research and design for MemorEase, an iOS app that gives early-to-moderate dementia patients emotional comfort through reminiscence, and keeps their caregivers in the loop. Midway, we caught that our core feature was hurting the people it was built for, and rebuilt it in a month.',
    facts: {
      Role: 'UX lead: research, flows, UI; coded parts in UIKit',
      Team: '4, in the MIT-WPU iOS Student Development Program (Apple and Infosys)',
      Timeline: '2025–2026',
      Tools: 'Figma, Swift, UIKit, Supabase',
    },
    hero: {
      grid: {
        cols: 2,
        size: 'narrow',
        items: [
          { img: 'patient-memorylane', alt: 'MemorEase patient app: a Memory Lane session with a family photo', caption: 'Patient: Memory Lane' },
          { img: 'caregiver-main', alt: 'MemorEase caregiver app home screen', caption: 'Caregiver: home' },
        ],
      },
    },
    sections: [
      {
        title: 'The problem',
        blocks: [
          { p: 'People with early-to-moderate dementia live with memory lapses and trouble with everyday cognitive tasks. That leads to stress, anxiety, irritation and low mood, and lowers their quality of life. It also weighs on the family members who care for them around the clock.' },
        ],
      },
      {
        title: 'Why it matters',
        blocks: [
          { p: "One of my teammates watched his grandmother live with dementia, so the team knew these problems first-hand. When we looked at existing apps, most offered only cognitive games, a few had routine reminders behind a paywall, and none focused on the patient's emotional comfort." },
        ],
      },
      {
        title: 'Research',
        blocks: [
          { p: 'We spoke with caregivers, a psychiatrist and neurologists. What we learned shaped every feature:' },
          {
            ul: [
              'Patients follow a **fixed daily routine**, and missed or doubled medication is a real risk.',
              'Many get **irritated in the evening (sundowning)** and have mood swings.',
              'Their best moments come from **familiar, nostalgic things**: old songs, singing, people they love.',
              "In the moderate stage, some **wander out of the house**, so caregivers need to know what's happening when they're away.",
              'Doctors stressed that **reliving memories** matters, not testing them.',
            ],
          },
        ],
      },
      {
        title: 'Process',
        blocks: [
          {
            ol: [
              ['Low-fi to hi-fi.', 'We sketched flows, then designed in Figma, reviewing each stage with our program mentors and external mentors from Apple and Infosys before coding.'],
              ['Two interfaces, one bond.', "Role-based onboarding: the patient signs up first and gets a connect code; the caregiver uses it to link to the patient's account."],
              ['Designing for users aged 60+.', 'One-to-two-tap navigation everywhere, adjustable text size, high contrast, voice input, and a warm beige palette that feels calm, not clinical.'],
              ['Holding design and code together.', 'I checked that the built app matched the Figma designs throughout development, and coded some flows myself.'],
            ],
          },
          {
            grid: {
              cols: 3,
              size: 'wide',
              steps: true,
              equal: true,
              items: [
                { img: 'design-initial', alt: 'MemorEase initial Figma designs', caption: 'Initial Figma design' },
                { img: 'design-mid', alt: 'MemorEase mid-stage Figma designs', caption: 'Mid stage' },
                { img: 'design-final', alt: 'MemorEase final designs', caption: 'Final design' },
              ],
            },
          },
        ],
      },
      {
        title: 'The pivot: from quiz to comfort',
        blocks: [
          { p: 'On mentor advice, the first Memory Lane asked patients to **recall** who was in a photo, with right and wrong answers and corrective feedback. It worked like a quiz. For someone with dementia, that risks a painful message: *you can’t remember things you used to.* For a large part of development, our main feature was quietly working against the problem we set out to solve.' },
          { p: 'An external mentor review exposed it. Within a month we redesigned the flow from scratch around **reminiscence therapy**:' },
          {
            ul: [
              'The caregiver uploads a photo, tags faces, and records or types the story behind it.',
              'The patient sees the photo and gentle, open-ended questions: *Do you remember this person?* (yes / no / maybe), then *What did you enjoy doing together?*',
              'Every question is **optional and skippable**; there are no wrong answers.',
              'The session ends by asking how the memory made them feel.',
            ],
          },
          {
            compare: {
              before: { label: 'Before: the recall quiz', items: ['before-1', 'before-2', 'before-3'], alt: 'Recall quiz screen' },
              after: { label: 'After: the reminiscence flow', items: ['after-1', 'after-2', 'after-3'], alt: 'Reminiscence flow screen' },
            },
          },
        ],
      },
      {
        title: 'Result',
        blocks: [
          { p: 'A working, demoed iOS app with three patient features and a caregiver side:' },
          {
            table: {
              head: ['For the patient', 'For the caregiver'],
              rows: [
                ['**Memory Lane:** reminiscence sessions with photos and gentle questions', '**Album:** upload photos, tag faces, tell the story by voice or text'],
                ['**Memory Recap:** relive past sessions as a short story-like summary', '**Session view:** see what the patient answered and shared'],
                ['**Routine reminders:** notifications answerable yes/no without opening the app', '**Routine setup and tracking:** see which tasks were done while away'],
                ['**Cognitive games:** sudoku, crossword, match the cards', ''],
              ],
            },
          },
          {
            grid: {
              cols: 2,
              size: 'narrow',
              max: '30rem',
              items: [
                { video: 'patient', w: 384, h: 832, label: 'Screen recording of the MemorEase patient app', caption: 'Patient app' },
                { video: 'caregiver', w: 432, h: 768, label: 'Screen recording of the MemorEase caregiver app', caption: 'Caregiver app' },
              ],
            },
          },
          {
            grid: {
              cols: 4,
              size: 'wide',
              screens: true,
              items: [
                { img: 'patient-routine', alt: 'MemorEase patient routine screen', caption: 'Patient: routine' },
                { img: 'caregiver-1', alt: 'MemorEase caregiver screen 1', caption: '' },
                { img: 'caregiver-2', alt: 'MemorEase caregiver screen 2', caption: '' },
                { img: 'caregiver-3', alt: 'MemorEase caregiver screen 3', caption: '' },
                { img: 'caregiver-4', alt: 'MemorEase caregiver screen 4', caption: '' },
                { img: 'caregiver-5', alt: 'MemorEase caregiver screen 5', caption: '' },
                { img: 'caregiver-6', alt: 'MemorEase caregiver screen 6', caption: '' },
                { img: 'patient-main', alt: 'MemorEase patient home screen', caption: 'Patient: home' },
              ],
            },
          },
        ],
      },
      {
        title: 'Impact',
        blocks: [
          { p: "The psychiatrist who advised us reviewed the app and said it would help patients. The app was demoed to mentors from Apple and Infosys. App Store release was planned by the college but hasn't happened yet." },
        ],
      },
      {
        title: 'Conclusion',
        blocks: [
          { p: "The biggest lesson: expert advice still has to be checked against the user's reality. A feature can work technically and still do harm. The next step would be testing with patients and caregivers at a dementia care centre, which the one-year program didn't leave room for." },
        ],
      },
    ],
  },

  tedx: {
    name: 'TEDxMITWPU',
    title: 'TEDxMITWPU 2025: brand identity and website',
    kicker: 'Case study · Brand identity and website · 2025',
    description: 'How I led the brand identity for TEDxMITWPU 2025 and co-designed the site that sold 100+ tickets in 72 hours.',
    line: 'Brand identity and website for “Threads of Identity”.',
    lead: 'I led the visual identity for the 2nd edition of TEDxMITWPU, and co-designed the event website that sold 100+ of 192 tickets within 72 hours of launch.',
    facts: {
      Role: 'Lead graphic designer',
      Team: 'Design team of 5–6; website co-designed with one other designer',
      Timeline: 'Design approved in under 17 days; site live in about 45',
      Tools: 'Figma, Illustrator, Photoshop, Canva, Krita (pen tablet)',
    },
    hero: { fig: { img: 'mainscreen', alt: 'TEDxMITWPU website home screen: Threads of Identity', size: 'wide' } },
    sections: [
      {
        title: 'The problem',
        blocks: [
          { p: 'The first edition had done well, but its look was simple and minimal. For the 2nd edition, the team was given one theme, **“Threads of Identity”**, and two goals: make the event visible across campus so tickets sell, and present the speakers clearly. The design had to explain an abstract theme fast enough that a student would understand it, connect with it and register.' },
        ],
      },
      {
        title: 'Why it matters',
        blocks: [
          { p: "Tickets had to sell before the event, so the website's first screen had one job: turn a curious visitor into a registration. A theme people don't understand is a theme they don't buy a ticket for." },
        ],
      },
      {
        title: 'Process',
        blocks: [
          {
            ol: [
              ['Research and moodboards.', 'I collected references on Pinterest to find a visual language for identity: hands, threads, butterflies and x-ray textures.'],
              ['Working inside TEDx rules.', 'TEDx brand guidelines allow only the official red, black and white. Instead of fighting that, I used it: black for depth, red for the threads that connect people.'],
              ['The X mark.', 'I drew a custom X by hand on a pen tablet in Krita, along with the thread illustrations that run across the pages. The team liked it enough that it became the core brand element across everything.'],
              ['Brand system.', 'I carried the X and the threads across tickets, a diary, badges and stickers, lanyards, social posts and the sponsor deck.'],
              ['Website.', 'I set the visual direction and designed the hero and creative elements; my co-designer executed content and layouts across pages. Pages: Home, About, Our Team, Past Edition, Contact, FAQ, plus mobile versions.'],
              ['Key decision: countdown in the hero.', 'Registrations had to happen before the event, so a live countdown and the “Book now” button sit on the first screen.'],
            ],
          },
          {
            grid: {
              cols: 3,
              size: 'wide',
              steps: true,
              equal: true,
              items: [
                { img: 'moodboard', alt: 'TEDxMITWPU initial moodboard: hands, threads, butterflies, x-ray textures', caption: 'Moodboard' },
                { raw: 'x-mark', alt: 'The hand-drawn TEDx X mark', caption: 'The X mark, drawn in Krita' },
                { img: 'figma-board', alt: 'TEDxMITWPU Figma board', caption: 'Figma board' },
              ],
            },
          },
        ],
      },
      {
        title: 'The brand system',
        blocks: [
          { fig: { img: 'tickets-front', alt: 'TEDxMITWPU ticket, front', size: 'wide', plain: true } },
          { fig: { img: 'tickets-back', alt: 'TEDxMITWPU ticket, back', size: 'wide', plain: true, caption: 'Tickets, front and back' } },
          {
            grid: {
              cols: 4,
              size: 'wide',
              items: [
                { img: 'diary-front', alt: 'TEDxMITWPU diary, front', caption: 'Diary, front', plain: true },
                { img: 'diary-back', alt: 'TEDxMITWPU diary, back', caption: 'Diary, back', plain: true },
                { img: 'badges', alt: 'TEDxMITWPU badges and stickers', caption: 'Badges and stickers', plain: true },
                { img: 'story', alt: 'TED Talks Thursday social story', caption: 'Social story', plain: true },
              ],
            },
          },
        ],
      },
      {
        title: 'The website',
        blocks: [
          { video: { src: 'web', w: 1280, h: 720, size: 'wide', label: 'Screen recording scrolling through the TEDxMITWPU website', caption: 'The live site, desktop' } },
          {
            grid: {
              cols: 2,
              size: 'wide',
              items: [
                { img: 'theme-reveal', alt: 'TEDxMITWPU website: theme reveal section', caption: 'Theme reveal' },
                { img: 'past-speakers', alt: 'TEDxMITWPU website: past speakers page', caption: 'Past speakers' },
                { img: 'contact', alt: 'TEDxMITWPU website: contact page', caption: 'Contact' },
                { img: 'faq', alt: 'TEDxMITWPU website: FAQ page', caption: 'FAQ' },
              ],
            },
          },
          {
            grid: {
              cols: 5,
              size: 'wide',
              screens: true,
              items: [
                { video: 'mobile', w: 432, h: 768, label: 'Screen recording of the TEDxMITWPU mobile site', caption: 'Mobile' },
                { img: 'mobile-main', alt: 'TEDxMITWPU mobile site: home', caption: 'Home' },
                { img: 'mobile-menu', alt: 'TEDxMITWPU mobile site: menu', caption: 'Menu' },
                { img: 'mobile-speakers', alt: 'TEDxMITWPU mobile site: past speakers', caption: 'Past speakers' },
                { img: 'mobile-contact', alt: 'TEDxMITWPU mobile site: contact', caption: 'Contact' },
              ],
            },
          },
        ],
      },
      {
        title: 'Result',
        blocks: [
          { p: 'The brand identity was used across all event material. The website was built and launched with the design followed on every page except the home hero, which the tech team implemented differently.' },
        ],
      },
      {
        title: 'Impact',
        blocks: [{ impact: '**100+ of 192 tickets sold within 72 hours** of the website going live, more than half the capacity in three days.' }],
      },
      {
        title: 'Conclusion',
        blocks: [
          { p: "The constraint (three colours, an abstract theme) became the identity. If I did it again, I'd work with developers from the start, so the hero ships exactly as designed." },
        ],
      },
    ],
  },

  'path-of-stillness': {
    name: 'Path of Stillness',
    title: 'Path of Stillness: a narrative iOS game',
    kicker: 'Case study · iOS game · Swift Student Challenge 2026',
    description: 'How I designed and built Path of Stillness, a four-chapter samurai game, solo in 3 days.',
    line: 'Narrative iOS game for the Swift Student Challenge 2026.',
    lead: 'I designed and built Path of Stillness solo in 3 days for Apple’s Swift Student Challenge 2026: a four-chapter samurai game where the mechanics themselves teach discipline, without a single control instruction.',
    facts: {
      Role: 'Concept, game and interaction design, code, art direction',
      Team: 'Solo',
      Timeline: '3 days',
      Tools: 'Swift, SwiftUI, SpriteKit, Figma, Gemini (pixel assets)',
    },
    hero: {
      fig: { img: 'title', alt: 'Path of Stillness title art: a samurai meditating in a dojo courtyard', size: 'wide' },
      after: { video: { src: 'gameplay', w: 640, h: 444, size: 'text', label: 'Gameplay recording of Path of Stillness', caption: 'Gameplay' } },
    },
    sections: [
      {
        title: 'The problem',
        blocks: [
          { p: 'The Swift Student Challenge asks for an app built in Swift that solves a problem or offers a unique interaction on Apple devices. I wanted to make values like discipline and self-mastery land for young adults like me, in a way that’s felt rather than lectured.' },
        ],
      },
      {
        title: 'Why it matters',
        blocks: [
          { p: 'Discipline is something I practise myself: a year of running every week without a skip, and daily habits for body and mind. Most “self-improvement” content tells you what to do. A game can make you *do* it, and discover the meaning yourself.' },
        ],
      },
      {
        title: 'Process',
        blocks: [
          {
            ol: [
              ['Two days of thinking before building.', 'I researched and planned the full concept before writing code, so the 3 days of execution had a clear vision.'],
              ['Mood and world.', 'Moodboards for a calm, retro samurai world: wooden dojo, paper screens, pixel art.'],
              ['Mechanics as meaning.', 'Each chapter shows only one line about a value. The player has to work out the action from that line. No controls are ever explained.'],
              ['Fitting the constraints.', 'The challenge limits playtime to about 3 minutes and app size to a few MB. Pixel art kept the build under 2 MB; I cut extra animation poses, not story.'],
              ['Art direction with AI.', 'With no time to draw every sprite, I art-directed the pixel assets with Gemini and assembled them myself.'],
            ],
          },
          {
            grid: {
              cols: 3,
              size: 'wide',
              equal: true,
              items: [
                { img: 'moodboard-1', alt: 'Path of Stillness moodboard 1', caption: 'Moodboard 1' },
                { img: 'moodboard-2', alt: 'Path of Stillness moodboard 2', caption: 'Moodboard 2' },
                { img: 'moodboard-3', alt: 'Path of Stillness moodboard 3', caption: 'Moodboard 3' },
              ],
            },
          },
          { fig: { img: 'figma-board', alt: 'Path of Stillness Figma board: chapter titles, backgrounds, sprites and UI', size: 'wide', caption: 'Figma board: chapter titles, backgrounds, sprites, UI' } },
        ],
      },
      {
        title: 'The four chapters',
        blocks: [
          {
            table: {
              head: ['Chapter', 'Value', 'What the player discovers'],
              rows: [
                ['I · The Weight of Stillness', 'Patience', 'Holding the screen steady for 10 seconds is what draws the sword'],
                ['II · The Unbroken Rhythm', 'Consistency', 'The training post only falls to repeated swipes, again and again'],
                ['III · The Price of Gold', 'Integrity', 'Choosing gold over your values sends you back to replay the chapter'],
                ['IV · The Shadow Within', 'Self-mastery', 'Attacking the shadow makes it stronger; you win by not fighting, because the shadow is you'],
              ],
            },
          },
          {
            grid: {
              cols: 2,
              size: 'wide',
              items: [
                { img: 'chapter-2', alt: 'Path of Stillness chapter II screenshot', caption: 'Chapter II · The Unbroken Rhythm' },
                { img: 'final-chapter', alt: 'Path of Stillness final chapter screenshot', caption: 'Chapter IV · The Shadow Within' },
              ],
            },
          },
          {
            grid: {
              cols: 2,
              size: 'narrow',
              items: [
                { img: 'ronin-ch2', alt: 'Pixel-art ronin sprite from chapter II', caption: 'Ronin, chapter II', pixel: true, plain: true },
                { img: 'ronin-ch4', alt: 'Pixel-art ronin sprite bracing, from chapter IV', caption: 'Ronin bracing, chapter IV', pixel: true, plain: true },
              ],
            },
          },
        ],
      },
      {
        title: 'Result',
        blocks: [
          { p: 'A complete, playable four-chapter game, under 2 MB, finishing within the challenge’s time limit, submitted to Swift Student Challenge 2026.' },
        ],
      },
      {
        title: 'Impact',
        blocks: [
          { p: 'It didn’t win. **20+ players** from my cohort and the iOS program played it. Most enjoyed it and understood the meaning; a few found the hint-only design confusing at first, then said it clicked once they understood the idea.' },
        ],
      },
      {
        title: 'Conclusion',
        blocks: [
          { p: 'The lesson: interaction itself can carry a message. Removing instructions made players think, which is the whole point of a game about stillness. With more time, I’d add small layers of meaning, not more length.' },
        ],
      },
    ],
  },
};
