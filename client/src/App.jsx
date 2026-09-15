import { BrowserRouter, Route, Routes } from 'react-router';

function Placeholder({ title }) {
  return (
    <main>
      <h1>{title}</h1>
      <p>TBD — built in a later phase. See docs/PHASES.md.</p>
    </main>
  );
}

function NotFound() {
  // Intentional soft-404 (HTTP 200) for the SPA — see docs/DECISIONS.md ADR-016.
  return (
    <main>
      <h1>Page not found</h1>
    </main>
  );
}

// TODO(P1+): replace with a real session check; this is a UX-only guard
// (docs/DECISIONS.md ADR-007 — never the only authorization check).
function AppShellGuard({ children }) {
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Placeholder title="Stafy" />} />
        <Route path="/login" element={<Placeholder title="Login" />} />
        <Route path="/privacy" element={<Placeholder title="Privacy Policy" />} />
        <Route path="/terms" element={<Placeholder title="Terms" />} />
        <Route
          path="/app/*"
          element={
            <AppShellGuard>
              <Placeholder title="App" />
            </AppShellGuard>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
