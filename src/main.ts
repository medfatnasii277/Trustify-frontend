import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Polyfill for SockJS - define global for browser environment
(window as any).global = window;

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
