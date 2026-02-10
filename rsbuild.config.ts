import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    alias: {
      '@': './src',
    },
    define: {
      'process.env.PUBLIC_YOUTUBE_API_KEY': JSON.stringify(process.env.PUBLIC_YOUTUBE_API_KEY || ''),
      'process.env.PUBLIC_BACKEND_URL': JSON.stringify(process.env.PUBLIC_BACKEND_URL || 'http://localhost:3001'),
    },
  },
  output: {
    distPath: {
      root: 'build',
    },
  },
});
