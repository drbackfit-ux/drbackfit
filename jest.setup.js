import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Mock server actions
jest.mock('@/actions/cart.actions', () => ({
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  updateCartItemQuantity: jest.fn(),
  clearCart: jest.fn(),
  getCartData: jest.fn(),
}))

// Mock services
jest.mock('@/services/products.service', () => ({
  getProducts: jest.fn(),
  getProductsByCategory: jest.fn(),
  getFeaturedProducts: jest.fn(),
  getBestsellerProducts: jest.fn(),
  getProductBySlug: jest.fn(),
  searchProducts: jest.fn(),
  getTestimonials: jest.fn(),
  getProductCategories: jest.fn(),
}))

// Global test setup
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}))