// for simplicity, we use the SQLite database, as it's available pretty much everywhere
import { defineConfig, SqlitePlatform } from '@mikro-orm/sqlite';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SeedManager } from '@mikro-orm/seeder';
import {Migrator} from "@mikro-orm/migrations";

// to get around stackblitz issues with outdated sqlite (no returning statement support)
SqlitePlatform.prototype.usesReturningStatement = () => false;

export default defineConfig({
  dbName: ':memory:',
  // folder based discovery setup, using common filename suffix
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  // we will use the ts-morph reflection, alternative to the default reflect-metadata provider
  // check the documentation for their differences: https://mikro-orm.io/docs/metadata-providers
  metadataProvider: TsMorphMetadataProvider,
  // enable debug mode to log SQL queries and discovery information
  debug: true,
  useBatchInserts: false, // this requires the returning statements which don't work in stackblitz
  // for vitest to get around `TypeError: Unknown file extension ".ts"` (ERR_UNKNOWN_FILE_EXTENSION)
  dynamicImportProvider: (id) => import(id),
  extensions: [SeedManager, Migrator],
});
