'use client'
import { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/diary', label: 'Diary' },
  { href: '/search', label: 'Search' },
  { href: '/recommendations', label: 'AI Recs' },
  { href: '/progress', label: 'Progress' },
  { href: '/profile', label: 'Profile' },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-green-600 text-xl">FitTrack</Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-5 text-sm">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={pathname.startsWith(href) ? 'text-green-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="text-gray-600 hover:text-red-600 cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(prev => !prev)}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-3 text-sm bg-white">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={pathname.startsWith(href) ? 'text-green-600 font-semibold' : 'text-gray-600'}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="text-left text-gray-600 hover:text-red-600 cursor-pointer"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}
