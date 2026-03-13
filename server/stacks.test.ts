import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 999,
    openId: "test-user-open-id",
    email: "testuser@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return createUserContext({ id: 1, role: "admin", openId: "admin-open-id", email: "admin@example.com", name: "Admin" });
}

// ─── Public Stacks Queries ────────────────────────────────────────────────

describe("stacks.list (public)", () => {
  it("returns a paginated list of published stacks", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.stacks.list({ limit: 10, offset: 0 });

    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.items)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it("respects the limit parameter", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.stacks.list({ limit: 3, offset: 0 });

    expect(result.items.length).toBeLessThanOrEqual(3);
  });

  it("filters by category", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.stacks.list({ category: "AI Productivity", limit: 50 });

    for (const item of result.items) {
      expect(item.category).toBe("AI Productivity");
    }
  });

  it("filters by search term", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.stacks.list({ search: "Notion", limit: 50 });

    expect(result.items.length).toBeGreaterThan(0);
    const names = result.items.map((i: any) => i.name.toLowerCase());
    expect(names.some((n: string) => n.includes("notion"))).toBe(true);
  });

  it("sorts by newest", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.stacks.list({ sort: "newest", limit: 10 });

    if (result.items.length >= 2) {
      const dates = result.items.map((i: any) => new Date(i.createdAt).getTime());
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i]).toBeLessThanOrEqual(dates[i - 1]);
      }
    }
  });
});

describe("stacks.getBySlug (public)", () => {
  it("returns a stack by slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    // First get a valid slug from the list
    const list = await caller.stacks.list({ limit: 1 });
    if (list.items.length === 0) return; // skip if no stacks

    const slug = list.items[0].slug;
    const result = await caller.stacks.getBySlug({ slug });

    expect(result).not.toBeNull();
    expect(result!.slug).toBe(slug);
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("description");
    expect(result).toHaveProperty("category");
  });

  it("returns null for non-existent slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.stacks.getBySlug({ slug: "non-existent-tool-xyz-123" });

    expect(result).toBeNull();
  });
});

describe("stacks.categoryCounts (public)", () => {
  it("returns an array of category counts", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.stacks.categoryCounts();

    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("category");
      expect(result[0]).toHaveProperty("count");
      expect(typeof result[0].count).toBe("number");
    }
  });
});

// ─── Reviews ─────────────────────────────────────────────────────────────

describe("reviews.listByStack (public)", () => {
  it("returns reviews for a stack", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    // Get a valid stack ID first
    const list = await caller.stacks.list({ limit: 1 });
    if (list.items.length === 0) return;

    const stackId = list.items[0].id;
    const result = await caller.reviews.listByStack({ stackId, limit: 10 });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("reviews.create (protected)", () => {
  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.reviews.create({
        stackId: 1,
        rating: 5,
        title: "Great tool",
        body: "This is a really great tool that I use every day for my work.",
      })
    ).rejects.toThrow();
  });
});

// ─── Lauds ───────────────────────────────────────────────────────────────

describe("lauds (protected)", () => {
  it("rejects unauthenticated toggle", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.lauds.toggle({ stackId: 1 })).rejects.toThrow();
  });

  it("rejects unauthenticated check", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.lauds.hasLauded({ stackId: 1 })).rejects.toThrow();
  });
});

// ─── Saves ───────────────────────────────────────────────────────────────

describe("saves (protected)", () => {
  it("rejects unauthenticated toggle", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.saves.toggle({ stackId: 1 })).rejects.toThrow();
  });

  it("rejects unauthenticated mySavedStacks", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.saves.mySavedStacks()).rejects.toThrow();
  });
});

// ─── Admin ───────────────────────────────────────────────────────────────

describe("admin (admin-only)", () => {
  it("rejects unauthenticated access to dashboardStats", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.admin.dashboardStats()).rejects.toThrow();
  });

  it("rejects regular user access to dashboardStats", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.dashboardStats()).rejects.toThrow();
  });

  it("allows admin access to dashboardStats", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.dashboardStats();

    expect(result).toHaveProperty("totalStacks");
    expect(result).toHaveProperty("totalReviews");
    expect(result).toHaveProperty("totalUsers");
    expect(typeof result.totalStacks).toBe("number");
  });

  it("allows admin to list stacks", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.listStacks({ limit: 5 });

    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.items)).toBe(true);
  });

  it("allows admin to get a stack by ID", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const list = await caller.admin.listStacks({ limit: 1 });
    if (list.items.length === 0) return;

    const stackId = list.items[0].id;
    const result = await caller.admin.getStack({ id: stackId });

    expect(result).not.toBeNull();
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("screenshots");
    expect(result).toHaveProperty("clickStats");
  });

  it("rejects regular user from creating stacks", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.admin.createStack({
        name: "Test Tool",
        slug: "test-tool",
        tagline: "A test tool",
        description: "This is a test tool description",
        category: "AI Productivity",
      })
    ).rejects.toThrow();
  });
});

// ─── Founder ─────────────────────────────────────────────────────────────

describe("founder (protected)", () => {
  it("rejects unauthenticated access to myStacks", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.founder.myStacks()).rejects.toThrow();
  });

  it("rejects unauthenticated launch", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.founder.launch({
        name: "My Tool",
        slug: "my-tool",
        tagline: "A great tool",
        description: "This is my great tool that does amazing things for developers.",
        category: "Developer Tools",
        websiteUrl: "https://mytool.com",
      })
    ).rejects.toThrow();
  });
});

// ─── Newsletter ──────────────────────────────────────────────────────────

describe("newsletter.subscribe (public)", () => {
  it("subscribes a new email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const randomEmail = `test-${Date.now()}@example.com`;
    const result = await caller.newsletter.subscribe({
      email: randomEmail,
      source: "vitest",
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.newsletter.subscribe({ email: "not-an-email" })
    ).rejects.toThrow();
  });
});
