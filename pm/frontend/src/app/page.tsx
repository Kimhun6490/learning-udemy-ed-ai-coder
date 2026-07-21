"use client";

import { FormEvent, useEffect, useState } from "react";
import { AiSidebar } from "@/components/AiSidebar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { AUTH_STORAGE_KEY, validateCredentials } from "@/lib/auth";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const isLoggedIn = window.sessionStorage.getItem(AUTH_STORAGE_KEY) === "1";
    setIsAuthenticated(isLoggedIn);
    setIsReady(true);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validateCredentials(username, password)) {
      window.sessionStorage.setItem(AUTH_STORAGE_KEY, "1");
      setIsAuthenticated(true);
      setError("");
      return;
    }

    setError("Invalid credentials. Use user / password.");
  };

  const handleLogout = () => {
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setError("");
  };

  if (!isReady) {
    return null;
  }

  if (isAuthenticated) {
    return (
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px]">
        <KanbanBoard onLogout={handleLogout} refreshToken={refreshToken} />
        <AiSidebar onBoardUpdated={() => setRefreshToken((value) => value + 1)} />
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6">
      <section className="w-full rounded-3xl border border-[var(--stroke)] bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--gray-text)]">
          Sign in
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-[var(--navy-dark)]">
          Project Management MVP
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--gray-text)]">
          Use the demo credentials to access your board.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gray-text)]"
            >
              Username
            </label>
            <input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-xl border border-[var(--stroke)] bg-white px-3 py-2 text-sm text-[var(--navy-dark)] outline-none transition focus:border-[var(--primary-blue)]"
              autoComplete="username"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gray-text)]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-[var(--stroke)] bg-white px-3 py-2 text-sm text-[var(--navy-dark)] outline-none transition focus:border-[var(--primary-blue)]"
              autoComplete="current-password"
            />
          </div>
          {error ? (
            <p className="text-sm font-medium text-[var(--secondary-purple)]">{error}</p>
          ) : null}
          <button
            type="submit"
            className="rounded-full bg-[var(--secondary-purple)] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:brightness-110"
          >
            Log in
          </button>
        </form>
      </section>
    </main>
  );
}
