"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ListingsSkeleton() {
  // สร้าง array ขนาด 6 สำหรับแสดง skeleton 6 รายการ
  const skeletons = Array.from({ length: 6 }, (_, i) => i)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {skeletons.map((index) => (
        <Card key={index} className="overflow-hidden border-gray-200/50 dark:border-gray-800/50">
          <Skeleton className="aspect-[4/3] w-full" />
          <CardContent className="p-4">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
