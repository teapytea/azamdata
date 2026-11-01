"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function OnboardingCVError({ error, reset }: ErrorPageProps) {
  React.useEffect(() => {
    console.error("Onboarding CV error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 mx-auto">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Terjadi Kesalahan
            </CardTitle>
            <CardDescription className="text-lg">
              Maaf, ada masalah saat memuat halaman onboarding CV
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Detail error:</strong>{" "}
                {error.message || "Kesalahan tidak diketahui"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={reset}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                Coba Lagi
              </Button>

              <Button
                variant="outline"
                asChild
                className="flex items-center gap-2"
              >
                <Link href="/dashboard">
                  <Home className="h-4 w-4" />
                  Kembali ke Dashboard
                </Link>
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              <p>Jika masalah terus berlanjut, silakan:</p>
              <ul className="mt-2 space-y-1">
                <li>• Refresh halaman dan coba lagi</li>
                <li>• Periksa koneksi internet Anda</li>
                <li>• Hubungi admin jika masalah berlanjut</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
