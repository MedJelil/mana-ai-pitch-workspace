import {
  emailOTPClient,
  magicLinkClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { auth } from ".";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    emailOTPClient(),
    magicLinkClient(),
  ],
});
