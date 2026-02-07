import { SignUpForm } from "@/components/sign-up-form";
import SignUpTag from "@/components/sign-up-tag";

export default function Page() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      <section className="hidden lg:block">
        <SignUpTag />
      </section>

      <section>
        <SignUpForm />
      </section>
    </div>
  );
}
