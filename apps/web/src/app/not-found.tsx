import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Large "404" background text */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10 select-none pointer-events-none">
            <h1 className="text-[280px] font-bold leading-none text-foreground">
              404
            </h1>
          </div>

          {/* 404 Icon */}
          <div className="relative flex justify-center mb-8 pt-20">
            <div className="relative">
              <Image
                src="/icons/404.png"
                alt="404 Error"
                width={200}
                height={200}
                className="rounded-full"
                priority
              />
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              Oops... Wrong Box!
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              You were aiming for a page, but unleashed ancient chaos instead. Typical Pandora
              move.
            </p>

            <div className="pt-6">
              <Link href="/">
                <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90">
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
