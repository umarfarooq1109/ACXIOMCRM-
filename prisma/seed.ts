import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database default users and customers...");

  const adminHash = await bcrypt.hash("Admin@123456", 12);
  const managerHash = await bcrypt.hash("Manager@123456", 12);
  const salesHash = await bcrypt.hash("SalesExec@123456", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@acxiomcrm.com" },
    update: {},
    create: {
      name: "Acxiom Administrator",
      email: "admin@acxiomcrm.com",
      phone: "9876543210",
      passwordHash: adminHash,
      role: "Admin",
      isActive: true,
      passwordHistory: { create: { passwordHash: adminHash } },
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@acxiomcrm.com" },
    update: {},
    create: {
      name: "Sales Manager",
      email: "manager@acxiomcrm.com",
      phone: "9876543211",
      passwordHash: managerHash,
      role: "Manager",
      isActive: true,
      passwordHistory: { create: { passwordHash: managerHash } },
    },
  });

  const sales = await prisma.user.upsert({
    where: { email: "sales@acxiomcrm.com" },
    update: {},
    create: {
      name: "Sales Executive",
      email: "sales@acxiomcrm.com",
      phone: "9876543212",
      passwordHash: salesHash,
      role: "SalesExecutive",
      isActive: true,
      passwordHistory: { create: { passwordHash: salesHash } },
    },
  });

  console.log("Users ready. Seeding 25 Indian enterprise customers...");

  const seedCustomers = [
    {
      customerCode: "CUS-000001",
      customerName: "Rajesh Kumar",
      email: "rajesh.kumar@tata.com",
      phone: "9848012345",
      companyName: "Tata Consultancy Services Ltd",
      address: "HITEC City, Phase 2",
      city: "Hyderabad",
      state: "Telangana",
      status: "Active",
      notes: "Key enterprise account for IT services.",
      ownerId: sales.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000002",
      customerName: "Suresh Reddy",
      email: "suresh.r@drreddys.com",
      phone: "9848023456",
      companyName: "Dr. Reddy's Laboratories Ltd",
      address: "Ameerpet Road",
      city: "Hyderabad",
      state: "Telangana",
      status: "Active",
      notes: "Pharma division digital procurement.",
      ownerId: sales.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000003",
      customerName: "Venkat Rao",
      email: "v.rao@aurobindo.com",
      phone: "9848034567",
      companyName: "Aurobindo Pharma Ltd",
      address: "Banjara Hills, Road No. 1",
      city: "Hyderabad",
      state: "Telangana",
      status: "Active",
      notes: "Active buyer for cloud analytics module.",
      ownerId: manager.id,
      createdBy: manager.id,
      modifiedBy: manager.id,
    },
    {
      customerCode: "CUS-000004",
      customerName: "Priya Sharma",
      email: "priya.sharma@infosys.com",
      phone: "9880112233",
      companyName: "Infosys Technologies Ltd",
      address: "Electronic City Phase 1",
      city: "Bengaluru",
      state: "Karnataka",
      status: "Active",
      notes: "Annual software subscription account.",
      ownerId: sales.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000005",
      customerName: "Anand Murthy",
      email: "anand.m@wipro.com",
      phone: "9880223344",
      companyName: "Wipro Digital Solutions",
      address: "Sarjapur Road",
      city: "Bengaluru",
      state: "Karnataka",
      status: "Active",
      notes: "High value deal prospect.",
      ownerId: manager.id,
      createdBy: manager.id,
      modifiedBy: manager.id,
    },
    {
      customerCode: "CUS-000006",
      customerName: "Kavitha Narayanan",
      email: "kavitha.n@biocon.com",
      phone: "9880334455",
      companyName: "Biocon India Ltd",
      address: "Hosur Road",
      city: "Bengaluru",
      state: "Karnataka",
      status: "Prospect",
      notes: "Initial consultation done.",
      ownerId: sales.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000007",
      customerName: "Rohan Mehta",
      email: "rohan.mehta@reliance.com",
      phone: "9820011223",
      companyName: "Reliance Industries Ltd",
      address: "Bandra Kurla Complex",
      city: "Mumbai",
      state: "Maharashtra",
      status: "Active",
      notes: "Enterprise retail portal integration.",
      ownerId: admin.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000008",
      customerName: "Vikram Shah",
      email: "vikram.shah@tcs.com",
      phone: "9820022334",
      companyName: "Tata Motors Ltd",
      address: "Fort Commercial Hub",
      city: "Mumbai",
      state: "Maharashtra",
      status: "Active",
      notes: "Supply chain management software lead.",
      ownerId: manager.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000009",
      customerName: "Sneha Kulkarni",
      email: "sneha.k@hdfcbank.com",
      phone: "9820033445",
      companyName: "HDFC Bank Corporate Office",
      address: "Lower Parel",
      city: "Mumbai",
      state: "Maharashtra",
      status: "Active",
      notes: "Banking CRM partner agreement.",
      ownerId: sales.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000010",
      customerName: "Karthik Subramanian",
      email: "karthik.s@tvs.in",
      phone: "9840011223",
      companyName: "TVS Motor Company",
      address: "Guindy Industrial Estate",
      city: "Chennai",
      state: "Tamil Nadu",
      status: "Active",
      notes: "Automobile spares vendor integration.",
      ownerId: sales.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000011",
      customerName: "Meenakshi Sundaram",
      email: "meena.s@ashokleyland.com",
      phone: "9840022334",
      companyName: "Ashok Leyland Ltd",
      address: "Nungambakkam High Road",
      city: "Chennai",
      state: "Tamil Nadu",
      status: "Prospect",
      notes: "Follow up scheduled for demo.",
      ownerId: manager.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000012",
      customerName: "Arun Prasad",
      email: "arun.p@mrf.com",
      phone: "9840033445",
      companyName: "MRF Tyres India",
      address: "Mount Road",
      city: "Chennai",
      state: "Tamil Nadu",
      status: "Inactive",
      notes: "Deactivated due to contract expiration.",
      ownerId: sales.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000013",
      customerName: "Amit Gupta",
      email: "amit.gupta@airtel.in",
      phone: "9810011223",
      companyName: "Bharti Airtel Telecom",
      address: "Cyber City, DLF Phase 2",
      city: "Delhi NCR",
      state: "Haryana",
      status: "Active",
      notes: "Telecom CRM integration account.",
      ownerId: admin.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000014",
      customerName: "Deepak Verma",
      email: "deepak.v@paytm.com",
      phone: "9810022334",
      companyName: "One97 Communications (Paytm)",
      address: "Sector 16, Noida",
      city: "Delhi NCR",
      state: "Uttar Pradesh",
      status: "Active",
      notes: "Fintech merchant acquiring team.",
      ownerId: sales.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000015",
      customerName: "Neha Agarwal",
      email: "neha.a@zomato.com",
      phone: "9810033445",
      companyName: "Zomato Media Pvt Ltd",
      address: "Golf Course Road",
      city: "Delhi NCR",
      state: "Haryana",
      status: "Prospect",
      notes: "Merchant onboarding automation pitch.",
      ownerId: manager.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000016",
      customerName: "Pradeep Joshi",
      email: "pradeep.j@divislabs.com",
      phone: "9848045678",
      companyName: "Divi's Laboratories Ltd",
      address: "Gachibowli Financial District",
      city: "Hyderabad",
      state: "Telangana",
      status: "Active",
      notes: "Export compliance tracking.",
      ownerId: sales.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000017",
      customerName: "Swati Deshmukh",
      email: "swati.d@persistent.com",
      phone: "9820044556",
      companyName: "Persistent Systems Ltd",
      address: "Hinjawadi IT Park",
      city: "Mumbai",
      state: "Maharashtra",
      status: "Active",
      notes: "Digital transformation consulting.",
      ownerId: manager.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000018",
      customerName: "Balaji R",
      email: "balaji.r@cognizant.com",
      phone: "9840044556",
      companyName: "Cognizant Technology Solutions",
      address: "Old Mahabalipuram Road",
      city: "Chennai",
      state: "Tamil Nadu",
      status: "Active",
      notes: "Global delivery unit agreement.",
      ownerId: sales.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000019",
      customerName: "Gautam Gambhir",
      email: "gautam.g@hero.com",
      phone: "9810044556",
      companyName: "Hero MotoCorp Ltd",
      address: "Vasant Kunj",
      city: "Delhi NCR",
      state: "Delhi NCR",
      status: "Inactive",
      notes: "Account paused for restructuring.",
      ownerId: sales.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000020",
      customerName: "Madhavan N",
      email: "madhavan.n@titan.co.in",
      phone: "9880445566",
      companyName: "Titan Company Ltd",
      address: "Electronic City",
      city: "Bengaluru",
      state: "Karnataka",
      status: "Active",
      notes: "Retail store inventory tracking.",
      ownerId: manager.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000021",
      customerName: "Chiranjeevi Rao",
      email: "chiru.rao@ramco.com",
      phone: "9848056789",
      companyName: "Ramco Cements Ltd",
      address: "Koti Main Road",
      city: "Hyderabad",
      state: "Telangana",
      status: "Prospect",
      notes: "Building material distribution leads.",
      ownerId: sales.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000022",
      customerName: "Pankaj Tripathi",
      email: "pankaj.t@lnt.com",
      phone: "9820055667",
      companyName: "Larsen & Toubro Ltd",
      address: "Powai Commercial Complex",
      city: "Mumbai",
      state: "Maharashtra",
      status: "Active",
      notes: "Heavy engineering division CRM.",
      ownerId: admin.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000023",
      customerName: "Ramesh Babu",
      email: "ramesh.b@mindtree.com",
      phone: "9880556677",
      companyName: "LTIMindtree Digital",
      address: "Whitefield Main Road",
      city: "Bengaluru",
      state: "Karnataka",
      status: "Active",
      notes: "Cloud infrastructure management.",
      ownerId: sales.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000024",
      customerName: "Sanjay Singhania",
      email: "sanjay.s@godrej.com",
      phone: "9820066778",
      companyName: "Godrej & Boyce Mfg Co",
      address: "Vikhroli East",
      city: "Mumbai",
      state: "Maharashtra",
      status: "Prospect",
      notes: "Security solutions sales deal.",
      ownerId: manager.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
    {
      customerCode: "CUS-000025",
      customerName: "Harish Chandra",
      email: "harish.c@bhel.in",
      phone: "9810055667",
      companyName: "Bharat Heavy Electricals Ltd",
      address: "Lodhi Road",
      city: "Delhi NCR",
      state: "Delhi NCR",
      status: "Active",
      notes: "Public sector enterprise account.",
      ownerId: sales.id,
      createdBy: admin.id,
      modifiedBy: admin.id,
    },
  ];

  for (const c of seedCustomers) {
    await prisma.customer.upsert({
      where: { customerCode: c.customerCode },
      update: {},
      create: c,
    });
  }

  console.log("Seeding Leads...");
  const firstCustomer = await prisma.customer.findFirst({ where: { customerCode: "CUS-000001" } });

  const seedLeads = [
    {
      leadCode: "LED-000001",
      leadName: "Vijay Mallya",
      email: "vijay@unitedspirits.in",
      phone: "9876500001",
      companyName: "United Spirits Ltd",
      source: "Website",
      status: "Qualified",
      priority: "High",
      expectedValue: 1200000,
      assignedToId: sales.id,
      notes: "High value enterprise enquiry.",
    },
    {
      leadCode: "LED-000002",
      leadName: "Karan Johar",
      email: "karan@dharma.in",
      phone: "9876500002",
      companyName: "Dharma Productions",
      source: "Referral",
      status: "New",
      priority: "Medium",
      expectedValue: 450000,
      assignedToId: manager.id,
      notes: "Media & entertainment CRM software request.",
    },
    {
      leadCode: "LED-000003",
      leadName: "Aditi Rao",
      email: "aditi@nykaa.com",
      phone: "9876500003",
      companyName: "FSN E-Commerce (Nykaa)",
      source: "LinkedIn",
      status: "Contacted",
      priority: "High",
      expectedValue: 850000,
      assignedToId: sales.id,
      notes: "Beauty retail customer support integration.",
    },
  ];

  for (const l of seedLeads) {
    await prisma.lead.upsert({
      where: { leadCode: l.leadCode },
      update: {},
      create: l,
    });
  }

  console.log("Seeding Opportunities...");
  if (firstCustomer) {
    const seedOpps = [
      {
        opportunityName: "TCS Enterprise License Expansion",
        customerId: firstCustomer.id,
        amount: 2500000,
        stage: "Negotiation",
        probability: 80,
        expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: "Open",
        assignedToId: sales.id,
        notes: "Final legal review of SLA agreement.",
      },
      {
        opportunityName: "Dr. Reddy Pharma Analytics",
        customerId: firstCustomer.id,
        amount: 1500000,
        stage: "Proposal",
        probability: 50,
        expectedCloseDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: "Open",
        assignedToId: manager.id,
        notes: "Technical demo completed.",
      },
    ];

    for (const o of seedOpps) {
      const existing = await prisma.opportunity.findFirst({ where: { opportunityName: o.opportunityName } });
      if (!existing) {
        await prisma.opportunity.create({ data: o });
      }
    }
  }

  console.log("Seeding Follow-ups & Activities...");
  const seedFollowUps = [
    {
      subject: "Q4 Renewal Discussion with TCS",
      followUpType: "Meeting",
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: "Planned",
      remarks: "Review contract pricing and user counts.",
      assignedToId: sales.id,
    },
    {
      subject: "Initial Requirements Call - Nykaa",
      followUpType: "Call",
      followUpDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue
      status: "Planned",
      remarks: "Discuss API integration requirements.",
      assignedToId: sales.id,
    },
  ];

  for (const f of seedFollowUps) {
    const existing = await prisma.followUp.findFirst({ where: { subject: f.subject } });
    if (!existing) {
      await prisma.followUp.create({ data: f });
    }
  }

  console.log("Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
