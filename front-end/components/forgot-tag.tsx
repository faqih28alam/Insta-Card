import { RotateCcwKey } from "lucide-react";
import { Card } from "./ui/card";

export default function ForgotTag() {
  return (
    <div className="bg-indigo-600 h-full w-full flex flex-col justify-center items-center p-5">
      <div className="max-w-2xl space-y-7 mx-auto">
        <h1 className="text-5xl text-white font-bold">LinkHub</h1>
        <h2 className="text-6xl text-white font-bold">
          Secure your account.
        </h2>
        <h3 className="text-xl text-gray-300">
          Don't worry, it happens to the best of us. Reset your password and get back to managing your links in seconds.
        </h3>
      </div>
      <div className="fixed bottom-8 w-full max-w-2xl flex justify-center xl:justify-end">
        <Card className="flex gap-5 items-center p-6 bg-white/5 backdrop-blur border border-white/30 shadow-md">
          <section className="bg-indigo-500/30 p-2 rounded-full">
            <RotateCcwKey className="text-indigo-600" />
          </section>
          <section>
            <p className="text-xl text-gray-300 font-semibold">Security Status</p>
            <p className="text-2xl text-white font-bold">Encrypted</p>
          </section>
        </Card>
      </div>
    </div>
  );
}
