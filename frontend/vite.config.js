import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Acepta conexiones desde otros dispositivos en tu misma red
    // WiFi (como tu celular), no solo desde esta misma PC.
    host: true,
    // Necesario para poder compartir el sitio con alguien fuera de
    // tu red (ej. un túnel de Cloudflare/ngrok durante una demo) —
    // por defecto Vite rechaza conexiones que no vengan de un
    // dominio "conocido" de antemano, y el dominio temporal que da
    // el túnel no lo sería.
    allowedHosts: true,
    // Redirige internamente las peticiones "/api/..." hacia el
    // backend real, sin que el navegador tenga que saber su
    // dirección. Esto permite exponer un solo puerto (5173) con un
    // único túnel durante una demo remota, en vez de necesitar dos
    // túneles simultáneos (algo que el plan gratuito de ngrok no
    // permite). VITE_BACKEND_INTERNAL_URL cambia según el contexto:
    // "http://backend:3000" dentro de Docker, "http://localhost:3000"
    // en desarrollo manual (su valor por defecto).
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_INTERNAL_URL || 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
