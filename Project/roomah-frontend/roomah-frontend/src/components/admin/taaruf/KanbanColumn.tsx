// src/components/admin/taaruf/KanbanColumn.tsx
"use client";
import { SortableContext } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import TaarufCard from "./TaarufCard";
import type { ProcessWithProfiles } from "./KanbanBoard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faVideo,
  faUsers,
  faComments,
  faHeart,
  faPlus,
  faFire,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

type KanbanColumnProps = {
  id: string;
  title: string;
  processes: ProcessWithProfiles[];
  colorClass: string;
};

const stageIcons: Record<string, any> = {
  cv_diterima: faCheckCircle,
  zoom_1: faVideo,
  keluarga: faUsers,
  konseling: faComments,
  khitbah: faHeart,
};

export default function KanbanColumn({
  id,
  title,
  processes,
  colorClass,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  // Hitung prioritas untuk badge
  const highPriorityCount = processes.filter(
    (p) => p.priority === "high"
  ).length;
  const mediumPriorityCount = processes.filter(
    (p) => p.priority === "medium"
  ).length;

  // Calculate average days in this stage
  const averageDays =
    processes.length > 0
      ? Math.round(
          processes.reduce((acc, p) => {
            const days = Math.floor(
              (Date.now() - new Date(p.last_updated).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return acc + days;
          }, 0) / processes.length
        )
      : 0;

  return (
    <div className="flex flex-col w-80 flex-shrink-0">
      {/* Column Header */}
      <div
        className={`flex-none bg-gradient-to-r ${colorClass} rounded-t-lg px-4 py-3 text-white shadow-sm`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg flex-shrink-0">
              <FontAwesomeIcon
                icon={stageIcons[id] || faCheckCircle}
                className="w-4 h-4"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate">{title}</h3>
              <p className="text-xs opacity-90">{processes.length} proses</p>
            </div>
          </div>

          {/* Priority Badges */}
          {(highPriorityCount > 0 || mediumPriorityCount > 0) && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {highPriorityCount > 0 && (
                <div className="bg-red-500 bg-opacity-30 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                  <FontAwesomeIcon icon={faFire} className="w-3 h-3" />
                  <span>{highPriorityCount}</span>
                </div>
              )}
              {mediumPriorityCount > 0 && (
                <div className="bg-yellow-500 bg-opacity-30 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="w-3 h-3"
                  />
                  <span>{mediumPriorityCount}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Column Body - Fixed Height with Scroll */}
      <div
        ref={setNodeRef}
        className="flex-1 bg-gray-50 border-l border-r border-gray-200 p-3 overflow-y-auto"
        style={{
          height: "calc(100vh - 280px)", // Adjusted for new compact header
          minHeight: "400px",
        }}
      >
        <SortableContext items={processes.map((p) => p.id)}>
          <div className="space-y-3">
            {processes.length > 0 ? (
              processes.map((process) => (
                <TaarufCard key={process.id} process={process} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="bg-gray-200 rounded-full p-3 mb-2">
                  <FontAwesomeIcon icon={faPlus} className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium">Belum ada proses</p>
                <p className="text-xs mt-1 text-center px-4">
                  Drag & drop kartu ke sini
                </p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>

      {/* Column Footer - Compact */}
      {processes.length > 0 && (
        <div
          className={`flex-none bg-gradient-to-r ${colorClass} rounded-b-lg px-4 py-2 text-white text-center shadow-sm`}
        >
          <div className="text-xs opacity-90">
            Rata-rata: {averageDays} hari di tahap ini
          </div>
        </div>
      )}
    </div>
  );
}
