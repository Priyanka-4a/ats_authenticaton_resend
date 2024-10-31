

// export { handler as GET, handler as POST };
import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import EmailProvider from "next-auth/providers/email";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      from: "onboarding@resend.dev",
      sendVerificationRequest: async ({ identifier, url }) => {
        console.log("Login link for", identifier, ":", url);
        // Log email link for dev/testing; no actual email sent
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id; // Add user ID to token
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId; // Make user ID available in session
      }
      return session;
    },
  },
  session: {
    strategy: "jwt" as const,
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
