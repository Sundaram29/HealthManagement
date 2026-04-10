"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: "#ffffff",
          color: "#111827",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
        },
        success: {
          iconTheme: {
            primary: "#059669",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#dc2626",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}
