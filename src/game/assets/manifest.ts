import { z } from 'zod';

const AssetEntrySchema = z.object({
  id: z.string().min(2),
  type: z.enum(['concept', 'sprite', 'tileset', 'map', 'audio', 'ui', 'font']),
  path: z.string().min(3),
  license: z.enum(['proprietary-original', 'generated-original', 'third-party']),
  status: z.enum(['reference-only', 'prototype', 'production']),
  attribution: z.string(),
});

const AssetManifestSchema = z.object({
  version: z.number().int().positive(),
  tileSize: z.literal(32),
  entries: z.array(AssetEntrySchema),
});

export type AssetManifest = z.infer<typeof AssetManifestSchema>;

export async function loadAssetManifest(
  fetcher: typeof fetch = fetch,
): Promise<AssetManifest> {
  const response = await fetcher('./assets/manifest.json');
  if (!response.ok) throw new Error('Não foi possível carregar o manifesto de assets.');
  return AssetManifestSchema.parse(await response.json());
}
