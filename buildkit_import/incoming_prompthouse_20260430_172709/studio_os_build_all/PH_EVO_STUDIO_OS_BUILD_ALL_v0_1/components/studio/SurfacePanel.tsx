export function SurfacePanel({ name, purpose, items }: { name: string; purpose: string; items: string[] }) {
  return (
    <div className="card">
      <div className="kicker">Studio Surface</div>
      <h3>{name}</h3>
      <p>{purpose}</p>
      <ul>
        {items.map((item) => <li key={item} className="small">{item}</li>)}
      </ul>
    </div>
  );
}
