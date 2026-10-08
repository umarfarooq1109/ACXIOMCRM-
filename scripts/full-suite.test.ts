import { PrismaClient } from "@prisma/client";
import { registerUser, loginUser } from "../src/services/auth";
import { createCustomer, listCustomers } from "../src/services/customer";
import { createLead, convertLeadToCustomer } from "../src/services/lead";
import { createOpportunity, changeOpportunityStage } from "../src/services/opportunity";
import { createFollowUp, completeFollowUp } from "../src/services/followup";
import { createActivity } from "../src/services/activity";
import { updateUserRole, unlockUserAccount } from "../src/services/user";
import { getDashboardStats } from "../src/services/dashboard";

const prisma = new PrismaClient();

async function runFullTestSuite() {
  console.log("==================================================");
  console.log("   ACXIOM CRM - AUTOMATED SUITE VERIFICATION     ");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.log(`[FAIL] ${name}:`, err?.stack || err?.message || err);
      failed++;
    }
  }

  // 1. Auth & Admin Seed Verification
  const adminCtx = { id: "", email: "admin@acxiomcrm.com", name: "Admin", role: "Admin" as const, mustChangePassword: false };
  const salesCtx = { id: "", email: "sales@acxiomcrm.com", name: "Sales Exec", role: "SalesExecutive" as const, mustChangePassword: false };

  await test("1. Authenticate Admin User", async () => {
    const user = await loginUser("admin@acxiomcrm.com", "Admin@123456");
    if (!user || user.role !== "Admin") throw new Error("Admin login failed");
    adminCtx.id = user.id;
  });

  await test("2. Authenticate Sales Executive User", async () => {
    const user = await loginUser("sales@acxiomcrm.com", "SalesExec@123456");
    if (!user || user.role !== "SalesExecutive") throw new Error("Sales login failed");
    salesCtx.id = user.id;
  });

  // 2. Account Lockout Protection
  await test("3. Account Lockout Triggering on 5 Failed Logins", async () => {
    const ts = Date.now();
    const randomPhone = "9" + Math.floor(100000000 + Math.random() * 900000000).toString();
    const testEmail = `locktest_${ts}@acxiomcrm.com`;
    await registerUser({
      name: "Lockout Test User",
      email: testEmail,
      phone: randomPhone,
      password: "Complex#987654",
      confirmPassword: "Complex#987654",
    });

    for (let i = 0; i < 5; i++) {
      try {
        await loginUser(testEmail, "WrongPass@123");
      } catch (e) {}
    }

    try {
      await loginUser(testEmail, "Complex#987654");
      throw new Error("Should have been locked out");
    } catch (e: any) {
      if (!e.message.includes("locked")) {
        throw new Error(`Expected lockout message, got: ${e.message}`);
      }
    }
  });

  // 3. Customer Management
  await test("4. Customer Code Auto-Generation & Creation", async () => {
    const ts = Date.now() + "_" + Math.floor(Math.random() * 10000);
    const randomPhone = "9" + Math.floor(100000000 + Math.random() * 900000000).toString();
    const cust = await createCustomer(
      salesCtx,
      {
        customerName: `Client ${ts}`,
        email: `client_${ts}@testcorp.com`,
        phone: randomPhone,
        companyName: `Corp ${ts}`,
        city: "Hyderabad",
        state: "Telangana",
      }
    );
    if (!cust.customerCode.startsWith("CUS-")) throw new Error("Invalid customer code");
  });

  // 4. Lead Management & Conversion
  await test("5. Lead Creation and Sequential Code Assignment", async () => {
    const ts = Date.now() + "_" + Math.floor(Math.random() * 10000);
    const randomPhone = "9" + Math.floor(100000000 + Math.random() * 900000000).toString();
    const lead = await createLead(
      {
        leadName: `Lead Prospect ${ts}`,
        companyName: `Solutions ${ts}`,
        email: `lead_${ts}@prospect.com`,
        phone: randomPhone,
        expectedValue: 350000,
      },
      salesCtx
    );
    if (!lead.leadCode.startsWith("LED-")) throw new Error("Invalid lead code");

    // Convert Lead
    const conversion = await convertLeadToCustomer(
      lead.id,
      { city: "Bengaluru", state: "Karnataka", createOpportunity: true, amount: 450000 },
      salesCtx
    );
    if (!conversion.customer || conversion.customer.customerName !== `Lead Prospect ${ts}`) {
      throw new Error(`Expected customerName 'Lead Prospect ${ts}', got '${conversion.customer?.customerName}'`);
    }
  });

  // 5. Opportunity Validation Rules
  await test("6. Opportunity Rejects Amount <= 0", async () => {
    const customer = await prisma.customer.findFirst();
    if (!customer) throw new Error("No customer found");

    try {
      await createOpportunity(
        {
          opportunityName: "Invalid Deal",
          customerId: customer.id,
          amount: -500,
          expectedCloseDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        },
        salesCtx
      );
      throw new Error("Should have failed negative amount");
    } catch (e: any) {
      if (!e.message.includes("Amount")) throw e;
    }
  });

  await test("7. Opportunity Rejects Past Expected Close Date", async () => {
    const customer = await prisma.customer.findFirst();
    if (!customer) throw new Error("No customer found");

    try {
      await createOpportunity(
        {
          opportunityName: "Past Date Deal",
          customerId: customer.id,
          amount: 100000,
          expectedCloseDate: "2020-01-01",
        },
        salesCtx
      );
      throw new Error("Should have failed past date");
    } catch (e: any) {
      if (!e.message.includes("past")) throw e;
    }
  });

  // 6. Follow-up Validation Rules
  await test("8. Follow-up Rejects Date in the Past", async () => {
    try {
      await createFollowUp(
        {
          subject: "Past Follow-up",
          followUpDate: "2020-01-01",
        },
        salesCtx
      );
      throw new Error("Should have failed past follow-up date");
    } catch (e: any) {
      if (!e.message.includes("today")) throw e;
    }
  });

  // 7. Dashboard Stats Calculation
  await test("9. Dashboard KPIs and Chart Data Generation", async () => {
    const stats = await getDashboardStats(adminCtx);
    if (typeof stats.kpis.totalCustomers !== "number") throw new Error("Invalid stats return");
    if (!stats.charts.leadStatus.labels) throw new Error("Missing chart labels");
  });

  console.log("==================================================");
  console.log(`   TEST RESULTS: ${passed} PASSED | ${failed} FAILED     `);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runFullTestSuite()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
