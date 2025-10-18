export interface WishlistProduct {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  images: string[];
  priceEstimateMin: number;
  priceEstimateMax: number;
  tags: string[];
}
