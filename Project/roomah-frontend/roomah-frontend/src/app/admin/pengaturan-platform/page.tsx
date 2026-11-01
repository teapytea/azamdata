// src/app/admin/pengaturan-platform/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { type coin_packages } from "@/types/database";

const initialFormData = {
  id: null as string | null,
  name: "",
  coins_amount: 0,
  price: 0,
  is_active: true,
};

export default function PengaturanPlatformPage() {
  const supabase = createClient();
  const [packages, setPackages] = useState<coin_packages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormData);

  const fetchPackages = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("coin_packages")
      .select("*")
      .order("price");
    setPackages(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? parseInt(value) || 0 : value,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { id, ...dataToSubmit } = formData;

    if (id) {
      await supabase.from("coin_packages").update(dataToSubmit).eq("id", id);
    } else {
      await supabase.from("coin_packages").insert([dataToSubmit]);
    }

    setFormData(initialFormData);
    fetchPackages();
  };

  const handleEdit = (pkg: coin_packages) => {
    setFormData({
      id: pkg.id,
      name: pkg.name,
      coins_amount: pkg.coins_amount,
      price: pkg.price,
      is_active: pkg.is_active,
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Anda yakin ingin menghapus paket ini?")) {
      await supabase.from("coin_packages").delete().eq("id", id);
      fetchPackages();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Pengaturan Platform</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">
            {formData.id ? "Edit Paket Koin" : "Tambah Paket Koin Baru"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="p-6 bg-white rounded-lg shadow-md space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nama Paket
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Jumlah Koin
              </label>
              <input
                type="number"
                name="coins_amount"
                value={formData.coins_amount}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Harga (Rp)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Aktifkan paket
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-secondary"
              >
                {formData.id ? "Update Paket" : "Simpan Paket"}
              </button>
              {formData.id && (
                <button
                  type="button"
                  onClick={() => setFormData(initialFormData)}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Daftar Paket Koin</h2>
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left font-semibold">Nama</th>
                  <th className="p-3 text-left font-semibold">Jumlah</th>
                  <th className="p-3 text-left font-semibold">Harga</th>
                  <th className="p-3 text-left font-semibold">Status</th>
                  <th className="p-3 text-left font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-3 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : (
                  packages.map((pkg) => (
                    <tr key={pkg.id} className="border-b">
                      <td className="p-3">{pkg.name}</td>
                      <td className="p-3">{pkg.coins_amount} Koin</td>
                      <td className="p-3">
                        Rp {pkg.price.toLocaleString("id-ID")}
                      </td>
                      <td className="p-3">
                        {pkg.is_active ? (
                          <span className="text-green-600">Aktif</span>
                        ) : (
                          <span className="text-red-600">Nonaktif</span>
                        )}
                      </td>
                      <td className="p-3 flex gap-3">
                        <button
                          onClick={() => handleEdit(pkg)}
                          className="text-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          className="text-red-600"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
