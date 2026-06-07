"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.name, name: data.name },
        emailRedirectTo: `${window.location.origin}/app/api/auth/callback`,
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    toast.success("Check your email to confirm your account");
    router.push("/app/login");
  };

  const handleGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/app/api/auth/callback` },
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white dark:bg-black">
      <div className="flex-1" />

      <div className="flex flex-col items-center px-8 pb-10">
        <div className="h-16 w-16 rounded-[22px] bg-[#111] dark:bg-white flex items-center justify-center mb-5">
          <span className="text-white dark:text-black font-serif font-bold text-2xl">S</span>
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-center">Create account</h1>
        <p className="text-[15px] text-[#888] mt-1 text-center">Start your journey with Selah</p>
      </div>

      <div className="px-6 space-y-3">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="Your name"
              autoComplete="name"
              className="w-full h-[52px] rounded-2xl border border-[#E0E0E0] dark:border-[#333] bg-[#FAFAFA] dark:bg-[#111] px-4 text-[15px] placeholder:text-[#888] focus:outline-none focus:border-[#111] dark:focus:border-white transition"
              {...register("name")}
            />
            {errors.name && <p className="text-[12px] text-red-500 mt-1 ml-1">{errors.name.message}</p>}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              className="w-full h-[52px] rounded-2xl border border-[#E0E0E0] dark:border-[#333] bg-[#FAFAFA] dark:bg-[#111] px-4 text-[15px] placeholder:text-[#888] focus:outline-none focus:border-[#111] dark:focus:border-white transition"
              {...register("email")}
            />
            {errors.email && <p className="text-[12px] text-red-500 mt-1 ml-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (8+ characters)"
                autoComplete="new-password"
                className="w-full h-[52px] rounded-2xl border border-[#E0E0E0] dark:border-[#333] bg-[#FAFAFA] dark:bg-[#111] px-4 pr-12 text-[15px] placeholder:text-[#888] focus:outline-none focus:border-[#111] dark:focus:border-white transition"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888] cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-[12px] text-red-500 mt-1 ml-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] rounded-2xl bg-[#111] dark:bg-white text-white dark:text-black font-semibold text-[15px] active:opacity-70 transition-opacity disabled:opacity-50 cursor-pointer mt-1"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-[#E0E0E0] dark:bg-[#333]" />
          <span className="text-[12px] text-[#888]">or</span>
          <div className="flex-1 h-px bg-[#E0E0E0] dark:bg-[#333]" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full h-[52px] rounded-2xl border border-[#E0E0E0] dark:border-[#333] bg-white dark:bg-black font-medium text-[15px] flex items-center justify-center gap-3 active:bg-[#F5F5F5] dark:active:bg-[#111] transition-colors cursor-pointer"
        >
          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </div>

      <div className="flex-1" />
      <p className="text-center text-[14px] text-[#888] pb-10">
        Have an account?{" "}
        <Link href="/app/login" className="text-[#111] dark:text-white font-semibold cursor-pointer">
          Sign in
        </Link>
      </p>
    </div>
  );
}
