"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/auth/signin?registered=true");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred during registration");
      }
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="username" className="form-label">
          Username
        </label>
        <div className="mt-2">
          <input
            id="username"
            name="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <div className="mt-2 relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-200"
          >
            {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="form-label">
          Confirm Password
        </label>
        <div className="mt-2 relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="form-input pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-200"
          >
            {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? "Creating account..." : "Register"}
        </button>
      </div>
    </form>
  );
}
