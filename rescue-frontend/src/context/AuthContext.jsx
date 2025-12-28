import React, {createContext, useState, useEffect} from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    // Sayfa yenilenince kullanıcı bilgisi gitmesin diye localStorage'dan okuyoruz
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Giriş Fonksiyonu
    const login = (userData) => {
        // userData şunları içermeli: { access_token, email, role, id }
        setUser(userData);
        localStorage.setItem('token', userData.access_token);
        localStorage.setItem('user', JSON.stringify(userData)); // Kullanıcı detaylarını sakla
    };

    // Çıkış Fonksiyonu
    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // İsteğe bağlı: Sayfayı login'e yönlendirme işlemi component içinde yapılır
    };

    return (
        <AuthContext.Provider value={{user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};