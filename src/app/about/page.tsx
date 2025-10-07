import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-secondary/20">
        <div className="absolute inset-0">
          <Image
            src="/craftsmanship.jpg"
            alt="Our craftsmanship"
            fill
            className="object-cover opacity-50"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-4">
            Our Story
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Crafting timeless furniture with passion and precision since 2003
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-serif font-bold text-foreground">
                Made by Hand, Loved for Years
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Dr Backfit was founded with a simple belief: furniture should be more than just functional. 
                It should tell a story, reflect craftsmanship, and stand the test of time.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                For over two decades, we've been creating pieces that blend traditional joinery techniques 
                with contemporary design. Each item is handcrafted by skilled artisans who pour their expertise 
                and passion into every detail.
              </p>
            </div>
            <div className="relative h-[400px]">
              <Image
                src="/craftsmanship.jpg"
                alt="Artisan at work"
                fill
                className="object-cover rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-secondary/20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we create
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Quality Craftsmanship",
                description: "Every piece is meticulously handcrafted by skilled artisans using time-honored techniques."
              },
              {
                title: "Sustainable Materials",
                description: "We source only sustainably harvested hardwoods and eco-friendly materials."
              },
              {
                title: "Timeless Design",
                description: "Our designs transcend trends, ensuring your furniture remains beautiful for generations."
              }
            ].map((value) => (
              <div key={value.title} className="card-premium p-8 text-center space-y-4">
                <CheckCircle2 className="h-12 w-12 text-accent mx-auto" />
                <h3 className="text-2xl font-serif font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
            Experience the Difference
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Visit our showroom or browse our collection to discover furniture that's built to last.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="btn-premium">
              <Link href="/showroom">Visit Showroom</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="btn-outline-premium">
              <Link href="/catalog">Browse Collection</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}