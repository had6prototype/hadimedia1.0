// این فایل شامل داده‌های نمونه برای جستجو است
// در یک پروژه واقعی، این داده‌ها از API یا CMS دریافت می‌شوند

export interface SearchItem {
  id: number
  title: string
  description: string
  category: string
  type: "video" | "article" | "question"
  url: string
  image?: string
}

export const searchData: SearchItem[] = [
  {
    id: 1,
    title: "احکام شرعی - عزاداری اهل بیت",
    description: "پاسخ به سوالات شرعی در مورد عزاداری اهل بیت (علیهم السلام)",
    category: "احکام شرعی",
    type: "video",
    url: "/programs/1",
    image: "/images/ahkam-sharei.png",
  },
  {
    id: 2,
    title: "تفاوت‌های حقوقی زن و مرد",
    description: "بررسی تفاوت‌های حقوقی زن و مرد از دیدگاه اسلام",
    category: "حقوق خانواده",
    type: "video",
    url: "/programs/2",
    image: "/images/tafavot-hoghoghi.png",
  },
  {
    id: 3,
    title: "هدف از آزادی",
    description: "بررسی مفهوم آزادی و هدف از آن در اسلام",
    category: "مباحث اجتماعی",
    type: "video",
    url: "/programs/3",
    image: "/images/hadaf-az-azadi.png",
  },
  {
    id: 4,
    title: "احکام شرعی - مسائل فقهی",
    description: "پاسخ به سوالات شرعی و مسائل فقهی",
    category: "احکام شرعی",
    type: "video",
    url: "/programs/4",
    image: "/images/ahkam-sharei-2.png",
  },
  {
    id: 5,
    title: "نگاهی به خطبه حضرت زینب در کوفه",
    description: "بررسی خطبه تاریخی حضرت زینب (س) در کوفه",
    category: "تاریخ اسلام",
    type: "video",
    url: "/programs/5",
    image: "/images/khotbe-zeinab.png",
  },
  {
    id: 6,
    title: "وسواس (علل و درمان)",
    description: "بررسی علل و درمان وسواس از دیدگاه اسلام",
    category: "روانشناسی اسلامی",
    type: "video",
    url: "/programs/6",
    image: "/images/vasvas.png",
  },
  {
    id: 7,
    title: "حقوق خانواده از نگاه زین العابدین",
    description: "بررسی حقوق خانواده از دیدگاه امام زین العابدین (ع)",
    category: "حقوق خانواده",
    type: "video",
    url: "/programs/7",
    image: "/images/hoghoogh-khanevade.png",
  },
  {
    id: 8,
    title: "هدف امام حسین از همراه کردن اهل بیت در قیام",
    description: "بررسی اهداف امام حسین (ع) از همراه کردن خانواده در قیام عاشورا",
    category: "تاریخ اسلام",
    type: "video",
    url: "/programs/8",
    image: "/images/hadaf-imam-hossein.png",
  },
  {
    id: 9,
    title: "تجلی کمالات انسانی در نهضت امام حسین",
    description: "بررسی جلوه‌های کمالات انسانی در نهضت امام حسین (ع)",
    category: "تاریخ اسلام",
    type: "video",
    url: "/programs/9",
    image: "/images/presenter.png",
  },
  {
    id: 10,
    title: "آیا در مجالس عزاداری، ناله و شیون بلند جایز است؟",
    description: "پاسخ به سوال شرعی در مورد نحوه عزاداری در مجالس امام حسین (ع)",
    category: "احکام شرعی",
    type: "question",
    url: "/questions/10",
  },
  {
    id: 11,
    title: "آیا نذر قربانی جلوی دسته عزاداری اشکال دارد؟",
    description: "پاسخ به سوال شرعی در مورد نذر قربانی در مراسم عزاداری",
    category: "احکام شرعی",
    type: "question",
    url: "/questions/11",
  },
  {
    id: 12,
    title: "حکم شرعی معاملات آنلاین و خرید و فروش اینترنتی",
    description: "بررسی احکام شرعی مربوط به معاملات آنلاین و تجارت الکترونیک",
    category: "احکام شرعی",
    type: "article",
    url: "/articles/12",
  },
  {
    id: 13,
    title: "اهمیت حجاب در اسلام",
    description: "بررسی اهمیت و فلسفه حجاب در دین اسلام",
    category: "احکام شرعی",
    type: "article",
    url: "/articles/13",
  },
  {
    id: 14,
    title: "فضیلت‌های ماه رمضان",
    description: "بررسی فضیلت‌ها و برکات ماه مبارک رمضان",
    category: "مناسبت‌های مذهبی",
    type: "article",
    url: "/articles/14",
  },
  {
    id: 15,
    title: "آداب دعا کردن",
    description: "آموزش آداب و شرایط استجابت دعا در اسلام",
    category: "آموزش‌های دینی",
    type: "article",
    url: "/articles/15",
  },
]

// دسته‌بندی‌های جستجو
export const searchCategories = [
  { id: "all", name: "همه" },
  { id: "video", name: "ویدیوها" },
  { id: "article", name: "مقالات" },
  { id: "question", name: "سوالات شرعی" },
]
