import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Award, ArrowRight, Scissors, Shield, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Rating } from '../components/ui/Rating';
import { Avatar } from '../components/ui/Avatar';
import { Skeleton } from '../components/ui/Skeleton';
import { apiClient } from '../lib/api';
import { formatPrice } from '../lib/utils';
import type { Barber, Review, ServiceDisplay, ProductDisplay } from '../types';

export function Home() {
  const [services, setServices] = useState<ServiceDisplay[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, barbersData, productsData, reviewsData] = await Promise.all([
          apiClient.getServices(),
          apiClient.getBarbers(),
          apiClient.getProducts(),
          apiClient.getReviews(),
        ]);
        
        // Transform services to include required display fields
        const displayServices: ServiceDisplay[] = servicesData.map(service => ({
          ...service,
          description: service.description || `${service.name} - Professional ${service.name.toLowerCase()} service`,
          category: service.category || 'Haircut',
          image: service.image || 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg',
          featured: service.featured || false,
          durationMin: service.duration
        }));
        setServices(displayServices.filter(s => s.featured));
        setBarbers(barbersData.filter(b => b.featured));
        // Transform products to include required display fields
        const displayProducts: ProductDisplay[] = productsData.map(product => ({
          ...product,
          originalPrice: undefined,
          category: 'Tools',
          brand: 'BarberCraft',
          image: 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg',
          images: ['https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg'],
          inStock: true,
          stockCount: 10,
          rating: 4.5,
          reviewCount: 0,
          featured: true,
          ingredients: undefined,
          howToUse: undefined
        }));
        setProducts(displayProducts);
        setReviews(reviewsData.slice(0, 3));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <Badge variant="accent" className="w-fit">
                Premium Barbering Experience
              </Badge>
              
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight">
                  Craft Your
                  <span className="block gradient-text">Perfect Look</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                  Experience the art of traditional barbering combined with modern techniques. 
                  Book your appointment with our master craftsmen today.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="xl" 
                  onClick={() => navigate('/booking')}
                  className="group"
                >
                  Book Appointment
                  <Calendar className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="xl"
                  onClick={() => navigate('/services')}
                >
                  View Services
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text">15+</div>
                  <div className="text-sm text-muted-foreground">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text">5000+</div>
                  <div className="text-sm text-muted-foreground">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text">4.9</div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in animate-delay-200">
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg"
                  alt="Professional barber at work"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              
              <div className="absolute -bottom-6 -left-6 glass p-6 rounded-2xl animate-fade-in animate-delay-500">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-accent" />
                  <div>
                    <div className="font-semibold">Award Winning</div>
                    <div className="text-sm text-muted-foreground">Best Barber 2024</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Why Choose BarberCraft
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We combine traditional craftsmanship with modern techniques to deliver exceptional results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Scissors className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-4">Master Craftsmanship</h3>
              <p className="text-muted-foreground">
                Our experienced barbers bring years of expertise and attention to detail to every cut
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-4">Premium Products</h3>
              <p className="text-muted-foreground">
                We use only the finest grooming products and tools to ensure exceptional results
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-4">Convenient Booking</h3>
              <p className="text-muted-foreground">
                Easy online booking system with flexible scheduling to fit your busy lifestyle
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                Featured Services
              </h2>
              <p className="text-xl text-muted-foreground">
                Discover our most popular grooming services
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => navigate('/services')}
              className="hidden sm:inline-flex"
            >
              View All Services
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-10 w-full mt-4" />
                  </CardContent>
                </Card>
              ))
            ) : (
              services.map((service) => (
                <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary">
                        {service.durationMin} min
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <Badge variant="accent" className="mb-2">
                          {service.category}
                        </Badge>
                        <h3 className="text-xl font-serif font-semibold">{service.name}</h3>
                        <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold gradient-text">
                          {formatPrice(service.price)}
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={() => navigate(`/booking?service=${service.id}`)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="text-center mt-12 sm:hidden">
            <Button 
              variant="outline"
              onClick={() => navigate('/services')}
            >
              View All Services
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Barbers */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                Meet Our Barbers
              </h2>
              <p className="text-xl text-muted-foreground">
                Skilled craftsmen dedicated to perfection
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => navigate('/barbers')}
              className="hidden sm:inline-flex"
            >
              Meet the Team
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2 text-center w-full">
                      <Skeleton className="h-6 w-32 mx-auto" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                      <Skeleton className="h-4 w-20 mx-auto" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4 mx-auto" />
                      <Skeleton className="h-10 w-full mt-4" />
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              barbers.map((barber) => (
                <Card key={barber.id} className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="space-y-6">
                    <div className="relative">
                      <Avatar
                        src={barber.avatar}
                        alt={barber.name}
                        name={barber.name}
                        size="xl"
                        className="mx-auto"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-serif font-semibold">{barber.name}</h3>
                      <p className="text-accent font-medium">{barber.title}</p>
                      <Rating rating={barber.rating} showValue className="justify-center" />
                      <p className="text-sm text-muted-foreground">
                        {barber.yearsExperience} years experience
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {barber.bio}
                      </p>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {barber.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={() => navigate(`/booking?barber=${barber.id}`)}
                    >
                      Book with {barber.name.split(' ')[0]}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="text-center mt-12 sm:hidden">
            <Button 
              variant="outline"
              onClick={() => navigate('/barbers')}
            >
              Meet the Team
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                Premium Products
              </h2>
              <p className="text-xl text-muted-foreground">
                Professional grooming products for home care
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => navigate('/shop')}
              className="hidden sm:inline-flex"
            >
              Shop All Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full mt-4" />
                  </CardContent>
                </Card>
              ))
            ) : (
              products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    {product.originalPrice && (
                      <div className="absolute top-4 left-4">
                        <Badge variant="accent">
                          Sale
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <Badge variant="secondary" className="mb-2">
                          {product.category}
                        </Badge>
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.brand}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Rating rating={product.rating} size="sm" showValue />
                        <p className="text-xs text-muted-foreground">
                          {product.reviewCount} reviews
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-xl font-bold">
                            {formatPrice(product.price)}
                          </div>
                          {product.originalPrice && (
                            <div className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.originalPrice)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={() => navigate(`/shop/products/${product.id}`)}
                      >
                        View Product
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="text-center mt-12 sm:hidden">
            <Button 
              variant="outline"
              onClick={() => navigate('/shop')}
            >
              Shop All Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </Card>
              ))
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Avatar
                        src={review.customerAvatar}
                        alt={review.customerName}
                        name={review.customerName}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{review.customerName}</div>
                        <Rating rating={review.rating} size="sm" />
                      </div>
                    </div>
                    
                    <blockquote className="text-muted-foreground leading-relaxed">
                      "{review.comment}"
                    </blockquote>
                    
                    <div className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl font-serif font-bold">
              Ready for Your Best Look Yet?
            </h2>
            <p className="text-xl opacity-90 leading-relaxed">
              Experience the difference that true craftsmanship makes. Book your appointment today 
              and discover why we're the premier choice for discerning gentlemen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="xl" 
                variant="accent"
                onClick={() => navigate('/booking')}
                className="group"
              >
                Book Your Appointment
                <Calendar className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="xl" 
                variant="outline" 
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                onClick={() => navigate('/contact')}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}