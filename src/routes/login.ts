import { Hono } from 'hono'

const login = new Hono()

login.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en" class="dark">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login - Frenspace</title>
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
    <body class="bg-gray-950 text-gray-100 min-h-screen flex items-center justify-center">
      <div class="w-full max-w-md px-6">
        <!-- Logo/Brand -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Frenspace
          </h1>
          <p class="text-gray-400 mt-2">Sign in to join your private community</p>
        </div>

        <!-- Login Card -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
          <button 
            id="discord-login"
            class="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg font-medium transition-colors duration-200 shadow-lg shadow-[#5865F2]/20 hover:shadow-[#5865F2]/30"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Sign in with Discord
          </button>

          <p id="error-msg" class="hidden mt-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2"></p>

          <div class="mt-6 text-center">
            <p class="text-xs text-gray-500">
              By signing in, you agree to join this private community
            </p>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-gray-600 text-sm mt-8">
          Private community access only
        </p>
      </div>

      <script>
        document.getElementById('discord-login').addEventListener('click', async () => {
          const errorMsg = document.getElementById('error-msg');
          errorMsg.classList.add('hidden');
          
          try {
            const response = await fetch('/api/auth/sign-in/social', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                provider: 'discord',
                callbackURL: '/home'
              })
            });
            
            const data = await response.json();
            
            if (data.url) {
              window.location.href = data.url;
            } else if (data.error) {
              errorMsg.textContent = 'Error: ' + data.error;
              errorMsg.classList.remove('hidden');
            }
          } catch (error) {
            console.error('Error:', error);
            errorMsg.textContent = 'An error occurred. Please try again.';
            errorMsg.classList.remove('hidden');
          }
        });
      </script>
    </body>
    </html>
  `)
})

export default login
