"use client";

import React from "react";
import type { UseFormReturn } from "react-hook-form";
import type { CvCoreData } from "@/features/cv/components/OnboardingCVForm";
import { Card, CardContent } from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarIcon,
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  DollarSign,
  Ruler,
  Weight,
  Heart,
  FileText,
} from "lucide-react";

interface CoreSectionProps {
  form: UseFormReturn<CvCoreData>;
}

const PROVINCES = [
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "Jawa Timur",
  "Yogyakarta",
  "Banten",
  "Bali",
  "Sumatera Utara",
  "Sumatera Barat",
  "Sumatera Selatan",
  "Kalimantan Timur",
  "Kalimantan Selatan",
  "Sulawesi Selatan",
  "Sulawesi Utara",
];

const EDUCATION_LEVELS = [
  { value: "SMA/SMK", label: "SMA/SMK" },
  { value: "D1", label: "Diploma 1" },
  { value: "D2", label: "Diploma 2" },
  { value: "D3", label: "Diploma 3" },
  { value: "S1", label: "Sarjana (S1)" },
  { value: "S2", label: "Magister (S2)" },
  { value: "S3", label: "Doktor (S3)" },
];

const INCOME_RANGES = [
  { value: "0-2", label: "0 - 2 Juta" },
  { value: "2-5", label: "2 - 5 Juta" },
  { value: "5-10", label: "5 - 10 Juta" },
  { value: "10+", label: "10+ Juta" },
];

const MARITAL_STATUS = [
  { value: "Single", label: "Single" },
  { value: "Duda", label: "Duda" },
  { value: "Janda", label: "Janda" },
];

export function CoreSection({ form }: CoreSectionProps) {
  return (
    <div className="space-y-6">
      {/* Biodata Pribadi */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Biodata Pribadi
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Tanggal Lahir
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="marital_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Pernikahan</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MARITAL_STATUS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="domicile_province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Domisili Provinsi
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih provinsi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROVINCES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Pendidikan
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pendidikan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((edu) => (
                        <SelectItem key={edu.value} value={edu.value}>
                          {edu.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="job"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Pekerjaan
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan pekerjaan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="income_range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Range Penghasilan
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih range penghasilan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INCOME_RANGES.map((inc) => (
                        <SelectItem key={inc.value} value={inc.value}>
                          {inc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Fisik */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Ruler className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Data Fisik</h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="height_cm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    Tinggi Badan (cm)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="100"
                      max="250"
                      placeholder="170"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight_kg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Weight className="h-4 w-4" />
                    Berat Badan (kg)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="30"
                      max="200"
                      placeholder="65"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Informasi Penting */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Informasi Penting
            </h3>
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="disease_history_summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Riwayat Penyakit (Ringkas)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cth: Tidak ada riwayat penyakit serius..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500">Maksimal 250 karakter</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="partner_criteria_summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Kriteria Pasangan (Ringkas)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cth: Sholehah, penyayang, bertanggung jawab..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500">Maksimal 250 karakter</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Ekspor named & default untuk fleksibilitas
export default CoreSection;
