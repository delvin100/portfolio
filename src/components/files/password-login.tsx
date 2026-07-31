"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function PasswordLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/files/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        setError("Incorrect password");
        setPassword("");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 relative">
      <Link 
        href="/"
        className="absolute top-8 left-8 flex items-center gap-3 px-6 py-2.5 text-xs font-mono tracking-[0.2em] uppercase text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white border border-gray-300 dark:border-white/20 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors z-10"
      >
        <ArrowLeft size={16} />
        Back To Portfolio
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl bg-white/5 dark:bg-black/20 border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 mb-4 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
            <Lock size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Protected Area</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
            Please enter the access password to view these files.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-white pr-12"
            />
            <button
              type="submit"
              disabled={loading || !password}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-500 text-white disabled:opacity-50 hover:bg-blue-600 transition-colors"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            </button>
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm text-center"
            >
              {error}
            </motion.p>
          )}
        </form>
      </motion.div>
    </div>
  );
}
