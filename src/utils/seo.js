import { getPropertyBySlug } from "../data/properties";

const SITE_NAME = "AURELIS";
const DEFAULT_TITLE = "AURELIS | Architecture & Private Residences";
const DEFAULT_DESCRIPTION =
  "AURELIS presents a curated collection of luxury residences in the world's most prestigious locations — architecture, landscape and light, considered as one.";

const OG_IMAGE = "/images/architecture-statement.jpg";
const OG_IMAGE_ALT =
  "A wide architectural residence framed by open landscape and evening light";
const OG_IMAGE_WIDTH = "1358";
const OG_IMAGE_HEIGHT = "699";

const PAGE_META = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  "/properties": {
    title: "Properties | AURELIS",
    description:
      "Explore the AURELIS collection of private residences — architectural homes catalogued by place, material and light.",
  },
  "/about": {
    title: "About | AURELIS",
    description:
      "Discover the perspective behind AURELIS: architecture, landscape and place brought together in a considered collection of private residences.",
  },
  "/contact": {
    title: "Private Enquiries | AURELIS",
    description:
      "Begin a private enquiry with AURELIS. Discuss availability, acquisition and selected architectural residences with our team.",
  },
};

function truncate(text, maxLength = 155) {
  const value = String(text ?? "").trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).replace(/\s+\S*$/, "")}…`;
}

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function decodeSegment(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function resolvePageMeta(pathname) {
  const path = normalizePath(pathname);
  const propertyMatch = path.match(/^\/properties\/([^/]+)$/);

  if (propertyMatch) {
    const property = getPropertyBySlug(decodeSegment(propertyMatch[1]));
    if (property) {
      const place = property.location ? `, ${property.location}` : "";
      return {
        path,
        title: `${property.name}${place} | AURELIS`,
        description:
          truncate(property.description) ||
          `${property.name}${place} — a private residence presented by AURELIS.`,
      };
    }
    return {
      path,
      title: "Property | AURELIS",
      description:
        "Discover an architectural residence presented by AURELIS — a curated collection of private homes in exceptional locations.",
    };
  }

  return { path, ...(PAGE_META[path] ?? PAGE_META["/"]) };
}

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

// Route metadata is applied client-side because this is a Vite SPA: every
// path serves the same index.html. Canonical and social image URLs are built
// from the live origin, so no production domain has to be hard-coded.
export function applyPageMetadata(pathname) {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  const meta = resolvePageMeta(pathname);
  const origin = window.location.origin;
  const canonicalUrl = `${origin}${meta.path === "/" ? "/" : meta.path}`;
  const imageUrl = new URL(OG_IMAGE, origin).href;

  document.title = meta.title;

  setMeta("name", "description", meta.description);
  setMeta("property", "og:site_name", SITE_NAME);
  setMeta("property", "og:title", meta.title);
  setMeta("property", "og:description", meta.description);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:url", canonicalUrl);
  setMeta("property", "og:image", imageUrl);
  setMeta("property", "og:image:alt", OG_IMAGE_ALT);
  setMeta("property", "og:image:width", OG_IMAGE_WIDTH);
  setMeta("property", "og:image:height", OG_IMAGE_HEIGHT);

  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", meta.title);
  setMeta("name", "twitter:description", meta.description);
  setMeta("name", "twitter:image", imageUrl);
  setMeta("name", "twitter:image:alt", OG_IMAGE_ALT);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", canonicalUrl);
}
