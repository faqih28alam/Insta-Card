import { Card } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

export default function SignUpTag() {
  return (
    <div className="bg-indigo-600 h-full w-full flex flex-col justify-center items-center p-5">
      <div className="max-w-2xl space-y-7 mx-auto">
        <h1 className="text-5xl text-white font-bold">LinkHub</h1>
        <h2 className="text-6xl text-white font-bold">
          Join thoushands of creators.
        </h2>
        <h3 className="text-xl text-gray-300">
          Everything you are in one simple link in bio. Join a community of
          content creators, artists, and business owners worldwide.
        </h3>
      </div>
      <div className="mt-20 flex justify-center">
        <Card className="p-6 bg-white/5 backdrop-blur border border-white/30 shadow-md w-fit">
          <section className="flex items-center gap-3 mb-3">
            <Avatar>
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt="@shadcn"
                className="grayscale"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="">
              <p className="text-white font-semibold">Sarah Jenkins</p>
              <span className="text-gray-300">Digital Artist</span>
            </div>
          </section>
          <section>
            <blockquote className="max-w-sm">
              <p className="text-gray-200 italic leading-relaxed">
                “LinkHub changed how I share my portfolio. My engagement
                increased by 40% in just two weeks!”
              </p>
            </blockquote>
          </section>
        </Card>
      </div>
    </div>
  );
}
