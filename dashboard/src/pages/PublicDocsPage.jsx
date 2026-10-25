import { Navbar, Footer } from "../components/layout";
import { DocumentationPage } from "./DocumentationPage";

export function PublicDocsPage() {
  return (
    <div
      style={{
        background: "hsl(225 20% 7%)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />
      <div
        style={{
          paddingTop: "calc(5.5rem + env(safe-area-inset-top, 0px))",
          flex: 1,
          background: "hsl(225 20% 7%)",
        }}
      >
        <DocumentationPage />
      </div>
      <Footer style={{ background: "hsl(225 20% 7%)", borderTop: "1px solid hsl(225 12% 22%)" }} />
    </div>
  );
}

export default PublicDocsPage;
