'use client'

import { useState, useEffect } from 'react'
import { uploadSettingFile, updateSetting, getSettings } from '@/app/actions/portfolio'
import { updateAccountEmail, updateAccountPassword, getCurrentUser } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Upload, Link as LinkIcon, FileImage, FileText, CheckCircle2, Lock, Mail, Key, Eye, EyeOff } from 'lucide-react'

type InputMode = 'upload' | 'url'

export default function SettingsPage() {
  const [isUploadingResume, setIsUploadingResume] = useState(false)
  const [isUploadingProfile, setIsUploadingProfile] = useState(false)
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentEmail, setCurrentEmail] = useState<string | null>(null)
  
  const [resumeMode, setResumeMode] = useState<InputMode>('upload')
  const [profileMode, setProfileMode] = useState<InputMode>('upload')
  
  const [resumeFileName, setResumeFileName] = useState<string | null>(null)
  const [profileFileName, setProfileFileName] = useState<string | null>(null)

  const [currentResume, setCurrentResume] = useState<string | null>(null)
  const [currentProfile, setCurrentProfile] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      const settings = await getSettings()
      if (settings['resume_url']) setCurrentResume(settings['resume_url'])
      if (settings['profile_picture_url']) setCurrentProfile(settings['profile_picture_url'])
      
      const user = await getCurrentUser()
      if (user?.email) setCurrentEmail(user.email)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleResumeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUploadingResume(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      if (resumeMode === 'upload') {
        formData.append('key', 'resume_url')
        await uploadSettingFile(formData)
        toast.success('Resume uploaded successfully!')
      } else {
        const url = formData.get('url') as string
        await updateSetting('resume_url', url)
        toast.success('Resume URL updated successfully!')
      }
      ;(e.target as HTMLFormElement).reset()
      setResumeFileName(null)
      fetchSettings()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsUploadingResume(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUploadingProfile(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      if (profileMode === 'upload') {
        formData.append('key', 'profile_picture_url')
        await uploadSettingFile(formData)
        toast.success('Profile picture uploaded successfully!')
      } else {
        const url = formData.get('url') as string
        await updateSetting('profile_picture_url', url)
        toast.success('Profile picture URL updated successfully!')
      }
      ;(e.target as HTMLFormElement).reset()
      setProfileFileName(null)
      fetchSettings()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsUploadingProfile(false)
    }
  }

  const handleEmailUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUpdatingEmail(true)
    const formData = new FormData(e.currentTarget)
    try {
      await updateAccountEmail(formData)
      toast.success('Email updated successfully!')
      ;(e.target as HTMLFormElement).reset()
      await fetchSettings()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUpdatingPassword(true)
    const formData = new FormData(e.currentTarget)
    
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm-password') as string
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      setIsUpdatingPassword(false)
      return
    }
    try {
      await updateAccountPassword(formData)
      toast.success('Password updated successfully!')
      ;(e.target as HTMLFormElement).reset()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Manage your global site configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Profile Picture Card */}
        <Card className="relative border-muted/30 shadow-xl shadow-black/5 bg-surface/40 backdrop-blur-sm overflow-hidden group mt-1">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 transform origin-left transition-transform group-hover:scale-x-100" />
          <CardHeader className="pb-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-xl">
                <FileImage className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Profile Picture</CardTitle>
                <CardDescription className="mt-1">
                  Replace the image in the About section.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            
            {/* Mode Switcher */}
            <div className="flex p-1 bg-muted/30 rounded-lg mb-6 w-full max-w-xs">
              <button 
                type="button"
                onClick={() => setProfileMode('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${profileMode === 'upload' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Upload size={14} /> Upload
              </button>
              <button 
                type="button"
                onClick={() => setProfileMode('url')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${profileMode === 'url' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LinkIcon size={14} /> Link URL
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="min-h-[140px] flex flex-col justify-end">
                {profileMode === 'upload' ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Label 
                      htmlFor="profilePic" 
                      className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer bg-muted/10 border-muted-foreground/20 hover:bg-muted/30 hover:border-blue-500/50 transition-all group/dropzone"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                        {profileFileName ? (
                          <>
                            <CheckCircle2 className="w-8 h-8 mb-2 text-emerald-500" />
                            <p className="mb-1 text-sm font-medium text-foreground truncate max-w-[200px]">{profileFileName}</p>
                            <p className="text-xs text-muted-foreground">Ready to upload</p>
                          </>
                        ) : (
                          <>
                            <div className="p-3 bg-background rounded-full mb-3 shadow-sm group-hover/dropzone:scale-110 transition-transform">
                              <Upload className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold text-foreground">Click to browse</span> or drag and drop</p>
                            <p className="text-[11px] text-muted-foreground/70 uppercase tracking-wider font-medium">JPG, PNG, WebP</p>
                          </>
                        )}
                      </div>
                      <Input 
                        id="profilePic" 
                        name="file" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        required={profileMode === 'upload'} 
                        onChange={(e) => setProfileFileName(e.target.files?.[0]?.name || null)}
                      />
                    </Label>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3">
                    <Label className="text-sm font-medium text-foreground/80">Direct Image URL</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        name="url" 
                        type="url"
                        placeholder="https://example.com/image.jpg" 
                        className="pl-9 h-12 bg-muted/10 border-muted-foreground/20 focus-visible:ring-blue-500/50" 
                        required={profileMode === 'url'} 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Paste a direct link to an image hosted elsewhere.</p>
                  </div>
                )}
              </div>
              
              <Button type="submit" disabled={isUploadingProfile} className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
                {isUploadingProfile ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving changes...</>
                ) : (
                  <>Save Profile Picture</>
                )}
              </Button>
            </form>

            {currentProfile && (
              <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">Current Image Link</p>
                <a href={currentProfile} target="_blank" rel="noreferrer" className="text-sm text-foreground/80 hover:text-blue-400 hover:underline break-all transition-colors line-clamp-2" title={currentProfile}>
                  {currentProfile}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resume Card */}
        <Card className="relative border-muted/30 shadow-xl shadow-black/5 bg-surface/40 backdrop-blur-sm overflow-hidden group mt-1">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 transform origin-left transition-transform group-hover:scale-x-100" />
          <CardHeader className="pb-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-xl">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Resume</CardTitle>
                <CardDescription className="mt-1">
                  Updates the View Resume button.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            
            {/* Mode Switcher */}
            <div className="flex p-1 bg-muted/30 rounded-lg mb-6 w-full max-w-xs">
              <button 
                type="button"
                onClick={() => setResumeMode('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${resumeMode === 'upload' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Upload size={14} /> Upload
              </button>
              <button 
                type="button"
                onClick={() => setResumeMode('url')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${resumeMode === 'url' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LinkIcon size={14} /> Link URL
              </button>
            </div>

            <form onSubmit={handleResumeSubmit} className="space-y-6">
              <div className="min-h-[140px] flex flex-col justify-end">
                {resumeMode === 'upload' ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Label 
                      htmlFor="resumeDoc" 
                      className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer bg-muted/10 border-muted-foreground/20 hover:bg-muted/30 hover:border-blue-500/50 transition-all group/dropzone"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                        {resumeFileName ? (
                          <>
                            <CheckCircle2 className="w-8 h-8 mb-2 text-emerald-500" />
                            <p className="mb-1 text-sm font-medium text-foreground truncate max-w-[200px]">{resumeFileName}</p>
                            <p className="text-xs text-muted-foreground">Ready to upload</p>
                          </>
                        ) : (
                          <>
                            <div className="p-3 bg-background rounded-full mb-3 shadow-sm group-hover/dropzone:scale-110 transition-transform">
                              <Upload className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold text-foreground">Click to browse</span> or drag and drop</p>
                            <p className="text-[11px] text-muted-foreground/70 uppercase tracking-wider font-medium">PDF Document</p>
                          </>
                        )}
                      </div>
                      <Input 
                        id="resumeDoc" 
                        name="file" 
                        type="file" 
                        accept="application/pdf" 
                        className="hidden" 
                        required={resumeMode === 'upload'} 
                        onChange={(e) => setResumeFileName(e.target.files?.[0]?.name || null)}
                      />
                    </Label>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3">
                    <Label className="text-sm font-medium text-foreground/80">Direct Document URL</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        name="url" 
                        type="url"
                        placeholder="https://example.com/resume.pdf" 
                        className="pl-9 h-12 bg-muted/10 border-muted-foreground/20 focus-visible:ring-blue-500/50" 
                        required={resumeMode === 'url'} 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Paste a link to a Google Drive or hosted PDF.</p>
                  </div>
                )}
              </div>
              
              <Button type="submit" disabled={isUploadingResume} className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
                {isUploadingResume ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving changes...</>
                ) : (
                  <>Save Resume</>
                )}
              </Button>
            </form>

            {currentResume && (
              <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">Current Document Link</p>
                <a href={currentResume} target="_blank" rel="noreferrer" className="text-sm text-foreground/80 hover:text-blue-400 hover:underline break-all transition-colors line-clamp-2" title={currentResume}>
                  {currentResume}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security & Account Card */}
        <Card className="relative border-muted/30 shadow-xl shadow-black/5 bg-surface/40 backdrop-blur-sm overflow-hidden group mt-1 lg:col-span-2">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-orange-400 transform origin-left transition-transform group-hover:scale-x-100" />
          <CardHeader className="pb-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/10 rounded-xl">
                <Lock className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Security & Account</CardTitle>
                <CardDescription className="mt-1">
                  Update your admin login credentials.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Email Form */}
              <div className="relative border border-white/5 rounded-2xl p-6 bg-black/20 backdrop-blur-sm overflow-hidden group/form transition-colors hover:bg-black/30 hover:border-white/10 flex flex-col h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover/form:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="relative z-10 mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-red-400" />
                    <h3 className="font-semibold text-white">Change Email</h3>
                  </div>
                  <p className="text-xs text-slate-400">Update the email address used for admin login.</p>
                </div>
                
                <form onSubmit={handleEmailUpdate} className="relative z-10 flex-1 flex flex-col">
                  <div className="space-y-4 mb-6">
                    <div className="space-y-2">
                      <Label className="text-slate-300 text-xs uppercase tracking-wider font-mono">Current Email</Label>
                      <Input 
                        type="email"
                        value={currentEmail || "Loading..."} 
                        className="bg-white/5 border-white/10 text-slate-400 h-11 cursor-not-allowed opacity-70" 
                        readOnly 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-email" className="text-slate-300 text-xs uppercase tracking-wider font-mono">New Email Address</Label>
                      <Input 
                        id="new-email"
                        name="email" 
                        type="email"
                        placeholder="admin@example.com" 
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-red-500/50 focus-visible:border-red-500/50 h-11" 
                        required 
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isUpdatingEmail} className="w-full h-11 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-medium shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all mt-auto">
                    {isUpdatingEmail ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                    ) : (
                      <>Update Email</>
                    )}
                  </Button>
                </form>
              </div>

              {/* Password Form */}
              <div className="relative border border-white/5 rounded-2xl p-6 bg-black/20 backdrop-blur-sm overflow-hidden group/form transition-colors hover:bg-black/30 hover:border-white/10 flex flex-col h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover/form:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="relative z-10 mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Key className="w-4 h-4 text-orange-400" />
                    <h3 className="font-semibold text-white">Change Password</h3>
                  </div>
                  <p className="text-xs text-slate-400">Must be at least 6 characters long.</p>
                </div>
                
                <form onSubmit={handlePasswordUpdate} className="relative z-10 flex-1 flex flex-col">
                  <div className="space-y-4 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-slate-300 text-xs uppercase tracking-wider font-mono">New Password</Label>
                      <div className="relative">
                        <Input 
                          id="new-password"
                          name="password" 
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••" 
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-orange-500/50 focus-visible:border-orange-500/50 h-11 pr-12" 
                          required 
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-orange-400 transition-colors p-1 outline-none focus-visible:text-orange-400"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-slate-300 text-xs uppercase tracking-wider font-mono">Confirm Password</Label>
                      <div className="relative">
                        <Input 
                          id="confirm-password"
                          name="confirm-password" 
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••" 
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-orange-500/50 focus-visible:border-orange-500/50 h-11 pr-12" 
                          required 
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-orange-400 transition-colors p-1 outline-none focus-visible:text-orange-400"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isUpdatingPassword} className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium shadow-[0_0_15px_rgba(249,115,22,0.2)] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all mt-auto">
                    {isUpdatingPassword ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                    ) : (
                      <>Update Password</>
                    )}
                  </Button>
                </form>
              </div>

            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
