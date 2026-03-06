import {
  Html,
  Body,
  Container,
  Text,
  Link,
  Img,
  Section,
  Head,
  Tailwind,
  pixelBasedPreset,
} from "@react-email/components";

interface OtpVerificationProps {
  otp?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mana-ai.com";

export const OtpVerification = ({ otp = "{{otp}}" }: OtpVerificationProps) => {
  return (
    <Html>
      <Head />
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                primary: "#0f766e",
                secondary: "#0d9488",
                gray: {
                  50: "#f8fafc",
                  100: "#f1f5f9",
                  400: "#94a3b8",
                  500: "#64748b",
                  700: "#334155",
                  900: "#0f172a",
                },
              },
            },
          },
        }}
      >
        <Body className="bg-white font-sans leading-relaxed text-gray-900">
          <Container className="mx-auto max-w-[600px] p-0">
            <Section className="px-6 py-4 flex flex-col items-center justify-center text-center">
              <Img
                src={`${baseUrl}/logo.svg`}
                alt="Mana AI"
                className="mx-auto max-w-[350px]"
              />
            </Section>

            {/* Main Content */}
            <Section className="px-6 py-12">
              <Text className="mb-3 mt-0 text-[26px] font-bold leading-tight text-gray-900">
                Verify your email
              </Text>

              <Text className="mb-8 mt-0 text-base font-medium text-gray-500">
                Use the code below to sign in to Mana AI and create tailored
                retail pitches.
              </Text>

              {/* OTP Display */}
              <Section
                className="my-8 rounded-xl border-2 border-primary/30 px-6 py-8 text-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(15, 118, 110, 0.08) 0%, rgba(13, 148, 136, 0.08) 100%)",
                  borderColor: "rgba(15, 118, 110, 0.25)",
                }}
              >
                <Text className="m-0 font-mono text-[48px] font-bold tracking-widest text-primary">
                  {otp}
                </Text>
              </Section>

              <Text className="my-6 text-[15px] leading-relaxed text-gray-700">
                Enter this code on the login page to continue. If you
                didn&apos;t request this, you can ignore this email or contact
                support.
              </Text>

              {/* Action Section */}
              <Section className="my-6 rounded-lg bg-gray-50 px-5 py-5">
                <Text className="my-2 text-[13px] font-medium text-primary">
                  ✓ Code expires in 10 minutes
                </Text>
                <Text className="my-2 text-[13px] font-medium text-primary">
                  ✓ Valid for one use only
                </Text>
                <Text className="my-2 text-[13px] font-medium text-primary">
                  ✓ Never share this code with anyone
                </Text>
              </Section>

              <Text className="mt-6 text-[13px] italic text-gray-500">
                Didn&apos;t request this?{" "}
                <Link
                  href="mailto:support@mana-ai.com"
                  className="font-semibold text-primary no-underline"
                >
                  Contact support
                </Link>
              </Text>
            </Section>

            {/* Footer */}
            <Section className="border-t border-gray-100 bg-gray-50 px-6 py-8 text-center">
              <Text className="mb-2 mt-0 text-xs text-gray-500">
                Mana AI · Pitch Workspace
              </Text>
              <Text className="my-2 text-xs">
                <Link
                  href="mailto:support@mana-ai.com"
                  className="font-semibold text-primary no-underline"
                >
                  support@mana-ai.com
                </Link>
              </Text>
              <Text className="mt-3 text-[11px] text-gray-400">
                Create tailored retail pitches powered by AI.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
