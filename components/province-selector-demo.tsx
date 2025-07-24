"use client"

import { useState } from "react"
import { ProvinceSelector, useThaiProvinces } from "./thai-province-provider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProvinceSelectorDemo() {
  const [selectedProvince, setSelectedProvince] = useState<string>("")
  const [selectedRegion, setSelectedRegion] = useState<string>("")
  const { getProvincesByRegion } = useThaiProvinces()
  const [regionProvinces, setRegionProvinces] = useState<string[]>([])

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region)
    const provinces = getProvincesByRegion(region)
    setRegionProvinces(provinces)
    setSelectedProvince("")
  }

  return (
    <div className="rounded-3xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-6 shadow-xl border border-gray-200/30 dark:border-gray-800/30">
      <h2 className="text-xl font-medium mb-4">ตัวเลือกจังหวัดในประเทศไทย</h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">เลือกจังหวัด (แบบทั้งหมด 77 จังหวัด)</label>
          <ProvinceSelector value={selectedProvince} onChange={setSelectedProvince} />

          {selectedProvince && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              คุณได้เลือกจังหวัด: <span className="font-medium">{selectedProvince}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">เลือกตามภูมิภาค</label>
          <Select value={selectedRegion} onValueChange={handleRegionChange}>
            <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
              <SelectValue placeholder="เลือกภูมิภาค" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="central">ภาคกลาง</SelectItem>
              <SelectItem value="north">ภาคเหนือ</SelectItem>
              <SelectItem value="northeast">ภาคตะวันออกเฉียงเหนือ</SelectItem>
              <SelectItem value="east">ภาคตะวันออก</SelectItem>
              <SelectItem value="west">ภาคตะวันตก</SelectItem>
              <SelectItem value="south">ภาคใต้</SelectItem>
            </SelectContent>
          </Select>

          {selectedRegion && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">จังหวัดในภูมิภาคที่เลือก</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {regionProvinces.map((province) => (
                  <Button
                    key={province}
                    variant="outline"
                    className={`text-sm ${selectedProvince === province ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                    onClick={() => setSelectedProvince(province)}
                  >
                    {province}
                  </Button>
                ))}
              </div>

              {selectedProvince && (
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  คุณได้เลือกจังหวัด: <span className="font-medium">{selectedProvince}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
