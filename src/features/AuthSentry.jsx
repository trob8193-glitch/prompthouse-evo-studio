import React from 'react';
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';

/**
 * AuthSentry — Sovereign Access Gate
 * ═══════════════════════════════════════════════════════════════
 * Provides a premium, glassmorphic authentication interface using
 * Clerk for global multi-tenancy.
 */
export const AuthSentry = ({ children }) => {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <div className="auth-sentry-overlay">
          <div className="auth-sentry-card">
            <div className="auth-sentry-header">
              <div className="auth-sentry-logo">
                <span className="logo-icon">☣️</span>
                <span className="logo-text">SOVEREIGN STUDIO</span>
              </div>
            </div>
            
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
              width: 420px;
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
              font-size: 24px;
              filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.5));
            }

            .logo-text {
              font-size: 14px;
              font-weight: 800;
              letter-spacing: 0.2em;
              color: #fff;
              opacity: 0.8;
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
              display: none !important; /* hide default clerk logo if any */
            }
          `}</style>
        </div>
      </SignedOut>
    </>
  );
};
