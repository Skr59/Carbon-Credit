"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-600 flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-7 h-7 text-white animate-spin" />
        </div>
        <h1 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-500 mb-4">
          A temporary glitch interrupted this screen. Everything is safe — your data is stored securely in your account.
        </p>
        <button
          onClick={() => {
            if (typeof reset === "function") reset();
            window.location.reload();
          }}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl py-2.5"
        >
          Try Again
        </button>
        <p className="text-xs text-gray-400 mt-4">If it keeps happening, hard-refresh once (Ctrl+Shift+R).</p>
      </div>
    </div>
  );
}