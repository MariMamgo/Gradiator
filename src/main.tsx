
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { databaseService } from './services/DatabaseService.ts'

// Set the document title
document.title = 'Gradiator';

// Initialize database with mock data
databaseService.initializeIfEmpty().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
