import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Onboarding | Roomah",
    default: "Onboarding | Roomah",
  },
  description: "Selamat datang di Roomah - Platform Ta'aruf Islami",
};

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="relative">
        {/* Header dengan logo */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Roomah</span>
              </div>

              {/* Help button */}
              <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Butuh Bantuan?
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="pt-20">{children}</div>

        {/* Footer */}
        <div className="py-8 text-center text-sm text-gray-500">
          <p>&copy; 2024 Roomah. Platform Ta'aruf Islami Terpercaya.</p>
        </div>
      </div>
    </div>
  );
}
