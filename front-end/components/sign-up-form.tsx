"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import OAuth from "./o-auth";
import { publicFetch } from "@/lib/api";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [available, setAvailable] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!username) {
        setAvailable(false);
        return;
      }
      const checkUsername = async () => {
        try {
          const response = await publicFetch(`/api/v1/user/check/${username}`);
          const data = await response.json();
          setAvailable(data.available);
        } catch {
          setAvailable(false);
        }
      };
      checkUsername();
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      if (data.user) {
        await publicFetch("/api/v1/user/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: data.user.id,
            username,
          }),
        })
      }
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-none shadow-none w-full max-w-lg mx-auto flex flex-col justify-center h-screen">
        <CardHeader>
          <CardTitle className="text-4xl font-bold">
            Create your account
          </CardTitle>
          <CardDescription className="text-md">
            Start building your personalized hub today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="username">Username</Label>

                  <div className="h-4">
                    {username &&
                      (available ? (
                        <span className="text-sm text-green-500">
                          Available
                        </span>
                      ) : (
                        <span className="text-sm text-red-500">
                          Unavailable
                        </span>
                      ))}
                  </div>
                </div>

                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username"
                    type="username"
                    placeholder="Your username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-14 pl-12 rounded-lg !text-lg focus-visible:outline-none
                    focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-12 rounded-lg !text-lg focus-visible:outline-none
                    focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>

                <div className="relative">
                  {/* Lock icon */}
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 pl-12 pr-12 rounded-lg !text-lg focus-visible:outline-none
                    focus-visible:ring-0 focus-visible:ring-offset-0"
                  />

                  {/* Toggle button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <Eye className="h-5 w-5 hover:text-indigo-600" />
                    ) : (
                      <EyeOff className="h-5 w-5 hover:text-indigo-600" />
                    )}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                type="submit"
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-xl text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating an account..." : "Sign up"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <OAuth />
            </div>

            <div className="mt-4 text-center">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-indigo-600 hover:text-indigo-500 font-semibold"
              >
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
