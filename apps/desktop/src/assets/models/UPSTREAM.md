# Provider brand marks

The SVG files in this directory are brand marks for the AI providers
PI-Desktop knows how to talk to. They are **bundled with the app**: the
renderer never loads a logo from a network location, so a row's mark appears
the same offline and no outbound request reveals which providers a user has
configured.

## Upstream

- Source: <https://models.dev/logos/&lt;key&gt;.svg>, retrieved 2026-09-25.
- Project: [models.dev](https://github.com/sst/models.dev), MIT licensed.
- One file per catalog provider key; the file name is that key verbatim, so
  `catalogProviderKey` from `providers.list` selects the mark directly.

Only the monochrome `currentColor` variants are vendored. That is deliberate:
rendering each mark through a CSS mask means every row carries one visual
weight and inherits the surrounding text color in both themes, instead of a
run of saturated colored logos.

## Refreshing

```bash
for key in openai anthropic google xai meta mistral deepseek alibaba-cn \
           zhipuai moonshotai-cn minimax-cn volcengine openrouter groq \
           togetherai; do
  curl -fsSL "https://models.dev/logos/$key.svg" -o "$key.svg"
done
```

Review the diff before committing: a mark is third-party artwork, so an
upstream change is a re-vendor, not a routine update. Add or remove a key in
the same change that touches `apps/desktop/src/lib/provider-marks.ts`, and
keep the two in step.

An unknown key is not an error. The UI falls back to the shared generic mark,
so a provider missing here stays fully usable.
