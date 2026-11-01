// src/components/shared/ProfileCard.tsx (IMPROVED UI VERSION)

import { Profile } from "@/lib/mock-data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBirthdayCake,
  faMapMarkerAlt,
  faGraduationCap,
  faEye,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

interface ProfileCardProps {
  profile: Profile;
}

const statusMap = {
  ready: {
    text: "Siap Bertaaruf",
    className: "bg-green-500 text-white",
    dotColor: "bg-green-500",
  },
  process: {
    text: "Dalam Proses",
    className: "bg-blue-500 text-white",
    dotColor: "bg-blue-500",
  },
  khitbah: {
    text: "Khitbah",
    className: "bg-yellow-500 text-white",
    dotColor: "bg-yellow-500",
  },
};

export default function ProfileCard({ profile }: ProfileCardProps) {
  const statusInfo = statusMap[profile.status];

  return (
    <div className="bg-surface-color rounded-2xl p-6 shadow-light border border-border-color/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-medium relative overflow-hidden">
      {/* Status Badge - Responsive size for mobile */}
      <div className="absolute top-4 right-4 z-10">
        <div
          className={`flex items-center gap-1 sm:gap-1.5 text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${statusInfo.className} shadow-sm`}
        >
          <div
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${statusInfo.dotColor} animate-pulse`}
          ></div>
          <span className="text-xs sm:text-xs">{statusInfo.text}</span>
        </div>
      </div>

      {/* Profile Header - Mobile optimized layout */}
      <div className="mb-6">
        {/* Avatar section */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Image
              src={profile.avatar}
              alt={profile.name}
              width={80}
              height={80}
              className="rounded-full object-cover border-4 border-background-color flex-shrink-0 shadow-sm"
            />
            {/* Online indicator - subtle dot */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-background-color">
              <div
                className={`w-3 h-3 rounded-full ${statusInfo.dotColor}`}
              ></div>
            </div>
          </div>
        </div>

        {/* Name and job section - fully centered */}
        <div className="text-center">
          <h3 className="font-bold text-lg text-text-primary mb-1 leading-tight">
            {profile.name}
          </h3>
          <p className="text-sm text-text-secondary font-medium">
            {profile.job}
          </p>
        </div>
      </div>

      {/* Details - More compact and visually appealing */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="flex flex-col items-center gap-1 bg-background-color px-3 py-3 rounded-xl text-center">
          <FontAwesomeIcon
            icon={faBirthdayCake}
            className="text-primary text-lg"
          />
          <span className="text-xs text-text-secondary font-medium">
            {profile.age} tahun
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 bg-background-color px-3 py-3 rounded-xl text-center">
          <FontAwesomeIcon
            icon={faMapMarkerAlt}
            className="text-primary text-lg"
          />
          <span className="text-xs text-text-secondary font-medium">
            {profile.location}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 bg-background-color px-3 py-3 rounded-xl text-center">
          <FontAwesomeIcon
            icon={faGraduationCap}
            className="text-primary text-lg"
          />
          <span className="text-xs text-text-secondary font-medium">
            {profile.education}
          </span>
        </div>
      </div>

      {/* Quote - Fixed height with responsive font size */}
      <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/20 relative h-24 flex items-center">
        <div className="absolute top-2 left-2 text-primary/30 text-2xl font-serif">
          &apos;
        </div>
        <p
          className={`italic text-text-secondary leading-relaxed pl-4 pr-2 w-full text-center ${
            profile.quote.length > 80
              ? "text-xs"
              : profile.quote.length > 50
              ? "text-sm"
              : "text-sm"
          }`}
        >
          {profile.quote}
        </p>
        <div className="absolute bottom-2 right-2 text-primary/30 text-2xl font-serif rotate-180">
          &apos;
        </div>
      </div>

      {/* Actions - Improved button design */}
      <div className="flex gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-primary border-2 border-primary/20 bg-primary/5 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200">
          <FontAwesomeIcon icon={faEye} />
          <span>Lihat CV</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-secondary text-white hover:from-secondary hover:to-primary transform hover:scale-105 transition-all duration-200 shadow-md">
          <FontAwesomeIcon icon={faPaperPlane} />
          <span>{"Ajukan Ta'aruf"}</span>
        </button>
      </div>
    </div>
  );
}
