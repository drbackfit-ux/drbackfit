import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import {
  fetchAllProductSlugs,
  fetchProductDetailBySlug,
  fetchProductReviews,
  fetchSimilarProducts,
} from "@/services/firebase/product.service";

const NAV_ITEMS = [
  { label: "Product", href: "#product" },
  { label: "Details", href: "#details" },
  { label: "Overview", href: "#overview" },
  { label: "Reviews", href: "#reviews" },
  { label: "FAQs", href: "#faqs" },
];

export const revalidate = 0;

export async function generateStaticParams() {
  const slugs = await fetchAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductDetailBySlug(slug);

  if (!product) {
    return {
      title: "Product not found",
    };
  }

  return {
    title: `${product.title} | Dr Backfit Atelier`,
    description: product.shortDescription,
    openGraph: {
      title: product.title,
      description: product.shortDescription,
      images: product.images.map((image) => ({
        url: image,
        alt: product.title,
      })),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProductDetailBySlug(slug);

  if (!product) {
    notFound();
  }

  const breadcrumbs = product.breadcrumbs.length
    ? product.breadcrumbs
    : [
        { label: "Home", href: "/" },
        { label: "Catalog", href: "/catalog" },
        { label: product.title },
      ];

  const [reviews, similarProducts] = await Promise.all([
    fetchProductReviews(product.id),
    fetchSimilarProducts(product.category, product.id, 4),
  ]);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <Fragment key={`${crumb.label}-${index}`}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href ?? "#"}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="container mx-auto flex flex-wrap gap-3 px-4 py-3 text-sm font-medium text-muted-foreground">
          {NAV_ITEMS.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 transition-colors ${
                index === 0
                  ? "bg-[#E0103A] text-white shadow"
                  : "hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <main>
        <ProductDetailClient
          initialProduct={product}
          initialReviews={reviews}
          similarProducts={similarProducts}
        />
      </main>
    </div>
  );
}
