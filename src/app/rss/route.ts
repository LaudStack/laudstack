import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { tools } from '@/drizzle/schema';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const recentTools = await db
      .select({
        name: tools.name,
        slug: tools.slug,
        tagline: tools.tagline,
        category: tools.category,
        createdAt: tools.createdAt,
      })
      .from(tools)
      .where(eq(tools.status, 'approved'))
      .orderBy(desc(tools.createdAt))
      .limit(50);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://laudstack.com';
    const buildDate = new Date().toUTCString();

    const items = recentTools.map(
      (tool: { name: string; slug: string; tagline: string; category: string; createdAt: Date }) => `
    <item>
      <title><![CDATA[${tool.name} — ${tool.tagline}]]></title>
      <link>${baseUrl}/tools/${tool.slug}</link>
      <guid isPermaLink="true">${baseUrl}/tools/${tool.slug}</guid>
      <description><![CDATA[${tool.tagline} — Category: ${tool.category}]]></description>
      <pubDate>${tool.createdAt ? new Date(tool.createdAt).toUTCString() : buildDate}</pubDate>
      <category><![CDATA[${tool.category}]]></category>
    </item>`
    ).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LaudStack — Latest SaaS &amp; AI Stacks</title>
    <link>${baseUrl}</link>
    <description>Discover the best SaaS and AI stacks. Real reviews, honest rankings, and fresh launches updated daily.</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/logo-dark-transparent.png</url>
      <title>LaudStack</title>
      <link>${baseUrl}</link>
    </image>
    ${items}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('RSS feed error:', error);
    return NextResponse.json({ error: 'Failed to generate RSS feed' }, { status: 500 });
  }
}
