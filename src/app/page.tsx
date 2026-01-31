import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";
import Dealers from "@/components/Dealers";
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
              Premium Orthopedic Mattresses
              <br />
              <span className="text-gradient-premium">& Sleep Accessories</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Doctor-Recommended Back Support. Complete Sleep Solutions Since 2003.
              Experience medical-grade orthopedic support with our premium mattresses,
              ergonomic pillows, and sleep essentials.
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
                <Link href="/contact">Request Custom Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Bestseller Products Section */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="text-center mb-8 space-y-3">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
              Bestselling Mattresses & Accessories
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our most loved orthopedic mattresses and sleep accessories. Trusted by thousands
              of families across India for back pain relief and better sleep.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
          <div className="text-center mb-8 space-y-3">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
              Browse by Category
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From orthopedic mattresses to ergonomic pillows and mattress protectors,
              discover complete sleep solutions for your home.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/catalog?category=${category.slug}`}
                className="card-premium group hover-lift p-6 text-center space-y-2"
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
          <div className="text-center mb-8 space-y-3">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
              Featured Orthopedic Products
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Doctor-recommended mattresses and sleep accessories designed for
              optimal back support and restful sleep.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Button asChild size="lg" className="btn-outline-premium">
              <Link href="/catalog">
                View Full Catalog <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="section-padding bg-secondary/20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
                20+ Years of Sleep Expertise
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                For over two decades, Dr Backfit has been creating orthopedic
                mattresses and sleep accessories designed in consultation with
                spine specialists. Our products provide the perfect balance of
                firm support and pressure-relieving comfort.
              </p>
              <ul className="space-y-3">
                {[
                  "Orthopedic designs for optimal spine alignment",
                  "High-density foam for 10+ years durability",
                  "Complete sleep solutions: mattresses, pillows, protectors",
                  "Free delivery and installation across India",
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

      {/* Testimonials */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
              Client Stories
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-6 space-y-3 card-premium">
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
      <section className="section-padding bg-secondary text-black-foreground">
        <div className="container mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-serif font-bold">
            Ready for Better Sleep?
          </h2>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Visit our showroom to experience our orthopedic mattresses or get
            a free consultation for your sleep needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" variant="secondary" className="text-base border">
              <Link href="/contact">Book Showroom Visit</Link>
            </Button>
            <Button asChild size="lg" className="text-base btn-premium">
              <Link href="/contact">Start Custom Project</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Dealers Section */}
      <Dealers />
    </div>
  );
}
