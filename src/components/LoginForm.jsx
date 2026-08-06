import React, { useState, useEffect } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiChevronDown, FiAlertCircle } from 'react-icons/fi';
import { usePage } from '../hooks/usePage';
import { api } from '../utils/api';

const LoginForm = () => {
  const { navigateTo } = usePage();

  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = {};

    const inputVal = formData.usernameOrEmail.trim().toLowerCase();
    const passwordVal = formData.password;

    if (!inputVal) {
      newErrors.usernameOrEmail = 'Username or Email is required.';
    }

    if (!passwordVal) {
      newErrors.password = 'Password is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Authenticate via the backend API!
      const { user } = await api.login(inputVal, passwordVal);

      // On successful login, sync users and projects into local cache
      try {
        const projects = await api.listProjects();
        localStorage.setItem('projects', JSON.stringify(projects || []));
      } catch (err) {
        console.warn('Syncing projects failed:', err);
      }

      try {
        const users = await api.listUsers();
        // Map backend users to UI fields (e.g. name to fullName)
        const mappedUsers = (users || []).map(u => ({
          id: u.id,
          fullName: u.name,
          email: u.email,
          role: u.role === 'TEAM_LEADER' ? 'Team Leader' : u.role === 'MENTOR' ? 'Mentor' : 'Student',
          collegeName: 'ProjectPilot University',
          department: u.department || 'Computer Science & Engineering',
          status: 'Active',
          team: u.team || 'Not Assigned'
        }));
        localStorage.setItem('registeredUsers', JSON.stringify(mappedUsers));

        // Sync the logged-in currentUser's team details
        const myUserRecord = mappedUsers.find(u => u.email.toLowerCase() === user.email?.toLowerCase());
        if (myUserRecord) {
          user.team = myUserRecord.team || 'Not Assigned';
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      } catch (err) {
        console.warn('Syncing users failed:', err);
      }

      if (user.role === 'System Administrator') {
        navigateTo('admin');
      } else if (user.role === 'Mentor') {
        navigateTo('mentor');
      } else if (user.role === 'Team Leader') {
        navigateTo('team-leader');
      } else {
        navigateTo('student');
      }
    } catch (err) {
      let friendlyMessage = 'Invalid credentials. Please check your username/password.';
      try {
        // Parse raw JSON errors from spring boot/auth backend
        const parsed = JSON.parse(err.message);
        if (parsed.message) {
          if (parsed.message.toLowerCase() === 'bad credentials') {
            friendlyMessage = 'Invalid email or password. Please try again.';
          } else {
            friendlyMessage = parsed.message;
          }
        } else if (parsed.error) {
          if (parsed.error === 'Bad Request') {
            friendlyMessage = 'Invalid login details. Please check your username/email and password credentials.';
          } else {
            friendlyMessage = parsed.error;
          }
        }
      } catch (e) {
        if (err.message && !err.message.includes('{')) {
          friendlyMessage = err.message;
        }
      }
      setErrors({ global: friendlyMessage });
    }
  };


  const [successMessage, setSuccessMessage] = useState('');

  const handleReset = () => {
    setFormData({
      usernameOrEmail: '',
      password: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setShowPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setSuccessMessage('');
  };

  const handleForgotPassword = () => {
    setIsForgotPasswordMode(true);
    setErrors({});
    setSuccessMessage('');
  };

  const handlePasswordResetSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    const inputVal = formData.usernameOrEmail.trim().toLowerCase();
    const newPasswordVal = formData.newPassword;
    const confirmPasswordVal = formData.confirmPassword;

    if (!inputVal) {
      newErrors.usernameOrEmail = 'Username or Email is required.';
    }

    if (!newPasswordVal) {
      newErrors.newPassword = 'New Password is required.';
    }

    if (!confirmPasswordVal) {
      newErrors.confirmPassword = 'Confirm Password is required.';
    } else if (newPasswordVal !== confirmPasswordVal) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const storedUsers = localStorage.getItem('registeredUsers');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const userIdx = users.findIndex(u => 
          u.email.toLowerCase() === inputVal || 
          u.fullName.toLowerCase().replace(/\s+/g, '_') === inputVal
        );

        if (userIdx !== -1) {
          users[userIdx].password = newPasswordVal;
          localStorage.setItem('registeredUsers', JSON.stringify(users));
          
          setSuccessMessage('Password reset successfully! Please log in with your new password.');
          setIsForgotPasswordMode(false);
          setFormData({
            usernameOrEmail: inputVal,
            password: '',
            newPassword: '',
            confirmPassword: ''
          });
          setErrors({});
        } else {
          setErrors({ global: 'User not found. Please enter a valid registered username or email.' });
        }
      } else {
        setErrors({ global: 'No registered users found in database.' });
      }
    } catch (err) {
      console.error(err);
      setErrors({ global: 'An error occurred during password reset.' });
    }
  };

  if (isForgotPasswordMode) {
    return (
      <form onSubmit={handlePasswordResetSubmit} className="space-y-5 text-left w-full animate-fade-in">
        
        {/* Global errors */}
        {errors.global && (
          <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-50/10 text-rose-500 text-xs font-semibold flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errors.global}</span>
          </div>
        )}

        {/* Username or Email Address Field */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
            Registered Username or Email
          </label>
          <div className="relative">
            <FiMail className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-text-muted/50" />
            <input
              type="text"
              name="usernameOrEmail"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              placeholder="Enter your username or email address"
              className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900/30 text-brand-text placeholder-brand-text-muted/40 focus:outline-none focus:ring-1 transition-all duration-300 ${
                errors.usernameOrEmail
                  ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30'
                  : 'border-brand-border focus:border-primary/50 focus:ring-primary/40 focus:shadow-glow-primary'
              }`}
            />
          </div>
          {errors.usernameOrEmail && (
            <div className="mt-1.5 flex items-center text-xs text-rose-500 font-semibold gap-1">
              <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errors.usernameOrEmail}</span>
            </div>
          )}
        </div>

        {/* New Password Field */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
            New Password
          </label>
          <div className="relative">
            <FiLock className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-text-muted/50" />
            <input
              type={showNewPassword ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              className={`w-full pl-11 pr-11 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900/30 text-brand-text placeholder-brand-text-muted/40 focus:outline-none focus:ring-1 transition-all duration-300 ${
                errors.newPassword
                  ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30'
                  : 'border-brand-border focus:border-primary/50 focus:ring-primary/40 focus:shadow-glow-primary'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-brand-text-muted/50 hover:text-brand-text focus:outline-none cursor-pointer"
            >
              {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          </div>
          {errors.newPassword && (
            <div className="mt-1.5 flex items-center text-xs text-rose-500 font-semibold gap-1">
              <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errors.newPassword}</span>
            </div>
          )}
        </div>

        {/* Confirm New Password Field */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
            Confirm New Password
          </label>
          <div className="relative">
            <FiLock className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-text-muted/50" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              className={`w-full pl-11 pr-11 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900/30 text-brand-text placeholder-brand-text-muted/40 focus:outline-none focus:ring-1 transition-all duration-300 ${
                errors.confirmPassword
                  ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30'
                  : 'border-brand-border focus:border-primary/50 focus:ring-primary/40 focus:shadow-glow-primary'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-brand-text-muted/50 hover:text-brand-text focus:outline-none cursor-pointer"
            >
              {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <div className="mt-1.5 flex items-center text-xs text-rose-500 font-semibold gap-1">
              <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errors.confirmPassword}</span>
            </div>
          )}
        </div>

        {/* Reset Actions Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            type="submit"
            className="w-full sm:flex-grow py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow-md hover:shadow-glow-primary hover-lift hover:brightness-110 transition-all duration-300 text-center cursor-pointer"
          >
            Reset Password
          </button>
          <button
            type="button"
            onClick={() => {
              setIsForgotPasswordMode(false);
              setErrors({});
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-brand-border bg-transparent text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:border-primary/50 font-bold text-sm transition-all duration-300 text-center cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </form>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5 text-left w-full">
      
      {/* Global simulated success / info messages */}
      {successMessage && (
        <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 text-xs font-semibold flex items-center gap-2">
          <FiAlertCircle className="w-4 h-4 flex-shrink-0 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Global simulated errors */}
      {errors.global && (
        <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 text-xs font-semibold flex items-center gap-2">
          <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errors.global}</span>
        </div>
      )}

      {/* Username or Email Address Field */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
          Username or Email Address
        </label>
        <div className="relative">
          <FiMail className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-text-muted/50" />
          <input
            type="text"
            name="usernameOrEmail"
            value={formData.usernameOrEmail}
            onChange={handleChange}
            placeholder="Enter your username or email address"
            className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900/30 text-brand-text placeholder-brand-text-muted/40 focus:outline-none focus:ring-1 transition-all duration-300 ${
              errors.usernameOrEmail
                ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30'
                : 'border-brand-border focus:border-primary/50 focus:ring-primary/40 focus:shadow-glow-primary'
            }`}
          />
        </div>
        {errors.usernameOrEmail && (
          <div className="mt-1.5 flex items-center text-xs text-rose-500 font-semibold gap-1">
            <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errors.usernameOrEmail}</span>
          </div>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
          Password
        </label>
        <div className="relative">
          <FiLock className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-text-muted/50" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className={`w-full pl-11 pr-11 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900/30 text-brand-text placeholder-brand-text-muted/40 focus:outline-none focus:ring-1 transition-all duration-300 ${
              errors.password
                ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30'
                : 'border-brand-border focus:border-primary/50 focus:ring-primary/40 focus:shadow-glow-primary'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-brand-text-muted/50 hover:text-brand-text focus:outline-none cursor-pointer"
          >
            {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <div className="mt-1.5 flex items-center text-xs text-rose-500 font-semibold gap-1">
            <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errors.password}</span>
          </div>
        )}
        
        {/* Forgot Password Right Aligned */}
        <div className="text-right mt-2">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-xs font-semibold text-primary hover:underline focus:outline-none cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>
      </div>



      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <button
          type="submit"
          className="w-full sm:flex-grow py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow-md hover:shadow-glow-primary hover-lift hover:brightness-110 transition-all duration-300 text-center cursor-pointer"
        >
          Login
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-brand-border bg-transparent text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:border-primary/50 font-bold text-sm transition-all duration-300 text-center cursor-pointer"
        >
          Reset
        </button>
      </div>


    </form>
  );
};

export default LoginForm;
