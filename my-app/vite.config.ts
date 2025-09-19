import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: "https://testffc.nimapinfotech.com/api",  
        changeOrigin: true,  
        secure: false,       
        rewrite: (path) => path.replace(/^\/api/, '')  
      },
    },
  },
})