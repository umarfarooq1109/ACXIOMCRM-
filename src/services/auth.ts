import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { APP_CONFIG } from "@/lib/config";
import { AppError } from "@/lib/errors";
import { recordAuditLog } from "@/services/audit";
import { registerSchema, changePasswordSchema } from "@/schemas/auth";

const DUMMY_HASH = "$2a$12$eImiTXuWVxfM37uY4JANjO5E/s.O9b8gO0Z5PZ.30w1y5pZ8x6fK"; // Pre-calculated bcrypt cost 12

export async function loginUser(
  emailInput: string,
  passwordInput: string,
  ipAddress?: string,
  userAgent?: string
) {
  const email = emailInput.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    include: { passwordHistory: true },
  });

  // Equal-time hash comparison for unknown email (prevents email enumeration attack)
  if (!user) {
    await bcrypt.compare(passwordInput, DUMMY_HASH);
    await recordAuditLog({
      action: "LOGIN_FAILURE",
      entityName: "User",
      result: "Failure",
      ipAddress,
      userAgent,
      newValue: { emailAttempted: email, reason: "Invalid credentials" },
    });
    throw new AppError("Invalid email address or password.", 401);
  }

  // Check account active state
  if (!user.isActive) {
    await recordAuditLog({
      userId: user.id,
      action: "LOGIN_FAILURE",
      entityName: "User",
      recordId: user.id,
      result: "Failure",
      ipAddress,
      userAgent,
      newValue: { reason: "Account inactive" },
    });
    throw new AppError("Your account has been deactivated. Please contact your administrator.", 403);
  }

  // Check lockout status
  const now = new Date();
  if (user.lockoutEnd && user.lockoutEnd > now) {
    const lockTimeStr = user.lockoutEnd.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    await recordAuditLog({
      userId: user.id,
      action: "LOGIN_LOCKOUT_BLOCKED",
      entityName: "User",
      recordId: user.id,
      result: "Failure",
      ipAddress,
      userAgent,
    });
    throw new AppError(
      `Account locked until ${lockTimeStr}. Try again later or contact your administrator.`,
      403
    );
  }

  // Auto-clear expired lockout
  if (user.lockoutEnd && user.lockoutEnd <= now) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockoutEnd: null },
    });
  }

  // Compare password
  const isMatch = await bcrypt.compare(passwordInput, user.passwordHash);

  if (!isMatch) {
    const newCount = user.failedLoginCount + 1;
    let lockoutEnd: Date | null = null;

    if (newCount >= APP_CONFIG.accountLockoutThreshold) {
      lockoutEnd = new Date(now.getTime() + APP_CONFIG.accountLockoutMinutes * 60 * 1000);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: newCount,
        lockoutEnd,
      },
    });

    if (lockoutEnd) {
      const lockTimeStr = lockoutEnd.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      await recordAuditLog({
        userId: user.id,
        action: "LOCKOUT",
        entityName: "User",
        recordId: user.id,
        result: "Failure",
        ipAddress,
        userAgent,
      });
      throw new AppError(
        `Account locked until ${lockTimeStr}. Try again later or contact your administrator.`,
        403
      );
    }

    await recordAuditLog({
      userId: user.id,
      action: "LOGIN_FAILURE",
      entityName: "User",
      recordId: user.id,
      result: "Failure",
      ipAddress,
      userAgent,
    });
    throw new AppError("Invalid email address or password.", 401);
  }

  // Successful Login: reset failed count, set lastLoginAt
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginCount: 0,
      lockoutEnd: null,
      lastLoginAt: now,
    },
  });

  await recordAuditLog({
    userId: user.id,
    action: "LOGIN_SUCCESS",
    entityName: "User",
    recordId: user.id,
    result: "Success",
    ipAddress,
    userAgent,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as "Admin" | "Manager" | "SalesExecutive",
    mustChangePassword: user.mustChangePassword,
  };
}

export async function registerUser(
  input: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
  },
  ipAddress?: string,
  userAgent?: string
) {
  const validated = registerSchema.parse(input);
  const email = validated.email.toLowerCase();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError("An account with this email address already exists.", 400);
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(validated.password, salt);

  // Forced server-side role assignment to SalesExecutive
  const newUser = await prisma.user.create({
    data: {
      name: validated.name,
      email,
      phone: validated.phone || null,
      passwordHash,
      role: "SalesExecutive",
      isActive: true,
      passwordHistory: {
        create: {
          passwordHash,
        },
      },
    },
  });

  await recordAuditLog({
    userId: newUser.id,
    action: "REGISTER",
    entityName: "User",
    recordId: newUser.id,
    result: "Success",
    ipAddress,
    userAgent,
    newValue: { email: newUser.email, role: newUser.role },
  });

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role as "SalesExecutive",
    mustChangePassword: newUser.mustChangePassword,
  };
}

export async function changeUserPassword(
  userId: string,
  input: { currentPassword: string; newPassword: string; confirmPassword: string },
  ipAddress?: string,
  userAgent?: string
) {
  const validated = changePasswordSchema.parse(input);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { passwordHistory: { orderBy: { createdAt: "desc" }, take: 3 } },
  });

  if (!user) throw new AppError("User account not found.", 404);

  const currentMatch = await bcrypt.compare(validated.currentPassword, user.passwordHash);
  if (!currentMatch) throw new AppError("Current password is incorrect.", 400);

  // Password history check (prevent reuse of last 3 passwords)
  for (const item of user.passwordHistory) {
    const isReused = await bcrypt.compare(validated.newPassword, item.passwordHash);
    if (isReused) {
      throw new AppError("You cannot reuse any of your last 3 passwords.", 400);
    }
  }

  const salt = await bcrypt.genSalt(12);
  const newPasswordHash = await bcrypt.hash(validated.newPassword, salt);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false,
      },
    }),
    prisma.passwordHistory.create({
      data: {
        userId,
        passwordHash: newPasswordHash,
      },
    }),
  ]);

  await recordAuditLog({
    userId,
    action: "PASSWORD_CHANGE",
    entityName: "User",
    recordId: userId,
    result: "Success",
    ipAddress,
    userAgent,
  });
}

export async function unlockUserAccount(userId: string, adminUserId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginCount: 0,
      lockoutEnd: null,
    },
  });

  await recordAuditLog({
    userId: adminUserId,
    action: "UNLOCK",
    entityName: "User",
    recordId: userId,
    result: "Success",
    newValue: { unlockedUserEmail: user.email },
  });

  return user;
}
