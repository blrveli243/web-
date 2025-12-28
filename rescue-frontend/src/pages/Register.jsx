import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig'; // DÜZELTME: Merkezi API kullanımı

const Register = () => {
    const navigate = useNavigate();

    // Form verilerini tek state'de tutalım (Senin yapına uygun)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'Victim' // Varsayılan rol: Afetzede
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // ESKİSİ (Hatalı): axios.post('http://localhost:3000/auth/register', ...)
            // YENİSİ (Doğru): Sadece uç noktayı ('/auth/register') yazıyoruz.
            await api.post('/auth/register', formData);

            alert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.');
            navigate('/login');
        } catch (error) {
            console.error("Kayıt hatası:", error);
            // Hata mesajını daha detaylı göstermek istersen:
            // alert(error.response?.data?.message || 'Kayıt sırasında bir hata oluştu.');
            alert('Kayıt sırasında bir hata oluştu. (E-posta kullanılıyor olabilir)');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white p-8">
            <div className="w-full max-w-md bg-slate-900 p-8 rounded-xl shadow-2xl border border-slate-800">
                <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    QuakeSense
                </h2>
                <p className="text-slate-400 text-center mb-8">Yeni Hesap Oluştur</p>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <input
                            name="email"
                            type="email"
                            placeholder="E-posta Adresi (örn: ali@test.com)"
                            className="w-full p-4 bg-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <input
                            name="password"
                            type="password"
                            placeholder="Şifre"
                            className="w-full p-4 bg-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-2 font-bold">ROLÜNÜZÜ SEÇİN</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full p-4 bg-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="Victim">Afetzede</option>
                            <option value="Volunteer">Gönüllü</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg transition shadow-lg mt-4"
                    >
                        KAYIT OL
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-400">
                    Zaten hesabınız var mı?{' '}
                    <span
                        onClick={() => navigate('/login')}
                        className="text-blue-400 cursor-pointer hover:underline"
                    >
                        Giriş Yap
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Register;