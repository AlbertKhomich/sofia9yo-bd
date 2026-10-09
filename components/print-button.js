'use client';

export default function PrintButton() {
  return <button className="alt" onClick={() => window.print()}>Codekarten drucken 🖨️</button>;
}
