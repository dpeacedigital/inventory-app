"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User, ShieldCheck, KeyRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "forgot") {
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, newPassword }),
        });

        const data = await res.json();
        if (res.ok) {
          setSuccess("Password updated successfully! You can now log in.");
          setMode("login");
          setPassword("");
          setNewPassword("");
        } else {
          setError(data.error || "Password reset failed");
        }
      } catch {
        setError("An unexpected error occurred");
      }
      return;
    }

    const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
    const payload = mode === "register" ? { name, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        if (mode === "register") {
          setMode("login");
          setSuccess("Account created successfully! Please sign in.");
        } else {
          router.push("/");
          router.refresh();
        }
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch {
      setError("An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-3">
            {mode === "forgot" ? <KeyRound className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === "register" && "Create Customer Account"}
            {mode === "login" && "Sign In to Store"}
            {mode === "forgot" && "Reset Password"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {mode === "register" && "Register to buy goods and track orders"}
            {mode === "login" && "Enter your email and password to continue"}
            {mode === "forgot" && "Enter your email and a new password"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm border border-emerald-200">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              <input
                required
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {mode !== "forgot" ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase text-slate-600">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError("");
                      setSuccess("");
                    }}
                    className="text-xs text-emerald-600 hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  required
                  type="password"
                  placeholder="Enter new password (min. 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition mt-2"
          >
            {mode === "register" && "Create Customer Account"}
            {mode === "login" && "Sign In"}
            {mode === "forgot" && "Update Password"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {mode === "forgot" ? (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
              className="text-emerald-600 font-semibold hover:underline"
            >
              Remember your password? Sign in
            </button>
          ) : mode === "register" ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
                className="text-emerald-600 font-semibold hover:underline"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              New customer?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                  setSuccess("");
                }}
                className="text-emerald-600 font-semibold hover:underline"
              >
                Register here
              </button>
            </>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-slate-400 hover:underline">
            Back to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
