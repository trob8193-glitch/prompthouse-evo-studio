import coreImport from '../buildkit_import/incoming_prompthouse_20260430_172709/import_manifest.json';
import builderImport from '../buildkit_import/incoming_prompthouse_20260430_174955/import_manifest.json';
import forgeTermImport from '../buildkit_import/incoming_prompthouse_20260430_182139/import_manifest.json';

export const SELF_BUILD_BATCHES = [
  {
    id: 'core-pack-import-20260430-172709',
    label: 'Core Pack Import',
    manifest: coreImport,
  },
  {
    id: 'builder-pack-import-20260430-174955',
    label: 'Builder Pack Import',
    manifest: builderImport,
  },
  {
    id: 'forgeterm-import-20260430-182139',
    label: 'ForgeTerm Import',
    manifest: forgeTermImport,
  },
];

export const SELF_BUILD_PACKS = SELF_BUILD_BATCHES.flatMap((batch) =>
  batch.manifest.packs.map((pack) => ({
    ...pack,
    ImportKey: `${batch.id}:${pack.Pack}`,
    BatchId: batch.id,
    BatchLabel: batch.label,
    BatchRoot: batch.manifest.root,
    ImportedAt: batch.manifest.imported_at,
  })),
);
