import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Welcome to{' '}
            <span className="text-primary">Hotte Couture</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            A modern, production-ready web application built with Next.js 14+, TypeScript, and Tailwind CSS.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg">
              Get started
            </Button>
            <Button variant="outline" size="lg">
              Learn more
            </Button>
          </div>
        </div>

        <div className="mt-20">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Next.js 14+</CardTitle>
                <CardDescription>
                  Built with the latest Next.js features including App Router and Server Components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Leveraging the power of React Server Components and the new App Router for optimal performance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>TypeScript</CardTitle>
                <CardDescription>
                  Fully typed with strict TypeScript configuration for better developer experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Comprehensive type safety with strict configuration and modern TypeScript features.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tailwind CSS</CardTitle>
                <CardDescription>
                  Beautiful, responsive design with utility-first CSS framework
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Custom design system with tablet-first responsive design and dark mode support.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Testing</CardTitle>
                <CardDescription>
                  Comprehensive testing setup with Vitest, Testing Library, and Playwright
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Unit tests, integration tests, and end-to-end testing for reliable applications.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CI/CD</CardTitle>
                <CardDescription>
                  Automated workflows with GitHub Actions for quality assurance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automated linting, type checking, testing, and deployment on every pull request.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vercel Ready</CardTitle>
                <CardDescription>
                  Optimized for deployment on Vercel with production-ready configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  One-click deployment with optimized build settings and environment configuration.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
