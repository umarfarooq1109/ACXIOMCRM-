import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export interface CreateAuditLogParams {
  userId?: string | null;
  action: string;
  entityName: string;
  recordId?: string | null;
  oldValue?: any;
  newValue?: any;
  result?: "Success" | "Failure";
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function recordAuditLog(params: CreateAuditLogParams) {
  try {
    const cleanOldValue = params.oldValue
      ? JSON.stringify(redactSensitiveFields(params.oldValue))
      : null;
    const cleanNewValue = params.newValue
      ? JSON.stringify(redactSensitiveFields(params.newValue))
      : null;

    const auditEntry = await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entityName: params.entityName,
        recordId: params.recordId || null,
        oldValue: cleanOldValue,
        newValue: cleanNewValue,
        result: params.result || "Success",
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });

    logger.info("Audit log recorded", {
      auditId: auditEntry.id,
      action: params.action,
      entityName: params.entityName,
      userId: params.userId,
      result: params.result,
    });

    return auditEntry;
  } catch (error) {
    logger.error("Failed to record audit log", { error, action: params.action });
    // Fail silently in audit log creation to prevent blocking primary business operations
    return null;
  }
}

function redactSensitiveFields(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  const sensitiveKeys = ["password", "passwordHash", "confirmPassword", "token", "secret", "hash"];

  for (const key of Object.keys(clone)) {
    if (sensitiveKeys.includes(key)) {
      clone[key] = "[REDACTED]";
    } else if (typeof clone[key] === "object") {
      clone[key] = redactSensitiveFields(clone[key]);
    }
  }

  return clone;
}
