# Content format

This is the format Colt & Valentine deliver game content in. One file per game, in both languages, dropped into `src/content/games/`. Each file is validated against a schema (zod) at build time — if a field is missing or malformed, the build fails loudly rather than shipping a broken game.

You don't need to write code. Fill in the structure below. JSON is fine; if you'd rather author in a spreadsheet, send that and the format gets converted on this side. Tell us which you prefer.

## Conventions used everywhere

- **Bilingual text** is always an object with `en` and `fr`:
  ```json
  { "en": "How we met", "fr": "Comment on s'est rencontrés" }
  ```
- **`day`** is 1–5 and sets the unlock order (1 = first day, Fri Jul 31, 2026).
- **`id`** is a short stable slug (`wordle`, `trivia`, `two-truths`, `travel`, `connections`). Don't change it once set.
- Keep copy phone-sized. These are read on small screens by all ages.

---

## 1. Wordle — `01-wordle.json`

A five-letter word about the two of you. The answer can differ per language (a word that works in English may not in French), so each locale has its own.

```json
{
  "id": "wordle",
  "day": 1,
  "title": { "en": "Today's word", "fr": "Le mot du jour" },
  "answer": { "en": "VALEN", "fr": "AMOUR" },
  "hint": { "en": "Five letters, very us", "fr": "Cinq lettres, très nous" }
}
```

Notes:

- Answers must be exactly 5 letters, no accents in the letters themselves (accents are a phone-keyboard nightmare for older guests). Put any flavor in the `hint`, not the answer.
- We deliberately **don't** validate guesses against a dictionary — guests can type any 5 letters. Lower friction for non-gamers, and the answer is personal anyway.

---

## 2. Trivia — `02-trivia.json`

Multiple choice, "how well do you know the couple." Aim for 5–8 questions.

```json
{
  "id": "trivia",
  "day": 2,
  "title": { "en": "How well do you know us?", "fr": "Tu nous connais bien ?" },
  "questions": [
    {
      "prompt": {
        "en": "Where did we first meet?",
        "fr": "Où s'est-on rencontrés ?"
      },
      "choices": [
        { "en": "A wedding", "fr": "Un mariage" },
        { "en": "At work", "fr": "Au travail" },
        { "en": "A dating app", "fr": "Une app de rencontre" },
        { "en": "On a plane", "fr": "Dans un avion" }
      ],
      "answerIndex": 0
    }
  ]
}
```

Notes:

- 3–4 choices per question. `answerIndex` is 0-based (0 = first choice).
- Keep all choices roughly the same length so the right one doesn't stand out.

---

## 3. Two Truths and a Lie — `03-two-truths.json`

Each round shows three statements; the guest guesses the lie. Aim for 4–6 rounds.

```json
{
  "id": "two-truths",
  "day": 3,
  "title": { "en": "Two truths and a lie", "fr": "Deux vérités, un mensonge" },
  "rounds": [
    {
      "statements": [
        {
          "en": "Valentine has run a marathon",
          "fr": "Valentine a couru un marathon"
        },
        { "en": "Colt once lived in Japan", "fr": "Colt a vécu au Japon" },
        { "en": "We met in 2018", "fr": "On s'est rencontrés en 2018" }
      ],
      "lieIndex": 1
    }
  ]
}
```

Notes:

- Exactly 3 statements per round. `lieIndex` is 0-based and marks the lie.

---

## 4. Travel round — `04-travel.json`

Honeymoon-themed sorting: is each thing **France** or **Sri Lanka**? Designed as a fast swipe (left = France, right = Sri Lanka). Aim for 8–12 items.

```json
{
  "id": "travel",
  "day": 4,
  "title": { "en": "France or Sri Lanka?", "fr": "France ou Sri Lanka ?" },
  "items": [
    {
      "label": { "en": "Tea plantations", "fr": "Plantations de thé" },
      "image": "travel/tea.jpg",
      "answer": "srilanka"
    },
    {
      "label": { "en": "Escargots", "fr": "Escargots" },
      "image": "travel/escargots.jpg",
      "answer": "france"
    }
  ]
}
```

Notes:

- `answer` is `"france"` or `"srilanka"`.
- `image` is optional but strongly recommended — this round is meant to be visual. Drop image files in `public/content/` and reference them by relative path (`travel/tea.jpg`). Roughly square, we'll handle resizing. If an item has no image it shows as a text card.

---

## 5. Connections — `05-connections.json`

The NYT grid: 16 tiles, 4 hidden groups of 4. Easy/couple-themed (the hard one is the in-person finale, not in the app).

**Important content caveat:** the grouping is wordplay, and wordplay rarely survives translation — a clever English group usually falls apart in French and vice-versa. So Connections takes a **separate grid per language**. Author the EN grid and the FR grid independently; they don't need to be translations of each other, just two good puzzles.

```json
{
  "id": "connections",
  "day": 5,
  "title": { "en": "Connections", "fr": "Connexions" },
  "grids": {
    "en": {
      "groups": [
        {
          "name": "Our pets",
          "level": 0,
          "members": ["LUNA", "MILO", "BEAR", "SHADOW"]
        },
        { "name": "Wedding venues we toured", "level": 1, "members": ["..."] },
        { "name": "Honeymoon stops", "level": 2, "members": ["..."] },
        { "name": "Inside jokes", "level": 3, "members": ["..."] }
      ]
    },
    "fr": {
      "groups": [{ "name": "Nos animaux", "level": 0, "members": ["..."] }]
    }
  }
}
```

Notes:

- Exactly 4 groups, exactly 4 members each, per language.
- `level` 0–3 sets difficulty/color (0 = easiest/yellow → 3 = hardest/purple), same as NYT.
- `name` is the category reveal; it doesn't need an `en`/`fr` object here because each grid is already inside its language key.
- Watch for tiles that could plausibly fit two groups — a little of that is good (it's the puzzle), too much is just frustrating. Keep it on the easy side.

---

## What we still need from you, in order

1. The five content files above, both languages.
2. Any Travel-round images into `public/content/`.
3. A couple of brand/aesthetic notes if you have them (colors, a font you like, a photo for the landing screen). Optional — the look is ours to run otherwise.
4. The guest list (name + email) as a CSV — format in `supabase/seed/guests.example.csv`.
