"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getJobSeekerDashboardData } from "@/lib/actions"

export function JobSeekerDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const dashboardData = await getJobSeekerDashboardData()
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
        <h1 className="text-3xl font-bold">Job Seeker Dashboard</h1>
        <Button asChild>
          <Link href="/jobs">Browse Jobs</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{data?.stats.applications || 0}</CardTitle>
            <CardDescription>Total Applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {data?.stats.recentApplications || 0} in the last 30 days
            </div>
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{data?.stats.savedJobs || 0}</CardTitle>
            <CardDescription>Saved Jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">{data?.stats.newSavedJobs || 0} new matches</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="applications">
        <TabsList>
          <TabsTrigger value="applications">Recent Applications</TabsTrigger>
          <TabsTrigger value="recommended">Recommended Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4 mt-6">
          {data?.recentApplications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <h3 className="text-lg font-medium">No applications yet</h3>
                <p className="text-muted-foreground mt-2">Start applying to jobs to see your applications here</p>
                <Button asChild className="mt-4">
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            data?.recentApplications.map((application) => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-start justify-between">
                      <Link href={`/jobs/${application.job.id}`} className="hover:underline">
                        <h3 className="text-xl font-semibold">{application.job.title}</h3>
                      </Link>
                      <Badge variant={application.status === "PENDING" ? "outline" : "default"}>
                        {application.status}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">
                      {application.job.company} • {application.job.location}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Applied {formatDistanceToNow(new Date(application.createdAt))} ago
                    </div>
                  </div>
                </CardContent>
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

        <TabsContent value="recommended" className="space-y-4 mt-6">
          {data?.recommendedJobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <h3 className="text-lg font-medium">No recommended jobs yet</h3>
                <p className="text-muted-foreground mt-2">Complete your profile to get job recommendations</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/profile">Complete Profile</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            data?.recommendedJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-start justify-between">
                      <Link href={`/jobs/${job.id}`} className="hover:underline">
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                      </Link>
                      <Badge variant={job.type === "FULL_TIME" ? "default" : "outline"}>
                        {job.type.replace("_", " ")}
                      </Badge>
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
                    </div>
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
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
