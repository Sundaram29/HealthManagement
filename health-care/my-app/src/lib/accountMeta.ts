export type AccountExtraMeta = {
  label?: string | null;
  licenseId?: string | null;
  specialty?: string | null;
  hospitalId?: number | null;
  doctorId?: number | null;
};

export function parseAccountExtra(value?: string | null): AccountExtraMeta | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as AccountExtraMeta;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { label: value };
    }

    return parsed;
  } catch {
    return { label: value };
  }
}

export function serializeAccountExtra(meta?: AccountExtraMeta | null) {
  if (!meta) {
    return null;
  }

  return JSON.stringify(meta);
}

export function getAccountExtraLabel(value?: string | null) {
  return parseAccountExtra(value)?.label ?? value ?? null;
}
