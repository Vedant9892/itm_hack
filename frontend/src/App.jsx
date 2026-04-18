import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import Soreness from './pages/soreness';
import SmartDevices from './pages/SmartDevices';
import AnatomyPage from './pages/AnatomyPage';
import { Toaster } from 'sonner';

function App() {
    return (
        <>
            <Toaster richColors position="top-right" />
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/dashboard" element={<UserDashboard />} />
                    <Route path="/soreness" element={<Soreness />} />
                    <Route path="/smart-devices" element={<SmartDevices />} />
                    <Route path="/anatomy" element={<AnatomyPage />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
