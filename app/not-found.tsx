import Navbar from "@/components/Navbar";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#install",  label: "Install" },
  { href: "/devs",      label: "Docs" },
];

export default function NotFound() {
  return (
    <>
      <Navbar links={NAV_LINKS} />
      <main className="shell">
        <div className="card">
          <h1>Diagram not found</h1>
          <p className="muted">The requested hash does not exist or already expired.</p>
        </div>
      </main>
    </>
  );
}
