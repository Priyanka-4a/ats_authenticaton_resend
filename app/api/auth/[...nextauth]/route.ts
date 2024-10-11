import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Resend } from "resend";
import prisma from "@/prisma/client";
import EmailProvider from "next-auth/providers/email";

const resend = new Resend(process.env.RESEND_API_KEY);

// Moving email generation to a helper function
function generateEmailHtml(magicLink: string) {
  return `
    <html>
      <body>
        <div style="text-align: center; padding: 20px;">
          <h2>Welcome to Our Service!</h2>
          <p>Click the link below to sign in:</p>
          <a href="${magicLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none;">
            Sign in
          </a>
        </div>
      </body>
    </html>
  `;
}

const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      from: "onboarding@resend.dev", // Make sure this is a verified email in Resend
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        try {
          console.log("Sending verification email to:", identifier);

          // Generate the HTML email
          const emailHtml = generateEmailHtml(url);

          // Send the email using Resend
          const response = await resend.emails.send({
            from: provider.from,
            to: identifier,
            subject: "Sign in to your account",
            text: `Sign in to your account by clicking on the link: ${url}`,
            html: emailHtml,
          });

          console.log("Email sent successfully. Response:", response);
        } catch (error) {
          console.error("Error sending email via Resend:", error);
          throw new Error("Failed to send verification email.");
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      return baseUrl;
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
