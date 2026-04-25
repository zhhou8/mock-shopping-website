export const MOCK_USER_ID = process.env.MOCK_USER_ID || "11111111-1111-1111-1111-111111111111";
export const MOCK_USER_EMAIL = process.env.MOCK_USER_EMAIL || "laura@bunqpal.dev";
export const MOCK_USER_NAME = process.env.MOCK_USER_NAME || "Laura Nicholson";

export const MOCK_USER = {
  id: MOCK_USER_ID,
  email: MOCK_USER_EMAIL,
  name: MOCK_USER_NAME,
  initials: MOCK_USER_NAME.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase(),
  address: {
    line1: "The Court 507",
    postal: "1060 OG",
    city: "Amsterdam",
    country: "NL"
  }
} as const;
