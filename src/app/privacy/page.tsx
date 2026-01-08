import Link from 'next/link'
import { Footer } from '@/components/Footer'

export const metadata = {
  title: 'Privacy Policy - Sarisari-Bench',
  description: 'Privacy policy for Sarisari-Bench AI agent benchmark platform.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="mb-6">
            <Link href="/" className="text-blue-600 hover:underline text-sm">
              Back to Home
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

          <div className="prose prose-gray max-w-none space-y-6">
            <p className="text-sm text-gray-500">Last updated: January 2025</p>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Sarisari-Bench is an open-source AI agent benchmark platform. We are committed to protecting your privacy and being transparent about the data we collect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect minimal information necessary to operate this service:
              </p>
              <p className="text-gray-700 leading-relaxed">
                - Benchmark run data: Model names, scores, and simulation metrics submitted through the platform.
              </p>
              <p className="text-gray-700 leading-relaxed">
                - Technical data: Standard server logs including IP addresses, browser type, and access times for security and performance purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Use Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use collected information to:
              </p>
              <p className="text-gray-700 leading-relaxed">
                - Display benchmark results and leaderboards publicly.
              </p>
              <p className="text-gray-700 leading-relaxed">
                - Improve the platform and fix technical issues.
              </p>
              <p className="text-gray-700 leading-relaxed">
                - Ensure security and prevent abuse.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">4. Data Sharing</h2>
              <p className="text-gray-700 leading-relaxed">
                Benchmark results are publicly displayed on the leaderboard. We do not sell personal information to third parties. We may share data with service providers (such as hosting services) necessary to operate the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">5. Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                This website uses minimal cookies for essential functionality. We do not use tracking or advertising cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">6. Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed">
                We use Vercel for hosting and Supabase for database services. These services may collect technical data as described in their respective privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">7. Your Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                You may request deletion of any data you have submitted. For data requests, please contact us through our GitHub repository.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">8. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">9. Contact</h2>
              <p className="text-gray-700 leading-relaxed">
                For questions about this privacy policy, please open an issue on our GitHub repository.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200">
            <Link href="/terms" className="text-blue-600 hover:underline text-sm">
              View Terms of Service
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
