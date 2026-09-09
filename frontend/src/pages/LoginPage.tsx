import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import authLoginImg from "@/assets/auth-login.jpg";

export function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            TeamPulse
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block overflow-hidden">
        <img
          src={authLoginImg}
          alt="TeamPulse Collaboration & Analytics Dashboard"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.85] transition-all duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

export default LoginPage;
