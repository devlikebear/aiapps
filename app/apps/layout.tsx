import AppHeader from '@/components/AppHeader';

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <div className="pt-16">{children}</div>
    </div>
  );
}
