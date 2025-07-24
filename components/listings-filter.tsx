"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Search, Filter, MapPin, Ruler } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FilterValues {
  search?: string
  minPrice?: number
  maxPrice?: number
  minSize?: number
  maxSize?: number
  propertyType?: string
  location?: string
}

interface ListingsFilterProps {
  initialValues: FilterValues
}

export default function ListingsFilter({ initialValues }: ListingsFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [values, setValues] = useState<FilterValues>(initialValues)

  // อัปเดตค่าเริ่มต้นเมื่อ initialValues เปลี่ยน
  useEffect(() => {
    setValues(initialValues)
  }, [initialValues])

  // อัปเดต URL พารามิเตอร์เมื่อมีการกรอง
  const applyFilters = () => {
    const params = new URLSearchParams()

    if (values.search) params.set("search", values.search)
    if (values.minPrice) params.set("minPrice", values.minPrice.toString())
    if (values.maxPrice) params.set("maxPrice", values.maxPrice.toString())
    if (values.minSize) params.set("minSize", values.minSize.toString())
    if (values.maxSize) params.set("maxSize", values.maxSize.toString())
    if (values.propertyType) params.set("propertyType", values.propertyType)
    if (values.location) params.set("location", values.location)

    router.push(`${pathname}?${params.toString()}`)
  }

  // รีเซ็ตฟิลเตอร์
  const resetFilters = () => {
    setValues({})
    router.push(pathname)
  }

  return (
    <div className="rounded-3xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-6 shadow-xl border border-gray-200/30 dark:border-gray-800/30 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium">ค้นหาและกรอง</h2>
        <Button variant="ghost" size="sm" className="lg:hidden rounded-full" onClick={() => setIsOpen(!isOpen)}>
          <Filter className="h-4 w-4 mr-2" />
          {isOpen ? "ซ่อนตัวกรอง" : "แสดงตัวกรอง"}
        </Button>
      </div>

      <div className={`space-y-6 ${isOpen ? "block" : "hidden lg:block"}`}>
        {/* ค้นหา */}
        <div className="space-y-2">
          <Label htmlFor="search">คำค้นหา</Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              id="search"
              placeholder="ค้นหาที่ดิน..."
              className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
              value={values.search || ""}
              onChange={(e) => setValues({ ...values, search: e.target.value })}
            />
          </div>
        </div>

        {/* ตำแหน่ง */}
        <div className="space-y-2">
          <Label htmlFor="location">ตำแหน่ง</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              id="location"
              placeholder="จังหวัด, อำเภอ..."
              className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
              value={values.location || ""}
              onChange={(e) => setValues({ ...values, location: e.target.value })}
            />
          </div>
        </div>

        {/* ประเภทที่ดิน */}
        <div className="space-y-2">
          <Label htmlFor="propertyType">ประเภทที่ดิน</Label>
          <Select
            value={values.propertyType || ""}
            onValueChange={(value) => setValues({ ...values, propertyType: value })}
          >
            <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
              <SelectValue placeholder="เลือกประเภท" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">ที่อยู่อาศัย</SelectItem>
              <SelectItem value="commercial">พาณิชย์</SelectItem>
              <SelectItem value="agricultural">เกษตรกรรม</SelectItem>
              <SelectItem value="industrial">อุตสาหกรรม</SelectItem>
              <SelectItem value="recreational">พักผ่อน/ท่องเที่ยว</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ช่วงราคา */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>ช่วงราคา</Label>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {values.minPrice ? `฿${values.minPrice.toLocaleString()}` : "฿0"} -
              {values.maxPrice ? `฿${values.maxPrice.toLocaleString()}` : "ไม่จำกัด"}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPrice" className="text-xs">
                ราคาต่ำสุด
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">฿</span>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                  value={values.minPrice || ""}
                  onChange={(e) =>
                    setValues({ ...values, minPrice: e.target.value ? Number.parseFloat(e.target.value) : undefined })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPrice" className="text-xs">
                ราคาสูงสุด
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">฿</span>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="ไม่จำกัด"
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                  value={values.maxPrice || ""}
                  onChange={(e) =>
                    setValues({ ...values, maxPrice: e.target.value ? Number.parseFloat(e.target.value) : undefined })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* ขนาดที่ดิน */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>ขนาดที่ดิน (ไร่)</Label>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {values.minSize || "0"} - {values.maxSize || "ไม่จำกัด"}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minSize" className="text-xs">
                ขนาดต่ำสุด
              </Label>
              <div className="relative">
                <Ruler className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  id="minSize"
                  type="number"
                  placeholder="0"
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                  value={values.minSize || ""}
                  onChange={(e) =>
                    setValues({ ...values, minSize: e.target.value ? Number.parseFloat(e.target.value) : undefined })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxSize" className="text-xs">
                ขนาดสูงสุด
              </Label>
              <div className="relative">
                <Ruler className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  id="maxSize"
                  type="number"
                  placeholder="ไม่จำกัด"
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                  value={values.maxSize || ""}
                  onChange={(e) =>
                    setValues({ ...values, maxSize: e.target.value ? Number.parseFloat(e.target.value) : undefined })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* ปุ่มค้นหาและรีเซ็ต */}
        <div className="flex flex-col space-y-2 pt-4">
          <Button
            onClick={applyFilters}
            className="w-full rounded-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            <Search className="h-4 w-4 mr-2" />
            ค้นหา
          </Button>
          <Button
            variant="outline"
            onClick={resetFilters}
            className="w-full rounded-full border-gray-300 dark:border-gray-700"
          >
            รีเซ็ตตัวกรอง
          </Button>
        </div>
      </div>
    </div>
  )
}
