import "../../globals.css";
import TopNav from "@/components/top-nav";

export default function RootLayout({ children }) {
  return (
    <>
      <AuthGuard>
        <TopNav />
        <div className="mt-4">{children}</div>
      </AuthGuard>
    </>
  );
}
