"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { hash } from "bcrypt"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function registerUser(data: {
  name: string
  email: string
  password: string
  role: string
}) {
  const hashedPassword = await hash(data.password, 10)

  const user = await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    },
  })

  // Create role-specific profile
  if (data.role === "JOB_SEEKER") {
    await db.jobSeeker.create({
      data: {
        userId: user.id,
      },
    })
  } else if (data.role === "JOB_PROVIDER") {
    await db.jobProvider.create({
      data: {
        userId: user.id,
      },
    })
  }

  return user
}

export async function createJob(data: any) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "JOB_PROVIDER") {
    throw new Error("Unauthorized")
  }

  const job = await db.job.create({
    data: {
      title: data.title,
      company: data.company,
      location: data.location,
      type: data.type,
      salary: data.salary,
      description: data.description,
      requirements: data.requirements,
      responsibilities: data.responsibilities,
      experience: data.experience,
      education: data.education,
      industry: data.industry,
      skills: data.skills,
      userId: session.user.id,
      status: "ACTIVE",
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/jobs")

  return job
}

export async function applyForJob(data: {
  jobId: string
  coverLetter: string
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "JOB_SEEKER") {
    throw new Error("Unauthorized")
  }

  // Check if user has already applied for this job
  const existingApplication = await db.application.findFirst({
    where: {
      jobId: data.jobId,
      userId: session.user.id,
    },
  })

  if (existingApplication) {
    throw new Error("You have already applied for this job")
  }

  const application = await db.application.create({
    data: {
      jobId: data.jobId,
      userId: session.user.id,
      coverLetter: data.coverLetter,
      status: "PENDING",
    },
  })

  revalidatePath(`/jobs/${data.jobId}`)
  revalidatePath("/dashboard")

  return application
}

export async function updateProfile(data: any, role: string) {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Unauthorized")
  }

  // Update user name
  await db.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      name: data.name,
    },
  })

  // Update role-specific profile
  if (role === "JOB_SEEKER") {
    await db.jobSeeker.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        title: data.title,
        bio: data.bio,
        location: data.location,
        skills: data.skills,
        experience: data.experience,
        education: data.education,
        resume: data.resume,
        linkedin: data.linkedin,
        github: data.github,
        website: data.website,
      },
      create: {
        userId: session.user.id,
        title: data.title,
        bio: data.bio,
        location: data.location,
        skills: data.skills,
        experience: data.experience,
        education: data.education,
        resume: data.resume,
        linkedin: data.linkedin,
        github: data.github,
        website: data.website,
      },
    })
  } else if (role === "JOB_PROVIDER") {
    await db.jobProvider.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        companyName: data.companyName,
        companyDescription: data.companyDescription,
        industry: data.industry,
        location: data.location,
        website: data.website,
        linkedin: data.linkedin,
        foundedYear: data.foundedYear,
        companySize: data.companySize,
      },
      create: {
        userId: session.user.id,
        companyName: data.companyName,
        companyDescription: data.companyDescription,
        industry: data.industry,
        location: data.location,
        website: data.website,
        linkedin: data.linkedin,
        foundedYear: data.foundedYear,
        companySize: data.companySize,
      },
    })
  }

  revalidatePath("/dashboard/profile")

  return { success: true }
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "JOB_PROVIDER") {
    throw new Error("Unauthorized")
  }

  // Verify that the application belongs to a job posted by this provider
  const application = await db.application.findUnique({
    where: {
      id: applicationId,
    },
    include: {
      job: true,
    },
  })

  if (!application || application.job.userId !== session.user.id) {
    throw new Error("Unauthorized")
  }

  await db.application.update({
    where: {
      id: applicationId,
    },
    data: {
      status,
    },
  })

  revalidatePath("/dashboard/applications")

  return { success: true }
}

export async function getUserProfile() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      jobSeeker: session.user.role === "JOB_SEEKER",
      jobProvider: session.user.role === "JOB_PROVIDER",
    },
  })

  return user
}

