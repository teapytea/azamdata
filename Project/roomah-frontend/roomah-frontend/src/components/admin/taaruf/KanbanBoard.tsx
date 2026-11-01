"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  closestCorners,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import KanbanColumn from "./KanbanColumn";
import TaarufCard from "./TaarufCard";
import { createClient } from "@/lib/supabase/client";
import type { taaruf_stage } from "@/types/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faExclamationTriangle,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";

// Definisikan tipe data gabungan di sini agar mudah diakses
export type ProcessWithProfiles = {
  id: string;
  created_at: string;
  last_updated: string;
  current_stage: taaruf_stage;
  ikhwan_profile: { full_name: string | null } | null;
  akhwat_profile: { full_name: string | null } | null;
  priority?: "high" | "medium" | "low";
  notes?: string;
};

const stages: taaruf_stage[] = [
  "cv_diterima",
  "zoom_1",
  "keluarga",
  "konseling",
  "khitbah",
];

const stageTitles: Record<taaruf_stage, string> = {
  cv_diterima: "CV Diterima",
  zoom_1: "Zoom Meeting",
  keluarga: "Pertemuan Keluarga",
  konseling: "Sesi Konseling",
  khitbah: "Alhamdulillah Khitbah",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

const stageColors: Record<taaruf_stage, string> = {
  cv_diterima: "from-blue-400 to-blue-600",
  zoom_1: "from-indigo-400 to-indigo-600",
  keluarga: "from-purple-400 to-purple-600",
  konseling: "from-pink-400 to-pink-600",
  khitbah: "from-green-400 to-green-600",
  selesai: "from-gray-400 to-gray-600",
  dibatalkan: "from-red-400 to-red-600",
};

export default function KanbanBoard({
  onDataChange,
}: {
  onDataChange: () => void;
}) {
  const supabase = createClient();
  const [processes, setProcesses] = useState<ProcessWithProfiles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fungsi untuk mengambil data
  const fetchProcesses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("taaruf_processes")
        .select(
          `
          id,
          created_at,
          last_updated,
          current_stage,
          ikhwan_profile:ikhwan_user_id ( cvs ( full_name ) ),
          akhwat_profile:akhwat_user_id ( cvs ( full_name ) )
        `
        )
        .in("current_stage", stages)
        .order("last_updated", { ascending: false });

      if (fetchError) throw fetchError;

      if (data) {
        const formattedData = data.map((p) => ({
          ...p,
          ikhwan_profile: {
            full_name:
              p.ikhwan_profile?.cvs?.[0]?.full_name ||
              "Nama Ikhwan Tidak Ditemukan",
          },
          akhwat_profile: {
            full_name:
              p.akhwat_profile?.cvs?.[0]?.full_name ||
              "Nama Akhwat Tidak Ditemukan",
          },
          priority: getPriorityBasedOnDuration(p.last_updated),
        })) as ProcessWithProfiles[];

        setProcesses(formattedData);
      }
    } catch (e: any) {
      setError("Gagal memuat data proses ta'aruf. Silakan coba lagi.");
      console.error("Error fetching taaruf processes:", e);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Fungsi untuk menentukan prioritas berdasarkan durasi
  const getPriorityBasedOnDuration = (
    lastUpdated: string
  ): "high" | "medium" | "low" => {
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceUpdate > 14) return "high";
    if (daysSinceUpdate > 7) return "medium";
    return "low";
  };

  // useEffect untuk fetch data
  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProcesses();
    await onDataChange();
    setIsRefreshing(false);
  };

  const processesInColumns = useMemo(() => {
    const grouped: Record<string, ProcessWithProfiles[]> = {};
    for (const stage of stages) {
      grouped[stage] = processes.filter((p) => p.current_stage === stage);
    }
    return grouped;
  }, [processes]);

  const findColumnForTask = (taskId: string) => {
    return Object.keys(processesInColumns).find((columnId) =>
      processesInColumns[columnId].some((task) => task.id === taskId)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnForTask(activeId);
    const overColumn = stages.includes(overId as taaruf_stage)
      ? (overId as taaruf_stage)
      : findColumnForTask(overId);

    if (!activeColumn || !overColumn || activeColumn === overColumn) {
      return;
    }

    const newStage = overColumn as taaruf_stage;
    const oldProcesses = processes;

    // Optimistic UI Update
    setProcesses((prev) =>
      prev.map((p) =>
        p.id === activeId
          ? {
              ...p,
              current_stage: newStage,
              last_updated: new Date().toISOString(),
              priority: getPriorityBasedOnDuration(new Date().toISOString()),
            }
          : p
      )
    );

    // Update database
    try {
      const { error } = await supabase
        .from("taaruf_processes")
        .update({
          current_stage: newStage,
          last_updated: new Date().toISOString(),
        })
        .eq("id", activeId);

      if (!error) {
        onDataChange();
      } else {
        throw error;
      }
    } catch (error: any) {
      // Rollback on error
      setProcesses(oldProcesses);
      setError("Gagal memindahkan proses: " + error.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const activeProcess = processes.find((p) => p.id === activeId);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50">
        <div className="relative">
          <FontAwesomeIcon
            icon={faSpinner}
            className="animate-spin text-pink-500 text-3xl mb-3"
          />
          <div className="absolute inset-0 bg-pink-500 opacity-20 rounded-full animate-ping"></div>
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Memuat Data</h3>
        <p className="text-sm text-gray-500 text-center">
          Mengambil data proses ta'aruf...
        </p>
      </div>
    );
  }

  if (error && processes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50">
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className="text-red-500 text-3xl mb-3"
        />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Terjadi Kesalahan
        </h3>
        <p className="text-red-600 text-center text-sm mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faRefresh} />
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Compact Board Header */}
      <div className="flex-none flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-800">
            {processes.length}
          </span>{" "}
          total proses aktif
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-3 py-1.5 bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-600 rounded border text-xs transition-colors flex items-center gap-1"
        >
          <FontAwesomeIcon
            icon={faRefresh}
            className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Sync..." : "Refresh"}
        </button>
      </div>

      {/* Kanban Board with Horizontal Scroll - Fixed Height */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          collisionDetection={closestCorners}
        >
          {/* Horizontal Scrollable Container */}
          <div className="h-full overflow-x-auto overflow-y-hidden">
            <div className="h-full flex gap-4 p-4 min-w-max">
              {stages.map((stage) => (
                <KanbanColumn
                  key={stage}
                  id={stage}
                  title={stageTitles[stage]}
                  processes={processesInColumns[stage] || []}
                  colorClass={stageColors[stage]}
                />
              ))}
            </div>
          </div>

          <DragOverlay>
            {activeId && activeProcess ? (
              <TaarufCard process={activeProcess} isDragging={true} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-2 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}

      {/* Empty State */}
      {processes.length === 0 && !isLoading && (
        <div className="absolute inset-4 flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-3">🤲</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Belum Ada Data
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Belum ada proses ta'aruf yang terdaftar dalam sistem.
          </p>
        </div>
      )}
    </div>
  );
}
