"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<ForgotForm> = async ({ email }) => {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?type=recovery`,
    });

    if (error) { toast.error(error.message); return; }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 selah-gradient rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">📬</span>
          </div>
          <h1 className="text-2xl font-bold">Email sent</h1>
          <p className="text-muted-foreground">
            If an account exists with that email, you'll receive a password reset link shortly.
          </p>
          <Button asChild variant="outline">
            <Link href="/login">Return to Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/login">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to sign in
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="text-muted-foreground mt-1">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message as string}</p>}
          </div>
          <Button type="submit" className="w-full" variant="gold" loading={isSubmitting}>
            Send Reset Link
          </Button>
        </form>
      </div>
    </div>
  );
}
