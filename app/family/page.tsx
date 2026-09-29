import { Suspense } from "react";
import FamilyView from "@/components/FamilyView";

export default function FamilyPage() {
  return (
    <Suspense fallback={<div className="h-dvh bg-background" />}>
      <FamilyView />
    </Suspense>
  );
}
