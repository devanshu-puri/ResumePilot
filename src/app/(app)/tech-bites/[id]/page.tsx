import React from "react";
import { notFound } from "next/navigation";
import { getLessonById } from "@/content/tech-bites/lessons";
import { LessonPlayer } from "@/components/tech-bites/lesson-player";

export default function LessonDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const lesson = getLessonById(params.id);

  if (!lesson) {
    notFound();
  }

  return <LessonPlayer lesson={lesson} />;
}
