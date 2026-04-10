export type RoleKey = "user" | "hospital" | "doctor" | "blood-bank";

export type RoleAccount = {
  role: RoleKey;
  name: string;
  email: string;
  password: string;
  extra?: string;
};

const ACCOUNT_STORAGE_KEY: Record<RoleKey, string> = {
  user: "health-role-user-accounts",
  hospital: "health-role-hospital-accounts",
  doctor: "health-role-doctor-accounts",
  "blood-bank": "health-role-blood-bank-accounts",
};

const SESSION_STORAGE_KEY = "health-role-session";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAccounts(role: RoleKey): RoleAccount[] {
  if (!isBrowser()) {
    return [];
  }

  const rawValue = window.localStorage.getItem(ACCOUNT_STORAGE_KEY[role]);

  if (!rawValue) {
    return [];
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return [];
  }
}

export function registerRoleAccount(account: RoleAccount) {
  const currentAccounts = getAccounts(account.role);
  const existingAccount = currentAccounts.find(
    (item) => item.email.toLowerCase() === account.email.toLowerCase()
  );

  if (existingAccount) {
    return {
      ok: false,
      error: `${account.role} account already exists with this email.`,
    };
  }

  const nextAccounts = [...currentAccounts, account];
  window.localStorage.setItem(
    ACCOUNT_STORAGE_KEY[account.role],
    JSON.stringify(nextAccounts)
  );

  return { ok: true };
}

export function loginRoleAccount(role: RoleKey, email: string, password: string) {
  const account = getAccounts(role).find(
    (item) =>
      item.email.toLowerCase() === email.toLowerCase() && item.password === password
  );

  if (!account) {
    return {
      ok: false,
      error: "Invalid login credentials.",
    };
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(account));
  return { ok: true, account };
}

export function getCurrentRoleSession(): RoleAccount | null {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

export function logoutRoleSession() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}
