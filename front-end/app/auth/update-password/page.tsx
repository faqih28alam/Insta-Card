import ForgotTag from "@/components/forgot-tag";
import { UpdatePasswordForm } from "@/components/update-password-form";

export default function Page() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      <section className="hidden lg:block">
        <ForgotTag />
      </section>

      <section>
        <UpdatePasswordForm />
      </section>
    </div>
  );
}
