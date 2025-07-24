import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined) return "ไม่ระบุราคา"

  const numPrice = typeof price === "string" ? Number.parseFloat(price) : price

  if (isNaN(numPrice)) return "ไม่ระบุราคา"

  // จัดรูปแบบราคาเป็นสกุลเงินบาท
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(numPrice)
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "ไม่ระบุ"

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch (error) {
    return "ไม่ระบุ"
  }
}

export function formatSize(size: number | string | null | undefined, unit = "ไร่"): string {
  if (size === null || size === undefined) return "ไม่ระบุขนาด"

  const numSize = typeof size === "string" ? Number.parseFloat(size) : size

  if (isNaN(numSize)) return "ไม่ระบุขนาด"

  return `${numSize.toLocaleString("th-TH")} ${unit}`
}
