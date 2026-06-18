import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting]     = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {/* Logo */}
          <div className="auth-logo">
            <span className="auth-logo-text">ProManage</span>
          </div>

          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>

          <form id="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                className={`form-input${errors.email ? ' error' : ''}`}
                placeholder="you@example.com"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address',
                  },
                })}
              />
              {errors.email && (
                <span className="form-error">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="input-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input${errors.password ? ' error' : ''}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                />
                <button
                  type="button"
                  id="toggle-password-btn"
                  className="input-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--clr-text-muted)', textTransform: 'uppercase' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <span className="form-error">{errors.password.message}</span>
              )}
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={submitting}
              style={{ marginTop: 'var(--space-sm)' }}
            >
              {submitting ? (
                <>
                  <div className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                  Signing in…
                </>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
