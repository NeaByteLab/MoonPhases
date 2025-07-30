import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/MoonPhases/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})