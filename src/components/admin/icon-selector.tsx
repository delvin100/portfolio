'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Image as ImageIcon, Link as LinkIcon, Type } from 'lucide-react'

export function IconSelector({ defaultType = 'lucide', defaultValue = '' }: { defaultType?: string, defaultValue?: string }) {
  const [iconType, setIconType] = useState(defaultType)
  const [lucideValue, setLucideValue] = useState(defaultType === 'lucide' ? defaultValue : '')
  const [urlValue, setUrlValue] = useState(defaultType === 'url' ? defaultValue : '')

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
        <ImageIcon className="h-4 w-4 text-purple-400" />
        Icon Type
      </Label>
      
      <RadioGroup 
        defaultValue={defaultType} 
        name="icon_type"
        onValueChange={setIconType} 
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="lucide" id="t-lucide" />
          <Label htmlFor="t-lucide" className="cursor-pointer flex items-center gap-1">
            <Type className="w-4 h-4" /> Lucide
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="url" id="t-url" />
          <Label htmlFor="t-url" className="cursor-pointer flex items-center gap-1">
            <LinkIcon className="w-4 h-4" /> URL
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="upload" id="t-upload" />
          <Label htmlFor="t-upload" className="cursor-pointer flex items-center gap-1">
            <ImageIcon className="w-4 h-4" /> Upload
          </Label>
        </div>
      </RadioGroup>

      <div className="mt-3">
        {iconType === 'lucide' && (
          <div className="space-y-2">
            <Input 
              name="icon_value" 
              value={lucideValue}
              onChange={(e) => setLucideValue(e.target.value)}
              placeholder="e.g. Terminal, Database" 
              className="bg-background/50 border-white/10"
              required={iconType === 'lucide'}
            />
            <p className="text-xs text-muted-foreground">Type a Lucide icon name (e.g., Code2, Layout)</p>
          </div>
        )}

        {iconType === 'url' && (
          <div className="space-y-2">
            <Input 
              name="icon_value" 
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://example.com/icon.svg" 
              className="bg-background/50 border-white/10"
              required={iconType === 'url'}
            />
            <p className="text-xs text-muted-foreground">Provide a direct link to an image (SVG, PNG, etc.)</p>
          </div>
        )}

        {iconType === 'upload' && (
          <div className="space-y-2">
            <input 
              name="icon_file" 
              type="file" 
              accept="image/*"
              className="flex w-full rounded-md bg-background/50 border border-white/10 text-sm text-slate-300 overflow-hidden cursor-pointer file:cursor-pointer file:border-0 file:border-r file:border-white/10 file:bg-blue-500/10 file:px-4 file:py-2.5 file:mr-4 file:text-blue-400 file:font-medium hover:file:bg-blue-500/20 file:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              required={!defaultValue || defaultType !== 'upload'}
            />
            <Input type="hidden" name="icon_value" value={defaultValue} />
            {defaultType === 'upload' && defaultValue && (
              <p className="text-xs text-muted-foreground">Leave blank to keep current uploaded image.</p>
            )}
            <p className="text-xs text-muted-foreground">Upload a square image (SVG, PNG, JPG)</p>
          </div>
        )}
      </div>
    </div>
  )
}
