"use client";

import { Tab } from "@headlessui/react";
import { EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
import { ReactNode } from "react";

interface CVTabsProps {
  previewTab: ReactNode;
  editTab: ReactNode;
}

export function CVTabs({ previewTab, editTab }: CVTabsProps) {
  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-200">
      <Tab.Group>
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
          <Tab.List className="flex bg-slate-50 p-1 m-4 mb-0 rounded-xl">
            <Tab
              className={({ selected }) =>
                `flex-1 flex items-center justify-center gap-2 rounded-lg py-3 px-4 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                  selected
                    ? "bg-white text-green-700 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                }`
              }
            >
              <EyeIcon className="h-4 w-4" />
              <span>Pratinjau</span>
            </Tab>
            <Tab
              className={({ selected }) =>
                `flex-1 flex items-center justify-center gap-2 rounded-lg py-3 px-4 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                  selected
                    ? "bg-white text-green-700 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                }`
              }
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </Tab>
          </Tab.List>
        </div>

        <Tab.Panels className="overflow-hidden">
          <Tab.Panel className="focus:outline-none p-4">{previewTab}</Tab.Panel>
          <Tab.Panel className="focus:outline-none p-4">{editTab}</Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
