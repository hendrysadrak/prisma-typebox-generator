import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/cli.ts',
    index: 'src/index.ts',
  },
  target: 'node16',
  format: ['cjs', 'esm'],
  // dts: true,
  clean: true,
  treeshake: true,
});
