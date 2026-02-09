/**
 * App.jsx
 * 
 * Main application component.
 * Renders the routing configuration created in AppRoutes.
 * 
 * Students: This is the entry point for the entire app.
 * Notice how it simply renders AppRoutes - all routing logic
 * is organized separately for clarity.
 */

import AppRoutes from './routes/AppRoutes.jsx';
import './App.css';

function App() {
  return <AppRoutes />;
}

export default App;
