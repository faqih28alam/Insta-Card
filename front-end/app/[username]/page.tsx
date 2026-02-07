import UserClient from "@/components/UserClient";
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <Suspense>
        <UserClient />
      </Suspense>
    </div>
  );
}
