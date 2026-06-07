"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
type FormData = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/app/home";
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"buttons" | "email">("buttons");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(data);
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  };

  const handleGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/app/api/auth/callback` },
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-black">

      {/* Verse section — fills upper portion */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-8 text-center">
        {/* App logo */}
        <div className="h-12 w-12 rounded-[16px] bg-white/10 border border-white/20 flex items-center justify-center mb-10">
          <span className="font-serif font-bold text-xl text-white">S</span>
        </div>

        {/* Featured verse */}
        <p className="font-serif text-white text-[24px] leading-[1.6] mb-4 italic">
          &ldquo;Your word is a lamp to my feet and a light to my path.&rdquo;
        </p>
        <p className="text-[13px] font-semibold text-white/40 tracking-wide">Psalm 119:105</p>
      </div>

      {/* Auth buttons */}
      <div className="px-6 pb-8 space-y-3">
        {mode === "buttons" ? (
          <>
            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              className="w-full h-[54px] rounded-2xl bg-white font-semibold text-[15px] text-black flex items-center justify-center gap-3 active:opacity-80 transition-opacity cursor-pointer shadow-lg"
            >
              <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* Email */}
            <button
              type="button"
              onClick={() => setMode("email")}
              className="w-full h-[54px] rounded-2xl border border-white/20 font-semibold text-[15px] text-white flex items-center justify-center gap-2 active:opacity-80 transition-opacity cursor-pointer"
            >
              Sign in with Email
            </button>
          </>
        ) : (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  autoFocus
                  className="w-full h-[52px] rounded-2xl bg-white/10 border border-white/20 px-4 text-[15px] text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition"
                  {...register("email")}
                />
                {errors.email && <p className="text-[12px] text-red-400 mt-1 ml-1">{errors.email.message}</p>}
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    autoComplete="current-password"
                    className="w-full h-[52px] rounded-2xl bg-white/10 border border-white/20 px-4 pr-12 text-[15px] text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[12px] text-red-400 mt-1 ml-1">{errors.password.message}</p>}
                <div className="text-right mt-1.5">
                  <Link href="/app/forgot-password" className="text-[13px] text-white/40 cursor-pointer">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] rounded-2xl bg-white text-black font-semibold text-[15px] active:opacity-70 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMode("buttons")}
              className="w-full text-center text-[13px] text-white/40 py-2 cursor-pointer"
            >
              ← Back
            </button>
          </>
        )}

        <p className="text-center text-[13px] text-white/40 pt-2">
          No account?{" "}
          <Link href="/app/register" className="text-white/80 font-semibold cursor-pointer">
            Sign up free
          </Link>
        </p>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
