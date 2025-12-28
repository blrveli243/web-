import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VictimDashboard from './pages/VictimDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

function App() {
    const { user } = useContext(AuthContext);

    return (
        <Router>
            <Routes>
                {/* Giriş ve Kayıt Sayfaları */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Rol Bazlı Yönlendirme: Giriş yapılmadıysa Login'e atar */}
                <Route
                    path="/victim"
                    element={
                        user ? (
                            user.role === 'Victim' ? (
                                <VictimDashboard />
                            ) : (
                                <Navigate to={user.role === 'Volunteer' ? '/volunteer' : '/login'} />
                            )
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/volunteer"
                    element={
                        user ? (
                            user.role === 'Volunteer' ? (
                                <VolunteerDashboard />
                            ) : (
                                <Navigate to={user.role === 'Victim' ? '/victim' : '/login'} />
                            )
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />

                {/* Ana sayfa açıldığında otomatik olarak Login'e yönlendir */}
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

// BU SATIR ÇOK KRİTİK: Vite'in sayfayı görebilmesi için şart!
export default App;