# Linked Skill Routing

This skill should orchestrate the existing visual skill system. Do not work alone when another skill already owns a stronger visual harness.

## Routing Rule

```text
linked skill plan:
- skill:
- job it performs:
- input it receives:
- output needed for web:
- how web will transform it:
- QA gate:
```

## master-styles

Use for art direction tokens when the page needs luxury, restraint, or a domain-specific visual register.

Good jobs:

- choose palette/light/composition tokens
- turn "premium" into visible rules
- prevent random purple/dark gradient styling
- guide Image Gen prompt for hero plates or textures

Do not:

- name-drop a style without concrete tokens
- copy famous works
- let style bury source material

## article-visual-grammar

Use when the source is a document, article, PDF, pitch deck, strategy memo, or educational content.

Good jobs:

- extract source anchors
- build figure spec
- choose diagram/spatial form
- apply image-quality harness and composition stability
- generate key visual plates that the website will animate or spatialize

Web transformation examples:

- article figure becomes a scroll chapter
- field atlas becomes interactive evidence wall
- route map becomes animated path
- cutaway becomes layered web section

## paper-operators

Use when the webpage needs tactile explanatory charm and the idea can be physically performed.

Good jobs:

- generate a paper-stage mechanism scene
- turn abstract consulting/product/culture idea into action
- create a miniature world that web scroll can pan, zoom, or reveal

Hard gate:

- answer `what breaks if removed`.
- if the operator is decorative, do not use it.

Web transformation examples:

- paper-stage image becomes a spatial gallery with hotspots
- blue carrier ribbon becomes scroll path
- operator action stations become sections
- generated 16:9 plate becomes hero scene with parallax layers

## cover-pop / quote-cards / rank-cards

Use when the site needs a strong cover-like hero, title slide, statement card, ranking wall, or shareable chapter card.

Web transformation examples:

- cover becomes first viewport with animated depth
- quote card becomes scroll-pinned statement
- rank card becomes interactive tier wall

Respect each skill's native text and anti-clutter rules.

## sticker-set / gif-stickers

Use when the web wants expressive character loops, sticker-like micro animations, or social/campaign energy.

Use sparingly for luxury pages. Do not let stickers cheapen a premium client presentation unless the brand tone supports it.

## Image Gen

Use directly when:

- source asset is weak or missing
- a cinematic hero plate is needed
- a texture/material/background/world needs to be created
- paper-operators/article-visual-grammar/master-styles have produced a generation prompt

Rules:

- Generate assets before coding when assets determine layout.
- Inspect output before embedding.
- If generated text is unreliable, use blank text zones and overlay in web.

## Cross-Skill Workflow

```text
1. Asset/document intake.
2. Decide which visual skill owns the image/world/figure problem.
3. Generate/edit visual assets if needed.
4. Inspect assets and write a web figure spec.
5. Build the web experience around those assets.
6. Screenshot QA.
7. Repair either asset or web, whichever is the largest failure.
```
