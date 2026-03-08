export const pitchesQueryKey = ["pitches"] as const;

export type BuyerSimulation = {
  questions: string[];
  concerns: string[];
  suggestions: string[];
};

export type ReadinessStatus = "ok" | "warning" | "missing";

export type ReadinessItem = {
  label: string;
  status: ReadinessStatus;
  note: string;
};

export type PitchRecord = {
  id: string;
  productId: string;
  productName: string;
  retailer: string;
  focus: string;
  readiness?: ReadinessItem[] | null;
  createdAt: string;
  positioning?: string;
  talkingPoints?: string[];
  suggestedPitch?: string;
  issues?: string[];
  suggestions?: string[];
  buyerSimulation?: BuyerSimulation | null;
};

export async function fetchPitches(): Promise<PitchRecord[]> {
  const res = await fetch("/api/pitches");
  if (!res.ok) throw new Error("Failed to load pitches");
  return res.json();
}

export async function fetchPitch(id: string): Promise<PitchRecord> {
  const res = await fetch(`/api/pitches/${id}`);
  if (!res.ok) throw new Error("Failed to load pitch");
  return res.json();
}

export type StoreInfo = {
  retailerBrand: string;
  storeName: string;
  address: string;
  city: string;
  state: string;
};

export type CreatePitchInput = {
  productId: string;
  focus: string;
  storeInfo: StoreInfo;
  /** @deprecated pass storeInfo instead */
  retailer?: string;
};

export type PitchResult = PitchRecord;

export async function createPitch(input: CreatePitchInput): Promise<PitchResult> {
  const res = await fetch("/api/pitches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to generate pitch");
  return data;
}

