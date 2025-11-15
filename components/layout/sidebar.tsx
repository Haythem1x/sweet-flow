"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { useState } from "react"
import { motion } from "framer-motion"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Products", href: "/products", icon: "🍫" },
  { name: "Customers", href: "/customers", icon: "🛒" },
  { name: "Invoices", href: "/invoices", icon: "🧾" },
  { name: "Payments", href: "/payments", icon: "💳" },
  { name: "Analytics", href: "/analytics", icon: "📈" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-primary text-primary-foreground rounded-lg shadow-lg active:scale-95 transition-transform"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 w-64 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 md:translate-x-0 overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="p-4 sm:p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground rounded-lg p-2">
              <img
                src="/Gemini_Generated_Image_58b47l58b47l58b4.png" // logo path in /public
                alt="SweetFlow Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg">SweetFlow</h1>
              <p className="text-xs text-sidebar-foreground/60">Distribution</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 sm:p-4 space-y-1 sm:space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-2.5 rounded-lg transition-colors active:scale-98",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-md"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <motion.span
                  className="text-lg sm:text-base"
                  animate={isActive ? { y: [0, -5, 0], scale: [1, 1.2, 1] } : {}}
                  whileHover={!isActive ? { rotate: [0, -15, 15, -15, 15, 0], scale: 1.2 } : {}}
                  transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
                >
                  {item.icon}
                </motion.span>
                <span className="text-sm sm:text-base">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
          onTouchStart={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
