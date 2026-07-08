export interface Settings {
  kitchenName: string;
  kitchenEmail: string;
  kitchenPhone: string;
  serviceAreas: string[];
  orderCutoff: string;
  deliveryTime: string;
  emailNotifs: boolean;
  smsNotifs: boolean;
  autoConfirm: boolean;
  pauseOrders: boolean;
  maxOrderDiscountPct: number;
  businessDiscountPct: number;
  businessDiscountThreshold: number;
  pricingVisibleToLoggedInOnly: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  kitchenName: "Subtle Kitchen",
  kitchenEmail: "hello@subtlekitchen.com",
  kitchenPhone: "+44 20 7946 0958",
  serviceAreas: ["Poole", "Bournemouth"],
  orderCutoff: "22:00",
  deliveryTime: "12:00-13:00",
  emailNotifs: true,
  smsNotifs: false,
  autoConfirm: true,
  pauseOrders: false,
  maxOrderDiscountPct: 10,
  businessDiscountPct: 5,
  businessDiscountThreshold: 50,
  pricingVisibleToLoggedInOnly: true,
};

const KEY = "sk_admin_settings";

function load(): Settings {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function save(settings: Settings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(settings));
}

export function getSettings(): Settings {
  return load();
}

export function updateSettings(patch: Partial<Settings>): Settings {
  const next = { ...load(), ...patch };
  save(next);
  return next;
}
