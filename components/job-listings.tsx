"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getJobs } from "@/lib/actions"

interface JobListingsProps {
  featured?: boolean
  limit?: number
  filters?: Record<string, any>
}

export function JobListings({ featured = false, limit, filters = {} }: JobListingsProps) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJobs() {
      try {
        const jobsData = await getJobs({ featured, limit, ...filters })
        setJobs(jobsData)
      } catch (error) {
        console.error("Error fetching jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [featured, limit, filters])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: limit || 5 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex space-x-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No jobs found</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your search filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <div className="flex items-start justify-between">
                <Link href={`/jobs/${job.id}`} className="hover:underline">
                  <h3 className="text-xl font-semibold">{job.title}</h3>
                </Link>
                <Badge variant={job.type === "FULL_TIME" ? "default" : "outline"}>{job.type.replace("_", " ")}</Badge>
              </div>
              <div className="text-muted-foreground">
                {job.company} • {job.location}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {job.skills.slice(0, 5).map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
                {job.skills.length > 5 && <Badge variant="secondary">+{job.skills.length - 5} more</Badge>}
              </div>
              <p className="mt-2 line-clamp-2">{job.description}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between p-6 pt-0">
            <div className="text-sm text-muted-foreground">
              Posted {formatDistanceToNow(new Date(job.createdAt))} ago
            </div>
            <Button asChild size="sm">
              <Link href={`/jobs/${job.id}`}>View Details</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
