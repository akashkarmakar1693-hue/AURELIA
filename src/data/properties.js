// The 12 property records live in sliding_imgs/img N/ (source of truth).
// Images and metadata are read raw at build time so no copy of the copy is
// ever maintained. Files are grouped by folder: one folder is always one
// property, even when it contains more than one photograph.
const imageModules = import.meta.glob(
  "/sliding_imgs/img*/*.{jpg,jpeg,png,webp,avif}",
  {
    eager: true,
    import: "default",
  }
);

const textModules = import.meta.glob("/sliding_imgs/img*/*.txt", {
  eager: true,
  query: "?raw",
  import: "default",
});

const FEATURED_SLUG = "cloud-terrace";

const US_STATES = new Set([
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "District of Columbia",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
]);

const COUNTRY_NAMES = {
  UAE: "United Arab Emirates",
  UK: "United Kingdom",
  USA: "United States",
  US: "United States",
};

// Metadata features are grouped into the discovery taxonomy used by the
// collection: water, land and parking. Unknown features stay null.
const FEATURE_GROUPS = {
  POOL: "water",
  "SKY POOL": "water",
  LAKESIDE: "water",
  GARDEN: "land",
  ACREAGE: "land",
  TERRACES: "land",
  COURTYARD: "land",
  "MOTOR COURT": "parking",
  CARPORT: "parking",
  GARAGE: "parking",
};

const collator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

function folderFromKey(key) {
  const parts = key.split("/");
  return parts[parts.length - 2] ?? "";
}

function filenameFromKey(key) {
  return key.split("/").pop() ?? "";
}

function withoutExtension(name) {
  return name.replace(/\.[^.]+$/, "");
}

function orderFromFolder(folder) {
  const match = /(\d+)/.exec(folder);
  return match ? Number(match[1]) : 0;
}

function parseFields(raw) {
  const fields = {};
  for (const line of raw.split(/\r?\n/)) {
    const sep = line.indexOf(":");
    if (sep > 0) fields[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
  }
  return fields;
}

// The file named after its folder (img 1.jpg) stays the primary image. Any
// additional images follow in natural filename order.
function sortWithPrimary(keys, folder) {
  const sorted = [...keys].sort((a, b) =>
    collator.compare(filenameFromKey(a), filenameFromKey(b))
  );
  const primary = sorted.findIndex(
    (key) => withoutExtension(filenameFromKey(key)) === folder
  );
  if (primary > 0) sorted.unshift(...sorted.splice(primary, 1));
  return sorted;
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseLocation(location) {
  const [cityPart = "", regionPart = ""] = location.split(/\s*\/\s*/);
  const city = cityPart.trim() || null;
  const regionOrCountry = regionPart.trim();

  if (!regionOrCountry) return { city, region: null, country: null };

  if (US_STATES.has(regionOrCountry)) {
    return { city, region: regionOrCountry, country: "United States" };
  }

  return {
    city,
    region: null,
    country: COUNTRY_NAMES[regionOrCountry] ?? regionOrCountry,
  };
}

function parseMetadata(metadata) {
  const bedsMatch = /(\d+)\s*BED(?:ROOM)?S?\b/i.exec(metadata);
  const areaMatch = /([\d,.]+)\s*(K)?\s*SQ\.?\s*FT\b/i.exec(metadata);

  let areaSqFt = null;
  if (areaMatch) {
    const value = Number(areaMatch[1].replace(/,/g, ""));
    if (Number.isFinite(value)) {
      areaSqFt = Math.round(value * (areaMatch[2] ? 1000 : 1));
    }
  }

  const parts = metadata
    .split(/\s*[•·|]\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  const featurePart = [...parts]
    .reverse()
    .find(
      (part) =>
        !/\bBED(?:ROOM)?S?\b/i.test(part) && !/\bSQ\.?\s*FT\b/i.test(part)
    );

  const feature = featurePart ?? null;

  return {
    beds: bedsMatch ? Number(bedsMatch[1]) : null,
    areaSqFt,
    areaLabel: areaSqFt === null ? null : `${areaSqFt.toLocaleString("en-US")} sq ft`,
    feature,
    featureGroup: feature ? FEATURE_GROUPS[feature.toUpperCase()] ?? null : null,
  };
}

const imageKeysByFolder = new Map();
for (const key of Object.keys(imageModules)) {
  const folder = folderFromKey(key);
  if (!folder) continue;
  const keys = imageKeysByFolder.get(folder) ?? [];
  keys.push(key);
  imageKeysByFolder.set(folder, keys);
}

const textKeysByFolder = new Map();
for (const key of Object.keys(textModules)) {
  const folder = folderFromKey(key);
  if (!folder) continue;
  const keys = textKeysByFolder.get(folder) ?? [];
  keys.push(key);
  textKeysByFolder.set(folder, keys);
}

const folders = [...imageKeysByFolder.keys()].sort((a, b) => {
  return orderFromFolder(a) - orderFromFolder(b) || collator.compare(a, b);
});

const usedSlugs = new Set();

export const properties = folders.map((folder) => {
  const order = orderFromFolder(folder);
  const imageKeys = sortWithPrimary(imageKeysByFolder.get(folder), folder);
  const images = imageKeys.map((key) => imageModules[key]);

  const textKeys = sortWithPrimary(textKeysByFolder.get(folder) ?? [], folder);
  const fields = parseFields(textKeys[0] ? textModules[textKeys[0]] ?? "" : "");

  const name = fields.Name ?? "";
  const location = fields.Location ?? "";
  const metadata = fields.Metadata ?? "";
  const parsedLocation = parseLocation(location);
  const parsedMetadata = parseMetadata(metadata);

  let slug = slugify(name) || `property-${order}`;
  if (usedSlugs.has(slug)) slug = `${slug}-${order}`;
  usedSlugs.add(slug);

  return {
    order,
    slug,
    name,
    location,
    city: parsedLocation.city,
    region: parsedLocation.region,
    country: parsedLocation.country,
    description: fields.Description ?? "",
    category: fields.Category ?? "",
    feature: parsedMetadata.feature,
    featureGroup: parsedMetadata.featureGroup,
    beds: parsedMetadata.beds,
    areaSqFt: parsedMetadata.areaSqFt,
    areaLabel: parsedMetadata.areaLabel,
    metadata,
    image: images[0],
    images,
    featured: slug === FEATURED_SLUG,
  };
});

export const propertiesBySlug = new Map(
  properties.map((property) => [property.slug, property])
);

export function getPropertyBySlug(slug) {
  return propertiesBySlug.get(String(slug ?? "").trim().toLowerCase()) ?? null;
}

export const featuredProperty =
  properties.find((property) => property.featured) ?? null;
