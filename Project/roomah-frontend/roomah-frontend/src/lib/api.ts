// src/lib/api.ts

import { mockProfiles, Profile } from "./mock-data";

// Fungsi untuk mensimulasikan delay jaringan
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Tipe untuk filter
export interface FilterOptions {
  gender?: "Ikhwan" | "Akhwat" | "";
  age?: string;
  education?: string;
  location?: string;
}

export const getCandidates = async (
  filters: FilterOptions = {}
): Promise<Profile[]> => {
  console.log("Fetching candidates with filters:", filters);
  await sleep(500); // Mensimulasikan loading

  let filteredData = mockProfiles;

  // Logika Filter
  if (filters.gender) {
    filteredData = filteredData.filter((p) => p.gender === filters.gender);
  }
  if (filters.location) {
    filteredData = filteredData.filter((p) => p.location === filters.location);
  }
  if (filters.education) {
    filteredData = filteredData.filter(
      (p) => p.education === filters.education
    );
  }
  if (filters.age) {
    const [minAge, maxAge] = filters.age.split("-").map(Number);
    filteredData = filteredData.filter(
      (p) => p.age >= minAge && p.age <= maxAge
    );
  }

  return filteredData;
};

export const getCandidateById = async (
  id: number
): Promise<Profile | undefined> => {
  await sleep(300);
  return mockProfiles.find((p) => p.id === id);
};

// Tambahkan fungsi API tiruan lainnya di sini nanti
// export const loginUser = async (...) => { ... }
// export const getMyCv = async (...) => { ... }
