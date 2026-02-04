import { Navbar } from "@/presentation/components/layouts/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="container py-8">{children}</main>
    </div>
  );
}
