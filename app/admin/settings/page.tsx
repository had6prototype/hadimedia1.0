"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, Save, Settings, Globe, Phone, Users } from "lucide-react"
import { getSettings, updateMultipleSettings, type SiteSetting } from "./actions"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSettings = async () => {
      const result = await getSettings()
      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setSettings(result.data || [])
        // Initialize form data
        const initialData: Record<string, string> = {}
        result.data?.forEach((setting) => {
          initialData[setting.setting_key] = setting.setting_value || ""
        })
        setFormData(initialData)
      }
      setIsLoading(false)
    }

    fetchSettings()
  }, [toast])

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateMultipleSettings(formData)
      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "موفقیت",
          description: "تنظیمات با موفقیت به‌روزرسانی شد",
        })
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در ذخیره تنظیمات",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const renderInput = (setting: SiteSetting) => {
    const value = formData[setting.setting_key] || ""

    switch (setting.setting_type) {
      case "textarea":
        return (
          <Textarea
            id={setting.setting_key}
            value={value}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
            placeholder={`${setting.display_name} را وارد کنید`}
            rows={3}
          />
        )
      case "email":
        return (
          <Input
            id={setting.setting_key}
            type="email"
            value={value}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
            placeholder={`${setting.display_name} را وارد کنید`}
            dir="ltr"
          />
        )
      case "url":
        return (
          <Input
            id={setting.setting_key}
            type="url"
            value={value}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
            placeholder={`${setting.display_name} را وارد کنید`}
            dir="ltr"
          />
        )
      default:
        return (
          <Input
            id={setting.setting_key}
            type="text"
            value={value}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
            placeholder={`${setting.display_name} را وارد کنید`}
          />
        )
    }
  }

  const groupedSettings = settings.reduce(
    (acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = []
      }
      acc[setting.category].push(setting)
      return acc
    },
    {} as Record<string, SiteSetting[]>,
  )

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case "contact":
        return { title: "اطلاعات تماس", icon: Phone, description: "اطلاعات تماس و آدرس سایت" }
      case "social":
        return { title: "شبکه‌های اجتماعی", icon: Users, description: "لینک‌های شبکه‌های اجتماعی" }
      case "general":
        return { title: "تنظیمات عمومی", icon: Globe, description: "تنظیمات کلی سایت" }
      default:
        return { title: category, icon: Settings, description: "" }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">در حال بارگذاری تنظیمات...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">تنظیمات سایت</h1>
          <p className="text-muted-foreground">مدیریت اطلاعات تماس، شبکه‌های اجتماعی و تنظیمات عمومی</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              در حال ذخیره...
            </>
          ) : (
            <>
              <Save className="ml-2 h-4 w-4" />
              ذخیره تغییرات
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6">
        {Object.entries(groupedSettings).map(([category, categorySettings]) => {
          const categoryInfo = getCategoryInfo(category)
          const IconComponent = categoryInfo.icon

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  {categoryInfo.title}
                </CardTitle>
                {categoryInfo.description && <CardDescription>{categoryInfo.description}</CardDescription>}
              </CardHeader>
              <CardContent className="space-y-4">
                {categorySettings.map((setting, index) => (
                  <div key={setting.setting_key}>
                    <div className="space-y-2">
                      <Label htmlFor={setting.setting_key}>{setting.display_name}</Label>
                      {renderInput(setting)}
                    </div>
                    {index < categorySettings.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              در حال ذخیره...
            </>
          ) : (
            <>
              <Save className="ml-2 h-4 w-4" />
              ذخیره همه تغییرات
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
