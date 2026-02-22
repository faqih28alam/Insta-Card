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
  const [publicLink, setPublicLink] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [available, setAvailable] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!publicLink) {
        setAvailable(false);
        return;
      }

      const checkPublicLink = async () => {
        try {
          const response = await publicFetch(
            `/api/v1/profile/check/${publicLink}`,
          );
          const data = await response.json();
          setAvailable(data.available);
        } catch {
          setAvailable(false);
        }
      };
      checkPublicLink();
    }, 500);

    return () => clearTimeout(timer);
  }, [publicLink]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    console.log("data sign up", publicLink, displayName, email, password);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      console.log("userId", data?.user?.id);

      if (error) throw error;

      if (data.user) {
        await publicFetch("/api/v1/profile/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: data.user.id,
            public_link: publicLink,
            display_name: displayName,
          }),
        });
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
                  <Label htmlFor="public-link">Public Link</Label>

                  <div className="h-4">
                    {publicLink &&
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

                <div className="flex">
                  <span className="inline-flex items-center px-3 h-14 bg-muted rounded-l-lg border border-r-0 font-semibold text-gray-400 shadow-sm">
                    linkhub.id/
                  </span>
                  <Input
                    spellCheck={false}
                    id="public-link"
                    type="text"
                    placeholder="Your public link"
                    required
                    value={publicLink}
                    onChange={(e) => setPublicLink(e.target.value)}
                    className="h-14 rounded-r-lg rounded-l-none !text-lg focus-visible:outline-none
                    focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="display-name">Display Name</Label>

                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    spellCheck={false}
                    id="display-name"
                    type="text"
                    placeholder="Your display name"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
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
                    spellCheck={false}
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
