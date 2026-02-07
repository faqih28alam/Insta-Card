import { LoginForm } from "@/components/login-form";
import LoginTag from "@/components/login-tag";

export default function Page() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      <section className="hidden lg:block">
        <LoginTag />
      </section>

      <section>
        <LoginForm />
      </section>
    </div>
  );
}
