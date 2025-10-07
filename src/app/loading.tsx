import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center">
        <Skeleton className="absolute inset-0" />
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-2xl space-y-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <div className="flex space-x-4 pt-4">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-48" />
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections Skeleton */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="text-center mb-12 space-y-4">
            <Skeleton className="h-12 w-96 mx-auto" />
            <Skeleton className="h-6 w-[600px] mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/3] w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
