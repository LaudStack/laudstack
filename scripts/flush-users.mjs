/**
 * flush-users.mjs
 * 
 * Flushes ALL user accounts from the database except henrykabak77@gmail.com,
 * sets that account as the only super_admin, and cleans up all related data.
 * Also removes Supabase Auth users via the admin API.
 */
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";

const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }
if (!SUPABASE_URL) { console.error("NEXT_PUBLIC_SUPABASE_URL not set"); process.exit(1); }
if (!SUPABASE_SERVICE_KEY) { console.error("SUPABASE_SERVICE_ROLE_KEY not set"); process.exit(1); }

const SUPER_ADMIN_EMAIL = "henrykabak77@gmail.com";

const sql = postgres(DATABASE_URL, { ssl: "require", max: 1 });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log("=== LaudStack User Flush Script ===\n");

  // Step 1: Find the super-admin user
  const [superAdmin] = await sql`
    SELECT id, email, supabase_id, role FROM users WHERE email = ${SUPER_ADMIN_EMAIL}
  `;

  if (!superAdmin) {
    console.error(`ERROR: User ${SUPER_ADMIN_EMAIL} not found in database!`);
    console.log("Creating a placeholder — you'll need to register this account.");
    // We'll still flush other users
  } else {
    console.log(`Found super-admin: id=${superAdmin.id}, email=${superAdmin.email}, current role=${superAdmin.role}`);
  }

  const superAdminId = superAdmin?.id;

  // Step 2: Get all users to flush (everyone except super-admin)
  const usersToFlush = superAdminId
    ? await sql`SELECT id, email, supabase_id FROM users WHERE id != ${superAdminId}`
    : await sql`SELECT id, email, supabase_id FROM users WHERE email != ${SUPER_ADMIN_EMAIL}`;

  console.log(`\nUsers to flush: ${usersToFlush.length}`);
  for (const u of usersToFlush) {
    console.log(`  - id=${u.id}, email=${u.email}`);
  }

  if (usersToFlush.length === 0) {
    console.log("\nNo users to flush.");
  } else {
    const flushIds = usersToFlush.map(u => u.id);

    console.log("\n--- Step 2a: Nullify non-cascading FK references ---");

    // tools.submitted_by, tools.claimed_by (no cascade)
    const r1 = await sql`UPDATE tools SET submitted_by = NULL WHERE submitted_by = ANY(${flushIds})`;
    console.log(`  tools.submitted_by nullified: ${r1.count}`);
    const r2 = await sql`UPDATE tools SET claimed_by = NULL WHERE claimed_by = ANY(${flushIds})`;
    console.log(`  tools.claimed_by nullified: ${r2.count}`);

    // reviews.user_id (no cascade)
    // Actually let's delete reviews by flushed users entirely
    const r3 = await sql`DELETE FROM review_helpful_votes WHERE review_id IN (SELECT id FROM reviews WHERE user_id = ANY(${flushIds}))`;
    console.log(`  review_helpful_votes deleted: ${r3.count}`);
    const r4 = await sql`DELETE FROM reviews WHERE user_id = ANY(${flushIds})`;
    console.log(`  reviews deleted: ${r4.count}`);

    // reviews.flagged_by, reviews.moderated_by (no cascade)
    const r5 = await sql`UPDATE reviews SET flagged_by = NULL WHERE flagged_by = ANY(${flushIds})`;
    console.log(`  reviews.flagged_by nullified: ${r5.count}`);
    const r6 = await sql`UPDATE reviews SET moderated_by = NULL WHERE moderated_by = ANY(${flushIds})`;
    console.log(`  reviews.moderated_by nullified: ${r6.count}`);

    // outbound_clicks.user_id (no cascade)
    const r7 = await sql`DELETE FROM outbound_clicks WHERE user_id = ANY(${flushIds})`;
    console.log(`  outbound_clicks deleted: ${r7.count}`);

    // tool_views.user_id (no cascade — check)
    const r7b = await sql`DELETE FROM tool_views WHERE user_id = ANY(${flushIds})`;
    console.log(`  tool_views deleted: ${r7b.count}`);

    // upvotes (no cascade)
    const r8 = await sql`DELETE FROM upvotes WHERE user_id = ANY(${flushIds})`;
    console.log(`  upvotes deleted: ${r8.count}`);

    // saved_tools (no cascade)
    const r9 = await sql`DELETE FROM saved_tools WHERE user_id = ANY(${flushIds})`;
    console.log(`  saved_tools deleted: ${r9.count}`);

    // review_rate_limits (no cascade)
    const r10 = await sql`DELETE FROM review_rate_limits WHERE user_id = ANY(${flushIds})`;
    console.log(`  review_rate_limits deleted: ${r10.count}`);

    // laud_rate_limits (no cascade)
    const r11 = await sql`DELETE FROM laud_rate_limits WHERE user_id = ANY(${flushIds})`;
    console.log(`  laud_rate_limits deleted: ${r11.count}`);

    // tool_submissions.created_by (no cascade)
    const r12 = await sql`
      DELETE FROM tool_screenshots WHERE submission_id IN (SELECT id FROM tool_submissions WHERE created_by = ANY(${flushIds}))
    `;
    console.log(`  tool_screenshots (submissions) deleted: ${r12.count}`);
    const r13 = await sql`DELETE FROM tool_submissions WHERE created_by = ANY(${flushIds})`;
    console.log(`  tool_submissions deleted: ${r13.count}`);

    // comments (cascade on user_id)
    const r14 = await sql`DELETE FROM comments WHERE user_id = ANY(${flushIds})`;
    console.log(`  comments deleted: ${r14.count}`);

    // deal_claims (cascade on user_id)
    const r15 = await sql`DELETE FROM deal_claims WHERE user_id = ANY(${flushIds})`;
    console.log(`  deal_claims deleted: ${r15.count}`);

    // tool_claims (no cascade)
    const r16 = await sql`DELETE FROM tool_claims WHERE user_id = ANY(${flushIds})`;
    console.log(`  tool_claims deleted: ${r16.count}`);

    // marketplace_products.created_by (no cascade)
    // First clean marketplace orders/offers/reviews that reference products by flushed users
    const flushProductIds = await sql`SELECT id FROM marketplace_products WHERE created_by = ANY(${flushIds})`;
    if (flushProductIds.length > 0) {
      const pIds = flushProductIds.map(p => p.id);
      await sql`DELETE FROM marketplace_reviews WHERE product_id = ANY(${pIds})`;
      await sql`DELETE FROM marketplace_offers WHERE product_id = ANY(${pIds})`;
      await sql`DELETE FROM marketplace_orders WHERE product_id = ANY(${pIds})`;
      const r17 = await sql`DELETE FROM marketplace_products WHERE created_by = ANY(${flushIds})`;
      console.log(`  marketplace_products deleted: ${r17.count}`);
    }

    // marketplace_orders.buyer_id (cascade)
    const r18 = await sql`DELETE FROM marketplace_orders WHERE buyer_id = ANY(${flushIds})`;
    console.log(`  marketplace_orders (buyer) deleted: ${r18.count}`);

    // marketplace_offers.buyer_id (cascade)
    const r19 = await sql`DELETE FROM marketplace_offers WHERE buyer_id = ANY(${flushIds})`;
    console.log(`  marketplace_offers (buyer) deleted: ${r19.count}`);

    // marketplace_reviews.reviewer_id (cascade)
    const r20 = await sql`DELETE FROM marketplace_reviews WHERE reviewer_id = ANY(${flushIds})`;
    console.log(`  marketplace_reviews deleted: ${r20.count}`);

    // marketplace_products.reviewed_by (no cascade)
    const r21 = await sql`UPDATE marketplace_products SET reviewed_by = NULL WHERE reviewed_by = ANY(${flushIds})`;
    console.log(`  marketplace_products.reviewed_by nullified: ${r21.count}`);

    // notifications (cascade on user_id, set null on actor_id)
    const r22 = await sql`DELETE FROM notifications WHERE user_id = ANY(${flushIds})`;
    console.log(`  notifications deleted: ${r22.count}`);
    const r23 = await sql`UPDATE notifications SET actor_id = NULL WHERE actor_id = ANY(${flushIds})`;
    console.log(`  notifications.actor_id nullified: ${r23.count}`);

    // user_follows (cascade)
    const r24 = await sql`DELETE FROM user_follows WHERE follower_id = ANY(${flushIds}) OR following_id = ANY(${flushIds})`;
    console.log(`  user_follows deleted: ${r24.count}`);

    // stack_follows (cascade)
    const r25 = await sql`DELETE FROM stack_follows WHERE user_id = ANY(${flushIds})`;
    console.log(`  stack_follows deleted: ${r25.count}`);

    // launch_notifications (cascade)
    const r26 = await sql`DELETE FROM launch_notifications WHERE user_id = ANY(${flushIds})`;
    console.log(`  launch_notifications deleted: ${r26.count}`);

    // promotions.user_id, promotions.admin_id (no cascade)
    const r27 = await sql`UPDATE promotions SET user_id = NULL WHERE user_id = ANY(${flushIds})`;
    console.log(`  promotions.user_id nullified: ${r27.count}`);
    const r28 = await sql`UPDATE promotions SET admin_id = NULL WHERE admin_id = ANY(${flushIds})`;
    console.log(`  promotions.admin_id nullified: ${r28.count}`);

    // tool_upgrades.user_id (no cascade)
    const r29 = await sql`UPDATE tool_upgrades SET user_id = NULL WHERE user_id = ANY(${flushIds})`;
    console.log(`  tool_upgrades.user_id nullified: ${r29.count}`);

    // admin_audit_log.admin_id (no cascade)
    const r30 = await sql`UPDATE admin_audit_log SET admin_id = NULL WHERE admin_id = ANY(${flushIds})`;
    console.log(`  admin_audit_log.admin_id nullified: ${r30.count}`);

    // email_verifications (no cascade check)
    const r31 = await sql`DELETE FROM email_verifications WHERE user_id = ANY(${flushIds})`;
    console.log(`  email_verifications deleted: ${r31.count}`);

    // contact_submissions (no user FK typically, but check)
    // moderation_logs (no cascade check)
    try {
      const r32 = await sql`DELETE FROM moderation_logs WHERE moderator_id = ANY(${flushIds})`;
      console.log(`  moderation_logs deleted: ${r32.count}`);
    } catch (e) { console.log("  moderation_logs: skipped (no matching column)"); }

    console.log("\n--- Step 2b: Delete user records ---");
    const r33 = await sql`DELETE FROM users WHERE id = ANY(${flushIds})`;
    console.log(`  Users deleted: ${r33.count}`);

    // Step 3: Clean Supabase Auth
    console.log("\n--- Step 3: Clean Supabase Auth users ---");
    let authDeleted = 0;
    let authFailed = 0;
    for (const u of usersToFlush) {
      if (u.supabase_id) {
        try {
          const { error } = await supabase.auth.admin.deleteUser(u.supabase_id);
          if (error) {
            console.log(`  WARN: Failed to delete Supabase auth for ${u.email}: ${error.message}`);
            authFailed++;
          } else {
            authDeleted++;
          }
        } catch (e) {
          console.log(`  WARN: Exception deleting Supabase auth for ${u.email}: ${e.message}`);
          authFailed++;
        }
      }
    }
    console.log(`  Supabase Auth deleted: ${authDeleted}, failed: ${authFailed}`);
  }

  // Step 4: Set super-admin role
  if (superAdminId) {
    console.log("\n--- Step 4: Set super-admin role ---");
    await sql`UPDATE users SET role = 'super_admin', updated_at = NOW() WHERE id = ${superAdminId}`;
    console.log(`  ${SUPER_ADMIN_EMAIL} set to super_admin`);
  }

  // Step 5: Verify final state
  console.log("\n--- Final State ---");
  const remaining = await sql`SELECT id, email, role FROM users ORDER BY id`;
  console.log(`Total users remaining: ${remaining.length}`);
  for (const u of remaining) {
    console.log(`  id=${u.id}, email=${u.email}, role=${u.role}`);
  }

  await sql.end();
  console.log("\n=== Flush complete ===");
}

main().catch(e => {
  console.error("FATAL:", e);
  process.exit(1);
});
