module.exports = {
    globDirectory: "build/",
    globPatterns: ["**/*.{js,css,html,png,svg,jpg,jpeg,gif,ico}"],
    swDest: "build/service-worker.js",
    clientsClaim: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "google-fonts-stylesheets",
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com/,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-webfonts",
          expiration: {
            maxAgeSeconds: 60 * 60 * 24 * 365,
          },
        },
      },
      {
        urlPattern: /^https:\/\/rsms\.me\/inter\/inter\.css/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "inter-font-stylesheet",
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "images",
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        urlPattern: /\.(?:js|css)$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-resources",
        },
      },
      {
        urlPattern: new RegExp("^https://localhost:5000/api/"),
        handler: "NetworkFirst",
        options: {
          cacheName: "api-responses",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 5 * 60, // 5 minutes
          },
        },
      }
    ],
  };