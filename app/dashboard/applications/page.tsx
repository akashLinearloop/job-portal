import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { JobSeekerApplications } from "@/components/job-seeker-applications"
import { JobProviderApplications } from "@/components/job-provider-applications"

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const userRole = session.user.role

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Applications</h1>

      {userRole === "JOB_SEEKER" ? <JobSeekerApplications /> : <JobProviderApplications />}
    </div>
  )
}
