"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { applyForJob } from "@/lib/actions"

interface ApplyButtonProps {
  jobId: string
}

export function ApplyButton({ jobId }: ApplyButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [open, setOpen] = useState(false)

  const handleApply = async () => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=" + encodeURIComponent(`/jobs/${jobId}`))
      return
    }

    if (session.user.role !== "JOB_SEEKER") {
      toast({
        title: "Not allowed",
        description: "Only job seekers can apply for jobs",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await applyForJob({
        jobId,
        coverLetter,
      })

      toast({
        title: "Application submitted",
        description: "Your application has been successfully submitted",
      })

      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Apply Now</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply for this position</DialogTitle>
          <DialogDescription>Write a cover letter to introduce yourself to the employer.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Tell the employer why you're a good fit for this position..."
            className="min-h-[200px]"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={isLoading || !coverLetter.trim()}>
            {isLoading ? "Submitting..." : "Submit Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
