import React, {useState, useEffect, useContext} from 'react';
import api from '../api/axiosConfig';
import {AuthContext} from '../context/AuthContext';
import {useNavigate} from 'react-router-dom';
import {LogOut, User, MapPin, Activity} from 'lucide-react';
import CommentSection from '../components/CommentSection';

const VictimDashboard = () => {
    const {user, logout} = useContext(AuthContext);
    const navigate = useNavigate();

    const [needs, setNeeds] = useState([]);
    // Düzenlenen talebi tutan state
    const [editingNeed, setEditingNeed] = useState(null);
    const [categories, setCategories] = useState([]);
    const [subject, setSubject] = useState(''); // Konu
    const [details, setDetails] = useState(''); // Detay
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

    const fetchNeeds = async () => {
        try {
            const response = await api.get('/needs');
            setNeeds(response.data);
        } catch (error) {
            console.error("Veri çekme hatası:", error);
        }
    };

    useEffect(() => {
        fetchNeeds();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
            if (response.data.length > 0 && !selectedCategoryId) {
                setSelectedCategoryId(response.data[0].id);
            }
        } catch (error) {
            console.error("Kategori çekme hatası:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('=== FORM SUBMIT BAŞLADI ===');
        console.log('User:', user);
        console.log('Subject:', subject);
        console.log('Details:', details);

        // Kullanıcı ID kontrolü (Güvenlik)
        if (!user || !user.id) {
            console.error('User veya user.id yok:', user);
            alert("Oturum hatası: Lütfen tekrar giriş yapın.");
            return;
        }

        // Form validasyonu
        if (!subject.trim() || !details.trim()) {
            alert("Lütfen tüm alanları doldurun.");
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('API çağrısı yapılıyor...');
            const requestData = {
                title: subject.trim(),
                description: details.trim(),
                userId: user.id,
                categoryId: selectedCategoryId,
            };
            console.log('Gönderilen veri:', requestData);

            const response = await api.post('/needs', requestData);
            console.log('API yanıtı:', response.data);
            console.log('=== BAŞARILI ===');

            alert('Talep başarıyla iletildi!');
            setSubject('');
            setDetails('');
            await fetchNeeds();
        } catch (error) {
            console.error("=== TALEP HATASI ===");
            console.error("Hata objesi:", error);
            console.error("Hata mesajı:", error.message);
            console.error("Response data:", error.response?.data);
            console.error("Response status:", error.response?.status);
            console.error("Response headers:", error.response?.headers);

            let errorMessage = 'Bilinmeyen bir hata oluştu';

            if (error.response?.data) {
                // NestJS validation hataları
                if (Array.isArray(error.response.data.message)) {
                    errorMessage = error.response.data.message.join(', ');
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            alert(`Bir hata oluştu: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    // Düzenleme Formunu Kaydetme
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!editingNeed) return;

        // Form validasyonu
        if (!editingNeed.title?.trim() || !editingNeed.description?.trim()) {
            alert("Lütfen tüm alanları doldurun.");
            return;
        }

        try {
            console.log('=== GÜNCELLEME İSTEĞİ BAŞLADI ===');
            console.log('Talep ID:', editingNeed.id);
            console.log('Gönderilecek veri:', {
                title: editingNeed.title.trim(),
                description: editingNeed.description.trim(),
                categoryId: Number(editingNeed.categoryId)
            });

            // Backend'e yeni verileri gönder
            const response = await api.patch(`/needs/${editingNeed.id}`, {
                title: editingNeed.title.trim(),
                description: editingNeed.description.trim(),
                categoryId: Number(editingNeed.categoryId)
            });

            console.log('Güncelleme başarılı:', response.data);

            // Listeyi backend'den yeniden çek
            await fetchNeeds();

            setEditingNeed(null); // Pencereyi kapat
            alert("Talep güncellendi! ");
        } catch (error) {
            console.error("=== GÜNCELLEME HATASI ===");
            console.error("Hata objesi:", error);
            console.error("Hata mesajı:", error.message);
            console.error("Response status:", error.response?.status);
            console.error("Response data:", error.response?.data);
            console.error("Request URL:", error.config?.url);
            console.error("Request method:", error.config?.method);
            
            let errorMessage = "Güncellerken hata oluştu.";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            alert(`Hata: ${errorMessage}`);
        }
    };

    const handleLogout = () => {
        if (window.confirm("Çıkış yapmak istiyor musunuz?")) {
            logout();
            navigate('/login');
        }
    };

    const handleDeleteNeed = async (needId) => {
        if (!window.confirm('Bu talebi silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            await api.delete(`/needs/${needId}`);
            alert('Talep başarıyla silindi!');
            fetchNeeds();
        } catch (error) {
            console.error('Silme hatası:', error);
            alert('Talep silinirken bir hata oluştu.');
        }
    };
    // Durum Güncelleme Fonksiyonu
    const handleUpdateStatus = async (needId, currentStatus) => {
        // Eğer zaten yardım edildiyse işlem yapma
        if (currentStatus === 'Yardım Edildi') return;

        if (window.confirm('Bu ihtiyacın karşılandığını onaylıyor musun? Durum "Tamamlandı" olacak.')) {
            try {
                // Backend'e güncelleme isteği (Controller: @Patch(':id/status'))
                // statusMap yapına uyması için 'Yardım Edildi' gönderiyoruz
                await api.patch(`/needs/${needId}/status`, {status: 'Yardım Edildi'});

                // Listeyi güncelle
                setNeeds(prevNeeds => prevNeeds.map(need =>
                    need.id === needId ? {...need, status: 'Yardım Edildi'} : need
                ));

                alert('Durum güncellendi! Geçmiş olsun.');
            } catch (error) {
                console.error("Güncelleme hatası:", error);
                alert('Güncelleme yapılamadı.');
            }
        }
    };

    const getStatusDisplay = (status) => {
        const statusMap = {
            'Açık': {text: 'Bekleniyor', color: 'bg-yellow-500/10 text-yellow-500', icon: '⏳'},
            'Gönüllü Yolda': {text: 'Yolda', color: 'bg-blue-500/10 text-blue-500', icon: '🚗'},
            'Yardım Edildi': {text: 'Tamamlandı', color: 'bg-green-500/10 text-green-500', icon: '✅'},
        };

        const defaultStatus = {text: 'Bekleniyor', color: 'bg-yellow-500/10 text-yellow-500', icon: '⏳'};
        return statusMap[status] || defaultStatus;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <nav
                className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600/20 p-2 rounded-full text-blue-500">
                        <Activity size={24}/>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            QuakeSense
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <User size={12}/>
                            <span>{user?.email || 'Kullanıcı'}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/50 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-500/20 transition"
                >
                    <LogOut size={16}/>
                    ÇIKIŞ
                </button>
            </nav>

            <div className="max-w-4xl mx-auto p-6 space-y-8">
                {/* FORM ALANI */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                        <MapPin className="text-blue-500"/>
                        Yardım Talebi
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2 font-bold">Kategori</label>
                            <select
                                value={selectedCategoryId || ''}
                                onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                                className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-white"
                                required
                            >
                                <option value="">Kategori Seçin</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2 font-bold">İhtiyaç Konusu</label>
                            <input
                                type="text"
                                placeholder="Örn: Gıda, Çadır..."
                                className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-white"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2 font-bold">Detaylı Açıklama</label>
                            <textarea
                                placeholder="Durum detayları..."
                                className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition h-32 resize-none text-white"
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-blue-900/20 ${
                                isSubmitting
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isSubmitting ? 'GÖNDERİLİYOR...' : 'TALEBİ YAYINLA'}
                        </button>
                    </form>
                </div>

                {/* LİSTE ALANI */}
                <div>
                    <h3 className="text-xl font-bold text-slate-400 mb-4 px-2">
                        Aktif Talepler ({needs.length})
                    </h3>

                    {needs.length === 0 ? (
                        <div
                            className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                            <p className="text-slate-500">Henüz talep yok.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {needs.map((need) => {
                                const statusDisplay = getStatusDisplay(need.status);
                                return (
                                    <div key={need.id}
                                         className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex flex-col gap-2 hover:border-slate-700 transition">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-lg font-bold text-blue-400">{need.title || "Başlıksız"}</h4>
                                            {/* --- DÜZENLE BUTONU (Sil butonunun yanına koy) --- */}
                                            <button
                                                onClick={() => setEditingNeed(need)}
                                                className="mr-2 text-blue-400 hover:text-blue-300 text-xs font-bold border border-blue-500/30 px-3 py-1 rounded hover:bg-blue-500/10 transition"
                                            >
                                                Düzenle
                                            </button>
                                            <div className="flex items-center gap-2">
                                                    <span
                                                        className={`${statusDisplay.color} px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1`}>
                                                        <span>{statusDisplay.icon}</span>
                                                        <span>{statusDisplay.text}</span>
                                                    </span>

                                                <button
                                                    onClick={() => handleDeleteNeed(need.id)}
                                                    className="bg-red-500/10 text-red-500 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-500/20 transition border border-red-500/20"
                                                >
                                                    Sil
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-slate-300 font-medium text-sm">{need.description}</p>
                                        <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-800">
                                            {new Date(need.createdAt || Date.now()).toLocaleString('tr-TR')}
                                        </p>
                                        <CommentSection needId={need.id}/>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            {/* --- DÜZENLEME MODALI (POP-UP) --- */}
            {editingNeed && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div
                        className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative">

                        {/* Kapatma Butonu (X) */}
                        <button
                            onClick={() => setEditingNeed(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
                        >
                            ✕
                        </button>

                        <h3 className="text-xl font-bold text-white mb-6">✏️ Talebi Düzenle</h3>

                        <form onSubmit={handleUpdateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Kategori</label>
                                <select
                                    value={editingNeed.categoryId || ''}
                                    onChange={(e) => setEditingNeed({...editingNeed, categoryId: Number(e.target.value)})}
                                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500"
                                    required
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Başlık</label>
                                <input
                                    type="text"
                                    value={editingNeed.title || ''}
                                    onChange={(e) => setEditingNeed({...editingNeed, title: e.target.value})}
                                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Açıklama</label>
                                <textarea
                                    value={editingNeed.description || ''}
                                    onChange={(e) => setEditingNeed({...editingNeed, description: e.target.value})}
                                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none h-32 resize-none focus:border-blue-500"
                                    required
                                />
                            </div>

                            <button type="submit"
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white transition">
                                KAYDET VE KAPAT
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VictimDashboard;