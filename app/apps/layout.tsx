import GlobalNav from '@/components/GlobalNav';

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <GlobalNav />
      {children}
    </div>
  );
}
