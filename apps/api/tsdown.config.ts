import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/server.ts'],
  platform: 'node',
  target: 'node24',
  format: 'esm',
  // Internal workspace packages ship raw TS, so bundle them into the output
  noExternal: [/^@pomodoro\//],
});
