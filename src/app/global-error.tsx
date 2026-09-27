"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="de">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#fafaf7", color: "#1b1e1f", padding: "4rem 1.5rem" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: "2.25rem" }}>Etwas ist schiefgelaufen.</h1>
        <p>Bitte versuchen Sie es erneut.</p>
        <button onClick={reset} style={{ marginTop: "1rem", padding: "0.8rem 1.4rem", background: "#1f3f36", color: "#fff", border: 0, borderRadius: 2 }}>
          Erneut versuchen
        </button>
      </body>
    </html>
  );
}
