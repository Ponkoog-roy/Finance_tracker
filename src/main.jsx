// 1. A dynamic proxy that auto-generates missing auth methods on the fly
const dynamicAuthHandler = {
  get: (target, prop) => {
    // If the code requests a standard property like isAuthenticated, return it
    if (prop === 'isAuthenticated') return async () => false;
    if (prop === 'me') return async () => null;

    // For ANY other method called (register, signUp, login, signIn, etc.), 
    // dynamically return a dummy successful async function to stop crashes.
    return async (...args) => {
      console.log(`[Base44 Mock] Dynamically intercepted db.auth.${prop}() with args:`, args);
      return { user: { id: "1", name: "Pankaj Kumar Roy", email: args[0] || "user@example.com" } };
    };
  }
};

// Inject the global trap setup
globalThis.__B44_DB__ = {
  auth: new Proxy({}, dynamicAuthHandler),
  entities: new Proxy({}, {
    get: () => ({
      filter: async () => [],
      get: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({})
    })
  }),
  integrations: {
    Core: {
      UploadFile: async () => ({ file_url: '' })
    }
  }
};

// Assign it to any other namespace variants the application might look for
globalThis.db = globalThis.__B44_DB__;

// 2. Your original React system loaders
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
