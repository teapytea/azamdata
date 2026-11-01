// src/components/admin/taaruf/TaarufCard.tsx
"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ProcessWithProfiles } from "./KanbanBoard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faUser,
  faCalendarAlt,
  faExclamationTriangle,
  faFire,
  faEye,
  faEdit,
  faGripVertical,
  faMars,
  faVenus,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function TaarufCard({
  process,
  isDragging = false,
}: {
  process: ProcessWithProfiles;
  isDragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: process.id });

  const [showDetails, setShowDetails] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Calculate days since last update
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(process.last_updated).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Get priority styling
  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-400";
      case "medium":
        return "border-l-yellow-400";
      default:
        return "border-l-green-400";
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500 animate-pulse";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative bg-white rounded-lg shadow-sm border-l-4 border-t border-r border-b border-gray-100 
        transition-all duration-200 hover:shadow-md cursor-pointer
        ${isDragging ? "rotate-1 shadow-xl scale-105 opacity-90 z-50" : ""}
        ${getPriorityBorder(process.priority || "low")}
      `}
      {...attributes}
    >
      {/* Compact Card Header */}
      <div className="flex items-center justify-between p-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 py-0.5 rounded text-xs font-bold">
            #{process.id.substring(0, 6)}
          </div>
          <div
            className={`w-2 h-2 rounded-full ${getPriorityDot(
              process.priority || "low"
            )}`}
          />
        </div>

        <div className="flex items-center gap-1">
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {daysSinceUpdate === 0 ? "Today" : `${daysSinceUpdate}d ago`}
          </div>

          {/* Drag Handle - More Compact */}
          <div
            {...listeners}
            className="opacity-30 group-hover:opacity-70 transition-opacity cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100"
          >
            <FontAwesomeIcon
              icon={faGripVertical}
              className="w-3 h-3 text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Compact Participants */}
      <div className="px-3 pb-2">
        <div className="space-y-1.5">
          {/* Ikhwan */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faMars} className="w-2.5 h-2.5" />
            </div>
            <span className="text-xs font-medium text-blue-700 truncate">
              {process.ikhwan_profile?.full_name || "Nama tidak ditemukan"}
            </span>
          </div>

          {/* Akhwat */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-pink-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faVenus} className="w-2.5 h-2.5" />
            </div>
            <span className="text-xs font-medium text-pink-700 truncate">
              {process.akhwat_profile?.full_name || "Nama tidak ditemukan"}
            </span>
          </div>
        </div>
      </div>

      {/* Compact Card Footer */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-b-lg border-t border-gray-100">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
          <span>
            {new Date(process.created_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
            })}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100 rounded transition-colors"
          >
            <FontAwesomeIcon
              icon={showDetails ? faChevronUp : faChevronDown}
              className="w-3 h-3"
            />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log("Edit process:", process.id);
            }}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Collapsible Details */}
      {showDetails && (
        <div className="border-t border-gray-200 bg-white p-3">
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500">Process ID:</span>
                <div className="font-mono text-gray-800 text-xs mt-1 bg-gray-100 px-2 py-1 rounded">
                  {process.id.substring(0, 12)}...
                </div>
              </div>
              <div>
                <span className="text-gray-500">Last Update:</span>
                <div className="text-gray-800 mt-1">
                  {new Date(process.last_updated).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <span className="text-gray-500">Status Duration:</span>
              <div
                className={`inline-block ml-2 px-2 py-1 rounded text-xs font-medium ${
                  daysSinceUpdate > 14
                    ? "bg-red-100 text-red-700"
                    : daysSinceUpdate > 7
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {daysSinceUpdate} hari di tahap ini
              </div>
            </div>
          </div>

          {/* Quick Actions in Details */}
          <div className="mt-3 flex gap-2">
            <button className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1.5 rounded text-xs font-medium transition-colors">
              View Details
            </button>
            <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1.5 rounded text-xs font-medium transition-colors">
              Add Note
            </button>
          </div>
        </div>
      )}

      {/* Compact Priority Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            process.priority === "high"
              ? "bg-red-500"
              : process.priority === "medium"
              ? "bg-yellow-500"
              : "bg-green-500"
          }`}
          style={{
            width: `${Math.max(10, Math.min(100 - daysSinceUpdate * 2, 100))}%`,
          }}
        />
      </div>
    </div>
  );
}
