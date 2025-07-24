interface Feature {
  name: string
  value: string
}

interface ListingFeaturesProps {
  features: Feature[]
}

export default function ListingFeatures({ features }: ListingFeaturesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {features.map((feature, index) => (
        <div key={index} className="flex items-start p-3 rounded-lg bg-gray-100/50 dark:bg-gray-800/50">
          <div>
            <p className="font-medium">{feature.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{feature.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
