"use client";

import { Phone, Mail } from "lucide-react";

export function MobileTopBar() {
  return (
    <div className="md:hidden bg-primary/10 border-b border-primary/20">
      <div className="container mx-auto px-3">
        <div className="flex items-center justify-center gap-4 h-9">
          {/* Contact Buttons - Compact Mobile Design */}
          <a
            href="tel:+91XXXXXXXXXX"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors active:scale-95"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Call</span>
          </a>
          <div className="h-4 w-px bg-border" />
          <a
            href="mailto:info@darecentre.com"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors active:scale-95"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Email</span>
          </a>
        </div>
      </div>
    </div>
  );
}

