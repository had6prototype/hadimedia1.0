import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Phone, MapPin, Globe } from "lucide-react"
import { getSettingsByCategory } from "@/app/admin/settings/actions"

export default async function Footer() {
  // Get settings from database
  const contactSettings = await getSettingsByCategory("contact")
  const socialSettings = await getSettingsByCategory("social")
  const generalSettings = await getSettingsByCategory("general")

  // Use settings with fallback values
  const siteTitle = generalSettings.site_title || "رسانه الهادی - Al-Hadi Media"
  const siteDescription =
    generalSettings.site_description ||
    "ارائه دهنده محتوای اسلامی و آموزشی با هدف ترویج فرهنگ اسلامی و پاسخگویی به سوالات شرعی"
  const newsletterText = generalSettings.newsletter_text || "برای دریافت آخرین اخبار و برنامه‌ها در خبرنامه ما عضو شوید"

  const contactEmail = contactSettings.contact_email || "info@alhadi.co.uk"
  const contactPhone = contactSettings.contact_phone || "۰۲۱-۱۲۳۴۵۶۷۸"
  const contactAddress = contactSettings.contact_address || "لندن، انگلستان"

  const facebookUrl = socialSettings.social_facebook || "https://www.facebook.com/fd.haditv6/photos_by"
  const instagramUrl = socialSettings.social_instagram || "https://www.instagram.com/fd_haditv6"
  const websiteUrl = socialSettings.social_website || "https://www.alhadi.co.uk"
  const youtubeUrl = socialSettings.social_youtube
  const telegramUrl = socialSettings.social_telegram

  return (
    <footer className="bg-muted/20 py-12 border-t">
      <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="relative h-16 w-48">
            <Image src="/images/logo-menu.png" alt={siteTitle} fill className="object-contain" />
          </div>
          <p className="text-sm text-muted-foreground">{siteDescription}</p>
          <div className="flex items-center space-x-4 space-x-reverse">
            {facebookUrl && (
              <Button variant="outline" size="icon" asChild>
                <Link href={facebookUrl} target="_blank" aria-label="فیسبوک">
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
                    className="h-4 w-4"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </Link>
              </Button>
            )}
            {instagramUrl && (
              <Button variant="outline" size="icon" asChild>
                <Link href={instagramUrl} target="_blank" aria-label="اینستاگرام">
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
                    className="h-4 w-4"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </Link>
              </Button>
            )}
            {youtubeUrl && (
              <Button variant="outline" size="icon" asChild>
                <Link href={youtubeUrl} target="_blank" aria-label="یوتیوب">
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
                    className="h-4 w-4"
                  >
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                    <path d="m10 15 5-3-5-3z" />
                  </svg>
                </Link>
              </Button>
            )}
            {telegramUrl && (
              <Button variant="outline" size="icon" asChild>
                <Link href={telegramUrl} target="_blank" aria-label="تلگرام">
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
                    className="h-4 w-4"
                  >
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </Link>
              </Button>
            )}
            {websiteUrl && (
              <Button variant="outline" size="icon" asChild>
                <Link href={websiteUrl} target="_blank" aria-label="وب‌سایت">
                  <Globe className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-primary">دسترسی سریع</h3>
          <nav className="flex flex-col space-y-2">
            <Link href="/" className="text-sm hover:text-primary">
              خانه
            </Link>
            <Link href="/live" className="text-sm hover:text-primary">
              پخش زنده
            </Link>
            <Link href="/programs" className="text-sm hover:text-primary">
              برنامه‌های جدید
            </Link>
            <Link href="/questions" className="text-sm hover:text-primary">
              سوالات شرعی
            </Link>
            <Link href="/articles" className="text-sm hover:text-primary">
              مقالات
            </Link>
          </nav>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-primary">تماس با ما</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Mail className="h-4 w-4 text-secondary" />
              <span className="text-sm">{contactEmail}</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Phone className="h-4 w-4 text-secondary" />
              <span className="text-sm">{contactPhone}</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <MapPin className="h-4 w-4 text-secondary" />
              <span className="text-sm">{contactAddress}</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-primary">خبرنامه</h3>
          <p className="text-sm text-muted-foreground">{newsletterText}</p>
          <div className="flex space-x-2 space-x-reverse">
            <Input type="email" placeholder="ایمیل خود را وارد کنید" />
            <Button type="submit">عضویت</Button>
          </div>
        </div>
      </div>
      <div className="container mt-8 border-t pt-8">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {siteTitle}. تمامی حقوق محفوظ است.
        </p>
      </div>
    </footer>
  )
}
