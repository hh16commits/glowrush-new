import { useEffect, useState } from "react";

export const LOCALE_STORAGE_KEY = "glowrush-locale";
export const USD_RATE_UZS = 11806.97;

export const LOCALE_LABELS = {
  RU: {
    nav: {
      catalog: "Каталог",
      brands: "Бренды",
      new: "Новинки",
      care: "Уход",
      sale: "Акции",
      guide: "Гид по уходу",
    },
    language: "Язык",
    currency: "Валюта",
  },

  UZ: {
    nav: {
      catalog: "Katalog",
      brands: "Brendlar",
      new: "Yangiliklar",
      care: "Parvarish",
      sale: "Aksiyalar",
      guide: "Parvarish qo‘llanmasi",
    },
    language: "Til",
    currency: "Valyuta",
  },

  EN: {
    nav: {
      catalog: "Catalog",
      brands: "Brands",
      new: "New",
      care: "Care",
      sale: "Sale",
      guide: "Glow Guide",
    },
    language: "Language",
    currency: "Currency",
  },
};

function readLocale() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(LOCALE_STORAGE_KEY) || "null"
    );

    return {
      language: ["RU", "UZ", "EN"].includes(saved?.language)
        ? saved.language
        : "RU",

      currency: ["UZS", "USD"].includes(saved?.currency)
        ? saved.currency
        : "UZS",
    };
  } catch {
    return {
      language: "RU",
      currency: "UZS",
    };
  }
}

export function setLocalePreferences(patch = {}) {
  const current = readLocale();

  const next = {
    language:
      ["RU", "UZ", "EN"].includes(patch.language)
        ? patch.language
        : current.language,

    currency: "UZS",
  };

  localStorage.setItem(
    LOCALE_STORAGE_KEY,
    JSON.stringify(next)
  );

  window.dispatchEvent(
    new CustomEvent("glowrush-locale-change", {
      detail: next,
    })
  );

  return next;
}

export function formatPrice(value, currency = "UZS") {
  const amount = Number(value || 0);

  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount / USD_RATE_UZS);
  }

  return `${new Intl.NumberFormat("ru-RU").format(
    Math.round(amount)
  )} сум`;
}

export function getLocalizedText(
  translations = [],
  language = "RU",
  fallback = ""
) {
  const exact = translations.find(
    (item) =>
      String(item?.locale || "").toUpperCase() === language
  );

  if (exact?.name) {
    return exact.name;
  }

  const ru = translations.find(
    (item) =>
      String(item?.locale || "").toUpperCase() === "RU"
  );

  return (
    ru?.name ||
    translations[0]?.name ||
    fallback
  );
}

export function useLocale() {
  const [locale, setLocale] = useState(readLocale);

  useEffect(() => {
    const syncLocale = (event) => {
      setLocale(
        event.detail || readLocale()
      );
    };

    window.addEventListener(
      "glowrush-locale-change",
      syncLocale
    );

    window.addEventListener(
      "storage",
      syncLocale
    );

    return () => {
      window.removeEventListener(
        "glowrush-locale-change",
        syncLocale
      );

      window.removeEventListener(
        "storage",
        syncLocale
      );
    };
  }, []);

  return {
    ...locale,
    labels: LOCALE_LABELS[locale.language],

    setLocale: (patch) => {
      setLocale(
        setLocalePreferences(patch)
      );
    },
  };
}