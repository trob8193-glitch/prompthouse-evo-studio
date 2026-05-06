export function Card({ title, kicker, children }: { title: string; kicker?: string; children: React.ReactNode }) {
  return (
    <section className="card">
      {kicker ? <div className="kicker">{kicker}</div> : null}
      <h2>{title}</h2>
      {children}
    </section>
  );
}
