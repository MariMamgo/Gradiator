
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { databaseService } from './services/DatabaseService.ts'
import { toast } from './hooks/use-toast'

// Set the document title
document.title = 'Gradiator';

// Initialize database with mock data
databaseService.initializeIfEmpty()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    toast({
      title: 'Database Error',
      description: 'There was an error initializing the application data. Some features may not work correctly.',
      variant: 'destructive',
    });
  });

// Check for data persistence capability
if (!window.localStorage) {
  console.warn('LocalStorage is not available. Data persistence may not work properly.');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
