"use client";

import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";

export function TopBar() {
  return (
    <div className="hidden md:block bg-primary/10 border-b border-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-10 text-sm">
          {/* Left Side - Contact Info */}
          <div className="flex items-center gap-6">
            <a
              href="tel:+91XXXXXXXXXX"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">+91 XXXXXXXXXX</span>
              <span className="lg:hidden">Call Us</span>
            </a>
            <a
              href="mailto:info@darecentre.com"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">info@darecentre.com</span>
              <span className="lg:hidden">Email</span>
            </a>
          </div>

          {/* Right Side - Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

