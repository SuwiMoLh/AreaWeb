"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useThaiProvinces } from "@/components/thai-province-provider"

interface DistrictSelectorProps {
  province: string
  value: string
  onChange: (district: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DistrictSelector({
  province,
  value,
  onChange,
  placeholder = "เลือกอำเภอ/เขต",
  className = "",
  disabled = false,
}: DistrictSelectorProps) {
  const { getDistrictsByProvince } = useThaiProvinces()
  const [districts, setDistricts] = useState<string[]>([])

  useEffect(() => {
    if (province) {
      const districtList = getDistrictsByProvince(province) || []
      setDistricts(districtList)

      // ถ้าค่าปัจจุบันไม่อยู่ในรายการอำเภอใหม่ ให้รีเซ็ตค่า
      if (value && !districtList.includes(value)) {
        onChange("")
      }
    } else {
      setDistricts([])
      if (value) {
        onChange("")
      }
    }
  }, [province, getDistrictsByProvince, value, onChange])

  return (
    <Select value={value || ""} onValueChange={onChange} disabled={disabled || !province || districts.length === 0}>
      <SelectTrigger
        className={`bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 ${className}`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {districts.length > 0 ? (
          districts.map((district) => (
            <SelectItem key={district} value={district || ""}>
              {district}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="no-data" disabled>
            ไม่มีข้อมูลอำเภอ
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}
