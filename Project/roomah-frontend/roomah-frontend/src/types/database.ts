// src/types/database.ts
// Tipe ini harus cocok dengan ENUM yang kita buat di SQL
export type taaruf_stage =
  | "cv_diterima"
  | "zoom_1"
  | "keluarga"
  | "konseling"
  | "khitbah"
  | "selesai"
  | "dibatalkan";
export type coin_packages = {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  coins_amount: number;
  price: number;
  is_active: boolean;
};
