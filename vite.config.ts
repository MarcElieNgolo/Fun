import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // ⚠️ Très important pour les chemins relatifs !
  plugins: [react()],
});
