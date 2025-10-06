import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProtectedPage } from '@/components/auth/protected-page'

export default function HomePage() {
  
  const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                     process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-supabase')

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
        {isMockMode && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Development Mode
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Running in mock mode without Supabase. All features are simulated for testing.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hotte Couture
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional tailoring and alteration services with modern workflow management
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Order Intake</CardTitle>
              <CardDescription>
                Streamlined client onboarding and order creation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="/intake">Start New Order</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kanban Board</CardTitle>
              <CardDescription>
                Visual workflow management for orders and tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <a href="/board">View Board</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>
                Check order status and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <a href="/status">Check Status</a>
              </Button>
            </CardContent>
          </Card>
        </div>


        {isMockMode && (
          <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🚀 Ready to Test!
            </h3>
            <p className="text-blue-800 mb-4">
              The application is running in development mode. You can test all features without Supabase:
            </p>
            <ul className="text-blue-700 space-y-1">
              <li>✅ Order intake form with mock data</li>
              <li>✅ Kanban board with drag & drop</li>
              <li>✅ Order status lookup</li>
              <li>✅ Label generation (simulated)</li>
              <li>✅ Multi-language support</li>
            </ul>
            <p className="text-blue-600 text-sm mt-4">
              When you get Supabase access, just update the environment variables and the app will automatically switch to real mode.
            </p>
          </div>
        )}
        </div>
      </div>
    </ProtectedPage>
  )
}