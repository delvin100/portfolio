'use client'

import { useState, useEffect } from 'react'
import { uploadSettingFile, updateSetting, getSettings } from '@/app/actions/portfolio'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Upload, Link as LinkIcon, FileImage, FileText, CheckCircle2 } from 'lucide-react'

type InputMode = 'upload' | 'url'

export default function SettingsPage() {
  const [isUploadingResume, setIsUploadingResume] = useState(false)
  const [isUploadingProfile, setIsUploadingProfile] = useState(false)
  
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400 inline-block">Settings</h1>
        <p className="text-muted-foreground mt-2 text-lg">
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

      </div>
    </div>
  )
}
