# DECISIONS.md

## 1. Why this approach over the obvious alternative I rejected?

The obvious alternative — and what was implemented in the previous version — is the standard dark SaaS landing-page formula: gradient headline, three feature cards with emoji icons, connector lines, glowing orb backgrounds, and a "testimonials" section.

I rejected this again, more completely this time.

ConfessHere is not a SaaS tool. It is a space where people say things they have been carrying. That distinction should be felt the moment the page loads — not read in a feature list.

The new approach:

**The composer is the hero.** Not a split layout with text on the left and a floating glass card on the right. The confession composer sits centered on the page, beneath a short honest headline. A visitor arrives and immediately feels like they are at a writing surface, not a marketing page. The layout says "this is where you write," not "here is why you should write."

**Editorial composition instead of card sections.** The "How it Works" section (three step cards with emoji icons and gradient connector lines) has been removed entirely. Its information — you write, you post anonymously, your thought enters the community — is now communicated through the composer interaction itself. Showing is more efficient than explaining.

The "Why It Matters" section (three pillar cards with emoji icons) has been replaced with a single editorial two-column block: a large pull-quote on one side and three short paragraphs of plain copy on the other. No card container, no border, no icon, no heading.

**An editorial interruption instead of another heading-plus-cards section.** Between the hero and the confession wall, three lines of large typographic text express the product's philosophy without any structural element around them. The lines themselves carry the meaning. This is a visual pause, not a content section.

**Restrained visual language.** The old design had: three floating orb glows, gradient text on the headline and footer logo, blue/purple/pink across the page, a blinking badge pill, glassmorphism on the composer. All of these have been removed. The background is flat near-black. Text is warm off-white. The only accent color is ConfessHere blue, used on the interactive composer button and the focus state. Nothing else competes.

The test I applied before finishing: if the logo were removed, would this page still feel like it belongs specifically to an anonymous confession product? The answer is yes — every section is shaped by the product's emotional reality: a writing surface, a typographic statement about privacy, the actual confession wall, an honest explanation of why identity-free expression matters.

---

## 2. One trade-off I made under the time limit, and what I'd do with a real week

The composer auto-typing uses a character-by-character interval timer. It is functional and gives the idle state visual life, but the rhythm can feel mechanical — characters arrive at a uniform pace rather than with the irregular cadence of real typing.

With a full week, I would replace this with `requestAnimationFrame`-based animation using variable per-character delay: slower at the start of a word, faster in the middle, a brief pause at punctuation, a longer pause between sentences. The idle confessions would fade out rather than hard-resetting, and the transition into user-typed text would be smoother. I would also run usability testing to confirm that visitors actually interact with the composer rather than scrolling past it.

---

## 3. Where I used AI tools, and what I personally verified afterward

AI assistance was used throughout: generating the JSX structure, the CSS layout, the editorial composition decisions for the interruption and why sections, and the responsive breakpoint styles.

What I personally reviewed and verified:
- The representative confession cards remain labeled as examples and are not presented as real user posts or testimonials
- No fabricated metrics, user counts, reviews, or claims
- No unsupported security or encryption claims
- All navigation CTAs route to `/auth/google` — the real existing authentication endpoint
- Confirmed the Konami code easter egg still works in the new version
- `npm run build` run to confirm zero compile errors
- Responsive CSS reviewed at 390px and 1440px: no horizontal overflow, composer is readable and tappable on mobile, CTA button stretches to full width on small screens
- Confirmed existing routes, APIs, confession functionality, inbox, and private messaging are untouched
