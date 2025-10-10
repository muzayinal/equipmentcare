"use client";

import SignInForm from "@/components/auth/SignInForm";

export default function SignInPage({ onLoginSuccess }: { onLoginSuccess?: () => void}) {
  return <SignInForm onLoginSuccess={onLoginSuccess} />;
}
