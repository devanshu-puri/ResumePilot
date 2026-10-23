import { describe, it, expect } from "vitest";
import { resolveTopic } from "@/modules/resume/domain/topic-mapper";

describe("Topic Mapper & Aliases (RES-T5)", () => {
  it("resolves variations of React to canonical 'react' slug", () => {
    expect(resolveTopic("React").slug).toBe("react");
    expect(resolveTopic("ReactJS").slug).toBe("react");
    expect(resolveTopic("React.js").slug).toBe("react");
    expect(resolveTopic("next.js").slug).toBe("react");
    expect(resolveTopic("React").isCanonical).toBe(true);
  });

  it("resolves backend and database variations", () => {
    expect(resolveTopic("NodeJS").slug).toBe("nodejs");
    expect(resolveTopic("Postgres").slug).toBe("postgresql");
    expect(resolveTopic("PostgreSQL").slug).toBe("postgresql");
    expect(resolveTopic("MySQL").slug).toBe("sql-fundamentals");
    expect(resolveTopic("Redis").slug).toBe("redis-caching");
    expect(resolveTopic("Docker").slug).toBe("docker");
    expect(resolveTopic("K8s").slug).toBe("kubernetes");
  });

  it("marks unknown or proprietary skills as candidate topics", () => {
    const unknown = resolveTopic("Proprietary internal framework XYZ");
    expect(unknown.isCanonical).toBe(false);
    expect(unknown.slug).toBe("proprietary-internal-framework-xyz");
    expect(unknown.name).toBe("Proprietary internal framework XYZ");
  });
});
