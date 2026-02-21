import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import Initializer from "@/components/dashboard/Initializer";
import { ProfileProvider } from "@/hooks/useProfile";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <ProfileProvider>
        <Initializer />
        <DashboardHeader />
        <div>{children}</div>
      </ProfileProvider>
    </main>
  );
}
