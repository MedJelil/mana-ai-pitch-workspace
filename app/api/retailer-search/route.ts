import { NextRequest, NextResponse } from "next/server";
import { getSessionFromHeaders } from "@/lib/auth/get-session";

// New host as of the Foursquare June 2025 migration
const FOURSQUARE_BASE = "https://places-api.foursquare.com/places/search";
const FOURSQUARE_API_VERSION = "2025-06-17";

export async function GET(req: NextRequest) {
  const session = await getSessionFromHeaders(req.headers);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.FOURSQUARE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Foursquare API key is not configured" },
      { status: 500 },
    );
  }

  const { searchParams } = req.nextUrl;
  const query = searchParams.get("query");
  const near = searchParams.get("near");

  if (!query || !near) {
    return NextResponse.json(
      { error: "query and near parameters are required" },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({
    query,
    near,
    limit: "10",
    // fsq_place_id replaces fsq_id in the new API
    fields: "fsq_place_id,name,location",
  });

  let response: Response;
  try {
    response = await fetch(`${FOURSQUARE_BASE}?${params}`, {
      headers: {
        // New auth: Bearer prefix required
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        // Required versioning header
        "X-Places-Api-Version": FOURSQUARE_API_VERSION,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach Foursquare API" },
      { status: 502 },
    );
  }

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    const isAuthError = response.status === 401 || response.status === 403;
    const error = isAuthError
      ? "Foursquare service key is invalid. Generate a Service Key at developer.foursquare.com and set FOURSQUARE_API_KEY in .env"
      : "Foursquare API returned an error";
    return NextResponse.json({ error, details }, { status: response.status });
  }

  const data = await response.json();

  // Tokenise the user's brand query so we can match each word independently.
  // e.g. "Whole Foods" → ["whole", "foods"]  "HEB" → ["heb"]
  const queryTokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1); // ignore single-letter tokens

  const results: StoreResult[] = ((data.results ?? []) as FoursquarePlace[])
    .filter((r) => {
      // Must be a US location
      if (r.location?.country !== "US") return false;

      const nameLower = r.name.toLowerCase();

      // Must contain at least one brand token — blocks Foursquare's "popular nearby" fallback
      if (
        queryTokens.length > 0 &&
        !queryTokens.some((t) => nameLower.includes(t))
      ) {
        return false;
      }

      // Block in-store sub-departments and non-retail tenants that share the brand name
      // e.g. "Walmart Pharmacy", "Walmart Auto Care Center", "Target Optical"
      return !isSubDepartment(nameLower);
    })
    .map((r) => ({
      fsq_id: r.fsq_place_id,
      name: r.name,
      location: r.location,
    }));

  return NextResponse.json({ results });
}

// Keywords that identify in-store sub-departments or non-retail tenants.
// These are suffixes/fragments that appear after the brand name in Foursquare.
const SUB_DEPARTMENT_KEYWORDS = [
  // Health / medicine
  "pharmacy",
  "pharmacist",
  "vision center",
  "optical",
  "eye care",
  "hearing center",
  "clinic",
  "urgent care",
  // Automotive
  "auto care",
  "auto center",
  "tire & lube",
  "tire center",
  "tires",
  "oil change",
  // Outdoor / seasonal
  "garden center",
  "nursery",
  // Beauty / personal care
  "hair salon",
  "nail salon",
  "beauty salon",
  "salon",
  // In-store food tenants
  "mcdonald's",
  "subway",
  "starbucks",
  "dunkin",
  "pizza hut",
  "taco bell",
  // Fuel
  "gas station",
  "fuel station",
  "fueling station",
  // Finance / other services
  "bank",
  "financial services",
  "money center",
  "check cashing",
  // Other
  "jewelry",
  "portrait studio",
  "photo center",
] as const;

function isSubDepartment(nameLower: string): boolean {
  return SUB_DEPARTMENT_KEYWORDS.some((kw) => nameLower.includes(kw));
}

type FoursquarePlace = {
  fsq_place_id: string;
  name: string;
  location: {
    address?: string;
    locality?: string;
    region?: string;
    postcode?: string;
    formatted_address?: string;
    country?: string;
  };
};

type StoreResult = {
  fsq_id: string;
  name: string;
  location: FoursquarePlace["location"];
};
