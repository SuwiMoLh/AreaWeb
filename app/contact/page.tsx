"use client"

import { useTranslation } from "@/lib/i18n/use-translation"

export default function ContactPage() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-4xl font-bold text-center mb-8">ติดต่อเรา</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
        หากคุณมีคำถามหรือต้องการข้อมูลเพิ่มเติมเกี่ยวกับบริการของเรา สามารถติดต่อเราได้ตามช่องทางด้านล่าง
      </p>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-10 shadow-lg border border-gray-200/30 dark:border-gray-800/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* ข้อมูลติดต่อ - คอลัมน์ซ้าย */}
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="mr-5 flex items-center justify-center">
                  <div
                    className="w-20 h-20 flex items-center justify-center shadow-lg relative rounded-full"
                    style={{
                      background: "black",
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10">
                      <path
                        fillRule="evenodd"
                        d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">เบอร์โทร</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400">+66 2 123 4567</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-5 flex items-center justify-center">
                  <div
                    className="w-20 h-20 flex items-center justify-center shadow-lg relative rounded-full"
                    style={{
                      background: "black",
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10">
                      <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                      <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">อีเมล</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400">contact@area-property.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-5 flex items-center justify-center">
                  <div
                    className="w-20 h-20 flex items-center justify-center shadow-lg relative rounded-full"
                    style={{
                      background: "black",
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10">
                      <path
                        fillRule="evenodd"
                        d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">ที่อยู่</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                    123 อาคารเอมบีซี ชั้น 10
                    <br />
                    ถนนสุขุมวิท แขวงคลองเตยเหนือ
                    <br />
                    เขตวัฒนา กรุงเทพฯ 10110
                  </p>
                </div>
              </div>
            </div>

            {/* ข้อมูลติดต่อ - คอลัมน์ขวา */}
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="mr-5 flex items-center justify-center">
                  <div
                    className="w-20 h-20 flex items-center justify-center shadow-lg relative rounded-full"
                    style={{
                      background: "black",
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 5.013 3.693 9.153 8.505 9.876V14.65H8.031v-2.629h2.474v-1.749c0-2.896 1.411-4.167 3.818-4.167 1.153 0 1.762.085 2.051.124v2.294h-1.642c-1.022 0-1.379.969-1.379 2.061v1.437h2.995l-.406 2.629h-2.588v7.247C18.235 21.236 22 17.062 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Facebook</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Area ซื้อขายที่ดิน</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-5 flex items-center justify-center">
                  <div
                    className="w-20 h-20 flex items-center justify-center shadow-lg relative rounded-full"
                    style={{
                      background: "black",
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Twitter</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Area ซื้อขายที่ดิน</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-5 flex items-center justify-center">
                  <div
                    className="w-20 h-20 flex items-center justify-center shadow-lg relative rounded-full"
                    style={{
                      background: "black",
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10">
                      <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.045-1.505.207-1.858.344-.466.182-.8.398-1.15.748-.35.35-.566.684-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.041 0 2.67.01 2.986.058 4.04.045.977.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058 2.67 0 2.987-.01 4.04-.058.977-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.684.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041 0-2.67-.01-2.986-.058-4.04-.045-.977-.207-1.505-.344-1.858a3.097 3.097 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.055-.048-1.37-.058-4.041-.058zm0 3.063a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27zm0 8.468a3.333 3.333 0 1 0 0-6.666 3.333 3.333 0 0 0 0 6.666zm6.538-8.469a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Instagram</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Area ซื้อขายที่ดิน</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
