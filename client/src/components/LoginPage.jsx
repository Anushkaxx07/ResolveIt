import React, { useState } from 'react';
import {
  Shield,
  User,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Wrench
} from 'lucide-react';
import { api } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrorMessage('Please enter your corporate email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await api.login(email.trim(), password, role);
      localStorage.setItem('smartdesk_user', JSON.stringify(res.data));
      onLoginSuccess(res.data);
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Resolve<span className="text-blue-500">IT</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">Enterprise Service Desk & Ticket Portal</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl border border-slate-100">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Sign In</h2>
              <p className="text-xs text-slate-500 mt-0.5">Enter your account credentials</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <KeyRound className="h-4 w-4" />
            </div>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Corporate Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Role Category <span className="text-red-500">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="Employee">Employee</option>
                <option value="SupportStaff">Support Staff / Administrator</option>
                <option value="DepartmentStaff">Department Staff Specialist</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 bg-slate-50 -mx-6 -mb-8 p-5 rounded-b-2xl text-xs space-y-2 text-slate-600">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              Test Credentials:
            </div>
            <div className="text-[11px] space-y-1">
              <p>
                <strong>Support Staff / Admin:</strong> <code>admin@gmail.com</code> | <code>admin123</code>
              </p>
              <p>
                <strong>Department Staff (IT):</strong> <code>alex.turner@company.com</code> | <code>password123</code>
              </p>
              <p>
                <strong>Employee:</strong> <code>anushka@company.com</code> | <code>password123</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
