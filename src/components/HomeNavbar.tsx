'use client'

import Link from 'next/link'
import { useState } from 'react'

export function HomeNavbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative z-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Sarisari-Bench</h2>
        <div className="flex-1 h-px bg-white/50 mx-6 hidden md:block"></div>
        <nav className="hidden md:flex space-x-6">
          <Link href="/leaderboard" className="hover:underline">Leaderboard</Link>
          <Link href="/models" className="hover:underline">Models</Link>
          <Link href="/runs" className="hover:underline">Runs</Link>
        </nav>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-white/20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden mt-4 bg-black/30 rounded-lg backdrop-blur-sm">
          <Link 
            href="/leaderboard" 
            className="block px-4 py-3 hover:bg-white/10 rounded-t-lg"
            onClick={() => setIsOpen(false)}
          >
            Leaderboard
          </Link>
          <Link 
            href="/models" 
            className="block px-4 py-3 hover:bg-white/10"
            onClick={() => setIsOpen(false)}
          >
            Models
          </Link>
          <Link 
            href="/runs" 
            className="block px-4 py-3 hover:bg-white/10 rounded-b-lg"
            onClick={() => setIsOpen(false)}
          >
            Runs
          </Link>
        </div>
      )}
    </div>
  )
}