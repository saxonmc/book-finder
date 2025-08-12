import React, { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import MobileNav from './MobileNav'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
} 