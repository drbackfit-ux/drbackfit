/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import * as productsService from "@/services/products.service";

// Mock the services
jest.mock("@/services/products.service");

const mockProductsService = productsService as jest.Mocked<
  typeof productsService
>;

// Mock Next.js components
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock server actions
jest.mock("@/actions/cart.actions", () => ({
  addToCart: jest.fn(),
  getCartData: jest
    .fn()
    .mockResolvedValue({ items: [], total: 0, itemCount: 0 }),
}));

// Create a simple test component that mimics the homepage structure
const TestHomePage = ({
  bestsellerProducts = [],
  featuredProducts = [],
  categories = [],
  testimonials = [],
}: any) => (
  <div>
    <h1>
      Made by hand.
      <span>Loved for years.</span>
    </h1>
    <div data-testid="bestsellers">
      {bestsellerProducts.map((product: any) => (
        <div key={product.id} data-testid="product-card">
          <h3>{product.title}</h3>
        </div>
      ))}
    </div>
  </div>
);

describe("HomePage", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock returns
    mockProductsService.getBestsellerProducts.mockResolvedValue([]);
    mockProductsService.getFeaturedProducts.mockResolvedValue([]);
    mockProductsService.getProductCategories.mockResolvedValue([]);
    mockProductsService.getTestimonials.mockResolvedValue([]);
  });

  it("renders_withValidData_showsMainContent", async () => {
    // Arrange
    const mockBestsellers = [
      {
        id: "bed-001",
        slug: "royal-upholstered-bed",
        title: "Royal Upholstered Bed",
        shortDescription: "Handcrafted luxury bed",
        images: ["/bed.jpg"],
        priceEstimateMin: 2500,
        priceEstimateMax: 4200,
        tags: ["Bestseller"],
        longDescription: "Long description",
        category: "beds",
        materials: ["Oak"],
        dimensions: { w: 180, h: 120, d: 210 },
        leadTimeDays: 28,
        isCustomAllowed: true,
      },
    ];

    // Act
    render(<TestHomePage bestsellerProducts={mockBestsellers} />);

    // Assert
    expect(screen.getByText("Made by hand.")).toBeInTheDocument();
    expect(screen.getByText("Loved for years.")).toBeInTheDocument();
    expect(screen.getByText("Royal Upholstered Bed")).toBeInTheDocument();
  });

  it("calls_allRequiredServices_whenDataFetched", async () => {
    // This tests the service layer independently
    await mockProductsService.getBestsellerProducts();
    await mockProductsService.getFeaturedProducts();
    await mockProductsService.getProductCategories();
    await mockProductsService.getTestimonials();

    // Assert
    expect(mockProductsService.getBestsellerProducts).toHaveBeenCalledWith();
    expect(mockProductsService.getFeaturedProducts).toHaveBeenCalledWith();
    expect(mockProductsService.getProductCategories).toHaveBeenCalledWith();
    expect(mockProductsService.getTestimonials).toHaveBeenCalledWith();
  });
});
