"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getJobProviderDashboardData } from "@/lib/actions"

export function JobProviderDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const dashboardData = await getJobProviderDashboardData()
        setData(dashboardData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>

        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Job Provider Dashboard</h1>
        <Button asChild>
          <Link href="/dashboard/jobs/new">Post a Job</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{data?.stats.activeJobs || 0}</CardTitle>
            <CardDescription>Active Jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">{data?.stats.totalViews || 0} total views</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{data?.stats.totalApplications || 0}</CardTitle>
            <CardDescription>Total Applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">{data?.stats.newApplications || 0} new applications</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{data?.stats.interviews || 0}</CardTitle>
            <CardDescription>Interviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">{data?.stats.upcomingInterviews || 0} upcoming</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">Your Jobs</TabsTrigger>
          <TabsTrigger value="applications">Recent Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4 mt-6">
          {data?.jobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <h3 className="text-lg font-medium">No jobs posted yet</h3>
                <p className="text-muted-foreground mt-2">Post your first job to start receiving applications</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/jobs/new">Post a Job</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            data?.jobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-start justify-between">
                      <Link href={`/jobs/${job.id}`} className="hover:underline">
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                      </Link>
                      <Badge variant={job.status === "ACTIVE" ? "default" : "outline"}>{job.status}</Badge>
                    </div>
                    <div className="text-muted-foreground">
                      {job.company} • {job.location}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Posted {formatDistanceToNow(new Date(job.createdAt))} ago
                      </div>
                      <div className="text-sm">{job.applicationCount} applications</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end p-6 pt-0 gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/jobs/${job.id}/edit`}>Edit</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/jobs/${job.id}/applications`}>View Applications</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-4 mt-6">
          {data?.recentApplications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <h3 className="text-lg font-medium">No applications yet</h3>
                <p className="text-muted-foreground mt-2">Post a job to start receiving applications</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/jobs/new">Post a Job</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            data?.recentApplications.map((application) => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/jobs/${application.job.id}`} className="hover:underline">
                          <h3 className="text-xl font-semibold">{application.job.title}</h3>
                        </Link>
                        <div className="text-muted-foreground">Applicant: {application.user.name}</div>
                      </div>
                      <Badge variant={application.status === "PENDING" ? "outline" : "default"}>
                        {application.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Applied {formatDistanceToNow(new Date(application.createdAt))} ago
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end p-6 pt-0">
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/applications/${application.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}

          {data?.recentApplications.length > 0 && (
            <div className="flex justify-center mt-4">
              <Button asChild variant="outline">
                <Link href="/dashboard/applications">View All Applications</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
