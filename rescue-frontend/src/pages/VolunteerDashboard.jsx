import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { ChevronDown, Users, UserPlus, UserMinus, LogOut, User, Activity } from 'lucide-react';
import CommentSection from '../components/CommentSection';

const VolunteerDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [needs, setNeeds] = useState([]);
    const [openDropdowns, setOpenDropdowns] = useState({});
    const dropdownRefs = useRef({});

    useEffect(() => { 
        fetchNeeds(); 
    }, []);

    useEffect(() => {
        // Dışarı tıklandığında dropdown'ları kapat
        const handleClickOutside = (event) => {
            Object.keys(openDropdowns).forEach(id => {
                const ref = dropdownRefs.current[id];
                if (ref && !ref.contains(event.target) && openDropdowns[id]) {
                    setOpenDropdowns(prev => ({ ...prev, [id]: false }));
                }
            });
        };

        if (Object.keys(openDropdowns).length > 0) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [openDropdowns]);

    const fetchNeeds = async () => {
        try {
            const response = await api.get('/needs');
            setNeeds(response.data);
        } catch (err) { console.error(err); }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await api.patch(`/needs/${id}/status`, { status: newStatus });
            setOpenDropdowns(prev => ({ ...prev, [id]: false }));
            fetchNeeds();
        } catch (err) { 
            console.error('Durum güncelleme hatası:', err);
            alert("Güncelleme başarısız."); 
        }
    };

    const toggleDropdown = (id) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Açık':
                return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'Gönüllü Yolda':
                return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'Yardım Edildi':
                return 'text-green-500 bg-green-500/10 border-green-500/20';
            default:
                return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Açık':
                return '⏳';
            case 'Gönüllü Yolda':
                return '🚗';
            case 'Yardım Edildi':
                return '✅';
            default:
                return '📋';
        }
    };

    const statusOptions = ['Açık', 'Gönüllü Yolda', 'Yardım Edildi'];

    const handleAddVolunteer = async (needId) => {
        try {
            await api.post(`/needs/${needId}/volunteers`);
            alert('Yardım etmeyi kabul ettiniz!');
            fetchNeeds();
        } catch (error) {
            console.error('Volunteer ekleme hatası:', error);
            alert('Yardım etme işlemi başarısız.');
        }
    };

    const handleRemoveVolunteer = async (needId) => {
        if (!window.confirm('Yardım etmekten vazgeçmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            await api.delete(`/needs/${needId}/volunteers/${user.id}`);
            alert('Yardım etmekten vazgeçtiniz.');
            fetchNeeds();
        } catch (error) {
            console.error('Volunteer çıkarma hatası:', error);
            alert('İşlem başarısız.');
        }
    };

    const isVolunteer = (need) => {
        return need.volunteers?.some((v) => v.id === user?.id);
    };

    const handleLogout = () => {
        if (window.confirm("Çıkış yapmak istiyor musunuz?")) {
            logout();
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600/20 p-2 rounded-full text-blue-500">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            QuakeSense
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <User size={12} />
                            <span>{user?.email || 'Kullanıcı'}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/50 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-500/20 transition"
                >
                    <LogOut size={16} />
                    ÇIKIŞ
                </button>
            </nav>

            <div className="p-8">
                <h1 className="text-3xl font-bold mb-10 border-l-4 border-blue-600 pl-4">Gönüllü Takip Paneli</h1>
            <div className="grid gap-6">
                {needs.map((item) => {
                    const volunteerStatus = isVolunteer(item);
                    return (
                        <div key={item.id} className="bg-slate-900 p-8 rounded-3xl border border-white/5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold mb-2">{item.title}</h2>
                                    <p className="text-slate-400 mb-3">{item.description}</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold px-3 py-1 bg-white/5 rounded-full border border-white/10 uppercase">
                                            Durum: {item.status || 'Açık'}
                                        </span>
                                        {item.volunteers && item.volunteers.length > 0 && (
                                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                                <Users size={14} />
                                                <span>{item.volunteers.length} Gönüllü</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 items-end">
                                    {!volunteerStatus && item.status === 'Açık' && (
                                        <button
                                            onClick={() => handleAddVolunteer(item.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl font-bold transition"
                                        >
                                            <UserPlus size={16} />
                                            Yardım Et
                                        </button>
                                    )}
                                    {volunteerStatus && (
                                        <button
                                            onClick={() => handleRemoveVolunteer(item.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition"
                                        >
                                            <UserMinus size={16} />
                                            Vazgeç
                                        </button>
                                    )}
                                    <div 
                                        className="relative"
                                        ref={(el) => (dropdownRefs.current[item.id] = el)}
                                    >
                                        <button
                                            onClick={() => toggleDropdown(item.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold border transition-all ${
                                                getStatusColor(item.status || 'Açık')
                                            } hover:opacity-80`}
                                        >
                                            <span>{getStatusIcon(item.status || 'Açık')}</span>
                                            <span>{item.status || 'Açık'}</span>
                                            <ChevronDown 
                                                size={16} 
                                                className={`transition-transform ${
                                                    openDropdowns[item.id] ? 'rotate-180' : ''
                                                }`}
                                            />
                                        </button>
                                        
                                        {openDropdowns[item.id] && (
                                            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden">
                                                {statusOptions.map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => updateStatus(item.id, status)}
                                                        className={`w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors flex items-center gap-2 ${
                                                            (item.status || 'Açık') === status 
                                                                ? 'bg-slate-700/50 font-bold' 
                                                                : ''
                                                        }`}
                                                    >
                                                        <span>{getStatusIcon(status)}</span>
                                                        <span>{status}</span>
                                                        {(item.status || 'Açık') === status && (
                                                            <span className="ml-auto text-xs">✓</span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <CommentSection needId={item.id} />
                        </div>
                    );
                })}
            </div>
            </div>
        </div>
    );
};
export default VolunteerDashboard;