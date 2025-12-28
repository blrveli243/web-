import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VictimDashboard from './pages/VictimDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Sadece Afetzedelerin (Victim) görebileceği alan */}
                <Route path="/victim" element={
                    <ProtectedRoute role="Victim">
                        <VictimDashboard />
                    </ProtectedRoute>
                } />

                {/* Sadece Gönüllülerin (Volunteer) görebileceği alan */}
                <Route path="/volunteer" element={
                    <ProtectedRoute role="Volunteer">
                        <VolunteerDashboard />
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}