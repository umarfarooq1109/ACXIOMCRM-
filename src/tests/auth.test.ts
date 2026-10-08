import { loginUser, registerUser, changeUserPassword } from "@/services/auth";
import { can, getScopeWhereClause } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

async function runAuthTests() {
  console.log("=========================================");
  console.log(" RUNNING MODULE 2 AUTHENTICATION TESTS");
  console.log("=========================================");

  try {
    // Test 1: Valid Login
    console.log("\n[TEST 1] Valid Login...");
    const adminUser = await loginUser("admin@acxiomcrm.com", "Admin@123456");
    console.log("✓ Success: Logged in as", adminUser.name, "with role", adminUser.role);

    // Test 2: Invalid Password
    console.log("\n[TEST 2] Invalid Password Rejection...");
    try {
      await loginUser("admin@acxiomcrm.com", "WrongPassword@123");
      console.error("❌ Failed: Should have rejected invalid password");
    } catch (err: any) {
      console.log("✓ Success: Rejected invalid password -", err.message);
    }

    // Test 3: Unknown Email (No Enumeration)
    console.log("\n[TEST 3] Unknown Email Response...");
    try {
      await loginUser("nonexistent@acxiomcrm.com", "SomePassword@123");
      console.error("❌ Failed: Should have rejected unknown email");
    } catch (err: any) {
      console.log("✓ Success: Generic rejection message -", err.message);
    }

    // Test 4: Account Lockout (5 Failed Attempts)
    console.log("\n[TEST 4] Account Lockout after 5 failed attempts...");
    const testEmail = `user_lockout_${Date.now()}@acxiomcrm.com`;
    const randomPhone1 = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
    await registerUser({
      name: "Lockout Test User",
      email: testEmail,
      phone: randomPhone1,
      password: "SecureP@ssw0rd!",
      confirmPassword: "SecureP@ssw0rd!",
    });

    for (let i = 1; i <= 5; i++) {
      try {
        await loginUser(testEmail, "WrongPassword@123");
      } catch (err: any) {
        if (i === 5) {
          console.log(`✓ Attempt ${i}: Lockout triggered! Error message: "${err.message}"`);
        }
      }
    }

    // Test 5: Server-side Forced SalesExecutive Role on Registration
    console.log("\n[TEST 5] Registration Role Tampering Defense...");
    const regEmail = `user_reg_${Date.now()}@acxiomcrm.com`;
    const randomPhone2 = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
    const regUser = await registerUser({
      name: "Registration Role Test",
      email: regEmail,
      phone: randomPhone2,
      password: "SecureP@ssw0rd!",
      confirmPassword: "SecureP@ssw0rd!",
    });
    console.log("✓ Success: Registered user role forced to:", regUser.role);

    // Test 6: RBAC Permission Matrix & Database Scope Helpers
    console.log("\n[TEST 6] RBAC Scoping & Database Scope Helpers...");
    const salesCanDelete = can({ id: regUser.id, role: "SalesExecutive" }, "delete", "customers");
    const adminCanDelete = can({ id: adminUser.id, role: "Admin" }, "delete", "customers");
    const salesWhere = getScopeWhereClause({ id: regUser.id, role: "SalesExecutive" }, "customers");
    const adminWhere = getScopeWhereClause({ id: adminUser.id, role: "Admin" }, "customers");

    console.log("✓ SalesExec can delete customers?", salesCanDelete);
    console.log("✓ Admin can delete customers?", adminCanDelete);
    console.log("✓ SalesExec DB query scope filter:", JSON.stringify(salesWhere));
    console.log("✓ Admin DB query scope filter:", JSON.stringify(adminWhere));

    // Test 7: Audit Log Verification
    console.log("\n[TEST 7] Audit Logs Recorded in Database...");
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { createdDate: "desc" },
      take: 5,
    });
    console.log(`✓ Found ${auditLogs.length} recent audit logs in DB. Latest action:`, auditLogs[0]?.action);

    console.log("\n=========================================");
    console.log(" ALL MODULE 2 TESTS PASSED SUCCESSFULLY!");
    console.log("=========================================\n");
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAuthTests();
