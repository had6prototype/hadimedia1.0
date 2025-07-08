import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MessageSquare, Search, User, ChevronLeft, ChevronRight } from "lucide-react"

export default function QuestionsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">سوالات شرعی</h1>
      <p className="text-muted-foreground mb-8">
        در این بخش می‌توانید سوالات شرعی خود را مطرح کنید و پاسخ‌های کارشناسان را مشاهده نمایید
      </p>

      {/* جستجو و ارسال سوال */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="جستجو در سوالات..." className="pr-10" />
        </div>
        <Button className="gap-2">
          <MessageSquare className="h-4 w-4" />
          ارسال سوال جدید
        </Button>
      </div>

      {/* تب‌های دسته‌بندی */}
      <Tabs defaultValue="all" className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">همه سوالات</TabsTrigger>
          <TabsTrigger value="prayer">نماز و روزه</TabsTrigger>
          <TabsTrigger value="family">خانواده</TabsTrigger>
          <TabsTrigger value="financial">احکام مالی</TabsTrigger>
          <TabsTrigger value="other">سایر موضوعات</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* لیست سوالات */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
          <Card key={item}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    سوال شرعی #{item}
                  </CardTitle>
                  <CardDescription>
                    {item % 3 === 0 ? "نماز و روزه" : item % 3 === 1 ? "احکام خانواده" : "احکام مالی"}
                  </CardDescription>
                </div>
                <Badge variant={item % 2 === 0 ? "default" : "outline"}>
                  {item % 2 === 0 ? "پاسخ داده شده" : "در انتظار پاسخ"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-medium mb-2">سوال:</p>
              <p className="text-sm text-muted-foreground mb-4">
                {item % 2 === 0
                  ? "آیا می‌توان نماز را به تاخیر انداخت؟ شرایط قضا شدن نماز چیست؟"
                  : "حکم شرعی معاملات آنلاین و خرید و فروش اینترنتی چیست؟ آیا این معاملات صحیح است؟"}
              </p>
              {item % 2 === 0 && (
                <>
                  <p className="font-medium mb-2">پاسخ:</p>
                  <p className="text-sm text-muted-foreground">
                    بخشی از پاسخ کارشناس به این سوال شرعی... برای مشاهده پاسخ کامل روی دکمه مشاهده کلیک کنید.
                  </p>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>کاربر {item}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>۱۴۰۴/۰۲/{10 + item}</span>
                </div>
              </div>
              <Button variant="link" size="sm" className="p-0 h-auto">
                مشاهده
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* پاگینیشن */}
      <div className="flex justify-center mt-8">
        <nav className="flex items-center gap-1">
          <Button variant="outline" size="icon" disabled>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">صفحه قبل</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8">
            ۱
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8">
            ۲
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8">
            ۳
          </Button>
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">صفحه بعد</span>
          </Button>
        </nav>
      </div>

      {/* فرم ارسال سوال */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="text-xl">ارسال سوال جدید</CardTitle>
          <CardDescription>سوال شرعی خود را در فرم زیر وارد کنید تا کارشناسان به آن پاسخ دهند</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                نام و نام خانوادگی
              </label>
              <Input id="name" placeholder="نام خود را وارد کنید" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                ایمیل
              </label>
              <Input id="email" type="email" placeholder="ایمیل خود را وارد کنید" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium">
                دسته‌بندی سوال
              </label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">انتخاب کنید</option>
                <option value="prayer">نماز و روزه</option>
                <option value="family">احکام خانواده</option>
                <option value="financial">احکام مالی</option>
                <option value="other">سایر موضوعات</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="question" className="text-sm font-medium">
                متن سوال
              </label>
              <textarea
                id="question"
                placeholder="سوال خود را به صورت واضح و کامل بنویسید..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline">انصراف</Button>
          <Button>ارسال سوال</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// Badge component
function Badge({ children, variant = "default" }) {
  const variantClasses = {
    default: "bg-primary/10 text-primary",
    outline: "border border-muted-foreground/20 text-muted-foreground",
  }

  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${variantClasses[variant]}`}>{children}</span>
}
