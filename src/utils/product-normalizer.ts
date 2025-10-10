type RawProductData = Record<string, unknown> & {
  id?: unknown;
  priceEstimateMin?: unknown;
  priceEstimateMax?: unknown;
  pricing?: unknown;
};

const toNumber = (value: unknown): number | undefined =>
  typeof value === "number" ? value : undefined;

const extractPricing = (pricing: unknown) => {
  if (typeof pricing !== "object" || pricing === null) {
    return { salePrice: undefined, mrp: undefined };
  }

  const record = pricing as Record<string, unknown>;

  return {
    salePrice: toNumber(record.salePrice),
    mrp: toNumber(record.mrp),
  };
};

export const prepareProductPayload = (
  data: RawProductData,
  fallbackId?: string
) => {
  const { salePrice, mrp } = extractPricing(data.pricing);

  const priceEstimateMin =
    toNumber(data.priceEstimateMin) ?? salePrice ?? toNumber(data.priceEstimateMax) ?? mrp ?? 0;

  const priceEstimateMax =
    toNumber(data.priceEstimateMax) ?? mrp ?? priceEstimateMin;

  return {
    ...data,
    id: (data.id as string | undefined) ?? fallbackId,
    priceEstimateMin,
    priceEstimateMax,
  };
};
