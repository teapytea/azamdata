"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useRouter } from "next/navigation";

import { cvCoreSchema } from "@/lib/validators/cv";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { CheckCircle, Circle, ArrowRight, UserCheck } from "lucide-react";
// ⬇️ PENTING: named import
import { CoreSection } from "./sections/CoreSection";

export type CvCoreData = z.infer<typeof cvCoreSchema>;

type OnboardingCVFormProps = {
  initialData?: Partial<CvCoreData>;
  saveAction?: (fd: FormData) => Promise<void>;
  skipAction?: (fd: FormData) => Promise<void>;
};

export default function OnboardingCVForm({
  initialData,
  saveAction,
  skipAction,
}: OnboardingCVFormProps) {
  const router = useRouter();

  const form = useForm<CvCoreData>({
    resolver: zodResolver(cvCoreSchema),
    defaultValues: {
      date_of_birth: initialData?.date_of_birth ?? "",
      marital_status: initialData?.marital_status ?? "",
      domicile_province: initialData?.domicile_province ?? "",
      education: initialData?.education ?? "",
      job: initialData?.job ?? "",
      income_range: initialData?.income_range ?? "",
      height_cm: initialData?.height_cm ?? undefined,
      weight_kg: initialData?.weight_kg ?? undefined,
      disease_history_summary: initialData?.disease_history_summary ?? "",
      partner_criteria_summary: initialData?.partner_criteria_summary ?? "",
    },
    mode: "onChange",
  });

  // Fallback: kalau tidak ada server action
  const handleClientSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (saveAction) return; // biarkan server action handle
    e.preventDefault();
    const ok = await form.trigger();
    if (!ok) return;
    router.push("/cv-saya");
  };

  const steps = [
    { id: 1, name: "Verifikasi Kesiapan", completed: true },
    { id: 2, name: "Biodata Inti", completed: false },
    { id: 3, name: "Selesai", completed: false },
  ];

  const watch = form.watch;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <UserCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Lengkapi Biodata Inti
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Langkah terakhir untuk menyelesaikan registrasi. Isi biodata inti
            atau lewati untuk melengkapi nanti.
          </p>
        </div>

        {/* Steps */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-center space-x-8">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className="flex items-center">
                  {s.completed ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : s.id === 2 ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                      <Circle className="h-3 w-3 fill-current text-white" />
                    </div>
                  ) : (
                    <Circle className="h-6 w-6 text-gray-300" />
                  )}
                  <span
                    className={cn(
                      "ml-2 text-sm font-medium",
                      s.id === 2
                        ? "text-blue-600"
                        : s.completed
                        ? "text-green-600"
                        : "text-gray-400"
                    )}
                  >
                    {s.name}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="mx-4 h-4 w-4 text-gray-300" />
                )}
              </div>
            ))}
          </div>
          <Progress value={66.67} className="h-2" />
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-2xl">Biodata Ta&apos;aruf</CardTitle>
            <CardDescription className="text-blue-100">
              Isi data dengan jujur dan sesuai kondisi sebenarnya
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {/* ⬇️ Penting: FormProvider harus membungkus seluruh pohon field */}
            <Form {...form}>
              <form
                action={saveAction}
                onSubmit={handleClientSubmit}
                className="p-6"
              >
                {/* Hidden mirrors untuk server action */}
                <input
                  type="hidden"
                  name="date_of_birth"
                  value={watch("date_of_birth") ?? ""}
                />
                <input
                  type="hidden"
                  name="marital_status"
                  value={watch("marital_status") ?? ""}
                />
                <input
                  type="hidden"
                  name="domicile_province"
                  value={watch("domicile_province") ?? ""}
                />
                <input
                  type="hidden"
                  name="education"
                  value={watch("education") ?? ""}
                />
                <input type="hidden" name="job" value={watch("job") ?? ""} />
                <input
                  type="hidden"
                  name="income_range"
                  value={watch("income_range") ?? ""}
                />
                <input
                  type="hidden"
                  name="height_cm"
                  value={watch("height_cm") ?? ""}
                />
                <input
                  type="hidden"
                  name="weight_kg"
                  value={watch("weight_kg") ?? ""}
                />
                <input
                  type="hidden"
                  name="disease_history_summary"
                  value={watch("disease_history_summary") ?? ""}
                />
                <input
                  type="hidden"
                  name="partner_criteria_summary"
                  value={watch("partner_criteria_summary") ?? ""}
                />

                {/* ⬇️ PASS props form */}
                <CoreSection form={form} />

                {/* Actions */}
                <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
                  {skipAction ? (
                    <button
                      type="submit"
                      formAction={skipAction}
                      className="inline-flex w-full items-center justify-center rounded-md border border-border px-4 py-2 text-sm hover:bg-muted sm:w-auto"
                    >
                      Lewati untuk saat ini
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => router.push("/cv-saya")}
                      className="inline-flex w-full items-center justify-center rounded-md border border-border px-4 py-2 text-sm hover:bg-muted sm:w-auto"
                    >
                      Lewati untuk saat ini
                    </button>
                  )}

                  <Button
                    type="submit"
                    disabled={!form.formState.isValid}
                    className="w-full sm:w-auto"
                  >
                    Simpan &amp; Selesai
                  </Button>
                </div>

                {/* Tips */}
                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500">
                      <span className="text-xs font-bold text-white">i</span>
                    </div>
                    <div className="text-sm text-blue-800">
                      <p className="mb-1 font-medium">Tips pengisian:</p>
                      <ul className="space-y-1 text-blue-700">
                        <li>
                          • Isi data dengan jujur dan sesuai kondisi sebenarnya
                        </li>
                        <li>
                          • Data akan diverifikasi admin sebelum profil aktif
                        </li>
                        <li>• Data lanjutan bisa dilengkapi di halaman CV</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
