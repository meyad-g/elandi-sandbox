"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import ShaderBackground from "@/components/shader-background"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { BookOpen, Sparkles, Users, Target } from "lucide-react"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    const supabase = createClient()
    setIsGoogleLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/`,
        },
      })
      if (error) {
        console.error("[v0] Google OAuth error:", error)
        throw error
      }
    } catch (error: unknown) {
      console.error("[v0] Google sign-in failed:", error)
      setError(error instanceof Error ? error.message : "An error occurred with Google sign-in")
      setIsGoogleLoading(false)
    }
  }

  const features = [
    {
      icon: BookOpen,
      title: "Smart Lesson Plans",
      description: "AI-generated personalized lesson plans for each student"
    },
    {
      icon: Users,
      title: "Student Management", 
      description: "Track progress and manage multiple students effortlessly"
    },
    {
      icon: Target,
      title: "Targeted Learning",
      description: "Identify gaps and focus on areas that need improvement"
    },
    {
      icon: Sparkles,
      title: "AI-Powered Insights",
      description: "Get intelligent recommendations and session strategies"
    }
  ]

  return (
    <ShaderBackground>
      <div className="min-h-screen relative overflow-hidden">
        <div className="flex min-h-screen">
          {/* Left Side - Features */}
          <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-8 lg:px-12 xl:px-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-lg"
            >
              <div className="mb-8">
                <motion.h1 
                  className="text-5xl xl:text-6xl font-light text-white mb-6 tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Tutors Copilot
                </motion.h1>
                <motion.p 
                  className="text-xl text-white/80 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  The AI-powered tutoring platform that helps you create personalized lesson plans and track student progress effortlessly.
                </motion.p>
              </div>
              
              <div className="grid gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                    className="flex items-start space-x-4 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-lg mb-1">{feature.title}</h3>
                      <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Side - Login */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-md"
            >
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 lg:p-10 shadow-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-3xl lg:text-4xl font-light text-white mb-3 tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="text-white/70 text-lg">
                    Sign in to continue to your dashboard
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="space-y-6"
                >
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                  
                  <Button
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full h-14 bg-white hover:bg-white/90 text-gray-900 border-0 rounded-2xl shadow-lg flex items-center justify-center gap-3 text-lg font-medium transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100"
                  >
                    {isGoogleLoading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full" />
                        Signing you in...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="mt-8 pt-6 border-t border-white/10 text-center"
                >
                  <p className="text-white/60 text-sm">
                    Secure authentication powered by Google
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </ShaderBackground>
  )
}
