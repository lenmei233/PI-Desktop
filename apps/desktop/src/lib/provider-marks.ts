import alibabaCnUrl from "../assets/models/alibaba-cn.svg";
import anthropicUrl from "../assets/models/anthropic.svg";
import deepseekUrl from "../assets/models/deepseek.svg";
import googleUrl from "../assets/models/google.svg";
import groqUrl from "../assets/models/groq.svg";
import metaUrl from "../assets/models/meta.svg";
import minimaxCnUrl from "../assets/models/minimax-cn.svg";
import mistralUrl from "../assets/models/mistral.svg";
import moonshotaiCnUrl from "../assets/models/moonshotai-cn.svg";
import openaiUrl from "../assets/models/openai.svg";
import openrouterUrl from "../assets/models/openrouter.svg";
import togetheraiUrl from "../assets/models/togetherai.svg";
import volcengineUrl from "../assets/models/volcengine.svg";
import xaiUrl from "../assets/models/xai.svg";
import zhipuaiUrl from "../assets/models/zhipuai.svg";

/**
 * Bundled brand marks, keyed by the models.dev provider key that enrichment
 * already resolves for a configured row (`catalogProviderKey`).
 *
 * The key is the row's own catalog identity, not a guess from its display
 * name, so two rows a user renamed the same way still get their own marks and
 * a vendor's mark never follows a custom name. See assets/models/UPSTREAM.md
 * for the source and the refresh procedure.
 */
const PROVIDER_MARKS: Readonly<Record<string, string>> = {
  openai: openaiUrl,
  anthropic: anthropicUrl,
  google: googleUrl,
  xai: xaiUrl,
  meta: metaUrl,
  mistral: mistralUrl,
  deepseek: deepseekUrl,
  "alibaba-cn": alibabaCnUrl,
  zhipuai: zhipuaiUrl,
  "moonshotai-cn": moonshotaiCnUrl,
  "minimax-cn": minimaxCnUrl,
  volcengine: volcengineUrl,
  openrouter: openrouterUrl,
  groq: groqUrl,
  togetherai: togetheraiUrl,
};

/** Every bundled provider key, for callers that need the whole set. */
export const bundledProviderMarkKeys: readonly string[] = Object.keys(PROVIDER_MARKS);

/**
 * Bundled mark for a provider's catalog key, or `undefined` when none is
 * vendored for it. An absent key means "unknown provider", never "broken":
 * the caller shows the shared generic mark instead, so no provider row is
 * left without an identity.
 */
export function providerMarkUrl(catalogProviderKey: string | undefined): string | undefined {
  if (!catalogProviderKey) return undefined;
  return PROVIDER_MARKS[catalogProviderKey];
}