export async function getJobs({ featured = false, limit, ...filters }: any = {}) {
  // Build the query
  const where: any = {
    status: "ACTIVE",
  }

  if (featured) {
    where.featured = true
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { company: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ]
  }

  if (filters.location) {
    where.location = { contains: filters.location, mode: "insensitive" }
  }

  if (filters.jobType) {
    where.type = filters.jobType
  }

  if (filters.remote === "true") {
    where.location = { contains: "remote", mode: "insensitive" }
  }

  const jobs = await db.job.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    take: limit ? Number.parseInt(limit) : undefined,
  })

  return jobs
}

export async function getJobById(id: string) {
  const job = await db.job.findUnique({
    where: {
      id,
    },
  })

  return job
}

export async function getJobSeekerDashboardData() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "JOB_SEEKER") {
    return null
  }

  // Get recent applications
  const recentApplications = await db.application.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      job: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  })

  // Get recommended jobs based on user skills
  const userProfile = await db.jobSeeker.findUnique({
    where: {
      userId: session.user.id,
    },
  })

  let recommendedJobs = []

  if (userProfile?.skills?.length) {
    recommendedJobs = await db.job.findMany({
      where: {
        status: "ACTIVE",
        skills: {
          hasSome: userProfile.skills,
        },
        applications: {
          none: {
            userId: session.user.id,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    })
  } else {
    // If no skills, just get recent jobs
    recommendedJobs = await db.job.findMany({
      where: {
        status: "ACTIVE",
        applications: {
          none: {
            userId: session.user.id,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    })
  }

  // Get stats
  const totalApplications = await db.application.count({
    where: {
      userId: session.user.id,
    },
  })

  const recentApplicationsCount = await db.application.count({
    where: {
      userId: session.user.id,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
  })

  const interviewsCount = await db.application.count({
    where: {
      userId: session.user.id,
      status: "INTERVIEW",
    },
  })

  const upcomingInterviewsCount = await db.application.count({
    where: {
      userId: session.user.id,
      status: "INTERVIEW",
      updatedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    },
  })

  return {
    recentApplications,
    recommendedJobs,
    stats: {
      applications: totalApplications,
      recentApplications: recentApplicationsCount,
      interviews: interviewsCount,
      upcomingInterviews: upcomingInterviewsCount,
      savedJobs: 0, // Placeholder for future feature
      newSavedJobs: 0, // Placeholder for future feature
    },
  }
}

export async function getJobProviderDashboardData() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "JOB_PROVIDER") {
    return null
  }

  // Get jobs posted by this provider
  const jobs = await db.job.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Get application counts for each job
  const jobsWithCounts = await Promise.all(
    jobs.map(async (job) => {
      const applicationCount = await db.application.count({
        where: {
          jobId: job.id,
        },
      })

      return {
        ...job,
        applicationCount,
      }
    }),
  )

  // Get recent applications
  const recentApplications = await db.application.findMany({
    where: {
      job: {
        userId: session.user.id,
      },
    },
    include: {
      job: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  })

  // Get stats
  const activeJobsCount = await db.job.count({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
    },
  })

  const totalApplicationsCount = await db.application.count({
    where: {
      job: {
        userId: session.user.id,
      },
    },
  })

  const newApplicationsCount = await db.application.count({
    where: {
      job: {
        userId: session.user.id,
      },
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    },
  })

  const interviewsCount = await db.application.count({
    where: {
      job: {
        userId: session.user.id,
      },
      status: "INTERVIEW",
    },
  })

  const upcomingInterviewsCount = await db.application.count({
    where: {
      job: {
        userId: session.user.id,
      },
      status: "INTERVIEW",
      updatedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    },
  })

  return {
    jobs: jobsWithCounts,
    recentApplications,
    stats: {
      activeJobs: activeJobsCount,
      totalViews: 0, // Placeholder for future feature
      totalApplications: totalApplicationsCount,
      newApplications: newApplicationsCount,
      interviews: interviewsCount,
      upcomingInterviews: upcomingInterviewsCount,
    },
  }
}

export async function getJobSeekerApplications() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "JOB_SEEKER") {
    return []
  }

  const applications = await db.application.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      job: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return applications
}

export async function getJobProviderApplications() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "JOB_PROVIDER") {
    return []
  }

  const applications = await db.application.findMany({
    where: {
      job: {
        userId: session.user.id,
      },
    },
    include: {
      job: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return applications
}
