import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

const toolRows = await sql`SELECT id, slug FROM tools LIMIT 15`;
const existing = await sql`SELECT count(*) FROM reviews`;
if (parseInt(existing[0].count) > 0) {
  console.log("Reviews already exist, skipping.");
  await sql.end();
  process.exit(0);
}

const reviewBodies = [
  { title: "Excellent tool!", body: "This tool has transformed our workflow. Highly recommended for any team.", rating: 5, pros: "Easy to use, great features", cons: "Pricing could be better" },
  { title: "Good but room for improvement", body: "Solid product with good fundamentals. A few rough edges but overall positive experience.", rating: 4, pros: "Good UI, reliable", cons: "Missing some advanced features" },
  { title: "Great value for the price", body: "For what you pay, this is an incredible tool. The free tier is generous enough for most use cases.", rating: 4, pros: "Affordable, feature-rich", cons: "Support could be faster" },
  { title: "Game changer for our team", body: "We have been using this for 6 months and it has completely changed how we work.", rating: 5, pros: "Incredible productivity boost", cons: "Steep learning curve initially" },
  { title: "Decent but not the best", body: "It does what it says but there are better alternatives in the market.", rating: 3, pros: "Simple to start", cons: "Limited integrations" },
];

for (const tool of toolRows) {
  for (let i = 0; i < 3; i++) {
    const review = reviewBodies[i % reviewBodies.length];
    const daysAgo = Math.floor(Math.random() * 90) + 1;
    await sql`
      INSERT INTO reviews (tool_id, rating, title, body, pros, cons, is_verified, helpful_count, created_at, updated_at)
      VALUES (${tool.id}, ${review.rating}, ${review.title}, ${review.body}, ${review.pros}, ${review.cons}, true, ${Math.floor(Math.random() * 50)}, NOW() - ${daysAgo + ' days'}::interval, NOW())
    `;
  }
  console.log("  Reviews for", tool.slug);
}
console.log("Done!");
await sql.end();
