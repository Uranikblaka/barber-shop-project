import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock newsletter subscription
    alert('Thank you for subscribing to our newsletter!');
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Contact */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-serif font-bold">
                BarberCraft
              </span>
            </div>
            <p className="text-primary-foreground/80">
              Premium barbering experience with attention to detail and exceptional service.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">123 Main Street, New York, NY 10001</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">hello@barbercraft.com</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif font-semibold">Services</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/services" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                Signature Cuts
              </Link>
              <Link to="/services" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                Beard Styling
              </Link>
              <Link to="/services" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                Hot Towel Shaves
              </Link>
              <Link to="/services" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                Hair Treatments
              </Link>
            </nav>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif font-semibold">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/about" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                About Us
              </Link>
              <Link to="/barbers" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                Our Team
              </Link>
              <Link to="/shop" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                Shop Products
              </Link>
              <Link to="/contact" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          {/* Newsletter & Hours */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-semibold">Stay Updated</h3>
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                />
                <Button 
                  type="submit" 
                  variant="accent" 
                  className="w-full"
                >
                  Subscribe
                </Button>
              </form>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">Opening Hours</span>
              </div>
              <div className="space-y-1 text-sm text-primary-foreground/80">
                <div className="flex justify-between">
                  <span>Mon - Fri</span>
                  <span>9:00 - 19:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>8:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>10:00 - 16:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-primary-foreground/20 pt-8 mt-12">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-sm text-primary-foreground/60">
              © 2025 BarberCraft. All rights reserved.
            </p>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-primary-foreground/80 hover:text-accent">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-primary-foreground/80 hover:text-accent">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-primary-foreground/80 hover:text-accent">
                <Twitter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}