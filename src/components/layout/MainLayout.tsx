import React from 'react'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Lamiche Pricing</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 relative">
        {children}
      </main>
    </div>
  )
} 