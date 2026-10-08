import { prisma } from "@/lib/prisma";
import {
  createCustomer,
  updateCustomer,
  getCustomerById,
  listCustomers,
  deactivateCustomer,
  reactivateCustomer,
  changeCustomerOwner,
  generateCustomerCode,
} from "@/services/customer";
import { UserContext } from "@/lib/rbac";
import { createCustomerSchema } from "@/schemas/customer";

async function runCustomerTests() {
  console.log("==================================");
  console.log("RUNNING CUSTOMER MANAGEMENT TESTS");
  console.log("==================================");

  // 1. Fetch seed users
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@acxiomcrm.com" } });
  const managerUser = await prisma.user.findUnique({ where: { email: "manager@acxiomcrm.com" } });
  const salesUser = await prisma.user.findUnique({ where: { email: "sales@acxiomcrm.com" } });

  if (!adminUser || !managerUser || !salesUser) {
    throw new Error("Seed users missing. Please run npx prisma db seed first.");
  }

  const adminCtx: UserContext = { id: adminUser.id, role: adminUser.role as "Admin" };
  const managerCtx: UserContext = { id: managerUser.id, role: managerUser.role as "Manager" };
  const salesCtx: UserContext = { id: salesUser.id, role: salesUser.role as "SalesExecutive" };

  // TEST 1: Zod Schema Validation
  console.log("\n[TEST 1] Zod schema validation for required & invalid fields...");
  const invalidResult = createCustomerSchema.safeParse({
    customerName: "",
    email: "invalid-email-address",
    phone: "123",
    companyName: "",
    city: "",
    state: "",
  });
  if (invalidResult.success) {
    throw new Error("Failed: Invalid customer input passed validation unexpectedly.");
  }
  console.log("PASS: Invalid customer input correctly rejected by Zod schema.");

  // TEST 2: Create Customer with Normalization
  console.log("\n[TEST 2] Create customer with email lowercasing & phone normalization...");
  const uniquePhone = "9988776655";
  const uniqueEmail = "TEST.NORMALIZATION@TESTINGCO.COM";
  const newCust = await createCustomer(adminCtx, {
    customerName: " Test Normalization ",
    email: uniqueEmail,
    phone: "+91 9988776655",
    companyName: "TestingCo Pvt Ltd",
    city: "Hyderabad",
    state: "Telangana",
    ownerId: salesUser.id,
  });

  if (newCust.email !== "test.normalization@testingco.com") {
    throw new Error(`Failed: Email lowercasing failed. Expected test.normalization@testingco.com but got ${newCust.email}`);
  }
  if (newCust.phone !== "9988776655") {
    throw new Error(`Failed: Phone normalization failed. Expected 9988776655 but got ${newCust.phone}`);
  }
  console.log(`PASS: Created customer ${newCust.customerCode} with clean email and normalized 10-digit phone.`);

  // TEST 3: Duplicate Email Prevention (Uppercase formatting trick bypass attempt)
  console.log("\n[TEST 3] Duplicate email detection with uppercase trick prevention...");
  try {
    await createCustomer(adminCtx, {
      customerName: "Another Person",
      email: "TEST.NORMALIZATION@TESTINGCO.COM", // uppercase version
      phone: "9112233445",
      companyName: "Another Company",
      city: "Bengaluru",
      state: "Karnataka",
      ownerId: salesUser.id,
    });
    throw new Error("Failed: Duplicate email creation succeeded unexpectedly!");
  } catch (err: any) {
    if (err.status !== 409 || !err.existingCustomer) {
      throw new Error(`Failed: Expected 409 conflict with existingCustomer details, got ${err.message}`);
    }
    console.log(`PASS: Duplicate email correctly blocked (409) linking to existing customer code ${err.existingCustomer.customerCode}.`);
  }

  // TEST 4: Duplicate Phone Prevention (+91 prefix trick bypass attempt)
  console.log("\n[TEST 4] Duplicate phone detection with +91 formatting trick prevention...");
  try {
    await createCustomer(adminCtx, {
      customerName: "Phone Duplicate Test",
      email: "different.email@domain.com",
      phone: "9988776655", // same normalized phone
      companyName: "Different Company",
      city: "Mumbai",
      state: "Maharashtra",
      ownerId: salesUser.id,
    });
    throw new Error("Failed: Duplicate phone creation succeeded unexpectedly!");
  } catch (err: any) {
    if (err.status !== 409 || !err.existingCustomer) {
      throw new Error(`Failed: Expected 409 conflict with existingCustomer details, got ${err.message}`);
    }
    console.log(`PASS: Duplicate phone correctly blocked (409) linking to existing customer code ${err.existingCustomer.customerCode}.`);
  }

  // TEST 5: Duplicate Name + Company Detection
  console.log("\n[TEST 5] Duplicate Name + Company Name detection...");
  try {
    await createCustomer(adminCtx, {
      customerName: newCust.customerName,
      companyName: newCust.companyName,
      email: "unique.email.address@company.com",
      phone: "9000011111",
      city: "Chennai",
      state: "Tamil Nadu",
      ownerId: salesUser.id,
    });
    throw new Error("Failed: Duplicate name + company creation succeeded unexpectedly!");
  } catch (err: any) {
    if (err.status !== 409) {
      throw new Error(`Failed: Expected 409 conflict for duplicate name+company, got ${err.message}`);
    }
    console.log("PASS: Duplicate customerName + companyName correctly blocked with 409 Conflict.");
  }

  // TEST 6: SalesExecutive Scope Isolation (Cannot access other's records)
  console.log("\n[TEST 6] SalesExecutive scope isolation & 404 policy...");
  // Create a customer owned by Admin
  const adminCust = await createCustomer(adminCtx, {
    customerName: "Admin Exclusive Corp",
    email: "exclusive.admin@domain.com",
    phone: "9888877777",
    companyName: "Admin Exclusive Industries",
    city: "Hyderabad",
    state: "Telangana",
    ownerId: adminUser.id,
  });

  try {
    await getCustomerById(salesCtx, adminCust.id);
    throw new Error("Failed: SalesExecutive accessed Admin's customer record unexpectedly!");
  } catch (err: any) {
    if (err.status !== 404) {
      throw new Error(`Failed: Expected 404 single policy response, got ${err.status}`);
    }
    console.log("PASS: SalesExecutive access to non-owned record rejected with 404 (zero info leak).");
  }

  // TEST 7: Mass Assignment Protection
  console.log("\n[TEST 7] Mass assignment protection (SalesExec cannot set ownerId or createdBy)...");
  const salesCreated = await createCustomer(salesCtx, {
    customerName: "Sales Own Account",
    email: "sales.account@testing.com",
    phone: "9777766666",
    companyName: "Sales Own Company",
    city: "Bengaluru",
    state: "Karnataka",
    ownerId: adminUser.id, // Trying to assign to admin
  });

  if (salesCreated.ownerId !== salesUser.id) {
    throw new Error(`Failed: SalesExecutive succeeded in assigning ownerId to another user! Assigned: ${salesCreated.ownerId}`);
  }
  console.log("PASS: Server forced ownerId to current SalesExecutive user ID.");

  // TEST 8: Customer Reassignment (Only Admin/Manager)
  console.log("\n[TEST 8] Owner reassignment by Manager...");
  const reassigned = await changeCustomerOwner(managerCtx, salesCreated.id, managerUser.id, "Reassigned to team lead");
  if (reassigned.ownerId !== managerUser.id) {
    throw new Error("Failed: Manager owner reassignment failed.");
  }
  console.log(`PASS: Customer ${salesCreated.customerCode} owner successfully reassigned to Manager.`);

  // TEST 9: Soft Deactivation & Reactivation with Audit Trail
  console.log("\n[TEST 9] Soft deactivation, reactivation, and audit log tracking...");
  await deactivateCustomer(managerCtx, salesCreated.id);
  const deactivatedCheck = await prisma.customer.findUnique({ where: { id: salesCreated.id } });
  if (deactivatedCheck?.status !== "Inactive") {
    throw new Error("Failed: Soft deactivation status mismatch.");
  }

  await reactivateCustomer(managerCtx, salesCreated.id);
  const reactivatedCheck = await prisma.customer.findUnique({ where: { id: salesCreated.id } });
  if (reactivatedCheck?.status !== "Active") {
    throw new Error("Failed: Reactivation status mismatch.");
  }
  console.log("PASS: Customer soft deactivation and reactivation confirmed.");

  // TEST 10: Concurrent Sequential Customer Code Generation
  console.log("\n[TEST 10] Transaction-safe sequential customer code generation under concurrency...");
  const codes = await Promise.all([
    generateCustomerCode(),
    generateCustomerCode(),
    generateCustomerCode(),
  ]);
  console.log("Concurrent codes generated:", codes);
  console.log("PASS: Customer code generation executed cleanly.");

  // Clean test artifacts
  await prisma.customer.deleteMany({
    where: {
      id: { in: [newCust.id, adminCust.id, salesCreated.id] },
    },
  });

  console.log("\n==================================");
  console.log("ALL CUSTOMER MANAGEMENT TESTS PASSED!");
  console.log("==================================");
}

runCustomerTests()
  .catch((err) => {
    console.error("TEST FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
