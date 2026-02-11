import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Plugin to strip "use client" directives from @vkontakte/icons.
 * These directives cause warnings in Vite since it doesn't use RSC.
 */
function handleModuleDirectivesPlugin() {
  return {
    name: 'handle-module-directives-plugin',
    transform(code: string, id: string) {
      if (id.includes('@vkontakte/icons')) {
        code = code.replace(/"use-client";?/g, '');
      }
      return { code };
    },
  };
}

const vendorChunkMatchers: Array<{ name: string; test: RegExp }> = [
  { name: 'vkui', test: /[\\/]node_modules[\\/]@vkontakte[\\/]vkui[\\/]/ },
  { name: 'vkui-icons', test: /[\\/]node_modules[\\/]@vkontakte[\\/]icons[\\/]/ },
  { name: 'vk-bridge', test: /[\\/]node_modules[\\/]@vkontakte[\\/]vk-bridge[\\/]/ },
];

const manualChunks = (id: string): string | undefined => {
  if (!id.includes('node_modules')) return undefined;

  for (const matcher of vendorChunkMatchers) {
    if (matcher.test.test(id)) return matcher.name;
  }

  if (
    /[\\/]node_modules[\\/]react(?:-dom)?[\\/]/.test(id) ||
    /[\\/]node_modules[\\/]scheduler[\\/]/.test(id)
  ) {
    return 'react-vendor';
  }

  return 'vendor';
};

export default defineConfig({
  base: './',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@data': path.resolve(__dirname, 'src/data'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },

  server: {
    port: 10888,
    host: true,
  },

  plugins: [
    react(),
    handleModuleDirectivesPlugin(),
  ],

  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    css: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    testTimeout: 10000,
  },
});
