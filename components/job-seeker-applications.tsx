"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getJobSeekerApplications } from "@/lib/actions"

export function JobSeekerApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchApplications() {
      try {
        const data = await getJobSeekerApplications()
        setApplications(data)
      } catch (error) {
        console.error("Error fetching applications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-medium">No applications yet</h3>
          <p className="text-muted-foreground mt-2">Start applying to jobs to see your applications here</p>
          <Button asChild className="mt-4">
            <Link href="/jobs">Browse Jobs</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application.id}>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <div className="flex items-start justify-between">
                <Link href={`/jobs/${application.job.id}`} className="hover:underline">
                  <h3 className="text-xl font-semibold">{application.job.title}</h3>
                </Link>
                <Badge variant={getStatusVariant(application.status)}>{application.status}</Badge>
              </div>
              <div className="text-muted-foreground">
                {application.job.company} • {application.job.location}
              </div>
              <div className="text-sm text-muted-foreground">
                Applied {formatDistanceToNow(new Date(application.createdAt))} ago
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end p-6 pt-0">
            <Button size="sm" asChild>
              <Link href={`/jobs/${application.job.id}`}>View Job</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function getStatusVariant(status: string) {
  switch (status) {
    case "PENDING":
      return "outline"
    case "REVIEWING":
      return "secondary"
    case "INTERVIEW":
      return "default"
    case "ACCEPTED":
      return "success"
    case "REJECTED":
      return "destructive"
    default:
      return "outline"
  }
}
