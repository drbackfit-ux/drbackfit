import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("home_loads_showsMainContent", async ({ page }) => {
    await page.goto("/");

    // Check for main hero heading
    await expect(
      page.getByRole("heading", { name: /made by hand/i })
    ).toBeVisible();
    await expect(page.getByText(/loved for years/i)).toBeVisible();

    // Check for navigation
    await expect(page.getByRole("link", { name: /catalog/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /about/i })).toBeVisible();

    // Check for CTA buttons
    await expect(
      page.getByRole("link", { name: /explore collection/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /request custom quote/i })
    ).toBeVisible();
  });

  test("navigation_clickLinks_navigatesCorrectly", async ({ page }) => {
    await page.goto("/");

    // Test catalog navigation
    await page
      .getByRole("link", { name: /catalog/i })
      .first()
      .click();
    await expect(page).toHaveURL("/catalog");

    // Go back to home
    await page.goto("/");

    // Test about navigation
    await page.getByRole("link", { name: /about/i }).first().click();
    await expect(page).toHaveURL("/about");
  });

  test("mobileMenu_opensAndCloses_correctBehavior", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Mobile menu should be hidden initially
    await expect(
      page.getByRole("navigation").locator("a", { hasText: "Home" })
    ).not.toBeVisible();

    // Click mobile menu button
    await page.getByRole("button", { name: /menu/i }).click();

    // Mobile menu should be visible
    await expect(
      page.getByRole("navigation").locator("a", { hasText: "Home" })
    ).toBeVisible();
    await expect(
      page.getByRole("navigation").locator("a", { hasText: "Catalog" })
    ).toBeVisible();

    // Click a link to close menu
    await page
      .getByRole("navigation")
      .locator("a", { hasText: "Catalog" })
      .click();
    await expect(page).toHaveURL("/catalog");

    // Menu should be closed after navigation
    await page.goto("/");
    await expect(
      page.getByRole("navigation").locator("a", { hasText: "Home" })
    ).not.toBeVisible();
  });

  test("productCards_displayCorrectly_onHomepage", async ({ page }) => {
    await page.goto("/");

    // Wait for product cards to load
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    });

    // Check that product cards are present
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards).toHaveCount(10); // 3 bestsellers + 4 featured + 3 from testimonials section

    // Check that first product card has required elements
    const firstCard = productCards.first();
    await expect(firstCard.locator("img")).toBeVisible();
    await expect(firstCard.locator("h3")).toBeVisible();
    await expect(
      firstCard.getByRole("button", { name: /add to cart/i })
    ).toBeVisible();
  });
});
