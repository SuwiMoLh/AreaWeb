// ระบบแปลภาษาอย่างง่าย
// ในแอปพลิเคชันจริง ควรใช้ไลบรารี i18n เช่น next-i18next หรือ react-i18next

type Translations = {
  [key: string]: {
    [key: string]: string
  }
}

export const translations: Translations = {
  en: {
    // Navigation
    "nav.search": "Search listings...",
    "nav.messages": "Messages",
    "nav.notifications": "Notifications",
    "nav.profile": "Profile",
    "nav.settings": "Settings",
    "nav.upload": "Upload Listing",
    "nav.darkMode": "Dark Mode",
    "nav.lightMode": "Light Mode",
    "nav.login": "Login",
    "nav.register": "Register",
    "nav.logout": "Logout",
    "nav.home": "Home",
    "nav.listings": "Listings",
    "nav.contact": "Contact",

    // Listings page
    "listings.title": "All Listings",
    "listings.filter.title": "Search and Filter",
    "listings.filter.search": "Search term",
    "listings.filter.location": "Location",
    "listings.filter.propertyType": "Property Type",
    "listings.filter.priceRange": "Price Range",
    "listings.filter.sizeRange": "Land Size (acres)",
    "listings.filter.minPrice": "Min Price",
    "listings.filter.maxPrice": "Max Price",
    "listings.filter.minSize": "Min Size",
    "listings.filter.maxSize": "Max Size",
    "listings.filter.search.button": "Search",
    "listings.filter.reset": "Reset Filters",
    "listings.sort.newest": "Newest",
    "listings.sort.priceLow": "Price: Low to High",
    "listings.sort.priceHigh": "Price: High to Low",
    "listings.sort.sizeLow": "Size: Small to Large",
    "listings.sort.sizeHigh": "Size: Large to Small",
    "listings.noResults.title": "No Listings Found",
    "listings.noResults.description":
      "No listings match your search criteria. Try changing your filters or search again.",
    "listings.noResults.viewAll": "View All Listings",
    "listings.results.count": "Found {count} listings",

    // Home page
    "home.hero.title": "Find your perfect piece of land",
    "home.hero.description":
      "Area connects you with premium land opportunities across the globe. Buy, sell, and discover your next investment with confidence.",
    "home.hero.browse": "Browse Listings",
    "home.hero.learn": "Learn More",
    "home.stats.listings": "Active Listings",
    "home.stats.users": "Users",
    "home.stats.messages": "Messages",
    "home.featured.title": "Featured Listings",
    "home.featured.viewAll": "View all",
    "home.cta.title": "Ready to list your land?",
    "home.cta.description":
      "Join thousands of landowners who have successfully sold their properties on Area. Our platform makes it easy to connect with serious buyers.",
    "home.cta.button": "Start Selling",

    // Card Stack
    "card.welcome.title": "Welcome to Area",
    "card.welcome.description": "The premium marketplace for land buyers and sellers",
    "card.discover.title": "Discover Properties",
    "card.discover.description": "Browse thousands of land listings across the globe",
    "card.connect.title": "Connect with Sellers",
    "card.connect.description": "Message property owners directly through our platform",
    "card.secure.title": "Secure Transactions",
    "card.secure.description": "Our platform ensures safe and transparent dealings",
    "card.mobile.title": "Mobile Friendly",
    "card.mobile.description": "Access Area from any device, anywhere, anytime",

    // Auth
    "auth.login.title": "Welcome back",
    "auth.login.description": "Sign in to your account to continue",
    "auth.login.email": "Email",
    "auth.login.password": "Password",
    "auth.login.button": "Sign in",
    "auth.login.forgot": "Forgot password?",
    "auth.login.noAccount": "Don't have an account?",
    "auth.login.register": "Sign up",
    "auth.login.or": "or continue with",

    "auth.register.title": "Create an account",
    "auth.register.description": "Sign up to get started with Area",
    "auth.register.name": "Full name",
    "auth.register.email": "Email",
    "auth.register.password": "Password",
    "auth.register.confirmPassword": "Confirm password",
    "auth.register.button": "Sign up",
    "auth.register.hasAccount": "Already have an account?",
    "auth.register.login": "Sign in",
    "auth.register.or": "or continue with",

    // Settings
    "settings.title": "Settings",
    "settings.account": "Account",
    "settings.appearance": "Appearance",
    "settings.notifications": "Notifications",
    "settings.privacy": "Privacy",
    "settings.save": "Save Changes",
    "settings.darkMode": "Dark Mode",
    "settings.darkModeDescription": "Enable dark mode for a more comfortable viewing experience in low light.",
    "settings.language": "Preferred Language",
    "settings.saveSuccess": "Settings Saved",
    "settings.saveSuccessDescription": "Your settings have been updated successfully.",
    "settings.changePassword": "Change Password",
    "settings.currentPassword": "Current Password",
    "settings.newPassword": "New Password",
    "settings.confirmPassword": "Confirm New Password",

    // Messages
    "messages.title": "Messages",
    "messages.search": "Search conversations...",
    "messages.empty": "No messages yet",
    "messages.newMessage": "New Message",
    "messages.send": "Send",
    "messages.placeholder": "Type a message...",

    // Notifications
    "notifications.title": "Notifications",
    "notifications.markRead": "Mark all as read",
    "notifications.empty": "No notifications yet",

    // Profile
    "profile.edit": "Edit Profile",
    "profile.save": "Save Changes",
    "profile.listings": "My Listings",
    "profile.messages": "Messages",
    "profile.favorites": "Favorites",
    "profile.email": "Email",
    "profile.phone": "Phone",
    "profile.location": "Location",
    "profile.bio": "Bio",
    "profile.name": "Full Name",

    // Upload
    "upload.title": "Upload New Listing",
    "upload.details": "Property Details",
    "upload.location": "Location",
    "upload.specifications": "Property Specifications",
    "upload.images": "Images",
    "upload.submit": "Submit Listing",
    "upload.dragDrop": "Drag and drop your images here, or click to browse",
    "upload.formats": "Supported formats: JPG, PNG, WEBP (max 10MB each)",
    "upload.browse": "Browse Files",

    // Not Found
    "notFound.title": "Page not found",
    "notFound.description": "Sorry, we couldn't find the page you're looking for.",
    "notFound.button": "Go back home",

    // Contact Page
    "contact.title": "Contact Us",
    "contact.subtitle":
      "Have questions or need more information about our services? Fill out the form below and our team will get back to you as soon as possible.",
    "contact.form.title": "Send Us a Message",
    "contact.info.title": "Contact Information",
    "contact.form.name": "Full Name",
    "contact.form.email": "Email",
    "contact.form.phone": "Phone Number",
    "contact.form.subject": "Subject",
    "contact.form.message": "Message",
    "contact.form.submit": "Send Message",
    "contact.form.sending": "Sending...",
    "contact.info.phone": "Phone",
    "contact.info.email": "Email",
    "contact.info.address": "Address",
    "contact.info.followUs": "Follow Us",
    "contact.success.title": "Message Sent",
    "contact.success.description": "We've received your message and will contact you back as soon as possible.",
    "contact.error.title": "Error",
    "contact.error.description": "Unable to send message. Please try again.",
  },

  th: {
    // Navigation
    "nav.search": "ค้นหารายการ...",
    "nav.messages": "ข้อความ",
    "nav.notifications": "การแจ้งเตือน",
    "nav.profile": "โปรไฟล์",
    "nav.settings": "ตั้งค่า",
    "nav.upload": "อัปโหลดรายการ",
    "nav.darkMode": "โหมดมืด",
    "nav.lightMode": "โหมดสว่าง",
    "nav.login": "เข้าสู่ระบบ",
    "nav.register": "สมัครสมาชิก",
    "nav.logout": "ออกจากระบบ",
    "nav.home": "หน้าแรก",
    "nav.listings": "รายการที่ดิน",
    "nav.contact": "ติดต่อเรา",

    // Listings page
    "listings.title": "รายการที่ดินทั้งหมด",
    "listings.filter.title": "ค้นหาและกรอง",
    "listings.filter.search": "คำค้นหา",
    "listings.filter.location": "ตำแหน่ง",
    "listings.filter.propertyType": "ประเภทที่ดิน",
    "listings.filter.priceRange": "ช่วงราคา",
    "listings.filter.sizeRange": "ขนาดที่ดิน (ไร่)",
    "listings.filter.minPrice": "ราคาต่ำสุด",
    "listings.filter.maxPrice": "ราคาสูงสุด",
    "listings.filter.minSize": "ขนาดต่ำสุด",
    "listings.filter.maxSize": "ขนาดสูงสุด",
    "listings.filter.search.button": "ค้นหา",
    "listings.filter.reset": "รีเซ็ตตัวกรอง",
    "listings.sort.newest": "ล่าสุด",
    "listings.sort.priceLow": "ราคา: ต่ำไปสูง",
    "listings.sort.priceHigh": "ราคา: สูงไปต่ำ",
    "listings.sort.sizeLow": "ขนาด: เล็กไปใหญ่",
    "listings.sort.sizeHigh": "ขนาด: ใหญ่ไปเล็ก",
    "listings.noResults.title": "ไม่พบรายการที่ดิน",
    "listings.noResults.description": "ไม่พบรายการที่ดินที่ตรงกับเงื่อนไขการค้นหาของคุณ กรุณาลองเปลี่ยนตัวกรองหรือค้นหาใหม่",
    "listings.noResults.viewAll": "ดูรายการทั้งหมด",
    "listings.results.count": "พบ {count} รายการ",

    // Home page
    "home.hero.title": "ค้นหาที่ดินที่สมบูรณ์แบบสำหรับคุณ",
    "home.hero.description":
      "Area เชื่อมต่อคุณกับโอกาสในการลงทุนที่ดินระดับพรีเมียมทั่วโลก ซื้อ ขาย และค้นพบการลงทุนครั้งต่อไปของคุณด้วยความมั่นใจ",
    "home.hero.browse": "ดูรายการ",
    "home.hero.learn": "เรียนรู้เพิ่มเติม",
    "home.stats.listings": "รายการที่ใช้งานอยู่",
    "home.stats.users": "ผู้ใช้",
    "home.stats.messages": "ข้อความ",
    "home.featured.title": "รายการแนะนำ",
    "home.featured.viewAll": "ดูทั้งหมด",
    "home.cta.title": "พร้อมที่จะลงรายการที่ดินของคุณ?",
    "home.cta.description":
      "เข้าร่วมกับเจ้าของที่ดินนับพันที่ประสบความสำเร็จในการขายที่ดินบน Area แพลตฟอร์มของเราช่วยให้คุณเชื่อมต่อกับผู้ซื้อที่จริงจังได้อย่างง่ายดาย",
    "home.cta.button": "เริ่มขาย",

    // Card Stack
    "card.welcome.title": "ยินดีต้อนรับสู่ Area",
    "card.welcome.description": "ตลาดระดับพรีเมียมสำหรับผู้ซื้อและผู้ขายที่ดิน",
    "card.discover.title": "ค้นพบอสังหาริมทรัพย์",
    "card.discover.description": "เรียกดูรายการที่ดินนับพันทั่วโลก",
    "card.connect.title": "เชื่อมต่อกับผู้ขาย",
    "card.connect.description": "ส่งข้อความถึงเจ้าของที่ดินโดยตรงผ่านแพลตฟอร์มของเรา",
    "card.secure.title": "ธุรกรรมที่ปลอดภัย",
    "card.secure.description": "แพลตฟอร์มของเรารับรองการซื้อขายที่ปลอดภัยและโปร่งใส",
    "card.mobile.title": "รองรับมือถือ",
    "card.mobile.description": "เข้าถึง Area ได้จากทุกอุปกรณ์ ทุกที่ ทุกเวลา",

    // Auth
    "auth.login.title": "ยินดีต้อนรับกลับ",
    "auth.login.description": "เข้าสู่ระบบบัญชีของคุณเพื่อดำเนินการต่อ",
    "auth.login.email": "อีเมล",
    "auth.login.password": "รหัสผ่าน",
    "auth.login.button": "เข้าสู่ระบบ",
    "auth.login.forgot": "ลืมรหัสผ่าน?",
    "auth.login.noAccount": "ยังไม่มีบัญชี?",
    "auth.login.register": "สมัครสมาชิก",
    "auth.login.or": "หรือดำเนินการต่อด้วย",

    "auth.register.title": "สร้างบัญชี",
    "auth.register.description": "สมัครสมาชิกเพื่อเริ่มต้นใช้งาน Area",
    "auth.register.name": "ชื่อ-นามสกุล",
    "auth.register.email": "อีเมล",
    "auth.register.password": "รหัสผ่าน",
    "auth.register.confirmPassword": "ยืนยันรหัสผ่าน",
    "auth.register.button": "สมัครสมาชิก",
    "auth.register.hasAccount": "มีบัญชีอยู่แล้ว?",
    "auth.register.login": "เข้าสู่ระบบ",
    "auth.register.or": "หรือดำเนินการต่อด้วย",

    // Settings
    "settings.title": "ตั้งค่า",
    "settings.account": "บัญชี",
    "settings.appearance": "การแสดงผล",
    "settings.notifications": "การแจ้งเตือน",
    "settings.privacy": "ความเป็นส่วนตัว",
    "settings.save": "บันทึกการตั้งค่า",
    "settings.darkMode": "โหมดมืด",
    "settings.darkModeDescription": "เปิดใช้งานโหมดมืดเพื่อการมองเห็นที่สบายตามากขึ้นในที่แสงน้อย",
    "settings.language": "ภาษาที่ต้องการ",
    "settings.saveSuccess": "บันทึกการตั้งค่าแล้ว",
    "settings.saveSuccessDescription": "การตั้งค่าของคุณได้รับการอัปเดตเรียบร้อยแล้ว",
    "settings.changePassword": "เปลี่ยนรหัสผ่าน",
    "settings.currentPassword": "รหัสผ่านปัจจุบัน",
    "settings.newPassword": "รหัสผ่านใหม่",
    "settings.confirmPassword": "ยืนยันรหัสผ่านใหม่",

    // Messages
    "messages.title": "ข้อความ",
    "messages.search": "ค้นหาการสนทนา...",
    "messages.empty": "ยังไม่มีข้อความ",
    "messages.newMessage": "ข้อความใหม่",
    "messages.send": "ส่ง",
    "messages.placeholder": "พิมพ์ข้อความ...",

    // Notifications
    "notifications.title": "การแจ้งเตือน",
    "notifications.markRead": "ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว",
    "notifications.empty": "ยังไม่มีการแจ้งเตือน",

    // Profile
    "profile.edit": "แก้ไขโปรไฟล์",
    "profile.save": "บันทึกการเปลี่ยนแปลง",
    "profile.listings": "รายการของฉัน",
    "profile.messages": "ข้อความ",
    "profile.favorites": "รายการโปรด",
    "profile.email": "อีเมล",
    "profile.phone": "โทรศัพท์",
    "profile.location": "ตำแหน่ง",
    "profile.bio": "ประวัติโดยย่อ",
    "profile.name": "ชื่อ-นามสกุล",

    // Upload
    "upload.title": "อัปโหลดรายการใหม่",
    "upload.details": "รายละเอียดทรัพย์สิน",
    "upload.location": "ตำแหน่งที่ตั้ง",
    "upload.specifications": "ข้อมูลจำเพาะของทรัพย์สิน",
    "upload.images": "รูปภาพ",
    "upload.submit": "ส่งรายการ",
    "upload.dragDrop": "ลากและวางรูปภาพของคุณที่นี่ หรือคลิกเพื่อเรียกดู",
    "upload.formats": "รูปแบบที่รองรับ: JPG, PNG, WEBP (สูงสุด 10MB ต่อรูป)",
    "upload.browse": "เรียกดูไฟล์",
    "upload.listingTitle": "ชื่อรายการ",
    "upload.description": "คำอธิบาย",
    "upload.address": "ที่อยู่",
    "upload.city": "เมือง",
    "upload.state": "รัฐ/จังหวัด",
    "upload.zipCode": "รหัสไปรษณีย์",
    "upload.country": "ประเทศ",
    "upload.price": "ราคา",
    "upload.size": "ขนาด (เอเคอร์)",
    "upload.zoning": "การแบ่งเขต",
    "upload.propertyType": "ประเภททรัพย์สิน",
    "upload.selectType": "เลือกประเภท",
    "upload.selectZoning": "เลือกการแบ่งเขต",
    "upload.selectCountry": "เลือกประเทศ",

    // Not Found
    "notFound.title": "ไม่พบหน้า",
    "notFound.description": "ขออภัย เราไม่พบหน้าที่คุณกำลังค้นหา",
    "notFound.button": "กลับไปหน้าแรก",

    // Contact Page
    "contact.title": "ติดต่อเรา",
    "contact.subtitle": "มีคำถามหรือต้องการข้อมูลเพิ่มเติมเกี่ยวกับบริ��ารของเรา? กรอกแบบฟอร์มด้านล่างและทีมงานของเราจะติดต่อกลับโดยเร็วที่สุด",
    "contact.form.title": "ส่งข้อความถึงเรา",
    "contact.info.title": "ข้อมูลติดต่อ",
    "contact.form.name": "ชื่อ-นามสกุล",
    "contact.form.email": "อีเมล",
    "contact.form.phone": "เบอร์โทรศัพท์",
    "contact.form.subject": "หัวข้อ",
    "contact.form.message": "ข้อความ",
    "contact.form.submit": "ส่งข้อความ",
    "contact.form.sending": "กำลังส่ง...",
    "contact.info.phone": "โทรศัพท์",
    "contact.info.email": "อีเมล",
    "contact.info.address": "ที่อยู่",
    "contact.info.followUs": "ติดตามเรา",
    "contact.success.title": "ส่งข้อความสำเร็จ",
    "contact.success.description": "เราได้รับข้อความของคุณแล้ว และจะติดต่อกลับโดยเร็วที่สุด",
    "contact.error.title": "เกิดข้อผิดพลาด",
    "contact.error.description": "ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง",
  },
}

export function getTranslation(lang: string, key: string): string {
  // Default to English if language not found
  const langData = translations[lang] || translations.en

  // Return the translation or the key if not found
  return langData[key] || translations.en[key] || key
}
