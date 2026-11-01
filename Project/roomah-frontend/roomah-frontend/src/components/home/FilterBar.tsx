"use client";

import { useEffect, useState, Fragment } from "react";
import { createClient } from "@/lib/supabase/client";
import { Combobox, Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

type Province = { id: number; name: string };
const educationLevels = ["SMA/SMK", "D3", "S1", "S2", "S3"];
const ageRanges = ["17-20", "21-25", "26-30", "31-35", "36-40", "41+"];
const genders = ["Ikhwan", "Akhwat"];

type FilterBarProps = {
  onFilterChange: (
    filterType: string,
    value: string | { gte: number; lte: number } | ""
  ) => void;
  onResetFilters: () => void;
};

// --- Konsistensi ukuran & style untuk semua kontrol ---
const CONTROL_WRAPPER = "relative w-full overflow-hidden rounded-lg";
const CONTROL_CLASSES =
  "w-full cursor-default rounded-lg bg-gray-50 border border-gray-300 " +
  "py-2.5 pl-3 pr-10 text-left text-gray-900 placeholder:text-gray-500 " +
  "focus:outline-none focus-visible:border-primary focus-visible:ring-2 " +
  "focus-visible:ring-white/75 sm:text-sm";

export default function FilterBar({
  onFilterChange,
  onResetFilters,
}: FilterBarProps) {
  const supabase = createClient();
  const [provinces, setProvinces] = useState<Province[]>([]);

  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedAge, setSelectedAge] = useState<string>("");
  const [selectedEducation, setSelectedEducation] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );
  const [provinceQuery, setProvinceQuery] = useState("");

  useEffect(() => {
    const fetchProvinces = async () => {
      const { data } = await supabase
        .from("provinces")
        .select("id, name")
        .order("name");
      setProvinces(data || []);
    };
    fetchProvinces();
  }, [supabase]);

  const filteredProvinces =
    provinceQuery === ""
      ? provinces
      : provinces.filter((prov) =>
          prov.name.toLowerCase().includes(provinceQuery.toLowerCase())
        );

  const handleReset = () => {
    setSelectedGender("");
    setSelectedAge("");
    setSelectedEducation("");
    setSelectedProvince(null);
    setProvinceQuery("");
    onResetFilters();
  };

  const handleAgeChange = (value: string) => {
    setSelectedAge(value);
    if (!value) {
      onFilterChange("age", "");
      return;
    }
    if (value.includes("+")) {
      const gte = parseInt(value.replace("+", ""));
      onFilterChange("age", { gte, lte: 100 });
    } else {
      const [gte, lte] = value.split("-").map(Number);
      onFilterChange("age", { gte, lte });
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 relative z-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
        {/* Gender */}
        <Listbox
          value={selectedGender}
          onChange={(val) => {
            setSelectedGender(val);
            onFilterChange("gender", val);
          }}
        >
          <div className="relative">
            <Listbox.Button className={CONTROL_CLASSES}>
              <span className="block truncate">
                {selectedGender || "Pilih Gender"}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-20">
                {genders.map((item) => (
                  <Listbox.Option
                    key={item}
                    value={item}
                    className={({ active }) =>
                      `${
                        active ? "bg-primary text-white" : "text-gray-900"
                      } relative cursor-default select-none py-2 pl-10 pr-4`
                    }
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {item}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-primary"
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>

        {/* Umur */}
        <Listbox value={selectedAge} onChange={handleAgeChange}>
          <div className="relative">
            <Listbox.Button className={CONTROL_CLASSES}>
              <span className="block truncate">
                {selectedAge || "Pilih Umur"}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-20">
                {ageRanges.map((item) => (
                  <Listbox.Option
                    key={item}
                    value={item}
                    className={({ active }) =>
                      `${
                        active ? "bg-primary text-white" : "text-gray-900"
                      } relative cursor-default select-none py-2 pl-10 pr-4`
                    }
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {item}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-primary"
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>

        {/* Pendidikan */}
        <Listbox
          value={selectedEducation}
          onChange={(val) => {
            setSelectedEducation(val);
            onFilterChange("education", val);
          }}
        >
          <div className="relative">
            <Listbox.Button className={CONTROL_CLASSES}>
              <span className="block truncate">
                {selectedEducation || "Pilih Pendidikan"}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-20">
                {educationLevels.map((item) => (
                  <Listbox.Option
                    key={item}
                    value={item}
                    className={({ active }) =>
                      `${
                        active ? "bg-primary text-white" : "text-gray-900"
                      } relative cursor-default select-none py-2 pl-10 pr-4`
                    }
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {item}
                        </span>
                        {selected ? (
                          <span
                            className={`${
                              active ? "text-white" : "text-primary"
                            } absolute inset-y-0 left-0 flex items-center pl-3`}
                          >
                            <CheckIcon className="h-5 w-5" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>

        {/* Domisili (Combobox) */}
        <div className="relative w-full">
          <Combobox
            as="div"
            value={selectedProvince}
            onChange={(prov) => {
              setSelectedProvince(prov);
              onFilterChange("domicile_prov", prov?.name || "");
            }}
          >
            {/* BORDER & BG di wrapper, bukan di input */}
            <div
              className="relative w-full overflow-hidden rounded-lg
               border border-gray-300 bg-gray-50
               focus-within:border-primary focus-within:ring-2
               focus-within:ring-white/75"
            >
              <Combobox.Input
                className="w-full bg-transparent border-0 outline-none ring-0 shadow-none
                 py-2.5 pl-3 pr-10 text-left text-gray-900 placeholder:text-gray-500
                 sm:text-sm"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                onChange={(e) => setProvinceQuery(e.target.value)}
                displayValue={(p: Province) => p?.name || ""}
                placeholder="Pilih Domisili"
              />

              {/* Tombol transparan, tidak menimpa border */}
              <Combobox.Button
                className="absolute inset-y-0 right-0 w-9 flex items-center justify-center
                 bg-transparent border-0 outline-none ring-0 shadow-none
                 [appearance:none]"
              >
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </Combobox.Button>
            </div>

            <Transition
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Combobox.Options
                className="absolute z-50 mt-1 max-h-60 w-full left-0 right-0
                 overflow-auto rounded-md bg-white py-1 text-base shadow-lg
                 ring-1 ring-black/5 focus:outline-none sm:text-sm"
              >
                {filteredProvinces.length === 0 && provinceQuery !== "" ? (
                  <div className="py-2 px-3 text-gray-500">Tidak ada hasil</div>
                ) : (
                  filteredProvinces.slice(0, 50).map((prov) => (
                    <Combobox.Option
                      key={prov.id}
                      value={prov}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? "bg-primary text-white" : "text-gray-900"
                        }`
                      }
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? "font-medium" : "font-normal"
                            }`}
                          >
                            {prov.name}
                          </span>
                          {selected && (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                active ? "text-white" : "text-primary"
                              }`}
                            >
                              <CheckIcon className="h-5 w-5" />
                            </span>
                          )}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Transition>
          </Combobox>
        </div>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="w-full bg-gray-600 text-white font-semibold py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
