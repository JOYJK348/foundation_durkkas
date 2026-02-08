"use client";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="min-h-screen w-full">
        {children}
      </main>
    </div>
  );
}

