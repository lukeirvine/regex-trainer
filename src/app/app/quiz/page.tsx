import type { Metadata } from "next";
import { Suspense } from "react";
import { ModeMenu, ModeMenuSkeleton } from "@/components/ModeMenu";

export const metadata: Metadata = { title: "Quiz" };

export default function QuizMenuPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quiz</h1>
        <p className="text-base-content/70 mt-1">
          Multiple-choice questions on the tokens you&apos;ll use every day. Get one right to tick it off.
        </p>
      </div>
      <Suspense fallback={<ModeMenuSkeleton />}>
        <ModeMenu mode="quiz" />
      </Suspense>
    </div>
  );
}
