import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth.ts'

const home = new Hono()

home.get('/', authMiddleware, (c) => {
  const user = c.get('user')

  const html = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Home - Frenspace</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            gray: {
              750: '#2d3748',
              850: '#1a202c',
              950: '#0d1117',
            }
          }
        }
      }
    }
  </script>
</head>
<body class="bg-gray-950 text-gray-100 min-h-screen">
  <div class="max-w-4xl mx-auto px-4 py-8">
    <!-- Header with user info -->
    <header class="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
      <div class="flex items-center gap-4">
        ${user.image ? `<img src="${user.image}" alt="${user.name}'s avatar" class="w-12 h-12 rounded-full border-2 border-purple-500 shadow-lg">` : '<div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg font-bold">' + user.name.charAt(0).toUpperCase() + '</div>'}
        <div>
          <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Hello, ${user.name}!
          </h1>
          <p class="text-gray-400 text-sm">Welcome back to your community</p>
        </div>
      </div>
      <button
        id="signout-btn"
        class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors duration-200 text-sm font-medium border border-gray-700 hover:border-gray-600"
      >
        Sign Out
      </button>
    </header>

    <!-- Announcements Section -->
    <section>
      <div class="flex items-center gap-2 mb-4">
        <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
        </svg>
        <h2 class="text-lg font-semibold text-gray-200">Private Community Announcements</h2>
      </div>

      <div class="space-y-3">
        <article class="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors duration-200">
          <div class="flex items-start gap-3">
            <div class="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
            <div>
              <h3 class="font-medium text-gray-100 mb-1">Welcome to Frenspace</h3>
              <p class="text-gray-400 text-sm leading-relaxed">
                We're glad you're here! This is your private community space. Stay tuned for updates and announcements.
              </p>
              <time class="text-xs text-gray-500 mt-2 block">Just now</time>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>

  <script>
    document.getElementById('signout-btn').addEventListener('click', async () => {
      try {
        const response = await fetch('/api/auth/sign-out', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          window.location.href = '/';
        } else {
          console.error('Sign out failed:', await response.text());
        }
      } catch (error) {
        console.error('Error during sign out:', error);
      }
    });
  </script>
</body>
</html>`.trim()

  return c.html(html)
})

export default home
