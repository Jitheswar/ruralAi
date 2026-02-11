import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="my-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
              <span className="text-4xl">🏥</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Rural Health AI</h1>
          <p className="text-gray-500 mt-2 mb-10">
            Your health companion, online or offline
          </p>

          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="block w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center"
            >
              Create Account
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-10">
            Powered by Rural Health AI
          </p>
        </div>
      </div>
    </div>
  );
}
