import UserClient from "@/components/public-page/UserClient";
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
