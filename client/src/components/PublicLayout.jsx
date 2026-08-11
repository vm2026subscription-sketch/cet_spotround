import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

/** Public page shell — same header/footer as the home page for consistent navigation. */
export default function PublicLayout({ children }) {
  return (
    <div className="public-page">
      <SiteHeader />
      <main className="public-main">{children}</main>
      <SiteFooter />
    </div>
  );
}
