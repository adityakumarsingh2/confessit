# DECISIONS.md

## 1. Why this approach over the obvious alternative I rejected?

The obvious alternative was a conventional SaaS marketing page: big gradient heading, three feature cards ("Anonymous", "Secure", "Fast"), fake user count statistics, and generic testimonials.

I rejected this because ConfessHere is a product people already use to share real thoughts. The strongest argument for signing up is showing someone what that actually feels like — not listing features.

The approach I chose centres on an interactive composer in the hero. A visitor can type their own confession into a real textarea and watch it get anonymised — the name disappears and a random identity replaces it. That single interaction communicates the whole product value: *your thought can exist without your name on it.* Three feature cards cannot deliver that in the same number of seconds.

The rest of the page follows the same logic: the feed preview uses real-looking confession cards (the same visual structure as the actual product), the "Why it matters" pillars describe emotional outcomes rather than technical features, and no statistics are invented because there are none to cite.

---

## 2. One trade-off I made under the time limit, and what I'd do with a real week

The hero composer auto-types example confessions to show what the product looks like when a user hasn't engaged yet. This works but it uses a simple character-by-character interval timer, not a polished typewriter library. The timing occasionally feels mechanical rather than natural.

With a full week, I'd replace this with a smoother animation using `requestAnimationFrame` with variable character delay (slower at the start of words, faster through the middle, brief pause at punctuation), giving it the feel of someone genuinely typing. I'd also add a subtle idle "thinking pause" between example confessions rather than the hard reset, and run proper usability testing to see whether visitors interact with the composer or scroll past it.

---

## 3. Where I used AI tools, and what I personally verified afterward

AI assistance was used throughout: generating the full JSX component structure, the CSS layout at both breakpoints, the interactive composer state machine logic, and the Konami code easter egg implementation.

What I personally reviewed and verified:
- Removed fabricated statistics (10K+, 50K+ Monthly Peers) that existed in the previous landing page — these would have violated the assignment honesty rules
- Confirmed the representative confession cards are labeled as "representative examples" and not presented as real user testimonials
- Confirmed no unsupported security/encryption claims are made — the old landing said "Encrypted & Private" which the codebase does not actually implement end-to-end
- Ran `npm run build` to confirm zero compile errors before submitting
- Reviewed the responsive CSS breakpoints at 480px and 1024px to confirm the hero, feed, and CTA sections reflow correctly
- Confirmed existing routes (`/auth/google`, `/auth/logout`), the confession feed, inbox, and private messaging are untouched
