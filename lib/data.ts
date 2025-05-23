import { db } from "@/lib/db"

export async function getJobById(id: string) {
  try {
    const job = await db.job.findUnique({
      where: {
        id,
      },
    })

    return job
  } catch (error) {
    console.error("Error fetching job:", error)
    return null
  }
}
