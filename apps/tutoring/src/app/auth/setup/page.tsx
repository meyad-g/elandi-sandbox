"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

export default function SetupPage() {
  const [formData, setFormData] = useState({
    bio: "",
    specializations: [] as string[],
    hourly_rate: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const addSpecialization = (value: string) => {
    if (value.trim() && !formData.specializations.includes(value.trim())) {
      setFormData((prev) => ({
        ...prev,
        specializations: [...prev.specializations, value.trim()],
      }))
    }
  }

  const removeSpecialization = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      // Update tutor profile
      const { error: updateError } = await supabase
        .from("tutors")
        .update({
          bio: formData.bio,
          specializations: formData.specializations,
          hourly_rate: formData.hourly_rate ? Number.parseFloat(formData.hourly_rate) : null,
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      router.push("/portal")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-2xl">
        <Card className="backdrop-blur-sm bg-white/80 border border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-gray-600">Tell us about your tutoring expertise</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell students about your teaching experience and approach..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Specializations</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.specializations.map((spec, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                      {spec}
                      <button
                        type="button"
                        onClick={() => removeSpecialization(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add specialization and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSpecialization(e.currentTarget.value)
                      e.currentTarget.value = ""
                    }
                  }}
                />
              </div>

              <div>
                <Label htmlFor="hourly_rate" className="text-sm font-medium text-gray-700">
                  Hourly Rate (optional)
                </Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hourly_rate: e.target.value }))}
                  placeholder="e.g., 50.00"
                  className="mt-1"
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "Setting up..." : "Complete Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
