import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Dosya yolunu kontrol et
import api from '../api/axiosConfig'; // DÜZELTME: Artık merkezi API ayarını kullanıyoruz

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // ESKİSİ (Hatalı): await axios.post('http://localhost:3000/auth/login', ...)
            // YENİSİ (Doğru): api.post kullanıyoruz, URL'in başını o kendisi tamamlıyor.
            const response = await api.post('/auth/login', { email, password });

            // Giriş başarılı, kullanıcı verisini Context'e kaydet
            login(response.data);

            // Role göre yönlendirme (Senin ekran görüntündeki mantık)
            if (response.data.role === 'Volunteer') {
                navigate('/volunteer'); // Gönüllü sayfasına
            } else {
                navigate('/victim'); // Afetzede sayfasına
            }
        } catch (error) {
            console.error("Giriş hatası:", error);
            alert('Giriş başarısız! E-posta veya şifre hatalı.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white p-8">
            <div className="w-full max-w-md bg-slate-900 p-8 rounded-xl shadow-2xl border border-slate-800">
                <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    QuakeSense
                </h2>
                <p className="text-slate-400 text-center mb-8">Sisteme Giriş Yap</p>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <input
                            type="email"
                            placeholder="E-posta Adresi"
                            className="w-full p-4 bg-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Şifre"
                            className="w-full p-4 bg-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg transition shadow-lg hover:shadow-blue-500/20"
                    >
                        GİRİŞ YAP
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-400">
                    Hesabınız yok mu?{' '}
                    <span
                        onClick={() => navigate('/register')}
                        className="text-blue-400 cursor-pointer hover:underline"
                    >
                        Hemen Kayıt Ol
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;