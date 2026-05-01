'use client'
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
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <Link href="/dashboard" className="font-bold text-green-600 text-xl">FitTrack</Link>
        <div className="flex gap-4 text-sm flex-wrap">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${pathname === href ? 'text-green-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {label}
            </Link>
          ))}
          <button onClick={() => signOut({ callbackUrl: '/auth/login' })} className="text-gray-600 hover:text-red-600">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
