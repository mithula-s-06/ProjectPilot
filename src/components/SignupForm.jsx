import React, { useState } from 'react';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiChevronDown, FiAlertCircle, FiBookOpen, FiGrid, FiX } from 'react-icons/fi';
import PasswordRequirements from './PasswordRequirements';
import { usePage } from '../hooks/usePage';
import { api, addNotification } from '../utils/api';

const SignupForm = ({ showTerms, setShowTerms }) => {
  const { navigateTo } = usePage();
  // Input fields state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    collegeName: '',
    department: '',
    otherDepartment: '',
    role: '',
    acceptedTerms: false,
  });

  // Toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field validation errors state
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'email' ? value.trim() : value,
    }));
    
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 1. Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }

    // 2. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email is invalid.';
    } else {
      // Check if user already exists
      try {
        const storedUsers = localStorage.getItem('registeredUsers');
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          const sameEmailUsers = users.filter(u => u.email.toLowerCase() === formData.email.toLowerCase());
          
          if (sameEmailUsers.length > 0) {
            const signupRole = formData.role; // 'Student' | 'Team Leader' | 'Mentor'
            const hasMentorOrAdmin = sameEmailUsers.some(u => u.role === 'Mentor' || u.role === 'System Administrator' || u.role === 'Admin');
            
            if (hasMentorOrAdmin || signupRole === 'Mentor') {
              newErrors.email = 'A user with this email address already exists.';
            } else {
              // Student / Team Leader
              const hasSameRole = sameEmailUsers.some(u => u.role === signupRole);
              if (hasSameRole) {
                newErrors.email = `An account with this email is already registered as a ${signupRole}.`;
              } else {
                // Different role! Check if password is same
                const hasSamePassword = sameEmailUsers.some(u => u.password === formData.password);
                if (hasSamePassword) {
                  newErrors.password = 'Email is already registered. Please use another password to distinguish this account.';
                }
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    // 3. Password requirements check
    const password = formData.password;
    const meetsLength = password.length >= 8;
    const meetsUpper = /[A-Z]/.test(password);
    const meetsLower = /[a-z]/.test(password);
    const meetsNumber = /[0-9]/.test(password);
    const meetsSpecial = /[^A-Za-z0-9]/.test(password);
    
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (!(meetsLength && meetsUpper && meetsLower && meetsNumber && meetsSpecial)) {
      newErrors.password = 'Password must satisfy all requirements.';
    }

    // 4. Confirm password check
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required.';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    // 5. College name validation
    if (!formData.collegeName.trim()) {
      newErrors.collegeName = 'College name is required.';
    }

    // 6. Department validation
    if (!formData.department) {
      newErrors.department = 'Department is required.';
    } else if (formData.department === 'Other' && !formData.otherDepartment.trim()) {
      newErrors.otherDepartment = 'Please specify your department.';
    }

    // 7. Role validation
    if (!formData.role) {
      newErrors.role = 'Role is required.';
    }

    // 8. Terms & Conditions validation
    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms = 'You must accept the Terms & Conditions to create an account.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const dept = formData.department === 'Other' ? formData.otherDepartment : formData.department;
        
        await api.register(formData.fullName, formData.email, formData.password, formData.role, dept, formData.collegeName);

        // Send signup notification to admin
        try {
          await addNotification(
            'New User Registration',
            `A new user "${formData.fullName}" (${formData.email}) has registered as a "${formData.role}".`,
            'admin@pp.edu',
            null,
            'info'
          );
        } catch (notifErr) {
          console.warn('Failed to send admin signup notification:', notifErr);
        }

        // Sync users list to local storage
        try {
          const users = await api.listUsers();
          const mappedUsers = (users || []).map(u => ({
            id: u.id,
            fullName: u.name,
            email: u.email,
            role: u.role === 'TEAM_LEADER' ? 'Team Leader' : u.role === 'MENTOR' ? 'Mentor' : 'Student',
            collegeName: u.collegeName || formData.collegeName,
            department: u.department || dept,
            status: 'Active',
            team: u.team || 'Not Assigned'
          }));
          localStorage.setItem('registeredUsers', JSON.stringify(mappedUsers));
        } catch (err) {
          console.warn('Syncing users failed:', err);
        }

        if (formData.role === 'Student') {
          navigateTo('student');
        } else if (formData.role === 'Team Leader') {
          navigateTo('team-leader');
        } else if (formData.role === 'Mentor') {
          navigateTo('mentor');
        } else {
          navigateTo('landing');
        }
      } catch (err) {
        setErrors(prev => ({ ...prev, global: err.message || 'Registration failed. Please try again.' }));
      }
    }
  };


  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      collegeName: '',
      department: '',
      otherDepartment: '',
      role: '',
      acceptedTerms: false,
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  if (showTerms) {
    return (
      <div className="space-y-5 text-left animate-fade-in select-none">
        {/* T&C Header with X button */}
        <div className="flex items-center justify-between pb-3.5 border-b border-brand-border/40">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
            Terms & Conditions
          </h3>
          <button 
            type="button" 
            onClick={() => setShowTerms(false)} 
            className="p-1.5 rounded-full border border-brand-border text-brand-text-muted hover:text-brand-text focus:outline-none cursor-pointer"
            title="Cancel"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Terms Content */}
        <div className="max-h-[350px] overflow-y-auto pr-2 space-y-4 text-xs text-brand-text-muted leading-relaxed custom-scrollbar select-text">
          <div className="font-semibold text-brand-text-muted/65">
            Last Updated: July 2026
          </div>
          <p>
            Welcome to the AI-Based Student Project Mentor and Milestone Tracking Platform. By creating an account and using this platform, you agree to the following Terms and Conditions.
          </p>
          
          <div className="space-y-3.5">
            <div>
              <h4 className="font-extrabold text-brand-text mb-1">1. Acceptance of Terms</h4>
              <p>By registering an account, you acknowledge that you have read, understood, and agreed to these Terms and Conditions. If you do not agree, please do not use this platform.</p>
            </div>

            <div>
              <h4 className="font-extrabold text-brand-text mb-1">2. Eligibility</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Users must register with valid and accurate information.</li>
                <li>Students, Team Leaders, Mentors, and Administrators are responsible for maintaining the confidentiality of their login credentials.</li>
                <li>Users are responsible for all activities performed through their accounts.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-brand-text mb-1">3. User Responsibilities</h4>
              <p className="font-semibold mb-1 text-brand-text">Users agree to:</p>
              <ul className="list-disc pl-4 space-y-1 mb-2">
                <li>Provide accurate profile information.</li>
                <li>Submit original project work and reports.</li>
                <li>Respect mentors, teammates, and other users.</li>
                <li>Use the platform only for educational and project-related purposes.</li>
                <li>Follow project deadlines and milestone requirements.</li>
              </ul>
              <p className="font-semibold mb-1 text-brand-text">Users must not:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Upload harmful, offensive, or illegal content.</li>
                <li>Share account credentials with others.</li>
                <li>Attempt to gain unauthorized access to another user's account.</li>
                <li>Manipulate project data or AI-generated results.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-brand-text mb-1">4. AI-Generated Recommendations</h4>
              <p>This platform uses Artificial Intelligence to provide project recommendations, progress analysis, report evaluation, task suggestions, learning recommendations, and risk predictions.</p>
              <p className="mt-1">AI-generated recommendations are intended to assist users and should not be considered final academic or mentor decisions. Mentors and administrators have the final authority regarding project evaluation.</p>
            </div>

            <div>
              <h4 className="font-extrabold text-brand-text mb-1">5. Project Reports and Documents</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Submitted reports must be original.</li>
                <li>Uploaded documents must not violate copyright laws.</li>
                <li>Files must not contain malicious software.</li>
              </ul>
              <p className="mt-1">The platform may analyze uploaded documents using AI to improve recommendations and detect similarities.</p>
            </div>

            <div>
              <h4 className="font-extrabold text-brand-text mb-1">6. GitHub Integration</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>The platform may access public repository information related to registered projects.</li>
                <li>GitHub data will be used only for project tracking and contribution analysis.</li>
                <li>The platform will not modify or delete GitHub repositories.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-brand-text mb-1">7. Privacy</h4>
              <p>The platform collects limited personal information (Name, Email address, Academic details, Project information, Uploaded reports, and Task progress) necessary to provide its services. Personal information will not be sold or shared with third parties without consent, except where required by law.</p>
            </div>

            <div>
              <h4 className="font-extrabold text-brand-text mb-1">8. Data Security</h4>
              <p>Reasonable security measures are implemented to protect user information. However, no online system can guarantee absolute security. Users should protect their passwords and report unauthorized access immediately.</p>
            </div>

            <div>
              <h4 className="font-extrabold text-brand-text mb-1">9. Intellectual Property</h4>
              <p>Users retain ownership of their project ideas, documents, and reports. By uploading content, users grant the platform permission to process it for progress tracking, AI analysis, similarity detection, and personalized recommendations. The platform does not claim ownership of user-created project content.</p>
            </div>

            <div>
              <h4 className="font-extrabold text-brand-text mb-1">10. Platform Availability</h4>
              <p>The platform may be updated, maintained, or temporarily unavailable without notice. We are not responsible for interruptions caused by technical issues beyond our control.</p>
            </div>

            <div>
              <h4 className="font-extrabold text-brand-text mb-1">11. Prohibited Activities</h4>
              <p>Users must not upload malware, attempt to hack or disrupt the platform, impersonate another user, misuse AI-generated responses, or use the platform for non-educational or unlawful purposes. Violations may result in account suspension or termination.</p>
            </div>

            <div>
              <h4 className="font-extrabold text-brand-text mb-1">12. Limitation of Liability</h4>
              <p>The platform is provided for educational purposes. We do not guarantee the accuracy, completeness, or suitability of all AI-generated recommendations. Users are responsible for verifying important decisions with their mentors.</p>
            </div>

            <div>
              <h4 className="font-extrabold text-brand-text mb-1">13. Account Suspension</h4>
              <p>The platform reserves the right to suspend or terminate accounts that violate these terms, engage in fraudulent activities, misuse resources, or upload inappropriate content.</p>
            </div>

            <div>
              <h4 className="font-extrabold text-brand-text mb-1">14. Changes to Terms</h4>
              <p>These terms may be updated periodically. Continued use of the platform after updates constitutes acceptance of the revised terms.</p>
            </div>

            <div>
              <h4 className="font-extrabold text-brand-text mb-1">15. Contact</h4>
              <p>For questions, support, or concerns regarding these Terms and Conditions, users may contact the platform administrator through the support channels provided within the application.</p>
            </div>
          </div>
        </div>

        {/* Accept / Cancel Button */}
        <div className="pt-4 border-t border-brand-border/40 flex justify-end gap-3 select-none">
          <button
            type="button"
            onClick={() => setShowTerms(false)}
            className="px-5 py-2.5 rounded-xl border border-brand-border text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData(prev => ({ ...prev, acceptedTerms: true }));
              if (errors.acceptedTerms) {
                setErrors(prev => ({ ...prev, acceptedTerms: '' }));
              }
              setShowTerms(false);
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow hover:shadow-glow-primary transition-all duration-300 cursor-pointer"
          >
            Accept and Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      
      {/* Global errors */}
      {errors.global && (
        <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-50/10 text-rose-500 text-xs font-semibold flex items-center gap-2">
          <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errors.global}</span>
        </div>
      )}
      {/* 1. Full Name Input */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
          Full Name
        </label>
        <div className="relative">
          <FiUser className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-text-muted/50" />
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900/30 text-brand-text placeholder-brand-text-muted/40 focus:outline-none focus:ring-1 transition-all duration-300 ${
              errors.fullName
                ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30'
                : 'border-brand-border focus:border-primary/50 focus:ring-primary/40 focus:shadow-glow-primary'
            }`}
          />
        </div>
        {errors.fullName && (
          <div className="mt-1.5 flex items-center text-xs text-rose-500 font-semibold gap-1">
            <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errors.fullName}</span>
          </div>
        )}
      </div>

      {/* 2. Email Address Input */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
          Email Address
        </label>
        <div className="relative">
          <FiMail className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-text-muted/50" />
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900/30 text-brand-text placeholder-brand-text-muted/40 focus:outline-none focus:ring-1 transition-all duration-300 ${
              errors.email
                ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30'
                : 'border-brand-border focus:border-primary/50 focus:ring-primary/40 focus:shadow-glow-primary'
            }`}
          />
        </div>
        {errors.email && (
          <div className="mt-1.5 flex items-center text-xs text-rose-500 font-semibold gap-1">
            <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errors.email}</span>
          </div>
        )}
      </div>

      {/* 3. Password Input */}
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
            placeholder="Create a password"
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
        
        {/* Real-time Password Requirements checklist */}
        <PasswordRequirements password={formData.password} />
        
        {errors.password && (
          <div className="mt-1.5 flex items-center text-xs text-rose-500 font-semibold gap-1">
            <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errors.password}</span>
          </div>
        )}
      </div>

      {/* 4. Confirm Password Input */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
          Confirm Password
        </label>
        <div className="relative">
          <FiLock className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-text-muted/50" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
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

      {/* College Name Input */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
          College Name
        </label>
        <div className="relative">
          <FiBookOpen className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-text-muted/50" />
          <input
            type="text"
            name="collegeName"
            value={formData.collegeName}
            onChange={handleChange}
            placeholder="Enter your college name"
            className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900/30 text-brand-text placeholder-brand-text-muted/40 focus:outline-none focus:ring-1 transition-all duration-300 ${
              errors.collegeName
                ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30'
                : 'border-brand-border focus:border-primary/50 focus:ring-primary/40 focus:shadow-glow-primary'
            }`}
          />
        </div>
        {errors.collegeName && (
          <div className="mt-1.5 flex items-center text-xs text-rose-500 font-semibold gap-1">
            <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errors.collegeName}</span>
          </div>
        )}
      </div>

      {/* Department Input */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
          Department
        </label>
        <div className="relative">
          <FiGrid className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-text-muted/50 pointer-events-none" />
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className={`w-full pl-11 pr-10 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:ring-1 transition-all duration-300 appearance-none cursor-pointer ${
              formData.department === '' ? 'text-brand-text-muted/40' : 'text-brand-text'
            } ${
              errors.department
                ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30'
                : 'border-brand-border focus:border-primary/50 focus:ring-primary/40 focus:shadow-glow-primary'
            }`}
          >
            <option value="" disabled className="text-brand-text-muted/40 bg-brand-card">
              Select your department
            </option>
            <option value="Computer Science" className="text-brand-text bg-brand-card">Computer Science</option>
            <option value="Information Technology" className="text-brand-text bg-brand-card">Information Technology</option>
            <option value="Electronics & Communication" className="text-brand-text bg-brand-card">Electronics & Communication</option>
            <option value="Mechanical Engineering" className="text-brand-text bg-brand-card">Mechanical Engineering</option>
            <option value="Civil Engineering" className="text-brand-text bg-brand-card">Civil Engineering</option>
            <option value="Other" className="text-brand-text bg-brand-card">Other</option>
          </select>
          <FiChevronDown className="w-5 h-5 absolute right-3.5 top-1/2 transform -translate-y-1/2 text-brand-text-muted/50 pointer-events-none" />
        </div>
        {errors.department && (
          <div className="mt-1.5 flex items-center text-xs text-rose-500 font-semibold gap-1">
            <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errors.department}</span>
          </div>
        )}
      </div>

      {/* Specify Custom Department (Shown only if Other is selected) */}
      {formData.department === 'Other' && (
        <div className="mt-4 animate-scale-up">
          <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
            Specify Department
          </label>
          <div className="relative">
            <FiGrid className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-text-muted/50" />
            <input
              type="text"
              name="otherDepartment"
              value={formData.otherDepartment}
              onChange={handleChange}
              placeholder="Enter your department name"
              className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900/30 text-brand-text placeholder-brand-text-muted/40 focus:outline-none focus:ring-1 transition-all duration-300 ${
                errors.otherDepartment
                  ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30'
                  : 'border-brand-border focus:border-primary/50 focus:ring-primary/40 focus:shadow-glow-primary'
              }`}
              required
            />
          </div>
          {errors.otherDepartment && (
            <div className="mt-1.5 flex items-center text-xs text-rose-500 font-semibold gap-1">
              <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errors.otherDepartment}</span>
            </div>
          )}
        </div>
      )}

      {/* 5. Role Dropdown Select */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
          Role
        </label>
        <div className="relative">
          <FiUser className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-text-muted/50 pointer-events-none" />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`w-full pl-11 pr-10 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900/30 text-brand-text placeholder-brand-text-muted/40 focus:outline-none focus:ring-1 transition-all duration-300 appearance-none cursor-pointer ${
              formData.role === '' ? 'text-brand-text-muted/50' : 'text-brand-text'
            } ${
              errors.role
                ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30'
                : 'border-brand-border focus:border-primary/50 focus:ring-primary/40 focus:shadow-glow-primary'
            }`}
          >
            <option value="" disabled className="text-brand-text-muted/40 bg-brand-card">
              Select your role
            </option>
            <option value="Student" className="text-brand-text bg-brand-card">
              Student
            </option>
            <option value="Team Leader" className="text-brand-text bg-brand-card">
              Team Leader
            </option>
            <option value="Mentor" className="text-brand-text bg-brand-card">
              Mentor
            </option>
          </select>
          <FiChevronDown className="w-5 h-5 absolute right-3.5 top-1/2 transform -translate-y-1/2 text-brand-text-muted/50 pointer-events-none" />
        </div>
        {errors.role && (
          <div className="mt-1.5 flex items-center text-xs text-rose-500 font-semibold gap-1">
            <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errors.role}</span>
          </div>
        )}
      </div>

      {/* Form Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        {/* Create Account Button */}
        <button
          type="submit"
          className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow-md hover:shadow-glow-primary hover-lift hover:brightness-110 transition-all duration-300 text-center cursor-pointer"
        >
          Create Account
        </button>
        {/* Reset Button */}
        <button
          type="button"
          onClick={handleReset}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-brand-border bg-transparent text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:border-primary/50 font-bold text-sm transition-all duration-300 text-center cursor-pointer"
        >
          Reset
        </button>
      </div>

      {/* Consent Checkbox */}
      <div className="pt-2 select-none">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            name="acceptedTerms"
            checked={formData.acceptedTerms}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, acceptedTerms: e.target.checked }));
              if (errors.acceptedTerms) {
                setErrors(prev => ({ ...prev, acceptedTerms: '' }));
              }
            }}
            className="mt-1 w-4.5 h-4.5 rounded border-brand-border bg-slate-50 dark:bg-slate-900/30 text-primary focus:ring-primary focus:ring-opacity-40 cursor-pointer accent-primary"
          />
          <span className="text-[11px] text-brand-text-muted leading-relaxed font-semibold">
            I have read, understood, and agree to the{' '}
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="text-primary hover:underline font-bold inline focus:outline-none cursor-pointer"
            >
              Terms & Conditions
            </button>{' '}
            and Privacy Policy. I understand that AI-generated recommendations are advisory and that mentors have the final authority regarding project evaluations.
          </span>
        </label>
        {errors.acceptedTerms && (
          <div className="mt-1.5 flex items-center text-xs text-rose-500 font-semibold gap-1">
            <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errors.acceptedTerms}</span>
          </div>
        )}
      </div>

    </form>
  );
};

export default SignupForm;
