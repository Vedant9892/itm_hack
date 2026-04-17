import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import UserDashboard from './pages/UserDashboard';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
    <Toaster richColors position="top-right" />
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;