import { createFileRoute } from "@tanstack/react-router";
import AdminStockDashboard from "@/components/AdminStockDashboard";

export const Route = createFileRoute("/admin/stock")({
  head: () => ({
    meta: [
      { title: "Aromatique AI - Dashboard Stok" },
      {
        name: "description",
        content: "Dashboard internal untuk memantau availability produk Aromatique per store.",
      },
    ],
  }),
  component: AdminStockDashboard,
});
