"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getJobProviderApplications, updateApplicationStatus } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"

export function JobProviderApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchApplications() {
      try {
        const data = await getJobProviderApplications()
        setApplications(data)
      } catch (error) {
        console.error("Error fetching applications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const handleStatusChange = async (applicationId: string, status: string) => {
    try {
      await updateApplicationStatus(applicationId, status)

      setApplications(applications.map((app) => (app.id === applicationId ? { ...app, status } : app)))

      toast({
        title: "Status updated",
        description: "Application status has been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      })
    }
  }

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
          <p className="text-muted-foreground mt-2">Post a job to start receiving applications</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/jobs/new">Post a Job</Link>
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
                <div>
                  <Link href={`/jobs/${application.job.id}`} className="hover:underline">
                    <h3 className="text-xl font-semibold">{application.job.title}</h3>
                  </Link>
                  <div className="text-muted-foreground">
                    Applicant: {application.user.name} • {application.user.email}
                  </div>
                </div>
                <Select
                  defaultValue={application.status}
                  onValueChange={(value) => handleStatusChange(application.id, value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="REVIEWING">Reviewing</SelectItem>
                    <SelectItem value="INTERVIEW">Interview</SelectItem>
                    <SelectItem value="ACCEPTED">Accepted</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                Applied {formatDistanceToNow(new Date(application.createdAt))} ago
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end p-6 pt-0 gap-2">
            <Button size="sm" asChild>
              <Link href={`/dashboard/applications/${application.id}`}>View Details</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
