import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Shield, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('password', formData.password);

      await login(data);

      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] p-6">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/10 rounded-2xl mb-6">
            <Shield className="h-10 w-10 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Berqenas</h1>
          <p className="text-gray-400">Cloud & Security Control Panel</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#151B2B] rounded-2xl shadow-2xl p-8 border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-6">Giriş Yap</h3>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full bg-[#0B0F1A] border border-gray-800 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-[#0B0F1A] border border-gray-800 text-white pl-12 pr-12 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-sm text-gray-600">
          &copy; 2026 Berqenas. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;