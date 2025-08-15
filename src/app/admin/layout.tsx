export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* e.g. <AdminNav /> */}
      <main className="p-8">{children}</main>
    </div>
  )
}
