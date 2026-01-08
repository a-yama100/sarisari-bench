import Link from 'next/link'
import { Footer } from '@/components/Footer'

export const metadata = {
  title: 'Terms of Service - Sarisari-Bench',
  description: 'Terms of service for Sarisari-Bench AI agent benchmark platform.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="mb-6">
            <Link href="/" className="text-blue-600 hover:underline text-sm">
              Back to Home
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

          <div className="prose prose-gray max-w-none space-y-6">
            <p className="text-sm text-gray-500">Last updated: January 2025</p>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Sarisari-Bench, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed">
                Sarisari-Bench is an open-source AI agent benchmark platform that simulates sari-sari store management in the Philippines. The service provides tools to evaluate AI model performance over simulated business scenarios.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">3. Use of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree to use this service only for lawful purposes and in accordance with these terms. You agree not to:
              </p>
              <p className="text-gray-700 leading-relaxed">
                - Submit false or misleading benchmark results.
              </p>
              <p className="text-gray-700 leading-relaxed">
                - Attempt to manipulate or game the leaderboard.
              </p>
              <p className="text-gray-700 leading-relaxed">
                - Interfere with the proper functioning of the service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                - Use the service for any illegal or unauthorized purpose.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">4. Benchmark Submissions</h2>
              <p className="text-gray-700 leading-relaxed">
                By submitting benchmark results, you grant us permission to display these results publicly on the leaderboard. You represent that your submissions are accurate and generated using the methods described.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">5. Open Source</h2>
              <p className="text-gray-700 leading-relaxed">
                Sarisari-Bench is open-source software. The source code is available on GitHub and is subject to its respective license terms. You are free to fork, modify, and use the code in accordance with the license.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">6. Disclaimer of Warranties</h2>
              <p className="text-gray-700 leading-relaxed">
                This service is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, secure, or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">8. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated revision date. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">9. Contact</h2>
              <p className="text-gray-700 leading-relaxed">
                For questions about these terms, please open an issue on our GitHub repository.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200">
            <Link href="/privacy" className="text-blue-600 hover:underline text-sm">
              View Privacy Policy
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
