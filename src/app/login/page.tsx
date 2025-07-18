import { signIn } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { SocialButton } from "@/components/base/buttons/social-button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex w-90 flex-col gap-3">
        <SocialButton social="google" theme="brand" className="bg-white text-black border-none">
          Sign in with Google
        </SocialButton>
        <SocialButton social="facebook" theme="brand">
          Sign in with Facebook
        </SocialButton>
        <SocialButton social="apple" theme="brand">
          Sign in with Apple
        </SocialButton>
      </div>
    </main>
  );
}
