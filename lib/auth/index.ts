import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendOtpEmail } from "@/emails";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { bearer } from "better-auth/plugins/bearer";
import { emailOTP } from "better-auth/plugins/email-otp";
import { magicLink } from "better-auth/plugins/magic-link";

const appOrigin = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
if (!appOrigin) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}

const isDev = process.env.NODE_ENV === "development";

export const magicLinkStore = new Map<
  string,
  {
    resolve: (url: string) => void;
    reject: (error: Error) => void;
  }
>();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  trustedOrigins: [appOrigin, "*"],
  advanced: {
    database: {
      generateId: false,
    },
    defaultCookieAttributes: {
      sameSite: isDev ? "lax" : "none",
      secure: !isDev,
      partitioned: !isDev,
    },
  },

  plugins: [
    emailOTP({
      expiresIn: 10 * 60,
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "sign-in") return;
        if (isDev) {
          console.log("================================================");
          console.log("[Mana AI] OTP for", email, ":", otp);
          console.log("================================================");
          return;
        }
        await sendOtpEmail(email, otp);
      },
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const stored = magicLinkStore.get(email);
        if (stored) {
          stored.resolve(url);
          magicLinkStore.delete(email);
        }
      },
    }),
    bearer(),
    nextCookies(),
  ],
});
