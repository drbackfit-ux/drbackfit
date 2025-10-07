import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";
import {
  getBestsellerProducts,
  getFeaturedProducts,
  getProductCategories,
  getTestimonials,
} from "@/services/products.service";

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

export default async function Home() {
  // Fetch data on the server with proper caching
  const [bestsellerProducts, featuredProducts, categories, testimonials] =
    await Promise.all([
      getBestsellerProducts(),
      getFeaturedProducts(),
      getProductCategories(),
      getTestimonials(),
    ]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero-main.jpg"
            alt="Premium furniture showcase"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-2xl space-y-6 animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground leading-tight">
              Made by hand.
              <br />
              <span className="text-gradient-premium">Loved for years.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Premium furniture crafted by master artisans. Each piece tells a
              story of dedication, quality materials, and timeless design.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" className="btn-premium text-base">
                <Link href="/catalog">
                  Explore Collection <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="btn-outline-premium text-base"
              >
                <Link href="/custom-order">Request Custom Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="section-padding bg-secondary/20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
                Craftsmanship That Speaks
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                For over two decades, Bēige & Oak has been creating furniture
                that transcends trends. Our workshop combines traditional
                joinery techniques with modern design sensibilities, ensuring
                each piece is both beautiful and built to last.
              </p>
              <ul className="space-y-3">
                {[
                  "Sustainably sourced hardwoods",
                  "Hand-selected premium fabrics",
                  "Custom dimensions available",
                  "Lifetime craftsmanship warranty",
                ].map((feature) => (
                  <li key={feature} className="flex items-center space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="btn-premium">
                <Link href="/about">
                  Our Story <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <Image
                src="/craftsmanship.jpg"
                alt="Craftsmanship detail"
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bestseller Products Section */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
              Bestsellers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our most loved pieces. Shop customer favorites and see why they
              choose Bēige & Oak.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {bestsellerProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="btn-premium">
              <Link href="/catalog">
                Shop All Products <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-padding bg-secondary/20">
        <div className="container mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
              Browse by Category
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From statement beds to inviting sofas, discover furniture designed
              for how you live.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/catalog?category=${category.slug}`}
                className="card-premium group hover-lift p-8 text-center space-y-3"
              >
                <h3 className="text-2xl font-serif font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {category.count}{" "}
                  {category.count === 1 ? "Collection" : "Collections"}
                </p>
                <ArrowRight className="h-5 w-5 mx-auto text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
              Featured Collection
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Handpicked pieces that exemplify our commitment to quality and
              design.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="btn-outline-premium">
              <Link href="/catalog">
                View Full Catalog <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
              Client Stories
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-8 space-y-4 card-premium">
                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground italic leading-relaxed">
                  &quot;{testimonial.content}&quot;
                </p>
                <div className="pt-4 border-t border-border">
                  <p className="font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-serif font-bold">
            Ready to Create Something Special?
          </h2>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Book a showroom visit or request a custom quote. Our team is ready
            to bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" variant="secondary" className="text-base">
              <Link href="/showroom">Book Showroom Visit</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-base border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <Link href="/custom-order">Start Custom Project</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
