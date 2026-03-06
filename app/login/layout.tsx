import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in – Mana AI",
  description: "Sign in to Mana AI to create tailored retail pitches powered by AI",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
