import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BuilderChallenge } from "@/components/BuilderChallenge";
import { ItemFrame, ItemSkeleton } from "@/components/ItemFrame";
import { neighbours } from "@/content";
import { builderById, builderChallenges, levelNames } from "@/content/builder";

export function generateStaticParams() {
  return builderChallenges.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/builder/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: builderById[id]?.title ?? "Builder" };
}

export default function BuilderItemPage({ params }: PageProps<"/builder/[id]">) {
  return (
    <Suspense fallback={<ItemSkeleton />}>
      <BuilderItem params={params} />
    </Suspense>
  );
}

async function BuilderItem({ params }: { params: PageProps<"/builder/[id]">["params"] }) {
  const { id } = await params;
  const challenge = builderById[id];
  if (!challenge) notFound();
  const { next } = neighbours("builder", id);

  return (
    <ItemFrame mode="builder" id={id} group={levelNames[challenge.level]}>
      <BuilderChallenge key={id} challenge={challenge} nextHref={next ? `/builder/${next}` : null} />
    </ItemFrame>
  );
}
