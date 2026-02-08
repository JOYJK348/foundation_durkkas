"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/workshops", label: "Workshops" },
  { href: "/tutor", label: "Become a Tutor" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Navigation Loading Indicator */}
      {isPending && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary origin-left animate-pulse" />
      )}
      
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center space-x-2"
            prefetch={true}
            onClick={handleLinkClick}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="font-display text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            >
              DURKKAS EMS
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  prefetch={true}
                  onClick={handleLinkClick}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "relative transition-all duration-200",
                      isActive && "text-primary"
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        initial={false}
                        transition={{ type: "spring", stiffness: 600, damping: 35, duration: 0.2 }}
                      />
                    )}
                  </Button>
                </Link>
              );
            })}
            <Link 
              href="/login"
              prefetch={true}
              onClick={handleLinkClick}
            >
              <Button size="sm" className="transition-all duration-200">Login</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t bg-background"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    prefetch={true}
                    onClick={handleLinkClick}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start transition-all duration-200",
                        isActive && "bg-accent text-primary"
                      )}
                    >
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              <Link 
                href="/login"
                prefetch={true}
                onClick={handleLinkClick}
              >
                <Button className="w-full transition-all duration-200">Login</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

