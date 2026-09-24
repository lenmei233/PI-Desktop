import { IconBot } from "../../../components/icons";
import { providerMarkUrl } from "../../../lib/provider-marks";

/**
 * One provider identity mark for the Composer model list.
 *
 * A known catalog key renders its bundled brand mark through a CSS mask, so
 * every row carries a single visual weight and inherits the surrounding text
 * color in either theme — the marks upstream publish are monochrome
 * `currentColor` artwork, and a mask keeps them that way instead of dropping a
 * run of saturated logos into one list. Anything else, including a row the
 * catalog could not place, falls back to the shared generic mark, so a
 * provider without a vendored mark is still recognizable and never an
 * unlabeled row.
 */
export function ModelProviderIcon({ catalogProviderKey }: { catalogProviderKey?: string }) {
  const mark = providerMarkUrl(catalogProviderKey);
  if (!mark) return <IconBot size={14} className="provider-mark provider-mark-generic" aria-hidden="true" />;
  return (
    <span
      className="provider-mark provider-mark-brand"
      style={{ maskImage: `url(${mark})`, WebkitMaskImage: `url(${mark})` }}
      aria-hidden="true"
    />
  );
}
