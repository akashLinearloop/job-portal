import { JobFilters } from "@/components/job-filters"
import { JobListings } from "@/components/job-listings"

export default function JobsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-4">
        <div className="w-full md:w-1/4">
          <JobFilters />
        </div>
        <div className="w-full md:w-3/4">
          <h1 className="text-3xl font-bold mb-6">Browse Jobs</h1>
          <JobListings />
        </div>
      </div>
    </div>
  )
}
