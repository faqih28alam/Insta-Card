import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import ForgotTag from "@/components/auth/forgot-tag";

export default function Page() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      <section className="hidden lg:block">
        <ForgotTag />
      </section>

      <section>
        <ForgotPasswordForm />
      </section>
    </div>
  );
}
