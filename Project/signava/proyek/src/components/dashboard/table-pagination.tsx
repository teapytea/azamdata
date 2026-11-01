import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { formatNumber } from "@/lib/format"

function pageWindow(current: number, pageCount: number, size = 5): number[] {
  const start = Math.max(
    1,
    Math.min(current - Math.floor(size / 2), pageCount - size + 1)
  )
  const end = Math.min(pageCount, start + size - 1)
  const pages: number[] = []
  for (let page = start; page <= end; page++) pages.push(page)
  return pages
}

export function TablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
}: {
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
}) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  if (totalItems === 0) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(totalItems, page * pageSize)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
      <p className="text-xs text-muted-foreground">
        Menampilkan {formatNumber(from)}–{formatNumber(to)} dari{" "}
        {formatNumber(totalItems)} data
      </p>
      {pageCount > 1 && (
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                text="Sebelumnya"
                aria-disabled={page === 1}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
                onClick={(event) => {
                  event.preventDefault()
                  onPageChange(Math.max(1, page - 1))
                }}
                href="#"
              />
            </PaginationItem>
            {pageWindow(page, pageCount).map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  isActive={pageNumber === page}
                  onClick={(event) => {
                    event.preventDefault()
                    onPageChange(pageNumber)
                  }}
                  href="#"
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                text="Berikutnya"
                aria-disabled={page === pageCount}
                className={
                  page === pageCount ? "pointer-events-none opacity-50" : ""
                }
                onClick={(event) => {
                  event.preventDefault()
                  onPageChange(Math.min(pageCount, page + 1))
                }}
                href="#"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
