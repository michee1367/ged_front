import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ServicesContent from "./services-content";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 max-w-7xl mx-auto p-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <ServicesContent />
    </Suspense>
  );
}