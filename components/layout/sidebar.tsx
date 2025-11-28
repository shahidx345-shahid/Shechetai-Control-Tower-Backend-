"use client"

import { 
  Home, Users, Layers, CreditCard, Wallet, Gift, Globe, Wrench, FlaskConical,
  Receipt, ChevronRight, ChevronDown
} from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface SidebarProps {
  currentSection: string
  onSectionChange?: (section: any) => void
}

const navItems = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "users", label: "Users", icon: Users },
  { id: "agents-teams", label: "Agents & Teams", icon: Layers },
  { id: "seats-invites", label: "Seats & Invites", icon: Layers },
  { 
    id: "billing-contracts", 
    label: "Billing & Contracts", 
    icon: CreditCard,
    children: [
      { id: "subscriptions", label: "Subscriptions", icon: Receipt },
      { id: "payment-methods", label: "Payment Methods", icon: CreditCard },
    ]
  },
  { id: "credits-wallets", label: "Credits & Wallets", icon: Wallet },
  { id: "referrals", label: "Referrals", icon: Gift },
  { id: "white-label", label: "White-Label & Retail", icon: Globe },
  { 
    id: "debug-tools", 
    label: "Debug & Tools", 
    icon: Wrench,
    children: [
      { id: "test-api", label: "Test API", icon: FlaskConical },
    ]
  },
]

export function Sidebar({ currentSection, onSectionChange }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(["billing-contracts", "debug-tools"]))

  const toggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <aside className="h-full w-full border-r border-sidebar-border bg-sidebar flex flex-col animate-slide-in-left">
      <div className="p-4 sm:p-6 border-b border-sidebar-border">
        <h1 className="text-lg sm:text-xl font-bold text-sidebar-foreground tracking-tight">GENERAL</h1>
        <p className="text-xs text-sidebar-foreground/60 mt-1 font-medium">Shechetai Control Tower</p>
      </div>

      <nav className="flex-1 p-2 sm:p-4 space-y-0.5 sm:space-y-1 overflow-y-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = currentSection === item.id
          const hasChildren = item.children && item.children.length > 0
          const isExpanded = expandedItems.has(item.id)
          const isChildActive = hasChildren && item.children.some((child: any) => child.id === currentSection)

          return (
            <div key={item.id} style={{ animation: `slideInLeft 0.3s ease-out ${index * 0.05}s both` }}>
              <Link
                href={`/dashboard/${item.id}`}
                onClick={() => {
                  if (hasChildren) {
                    toggleExpand(item.id)
                  }
                  onSectionChange?.(item.id)
                }}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive || isChildActive ? "bg-primary text-white shadow-lg" : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-left flex-1">{item.label}</span>
                {hasChildren && (
                  isExpanded ? 
                    <ChevronDown className="w-4 h-4 flex-shrink-0" /> : 
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                )}
              </Link>

              {hasChildren && isExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((child: any) => {
                    const ChildIcon = child.icon
                    const isChildActiveItem = currentSection === child.id
                    return (
                      <Link
                        key={child.id}
                        href={`/dashboard/${child.id}`}
                        onClick={() => onSectionChange?.(child.id)}
                        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                          isChildActiveItem ? "bg-primary/90 text-white shadow-md" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
                        }`}
                      >
                        <ChildIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-left">{child.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="hidden sm:block p-3 sm:p-4 border-t border-sidebar-border space-y-2">
        <p className="text-xs text-sidebar-foreground/60 font-semibold">API Base</p>
        <p className="font-mono text-xs text-sidebar-foreground/80 break-all bg-sidebar-accent/30 px-2 py-1 rounded">
          hooks.shechet.com
        </p>
      </div>
    </aside>
  )
}
