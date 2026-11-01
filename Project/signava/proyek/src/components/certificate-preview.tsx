import { currentOrganization } from "@/lib/mock"
import { cn } from "@/lib/utils"

interface CertificatePreviewProps {
  title: string
  subtitle: string
  recipientName: string
  accentColor: string
  showLogo?: boolean
  showBadge?: boolean
  badgeColor?: string
  organizationName?: string
  detailLines?: string[]
  className?: string
}

// Medali emas kecil di pojok sertifikat, gaya badge penghargaan.
function CertificateBadge({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 40 52"
      aria-hidden="true"
      className="absolute right-4 bottom-4 h-12 w-9 drop-shadow-sm"
    >
      <polygon points="12,28 20,52 4,46" fill={color} opacity={0.75} />
      <polygon points="28,28 36,46 20,52" fill={color} opacity={0.6} />
      <circle cx="20" cy="18" r="15" fill={color} />
      <circle cx="20" cy="18" r="11" fill="white" opacity={0.25} />
      <path
        d="M20 10.5l2.2 4.5 5 .7-3.6 3.5.9 4.9-4.5-2.3-4.5 2.3.9-4.9-3.6-3.5 5-.7z"
        fill="white"
      />
    </svg>
  )
}

// Pratinjau sertifikat statis untuk galeri template, editor, wizard, dan verifikasi.
export function CertificatePreview({
  title,
  subtitle,
  recipientName,
  accentColor,
  showLogo = true,
  showBadge = false,
  badgeColor = "#B7791F",
  organizationName = currentOrganization.name,
  detailLines = [],
  className,
}: CertificatePreviewProps) {
  return (
    <div
      className={cn(
        "relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-white p-6 text-center shadow-xs dark:bg-neutral-100",
        className
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1.5"
        style={{ backgroundColor: accentColor }}
      />

      {showLogo && (
        <div
          className="mb-3 flex size-8 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: accentColor }}
        >
          {organizationName
            .split(" ")
            .slice(0, 2)
            .map((word) => word[0])
            .join("")}
        </div>
      )}

      <p
        className="text-[10px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: accentColor }}
      >
        {title}
      </p>
      <p className="mt-2 text-[10px] text-neutral-500">{subtitle}</p>
      <p className="mt-1 font-serif text-lg font-semibold text-neutral-900">
        {recipientName}
      </p>

      {detailLines.length > 0 && (
        <div className="mt-2 space-y-0.5">
          {detailLines.map((line) => (
            <p key={line} className="text-[10px] text-neutral-600">
              {line}
            </p>
          ))}
        </div>
      )}

      <p className="mt-3 text-[9px] text-neutral-400">{organizationName}</p>

      {showBadge && <CertificateBadge color={badgeColor} />}
    </div>
  )
}
