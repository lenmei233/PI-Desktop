# ADR provider-brand-marks: Bundled monochrome provider marks for the model picker

- Status: Accepted
- Date: 2026-09-25
- Related: Issue #1028, spec `13-model-catalog-and-selection.md` §9.2.1

## Context

The conversation Composer model picker identified each row only by text. A user
asked for model context/output length and a model icon, and volunteered their
own hand-drawn icons, reporting them "ugly and inconsistent" — the natural
result of mixing per-row artwork by hand.

Two constraints shape the decision:

- **Selection by name is unsound.** A provider row's display name is user
  editable, and several configured rows can resolve to one catalog vendor. Any
  mark chosen from a name is a guess.
- **Fetching is unsound.** models.dev serves marks at
  `https://models.dev/logos/<key>.svg`. A renderer that loaded them directly
  would need an external origin in `img-src`, would look different offline, and
  would emit an outbound request naming the providers a user configured.

## Decision

1. **Select by catalog key, not by name.** `ProviderPublic` gains an optional
   `catalogProviderKey`, filled once in Electron Main by
   `modelsDevCatalog.providerKeyForRow` during provider enrichment — the same
   alias mapping (vendor key, base URL, native-adapter aliases) that already
   places the row's metadata. The renderer neither re-derives nor duplicates
   that mapping, so there is no second source of truth.
2. **Bundle a curated set of marks.** About fifteen marks covering the catalog's
   common providers are vendored under `apps/desktop/src/assets/models/`, with
   an `UPSTREAM.md` recording the source, retrieval date, upstream MIT licence,
   and refresh procedure. Vite emits them as release assets.
3. **Render monochrome through a CSS mask.** Upstream publishes these marks as
   `currentColor` paths. Masking the bundled image with the element's own text
   color keeps every vendor at one visual weight and makes each mark follow the
   active theme, instead of filling one list with saturated colored logos.
4. **Always fall back.** A key with no vendored mark — including every row the
   catalog could not place — renders the shared generic mark. No row is ever
   left without an identity, and a missing or renamed asset degrades silently
   rather than breaking the list.

## Consequences

- One optional additive field on the public provider type. No IPC contract
  change beyond the extra property, no database migration, no persisted-format
  change, and no Plugin SDK change. A producer that omits the field keeps
  working and gets the generic mark.
- No CSP change and no runtime network access: `img-src 'self'` is untouched and
  `connect-src` does not gain a logo host.
- Marks age with upstream branding; the curated set is refreshed deliberately
  (re-vendoring third-party artwork, not a routine bump) and a stale or missing
  mark is a cosmetic fallback, never a functional loss.
- Coverage is limited to the curated key list. A provider outside it uses the
  generic mark until someone vendors its artwork, which is the honest outcome:
  no row claims a brand it cannot prove.
- The icons are decorative (`aria-hidden`, no new user-visible strings), so the
  shipped locales are unchanged; the model ID beside the mark remains the row's
  accessible name.

## Alternatives

- **Fetch marks from models.dev at runtime.** Rejected: offline-first behavior,
  one more external origin in the CSP, and a request that discloses which
  providers the user configured.
- **Pick the mark from the display name or vendor key in the renderer.**
  Rejected: duplicates the alias mapping that already exists in Main, so the two
  would drift and a renamed row could show another vendor's mark.
- **Ship the full catalog of marks.** Rejected: hundreds of third-party
  artworks, most of which no user would ever see, for no added capability.
- **Hand-drawn icons.** Rejected: it is the state the request came from. A
  curated set with one mechanism and a guaranteed fallback is what makes the
  list consistent.
