"use server";
import { headers } from "next/headers";
import { auth } from ".";

export const getSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
};

/** Use in API Route Handlers: pass request.headers to get the current session */
export async function getSessionFromHeaders(requestHeaders: Headers) {
  return auth.api.getSession({ headers: requestHeaders });
}
