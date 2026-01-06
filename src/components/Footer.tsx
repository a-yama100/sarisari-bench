export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm">
            {currentYear} Sarisari-Bench. All rights reserved.
          </div>
          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            <a
              href="https://substack.com/@aifieldtest"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              AI Field Test Manila Edition
            </a>
            <a
              href="https://tools.aifieldtest.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Manila VA Tools
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
