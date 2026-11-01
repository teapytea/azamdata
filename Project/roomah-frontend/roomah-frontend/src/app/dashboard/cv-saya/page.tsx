"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { FormProvider } from "@/components/cv/FormProvider";
import { CVTabs } from "@/components/cv/CVTabs";
import { StickyActions } from "@/components/cv/StickyActions";
import { LoadingSkeleton } from "@/components/cv/LoadingSkeleton";

// Dynamic imports for better performance
const CVPreview = dynamic(() => import("@/components/cv/CVPreview"), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});

const CVForm = dynamic(() => import("@/components/cv/CVForm"), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});

export default function CvSayaPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-2 sm:p-4">
      <div className="mx-auto max-w-7xl h-full">
        <FormProvider>
          <CVTabs
            previewTab={
              <Suspense fallback={<LoadingSkeleton />}>
                <CVPreview />
              </Suspense>
            }
            editTab={
              <Suspense fallback={<LoadingSkeleton />}>
                <CVForm />
              </Suspense>
            }
          />
        </FormProvider>
      </div>
    </div>
  );
}
