"use client";

import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-background text-on-surface font-body min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="w-full">
        <div className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full">
          <div className="text-xl font-bold text-primary tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">
                bolt
              </span>
            </div>
            KINETIC
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors">
              Support
            </a>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-surface p-8 md:p-10 rounded-lg border border-outline shadow">
            {/* TITLE */}
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-on-surface mb-2">
                Welcome back
              </h2>
              <p className="text-on-surface-variant text-sm">
                Please enter your details to sign in.
              </p>
            </div>

            {/* FORM */}
            <form className="space-y-5">
              {/* EMAIL */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Email address</label>
                <input
                  type="email"
                  placeholder="coach@kinetic.com"
                  className="w-full border border-outline rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              {/* PASSWORD */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold">Password</label>
                  <a className="text-xs font-semibold text-primary hover:text-primary-hover">
                    Forgot password?
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full border border-outline rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-lg">
                      visibility
                    </span>
                  </button>
                </div>
              </div>

              {/* REMEMBER */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  className="rounded border-outline text-primary focus:ring-primary/20"
                />
                <label className="text-xs text-on-surface-variant font-medium">
                  Remember for 30 days
                </label>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg font-semibold text-sm shadow-sm"
              >
                Sign in
              </button>

              {/* DIVIDER */}
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-outline"></div>
                <span className="mx-4 text-xs text-on-surface-variant">
                  OR
                </span>
                <div className="flex-grow border-t border-outline"></div>
              </div>

              {/* GOOGLE */}
              <button
                type="button"
                className="w-full border border-outline py-2.5 rounded-lg flex items-center justify-center gap-3 text-sm font-semibold hover:bg-outline-variant"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>
            </form>

            {/* FOOTER */}
            <div className="mt-8 text-center">
              <p className="text-sm text-on-surface-variant">
                Don&apos;t have an account?{" "}
                <a className="text-primary font-bold hover:text-primary-hover">
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-outline bg-surface">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-8 max-w-7xl mx-auto text-xs text-on-surface-variant">
          <div className="mb-4 md:mb-0">
            © 2024 KINETIC PRECISION.
          </div>
          <div className="flex gap-6">
            <a className="hover:text-primary">Privacy Policy</a>
            <a className="hover:text-primary">Terms</a>
            <a className="hover:text-primary">Support</a>
            <a className="hover:text-primary">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}