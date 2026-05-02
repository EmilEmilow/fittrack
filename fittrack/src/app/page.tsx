import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-2xl font-bold text-green-600">FitTrack</span>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2">
              Sign In
            </Link>
            <Link href="/auth/signup" className="text-sm bg-green-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-green-700">
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 to-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-5">
            Track your food.<br />
            <span className="text-green-600">Reach your goals.</span>
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
            FitTrack calculates your personal calorie and macro targets, lets you log every meal, and gives you AI-powered food suggestions — all in one place.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/auth/signup"
              className="bg-green-600 text-white font-semibold px-8 py-3 rounded-xl text-base hover:bg-green-700 shadow-sm">
              Join Now — It&apos;s Free
            </Link>
            <Link href="/auth/login"
              className="border border-gray-300 text-gray-700 font-semibold px-8 py-3 rounded-xl text-base hover:border-gray-400">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-green-600 py-6 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-white text-center">
          <div>
            <div className="text-2xl font-bold">14M+</div>
            <div className="text-green-100 text-sm">Foods in database</div>
          </div>
          <div>
            <div className="text-2xl font-bold">3</div>
            <div className="text-green-100 text-sm">Goals supported</div>
          </div>
          <div>
            <div className="text-2xl font-bold">AI</div>
            <div className="text-green-100 text-sm">Powered by Claude</div>
          </div>
          <div>
            <div className="text-2xl font-bold">100%</div>
            <div className="text-green-100 text-sm">Free to use</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Everything you need to hit your goal</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal targets</h3>
              <p className="text-gray-500 text-sm">Enter your stats and goal — we calculate your daily calories, protein, carbs and fat automatically using the Mifflin-St Jeor formula.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Massive food database</h3>
              <p className="text-gray-500 text-sm">Search millions of foods from USDA FoodData Central and Open Food Facts. Add any food to your diary in seconds.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI food suggestions</h3>
              <p className="text-gray-500 text-sm">Claude AI looks at your remaining macros and eating history to suggest the best foods to eat to hit your targets today.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Macro tracking</h3>
              <p className="text-gray-500 text-sm">Visual progress bars for protein, carbs and fat. See at a glance how close you are to your targets for the day.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress over time</h3>
              <p className="text-gray-500 text-sm">Track your weight and calorie trends over weeks and months. See your streaks and stay motivated.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="text-3xl mb-3">🍽️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom foods & meals</h3>
              <p className="text-gray-500 text-sm">Create your own foods and save meal templates for things you eat regularly — log your favourite breakfast in one tap.</p>
            </div>

          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Get started in 3 steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-green-600 text-white font-bold flex items-center justify-center text-lg mb-4">1</div>
              <h3 className="font-semibold text-gray-900 mb-1">Create your account</h3>
              <p className="text-sm text-gray-500">Enter your name, email, and password.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-green-600 text-white font-bold flex items-center justify-center text-lg mb-4">2</div>
              <h3 className="font-semibold text-gray-900 mb-1">Set your goal</h3>
              <p className="text-sm text-gray-500">Tell us your stats and choose to cut, maintain, or bulk. We do the maths.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-green-600 text-white font-bold flex items-center justify-center text-lg mb-4">3</div>
              <h3 className="font-semibold text-gray-900 mb-1">Start logging</h3>
              <p className="text-sm text-gray-500">Search for foods and log your meals. Watch your ring fill up.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to start?</h2>
        <p className="text-gray-500 mb-8">Join FitTrack today and take control of your nutrition.</p>
        <Link href="/auth/signup"
          className="bg-green-600 text-white font-semibold px-10 py-3 rounded-xl text-base hover:bg-green-700 shadow-sm inline-block">
          Join Now — It&apos;s Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-6 text-center text-sm text-gray-400">
        © 2026 FitTrack. Built with Next.js, Prisma & Claude AI.
      </footer>

    </div>
  )
}
