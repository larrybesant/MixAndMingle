// This is a simplified database client for demonstration purposes
// In a real app, you would use Prisma or another ORM

// Mock database client
export const db = {
  user: {
    findUnique: async ({ where }: { where: any }) => {
      console.log("Finding user:", where)
      // Mock implementation
      if (where.email === "test@example.com") {
        return {
          id: "user_123",
          email: "test@example.com",
          passwordHash: "$2b$12$K8HbN0w.1VLBsLVECXlJGOiPXKdRf2KoNu16yKB5JOp1VUe3UKIFy", // hashed "Password123!"
        }
      }
      return null
    },
    findFirst: async ({ where }: { where: any }) => {
      console.log("Finding user with token:", where)
      // Mock implementation for token verification
      if (where.passwordResetToken && where.passwordResetToken === "valid_token") {
        return {
          id: "user_123",
          email: "test@example.com",
          passwordHash: "$2b$12$K8HbN0w.1VLBsLVECXlJGOiPXKdRf2KoNu16yKB5JOp1VUe3UKIFy",
        }
      }
      return null
    },
    update: async ({ where, data }: { where: any; data: any }) => {
      console.log("Updating user:", where, "with data:", data)
      // Mock implementation
      return {
        id: where.id,
        email: "test@example.com",
        ...data,
      }
    },
  },
  session: {
    deleteMany: async ({ where }: { where: any }) => {
      console.log("Deleting sessions for user:", where)
      // Mock implementation
      return { count: 2 }
    },
  },
  securityLog: {
    create: async ({ data }: { data: any }) => {
      console.log("Creating security log:", data)
      // Mock implementation
      return {
        id: "log_123",
        createdAt: new Date(),
        ...data,
      }
    },
  },
}
