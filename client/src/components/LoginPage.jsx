import React, { useState } from 'react';
import {
  Shield,
  User,
  Lock,
  Mail,
  Building,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  UserPlus,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

const SUPPORT_DEPARTMENTS = ['IT', 'HR', 'Facilities', 'Finance', 'Access Management'];

const DEMO_ACCOUNTS = [
  { label: 'Support Admin', email: 'admin@gmail.com', pass: 'admin123', role: 'SupportStaff' },
  { label: 'IT Specialist', email: 'alex.turner@company.com', pass: 'password123', role: 'DepartmentStaff' },
  { label: 'Employee', email: 'anushka@company.com', pass: 'password123', role: 'Employee' },
];

export default function LoginPage({ onLoginSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [role, setRole] = useState('Employee');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const switchMode = (registerMode) => {
    setIsRegisterMode(registerMode);
    setErrorMessage('');
    setSuccessMessage('');
    if (registerMode) {
      setDepartment(role === 'DepartmentStaff' ? 'IT' : 'Engineering');
    }
  };

  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    if (errorMessage) setErrorMessage('');
    if (isRegisterMode) {
      if (nextRole === 'DepartmentStaff' && !SUPPORT_DEPARTMENTS.includes(department)) {
        setDepartment('IT');
      } else if (nextRole !== 'DepartmentStaff' && !department.trim()) {
        setDepartment('Engineering');
      }
    }
  };

  const fillDemo = (acc) => {
    setIsRegisterMode(false);
    setEmail(acc.email);
    setPassword(acc.pass);
    setRole(acc.role);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegisterMode && !name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your corporate email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (isRegisterMode && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (isRegisterMode && !department.trim()) {
      setErrorMessage('Please specify your department.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (isRegisterMode) {
        const res = await api.register({
          name: name.trim(),
          email: email.trim(),
          password,
          department: department.trim(),
          role,
        });
        setIsRegisterMode(false);
        setPassword('');
        setName('');
        setSuccessMessage(
          `Account created for ${res.data?.Email || email.trim()}. Please sign in with your credentials.`
        );
      } else {
        const res = await api.login(email.trim(), password, role);
        localStorage.setItem('smartdesk_user', JSON.stringify(res.data));
        onLoginSuccess(res.data);
      }
    } catch (err) {
      setErrorMessage(
        err.message || (isRegisterMode ? 'Registration failed.' : 'Login failed. Please check your credentials.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#25232B] relative overflow-hidden flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-64 w-[36rem] rounded-full bg-[#705E86]/15 blur-3xl" />

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md text-center mb-7">
        <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-[#323039] border border-[#504C5B] shadow-lg mb-3">
          <Sparkles className="h-5 w-5 text-[#F2CE54]" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Resolve<span className="text-[#F2CE54]">IT</span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Enterprise Service Desk & Ticket Portal</p>
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#323039] py-7 px-6 sm:px-9 rounded-2xl shadow-2xl border border-[#504C5B]/90">
          <div className="grid grid-cols-2 rounded-xl bg-[#25232B] border border-[#504C5B]/80 p-1 mb-6">
            <button
              type="button"
              onClick={() => switchMode(false)}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                !isRegisterMode
                  ? 'bg-[#423F4B] text-white shadow-sm border border-[#625D6F]/80'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode(true)}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                isRegisterMode
                  ? 'bg-[#423F4B] text-white shadow-sm border border-[#625D6F]/80'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-[#504C5B]/80">
            <div>
              <h2 className="text-base font-semibold text-white">
                {isRegisterMode ? 'Create Account' : 'Welcome back'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isRegisterMode ? 'Register a new ResolveIT account' : 'Sign in with your corporate credentials'}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-[#705E86]/20 border border-[#8874A0]/30 text-[#C8BBD8]">
              {isRegisterMode ? <UserPlus className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
            </div>
          </div>

          {successMessage && (
            <div className="mb-5 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
              <div className="flex-1 font-medium leading-relaxed">{successMessage}</div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-[#423F4B] border border-[#504C5B] text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#8874A0]/60 focus:border-[#A795BD] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-[#423F4B] border border-[#504C5B] text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#8874A0]/60 focus:border-[#A795BD] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={isRegisterMode ? 'At least 6 characters' : 'Enter password'}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-[#423F4B] border border-[#504C5B] text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#8874A0]/60 focus:border-[#A795BD] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Role Category
              </label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#504C5B] bg-[#423F4B] text-white focus:outline-none focus:ring-2 focus:ring-[#8874A0]/60 focus:border-[#A795BD] transition-colors cursor-pointer"
              >
                <option value="Employee">Employee</option>
                <option value="SupportStaff">Support Staff / Administrator</option>
                <option value="DepartmentStaff">Department Staff Specialist</option>
              </select>
            </div>

            {isRegisterMode && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Department
                </label>
                {role === 'DepartmentStaff' ? (
                  <select
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#504C5B] bg-[#423F4B] text-white focus:outline-none focus:ring-2 focus:ring-[#8874A0]/60 focus:border-[#A795BD] transition-colors cursor-pointer"
                  >
                    {SUPPORT_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => {
                        setDepartment(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="e.g. Engineering, Marketing, Operations"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-[#423F4B] border border-[#504C5B] text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#8874A0]/60 focus:border-[#A795BD] transition-colors"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F2CE54] hover:bg-[#F7DC7C] text-[#25232B] font-semibold text-sm shadow-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <span>
                  {isLoading
                    ? isRegisterMode
                      ? 'Creating Account...'
                      : 'Authenticating...'
                    : isRegisterMode
                    ? 'Create Account'
                    : 'Sign In'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          {!isRegisterMode && (
            <div className="mt-6 pt-4 border-t border-[#504C5B]/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <Shield className="h-3.5 w-3.5 text-[#A795BD]" />
                  Quick Demo Login
                </span>
                <span className="text-[11px] text-zinc-500">Click to autofill</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemo(acc)}
                    className="px-2 py-1.5 rounded-lg bg-[#3A3742] hover:bg-[#423F4B] border border-[#504C5B] hover:border-[#8874A0]/50 text-[11px] font-medium text-zinc-300 hover:text-white transition-colors text-center"
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
