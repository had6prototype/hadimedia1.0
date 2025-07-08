"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle } from "lucide-react"
import { getSettingsByCategory } from "@/app/admin/settings/actions"
import { useEffect } from "react"

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [contactSettings, setContactSettings] = useState<Record<string, string>>({})
  const [socialSettings, setSocialSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchSettings = async () => {
      const contact = await getSettingsByCategory("contact")
      const social = await getSettingsByCategory("social")
      setContactSettings(contact)
      setSocialSettings(social)
    }
    fetchSettings()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // در یک پروژه واقعی، اینجا اطلاعات فرم به سرور ارسال می‌شود
    setFormSubmitted(true)
    setTimeout(() => {
      setFormSubmitted(false)
    }, 3000)
  }

  const contactPhone = contactSettings.contact_phone || "۰۲۱-۱۲۳۴۵۶۷۸"
  const contactEmail = contactSettings.contact_email || "info@alhadi.co.uk"
  const contactAddress = contactSettings.contact_address || "لندن، انگلستان"
  const facebookUrl = socialSettings.social_facebook || "https://www.facebook.com/fd.haditv6/photos_by"
  const instagramUrl = socialSettings.social_instagram || "https://www.instagram.com/fd_haditv6"
  const websiteUrl = socialSettings.social_website || "https://www.alhadi.co.uk"

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">تماس با ما</h1>
      <p className="text-muted-foreground mb-8">برای ارتباط با رسانه الهادی می‌توانید از روش‌های زیر استفاده کنید</p>

      <div className="grid gap-8 md:grid-cols-3 mb-12">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>تماس تلفنی</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">برای تماس تلفنی با ما می‌توانید با شماره‌های زیر تماس بگیرید</p>
            <p className="font-medium">{contactPhone}</p>
            <p className="font-medium">۰۹۱۲۳۴۵۶۷۸۹</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 ml-1" />
              <span>ساعات پاسخگویی: ۸ صبح تا ۸ شب</span>
            </div>
          </CardFooter>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>ایمیل</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">برای ارسال ایمیل می‌توانید از آدرس‌های زیر استفاده کنید</p>
            <p className="font-medium">{contactEmail}</p>
            <p className="font-medium">support@alhadi.co.uk</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 ml-1" />
              <span>پاسخگویی: حداکثر ۲۴ ساعت</span>
            </div>
          </CardFooter>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>آدرس</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">آدرس دفتر مرکزی رسانه الهادی</p>
            <p className="font-medium">{contactAddress}</p>
            <p className="font-medium">کد پستی: ۱۲۳۴۵۶۷۸۹</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 ml-1" />
              <span>ساعات کاری: شنبه تا پنج‌شنبه ۸ صبح تا ۵ عصر</span>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">فرم تماس با ما</CardTitle>
              <CardDescription>برای ارسال پیام، سوال یا پیشنهاد خود می‌توانید از فرم زیر استفاده کنید</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">نام و نام خانوادگی</Label>
                    <Input id="name" placeholder="نام خود را وارد کنید" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">ایمیل</Label>
                    <Input id="email" type="email" placeholder="ایمیل خود را وارد کنید" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">موضوع</Label>
                  <Input id="subject" placeholder="موضوع پیام خود را وارد کنید" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">پیام</Label>
                  <textarea
                    id="message"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="پیام خود را بنویسید..."
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="gap-2">
                    {formSubmitted ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        پیام ارسال شد
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        ارسال پیام
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="faq" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="faq">سوالات متداول</TabsTrigger>
              <TabsTrigger value="social">شبکه‌های اجتماعی</TabsTrigger>
            </TabsList>
            <TabsContent value="faq" className="border rounded-md mt-2 p-4 h-[calc(100%-40px)]">
              <h3 className="font-bold mb-4">سوالات متداول</h3>
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h4 className="font-medium mb-1 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    چگونه می‌توانم در برنامه‌های زنده شرکت کنم؟
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    برای شرکت در برنامه‌های زنده می‌توانید از طریق بخش پخش زنده وارد شوید و در گفتگوی زنده شرکت کنید.
                  </p>
                </div>
                <div className="border-b pb-3">
                  <h4 className="font-medium mb-1 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    چگونه می‌توانم سوال شرعی خود را مطرح کنم؟
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    برای مطرح کردن سوال شرعی می‌توانید به بخش سوالات شرعی مراجعه کرده و فرم مربوطه را تکمیل کنید.
                  </p>
                </div>
                <div className="border-b pb-3">
                  <h4 className="font-medium mb-1 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    آیا می‌توانم برنامه‌های گذشته را مشاهده کنم؟
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    بله، تمامی برنامه‌های گذشته در بخش آرشیو قابل مشاهده هستند.
                  </p>
                </div>
                <div className="border-b pb-3">
                  <h4 className="font-medium mb-1 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    چگونه می‌توانم در خبرنامه عضو شوم؟
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    برای عضویت در خبرنامه می‌توانید ایمیل خود را در بخش مربوطه در پایین صفحه وارد کنید.
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="social" className="border rounded-md mt-2 p-4 h-[calc(100%-40px)]">
              <h3 className="font-bold mb-4">شبکه‌های اجتماعی</h3>
              <div className="space-y-4">
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">فیسبوک</h4>
                    <p className="text-xs text-muted-foreground">facebook.com/fd.haditv6</p>
                  </div>
                </a>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">اینستاگرام</h4>
                    <p className="text-xs text-muted-foreground">instagram.com/fd_haditv6</p>
                  </div>
                </a>
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" x2="22" y1="12" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">وب‌سایت</h4>
                    <p className="text-xs text-muted-foreground">www.alhadi.co.uk</p>
                  </div>
                </a>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* نقشه */}
      <div className="mt-12 border rounded-lg overflow-hidden">
        <div className="aspect-[21/9] bg-muted relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground">نقشه موقعیت دفتر رسانه الهادی</p>
          </div>
        </div>
      </div>
    </div>
  )
}
