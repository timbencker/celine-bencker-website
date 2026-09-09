# Language policy

Binding rules for how German and English coexist on this site. Written down so
the decisions are not rediscovered — or quietly reversed — later.

## Audiences

German is the default. Betroffene and österreichische Redaktionen have the
highest claim to being understood, and they read German. Komitees and Forschende
need English, but they tolerate Fachdeutsch better than laypeople tolerate
English. English is therefore fully parallel, not an afterthought.

## Rules

**The URL carries the language, never a cookie.** `/de/forschung`,
`/en/research`. Every page is linkable and citable in each language — decisive
when Redaktionen and Komitees pass links around.

**Slugs are localized.** The counterpart of `/de/forschung` is `/en/research`,
not `/en/forschung`. Pages are linked by the `translationKey` in their
frontmatter, not by a shared slug.

**No automatic redirection by browser language.** It breaks shared links and is
almost always wrong on a bilingual site. An explicit URL is never overridden: a
link to `/de/forschung` always opens in German, whatever the visitor previously
chose or their browser prefers.

**A remembered choice acts only on the bare `/`.** It is set by clicking the
language switcher and never inferred from `navigator.language`. `/de/` remains
the no-JavaScript fallback. This is the only place JavaScript touches routing.

**The switcher goes to the same page in the other language**, never to the home
page. Where no counterpart exists it renders _disabled_ — not a dead link, not a
redirect. Losing the reader's place is worse than showing an unavailable option.
The reason is given as text, because a greyed-out appearance communicates nothing
to a screen reader.

**Content lives in separate files per language; layouts exist once.** Otherwise
the two versions drift apart.

## What need not be bilingual

Not everything has to exist twice. Each exception is _declared_, never implied —
set `singleLocale: true` in the page's frontmatter, and the build stops
complaining about that page.

- **Publication titles and DOIs stay English.** That is the convention in the
  field; translating them would make them harder to cite, not easier.
- **"Einfach erklärt" is aimed at German-speaking laypeople.** An English
  version is optional, not required.
- **Legal pages** (Impressum, Datenschutz) may be German-only where that is the
  legally operative version.

## Enforcement

A page that exists in one language and not the other **fails the build**, unless
it declares `singleLocale: true`. So does reusing the same `translationKey` twice
within one language. Both checks live in `src/i18n/pages.ts` and run from
`getStaticPaths`, so `npm run build` is the gate.

Per page, automatically: a correct `lang` attribute, reciprocal `hreflang` pairs
between the versions, `x-default` pointing at the German version, and both
languages in `sitemap.xml`.

## The root redirect

`/` redirects to `/de/`. This is a _constant_ redirect to the default language,
not language detection, so Google's guidance against auto-redirecting by
perceived language does not apply.

It is implemented as a zero-delay meta refresh in `src/pages/index.astro`, not
via `routing.redirectToDefaultLocale`, because that option requires a server and
GitHub Pages has none. WCAG technique F40 only fails _timed_ refreshes, so a zero
delay is conformant — and the page renders real links as well, so it stays
navigable if the refresh is blocked.
