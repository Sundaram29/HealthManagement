export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;

export const BLOOD_COMPONENTS = [
  "Packed Red Blood Cells",
  "Whole Blood",
  "Fresh Frozen Plasma",
  "Platelets",
  "Cryoprecipitate",
] as const;

export function createDefaultInventory() {
  return BLOOD_TYPES.map((type) => ({
    type,
    component: "Whole Blood",
    units: 0,
    available: false,
  }));
}
