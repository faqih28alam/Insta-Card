import { TrendingUp } from "lucide-react";
import { Card } from "./ui/card";

export default function LoginTag() {
  return (
    <div className="bg-indigo-600 h-full w-full flex flex-col justify-center items-center p-5">
      <div className="max-w-2xl space-y-7 mx-auto">
        <h1 className="text-5xl text-white font-bold">LinkHub</h1>
        <h2 className="text-6xl text-white font-bold">
          Connect Everything with one link.
        </h2>
        <h3 className="text-xl text-gray-300">
          The simplest way to manage your online presence. Track clicks,
          costumize your page, and grow your audience from one centralized
          dashboard.
        </h3>
      </div>
      <div className="fixed bottom-8 w-full max-w-2xl flex justify-center xl:justify-end">
        <Card className="flex gap-5 items-center p-6 bg-white/5 backdrop-blur border border-white/30 shadow-md">
          <section className="bg-green-500/30 p-2 rounded-full">
            <TrendingUp className="text-green-500"/>
          </section>
          <section>
            <p className="text-xl text-gray-300 font-semibold">Total Views</p>
            <p className="text-2xl text-white font-bold">42,890</p>
          </section>
        </Card>
      </div>
    </div>
  );
}
