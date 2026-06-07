"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/app/api/auth/callback?next=/app/settings`,
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white dark:bg-black">
      <div className="flex-1" />

      <div className="flex flex-col items-center px-8 pb-10">
        <div className="h-16 w-16 rounded-[22px] bg-[#111] dark:bg-white flex items-center justify-center mb-5">
          <span className="text-white dark:text-black font-serif font-bold text-2xl">S</span>
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-center">
          {sent ? "Email sent" : "Reset password"}
        </h1>
        <p className="text-[15px] text-[#888] mt-1 text-center">
          {sent
            ? "Check your inbox for a reset link."
            : "Enter your email and we'll send a reset link."}
        </p>
      </div>

      {!sent && (
        <div className="px-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
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
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] rounded-2xl bg-[#111] dark:bg-white text-white dark:text-black font-semibold text-[15px] active:opacity-70 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        </div>
      )}

      <div className="flex-1" />
      <p className="text-center text-[14px] text-[#888] pb-10">
        <Link href="/app/login" className="text-[#111] dark:text-white font-semibold cursor-pointer">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
