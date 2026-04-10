"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        setUser(payload?.session ?? null);
      });
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <div>
      {user ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <a href="/auth/login">Login</a>
      )}
    </div>
  );
}
