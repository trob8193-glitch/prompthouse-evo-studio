import React from 'react';
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import { useSovereignStore } from '../store.js';

/**
 * AuthSentry — Evo Studio Access Gate
 * ═══════════════════════════════════════════════════════════════
 * Provides a premium, glassmorphic authentication interface using
 * Clerk for global multi-tenancy.
 */
export const AuthSentry = ({ children }) => {
  const isAuthenticated = useSovereignStore((state) => state.isAuthenticated);
  const setAuthenticated = useSovereignStore((state) => state.setAuthenticated);
  const clerkEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const signInPanel = (
    <div className="auth-sentry-overlay">
      <div className="auth-sentry-card">
        <div className="auth-sentry-header">
          <div className="auth-sentry-logo">
            <span className="logo-icon">PH</span>
            <span className="logo-text">EVO STUDIO STUDIO</span>
          </div>
        </div>

        {clerkEnabled ? (
          <SignIn
            appearance={{
              variables: {
                colorPrimary: '#ffffff',
                colorBackground: 'transparent',
                colorText: '#ffffff',
                colorInputBackground: 'rgba(255,255,255,0.05)',
                colorInputText: '#ffffff',
              },
              elements: {
                card: 'clerk-glass-card',
                headerTitle: 'clerk-glass-title',
                headerSubtitle: 'clerk-glass-subtitle',
                formButtonPrimary: 'clerk-glass-btn',
                footerActionLink: 'clerk-glass-link',
                dividerLine: 'clerk-glass-divider',
                dividerText: 'clerk-glass-divider-text',
                socialButtonsBlockButton: 'clerk-glass-social-btn',
                socialButtonsBlockButtonText: 'clerk-glass-social-text'
              }
            }}
          />
        ) : (
          <button className="auth-sentry-local-button" type="button" onClick={() => setAuthenticated(true)}>
            ENTER DEMO MODE
          </button>
        )}
      </div>

      <style jsx>{`
        .auth-sentry-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at center, #1a1a2e 0%, #0a0a0a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          font-family: 'Inter', sans-serif;
        }

        .auth-sentry-card {
          width: min(420px, calc(100vw - 32px));
          padding: 40px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .auth-sentry-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .auth-sentry-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .logo-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid rgba(103, 232, 249, 0.45);
          color: #67e8f9;
          font-size: 12px;
          font-weight: 900;
          filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.5));
        }

        .logo-text {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.2em;
          color: #fff;
          opacity: 0.8;
        }

        .auth-sentry-local-button {
          width: 100%;
          border: 1px solid rgba(103, 232, 249, 0.35);
          border-radius: 12px;
          background: rgba(103, 232, 249, 0.12);
          color: #ffffff;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.08em;
          padding: 14px 16px;
          cursor: pointer;
        }

        .auth-sentry-local-button:hover {
          background: rgba(103, 232, 249, 0.2);
        }

        /* Clerk Overrides */
        :global(.clerk-glass-card) {
          box-shadow: none !important;
          background: transparent !important;
          border: none !important;
        }
        :global(.clerk-glass-title) {
          color: white !important;
          font-size: 24px !important;
          font-weight: 700 !important;
          letter-spacing: -0.02em !important;
        }
        :global(.clerk-glass-subtitle) {
          color: rgba(255,255,255,0.5) !important;
        }
        :global(.clerk-glass-btn) {
          background: white !important;
          color: black !important;
          border-radius: 12px !important;
          font-weight: bold !important;
          padding: 14px !important;
        }
        :global(.clerk-glass-link) {
          color: rgba(255,255,255,0.7) !important;
        }
        :global(.clerk-glass-divider) {
          background: rgba(255,255,255,0.1) !important;
        }
        :global(.clerk-glass-divider-text) {
          color: rgba(255,255,255,0.4) !important;
        }
        :global(.clerk-glass-social-btn) {
          border: 1px solid rgba(255,255,255,0.1) !important;
          background: rgba(255,255,255,0.05) !important;
          border-radius: 12px !important;
        }
        :global(.clerk-glass-social-text) {
          color: white !important;
        }
        :global(.cl-internal-b3al4t) {
          display: none !important;
        }
      `}</style>
    </div>
  );

  if (!clerkEnabled) {
    return signInPanel;
  }

  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        {signInPanel}
      </SignedOut>
    </>
  );
};
