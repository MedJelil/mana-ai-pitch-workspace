export type SimulateBuyerInput = {
  pitchId: string;
  productId: string;
  retailer: string;
  pitch: {
    positioning: string;
    talkingPoints: string[];
    suggestedPitch: string;
  };
};

export type BuyerSimulationResult = {
  questions: string[];
  concerns: string[];
  suggestions: string[];
};

export async function simulateBuyer(input: SimulateBuyerInput): Promise<BuyerSimulationResult> {
  const res = await fetch("/api/simulate-buyer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to run simulation");
  return data;
}
