import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Clock, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../lib/api';
import { formatPrice } from '../lib/utils';
import type { Service } from '../types';

interface ServiceFormData {
  name: string;
  price: number;
  duration: number;
}

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    price: 0,
    duration: 30
  });
  const [formErrors, setFormErrors] = useState<Partial<ServiceFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  // Load services on component mount
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getServices();
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = () => {
    setEditingService(null);
    setFormData({ name: '', price: 0, duration: 30 });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: service.price,
      duration: service.duration
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await apiClient.deleteService(id);
      setServices(services.filter(service => service.id !== id));
      addToast({
        type: 'success',
        title: 'Service deleted',
        description: 'The service has been successfully removed.'
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      addToast({
        type: 'error',
        title: 'Delete failed',
        description: 'Failed to delete service. Please try again.'
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<ServiceFormData> = {};

    if (!formData.name.trim()) {
      errors.name = 'Service name is required';
    }

    if (formData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    if (formData.duration <= 0) {
      errors.duration = 'Duration must be greater than 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingService) {
        // Update existing service
        const updatedService = await apiClient.updateService(editingService.id, formData);
        setServices(services.map(service => 
          service.id === editingService.id ? updatedService : service
        ));
      } else {
        // Create new service
        const newService = await apiClient.createService(formData);
        setServices([...services, newService]);
        addToast({
          type: 'success',
          title: editingService ? 'Service updated!' : 'Service created!',
          description: `${formData.name} has been successfully ${editingService ? 'updated' : 'added'}.`
        });
      }

      setIsModalOpen(false);
      setFormData({ name: '', price: 0, duration: 30 });
      setFormErrors({});
    } catch (error) {
      console.error('Error saving service:', error);
      addToast({
        type: 'error',
        title: 'Save failed',
        description: 'Failed to save service. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Services Management</h1>
            <p className="text-muted-foreground">
              Manage your barber shop services and pricing
            </p>
          </div>
          <Button onClick={handleCreateService} className="mt-4 sm:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Add New Service
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <div className="flex gap-2 pt-4">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                {searchTerm ? 'No services found matching your search.' : 'No services available.'}
              </div>
              {!searchTerm && (
                <Button onClick={handleCreateService} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Service
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold">{service.name}</h3>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditService(service)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xl font-bold text-foreground">
                          {formatPrice(service.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration} minutes</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <Badge variant="secondary">
                        Service ID: {service.id}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Service Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingService ? 'Edit Service' : 'Add New Service'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label="Service Name"
                placeholder="Enter service name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={formErrors.name}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Price ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  error={formErrors.price}
                  required
                />
              </div>
              <div>
                <Input
                  label="Duration (minutes)"
                  type="number"
                  min="1"
                  placeholder="30"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  error={formErrors.duration}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
