import { MapPin, Phone, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Dummy dealer data
const dealers = [
  {
    id: 1,
    name: "Dr Backfit Mumbai Central",
    city: "Mumbai",
    state: "Maharashtra",
    address: "Shop No. 15, Phoenix Mills, Lower Parel",
    phone: "+91 98765 43210",
    email: "mumbai@drbackfit.com",
    manager: "Rajesh Sharma"
  },
  {
    id: 2,
    name: "Dr Backfit Delhi Premium",
    city: "New Delhi",
    state: "Delhi",
    address: "A-24, Connaught Place, Central Delhi",
    phone: "+91 98765 43211",
    email: "delhi@drbackfit.com",
    manager: "Priya Singh"
  },
  {
    id: 3,
    name: "Dr Backfit Bangalore Elite",
    city: "Bangalore",
    state: "Karnataka",
    address: "UB City Mall, Level 2, Vittal Mallya Road",
    phone: "+91 98765 43212",
    email: "bangalore@drbackfit.com",
    manager: "Arjun Krishnan"
  },
  {
    id: 4,
    name: "Dr Backfit Chennai Luxury",
    city: "Chennai",
    state: "Tamil Nadu",
    address: "Express Avenue Mall, Royapettah",
    phone: "+91 98765 43213",
    email: "chennai@drbackfit.com",
    manager: "Lakshmi Raman"
  },
  {
    id: 5,
    name: "Dr Backfit Kolkata Heritage",
    city: "Kolkata",
    state: "West Bengal",
    address: "South City Mall, Prince Anwar Shah Road",
    phone: "+91 98765 43214",
    email: "kolkata@drbackfit.com",
    manager: "Amit Ghosh"
  },
  {
    id: 6,
    name: "Dr Backfit Hyderabad Modern",
    city: "Hyderabad",
    state: "Telangana",
    address: "Inorbit Mall, HITEC City, Madhapur",
    phone: "+91 98765 43215",
    email: "hyderabad@drbackfit.com",
    manager: "Venkat Reddy"
  }
];

const cities = [
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad",
  "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Kochi", "Chandigarh"
];

const Dealers = () => {
  return (
    <section className="section-padding bg-secondary/30">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
            Our Dealers
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Experience Dr Backfit's premium furniture at our exclusive dealer 
            locations throughout India. Each showroom offers personalized 
            consultations and the full range of our handcrafted collections.
          </p>
        </div>

        {/* Cities We Serve */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-serif font-semibold text-foreground mb-6">
            We Deal in These Cities
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {cities.map((city) => (
              <span
                key={city}
                className="px-4 py-2 bg-background rounded-full text-sm font-medium text-foreground border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {city}
              </span>
            ))}
          </div>
        </div>

        {/* Dealer Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {dealers.map((dealer) => (
            <Card key={dealer.id} className="p-6 bg-background hover:shadow-lg transition-all duration-300">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-1">
                    {dealer.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Manager: {dealer.manager}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-foreground font-medium">
                        {dealer.city}, {dealer.state}
                      </p>
                      <p className="text-muted-foreground">
                        {dealer.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-accent flex-shrink-0" />
                    <a 
                      href={`tel:${dealer.phone}`}
                      className="text-sm text-foreground hover:text-primary transition-colors"
                    >
                      {dealer.phone}
                    </a>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-accent flex-shrink-0" />
                    <a 
                      href={`mailto:${dealer.email}`}
                      className="text-sm text-foreground hover:text-primary transition-colors"
                    >
                      {dealer.email}
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                  >
                    Visit Showroom
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-serif font-semibold text-foreground">
            Can't Find a Dealer Near You?
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're expanding our network across India. Contact us to inquire 
            about dealers in your area or to schedule a virtual consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="btn-premium">
              Find Nearest Dealer
            </Button>
            <Button variant="outline">
              Schedule Virtual Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dealers;