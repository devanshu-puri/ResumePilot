import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NavRail } from "@/components/layout/nav-rail";
import { BottomNav } from "@/components/layout/bottom-nav";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/resume",
}));

describe("App Shell Navigation", () => {
  it("renders NavRail with 4 primary links and 2 foot links", () => {
    render(<NavRail />);
    expect(screen.getByText("Home")).toBeDefined();
    expect(screen.getByText("Resume")).toBeDefined();
    expect(screen.getByText("Interview")).toBeDefined();
    expect(screen.getByText("Library")).toBeDefined();
    expect(screen.getByText("History")).toBeDefined();
    expect(screen.getByText("Settings")).toBeDefined();
  });

  it("renders BottomNav with 4 primary links for mobile", () => {
    render(<BottomNav />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBe(4);
    expect(screen.getByText("Home")).toBeDefined();
    expect(screen.getByText("Resume")).toBeDefined();
    expect(screen.getByText("Interview")).toBeDefined();
    expect(screen.getByText("Library")).toBeDefined();
  });
});
