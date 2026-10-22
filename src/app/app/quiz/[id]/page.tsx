import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ItemFrame, ItemSkeleton } from "@/components/ItemFrame";
import { QuizQuestion } from "@/components/QuizQuestion";
import { neighbours } from "@/content";
import { quizById, quizQuestions } from "@/content/quiz";
import { topicById } from "@/content/topics";

export function generateStaticParams() {
  return quizQuestions.map((q) => ({ id: q.id }));
}

export async function generateMetadata({ params }: PageProps<"/app/quiz/[id]">): Promise<Metadata> {
  const { id } = await params;
  const { index } = neighbours("quiz", id);
  return { title: `Quiz #${index + 1}` };
}

export default function QuizItemPage({ params }: PageProps<"/app/quiz/[id]">) {
  return (
    <Suspense fallback={<ItemSkeleton />}>
      <QuizItem params={params} />
    </Suspense>
  );
}

async function QuizItem({ params }: { params: PageProps<"/app/quiz/[id]">["params"] }) {
  const { id } = await params;
  const question = quizById[id];
  if (!question) notFound();
  const { next } = neighbours("quiz", id);

  return (
    <ItemFrame mode="quiz" id={id} group={topicById[question.topic].title}>
      {/* key resets component state when navigating between questions */}
      <QuizQuestion key={id} question={question} nextHref={next ? `/app/quiz/${next}` : null} />
    </ItemFrame>
  );
}
