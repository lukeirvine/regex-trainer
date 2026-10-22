import type { Metadata } from "next";
import { Suspense } from "react";
import { ModeMenu, ModeMenuSkeleton } from "@/components/ModeMenu";

export const metadata: Metadata = { title: "Builder" };

export default function BuilderMenuPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Builder</h1>
        <p className="text-base-content/70 mt-1">
          Write one regex that matches every string on the left and none on the right.
        </p>
      </div>
      <Suspense fallback={<ModeMenuSkeleton />}>
        <ModeMenu mode="builder" />
      </Suspense>
    </div>
  );
}
