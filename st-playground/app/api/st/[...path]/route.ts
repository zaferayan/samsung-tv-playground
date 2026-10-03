import { NextRequest, NextResponse } from "next/server";

// SmartThings proxy: token sunucuda kalır, tarayıcıya hiç düşmez.
const BASE = "https://api.smartthings.com/v1";
const TOKEN = process.env.ST_TOKEN || "";

async function proxy(req: NextRequest, path: string[]) {
  if (!TOKEN) {
    return NextResponse.json({ error: ".env.local içinde ST_TOKEN yok" }, { status: 500 });
  }
  const url = new URL(req.url);
  const target = `${BASE}/${path.join("/")}${url.search}`;
  const init: RequestInit = {
    method: req.method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    const body = await req.text();
    if (body) init.body = body;
  }
  const res = await fetch(target, init);
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return NextResponse.json(data ?? null, { status: res.status });
}

type Ctx = { params: Promise<{ path: string[] }> };
const handler = async (req: NextRequest, ctx: Ctx) => {
  const { path } = await ctx.params;
  return proxy(req, path);
};

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
