import { AlertCircle, KeyRound, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { APP_CONFIG } from '../../config/app.config';

interface AdminLoginProps {
  onLoginSuccess: (token: string, user: { id: string; email: string; fullName: string; role: string }) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (loginEmail = email, loginPass = password) => {
    if (!loginEmail.trim() || !loginPass.trim()) {
      setError('Please enter both official email and credential password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Authentication failed.');
      }

      onLoginSuccess(json.data.token, json.data.user);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] shadow-xs p-6 sm:p-8">
        {/* Top Gold Accent Line */}
        <div className="w-12 h-1 bg-[#D97706] mx-auto mb-5" />

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#382B20] text-[#FBBF24] border border-[#231A12] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Lock className="w-6 h-6 text-[#F59E0B]" />
          </div>
          <h2 className="text-lg font-black text-[#261F18] uppercase tracking-tight">
            Admissions Management Console
          </h2>
          <p className="text-xs text-[#7A6A59] mt-1">
            Restricted access for registrar officials and admissions evaluation staff at {APP_CONFIG.school.name}.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#FEF2F2] border-l-4 border-[#DC2626] text-[#991B1B] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
              Official Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8A7968] absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@stfrancis.edu"
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] font-mono placeholder-[#A89885] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
              Account Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#8A7968] absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] font-mono placeholder-[#A89885] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#382B20] text-[#FFFBEB] hover:bg-[#231A12] border border-[#F59E0B] font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#F59E0B]" /> : <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />}
            <span>Authenticate Session</span>
          </button>
        </form>

        {/* Quick Demo Login Preset Buttons */}
        <div className="mt-8 pt-6 border-t border-[#EBE3D5]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#7A6A59] text-center mb-3">
            Evaluation Credentials (Quick Fill)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@stfrancis.edu');
                setPassword('AdminPass2026!');
                handleLogin('admin@stfrancis.edu', 'AdminPass2026!');
              }}
              className="p-3 border-2 border-[#E5D7BE] bg-[#FAF6EE] hover:border-[#D97706] hover:bg-[#FDFBF7] text-[#261F18] text-xs font-bold transition-all text-center flex flex-col items-center cursor-pointer"
            >
              <span className="font-bold uppercase text-[11px] text-[#855D1E]">Admin Account</span>
              <span className="text-[10px] text-[#7A6A59] font-normal mt-0.5">Dean Eleanor Vance</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('staff@stfrancis.edu');
                setPassword('StaffPass2026!');
                handleLogin('staff@stfrancis.edu', 'StaffPass2026!');
              }}
              className="p-3 border-2 border-[#D8CEBE] bg-[#EBE3D5] hover:border-[#D97706] hover:bg-[#FDFBF7] text-[#261F18] text-xs font-bold transition-all text-center flex flex-col items-center cursor-pointer"
            >
              <span className="font-bold uppercase text-[11px] text-[#4A3B2C]">Staff Account</span>
              <span className="text-[10px] text-[#7A6A59] font-normal mt-0.5">Officer Marcus Aurel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
