import type { StudioModule } from "@/lib/studio/types";

export function ModuleRoute({ route }: { route: StudioModule[] }) {
  return (
    <div className="row">
      {route.map((item) => (
        <span className="badge" key={item}>{item}</span>
      ))}
    </div>
  );
}
