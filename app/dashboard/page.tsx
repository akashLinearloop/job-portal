import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { JobSeekerDashboard } from "@/components/job-seeker-dashboard"
import { JobProviderDashboard } from "@/components/job-provider-dashboard"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const userRole = session.user.role

  return (
    <div className="container mx-auto px-4 py-8">
      {userRole === "JOB_SEEKER" ? <JobSeekerDashboard /> : <JobProviderDashboard />}
    </div>
  )
}
