import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getJobById } from "@/lib/data"
import { ApplyButton } from "@/components/apply-button"
import { formatDistanceToNow } from "date-fns"
import { notFound } from "next/navigation"

export default async function JobPage({ params }: { params: { id: string } }) {
  const job = await getJobById(params.id)

  if (!job) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">{job.title}</h1>
                  <Badge variant={job.type === "FULL_TIME" ? "default" : "outline"}>{job.type.replace("_", " ")}</Badge>
                </div>
                <div className="text-muted-foreground">
                  {job.company} • {job.location} • Posted {formatDistanceToNow(new Date(job.createdAt))} ago
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Job Description</h2>
                  <p className="whitespace-pre-line">{job.description}</p>
                </div>
                <Separator />
                <div>
                  <h2 className="text-lg font-semibold mb-2">Requirements</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div>
                  <h2 className="text-lg font-semibold mb-2">Responsibilities</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index}>{resp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <ApplyButton jobId={job.id} />
            </CardFooter>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Job Overview</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium">Salary</div>
                  <div>{job.salary}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Experience</div>
                  <div>{job.experience}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Industry</div>
                  <div>{job.industry}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Education</div>
                  <div>{job.education}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Skills</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Share Job
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
