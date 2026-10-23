import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            includeAssets: [
                'favicon.ico',
                'pwa-192x192.png',
                'pwa-512x512.png',
                'apple-touch-icon.png',
                '2.png'
            ],
            manifest: {
                name: 'ObserveX - API Monitoring & Observability Platform',
                short_name: 'ObserveX',
                description: 'Real-time API monitoring, metrics observability, latency tracking, and error analytics across your infrastructure.',
                theme_color: '#000000',
                background_color: '#000000',
                display: 'standalone',
                orientation: 'any',
                scope: '/',
                start_url: '/',
                categories: ['developer-tools', 'productivity', 'utilities'],
                icons: [
                    {
                        src: '/pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: '/pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: '/pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    }
                ],
                shortcuts: [
                    {
                        name: 'Live Dashboard',
                        short_name: 'Dashboard',
                        description: 'View real-time API health and telemetry metrics',
                        url: '/client/dashboard',
                        icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
                    },
                    {
                        name: 'Analytics Overview',
                        short_name: 'Analytics',
                        description: 'Analyze API traffic, latency, and status codes',
                        url: '/analytics',
                        icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
                    },
                    {
                        name: 'Endpoints',
                        short_name: 'Endpoints',
                        description: 'Check individual endpoint health and response times',
                        url: '/analytics/endpoints',
                        icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,woff,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 30,
                                maxAgeSeconds: 60 * 60 * 24 * 365,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images-cache',
                            expiration: {
                                maxEntries: 60,
                                maxAgeSeconds: 60 * 60 * 24 * 30,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: /\/api\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'observex-api-cache',
                            networkTimeoutSeconds: 5,
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                ],
            },
        }),
    ],
    build: {
        target: 'esnext',
        cssCodeSplit: true,
        chunkSizeWarningLimit: 800,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/apexcharts') || id.includes('node_modules/react-apexcharts')) {
                        return 'vendor-charts';
                    }
                    if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
                        return 'vendor-react';
                    }
                    if (id.includes('node_modules/@tanstack/react-query') || id.includes('node_modules/axios')) {
                        return 'vendor-query';
                    }
                    if (id.includes('node_modules/lucide-react')) {
                        return 'vendor-icons';
                    }
                },
            },
        },
    },
    css: {
        modules: {
            localsConvention: 'camelCase',
        },
        preprocessorOptions: {
            scss: {
                api: 'modern',
            }
        }
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            '/api': {
                target: process.env.VITE_API_PROXY_TARGET || process.env.VITE_API_URL || 'https://observex-1.onrender.com',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
