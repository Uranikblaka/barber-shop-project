import { useEffect, useState } from 'react';
import { Calendar, Clock, User, Scissors, Edit, Trash2, Plus, Search, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { AdminOnly, UserOnly } from '../components/RoleGuard';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { Appointment, Service, CreateAppointmentData, UpdateAppointmentData } from '../types';

interface AppointmentFormData {
  service_id: string;
  date: string;
  time: string;
}

export function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<AppointmentFormData>({
    service_id: '',
    date: '',
    time: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<AppointmentFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, isAuthenticated } = useAuth();

  // Load appointments and services on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, servicesData] = await Promise.all([
        apiClient.getAppointments(),
        apiClient.getServices()
      ]);
      setAppointments(appointmentsData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = () => {
    setEditingAppointment(null);
    setFormData({ service_id: '', date: '', time: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      service_id: appointment.service_id,
      date: appointment.date,
      time: appointment.time
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      await apiClient.deleteAppointment(id);
      setAppointments(appointments.filter(appointment => appointment.id !== id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment. Please try again.');
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<AppointmentFormData> = {};

    if (!formData.service_id) {
      errors.service_id = 'Service is required';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.date = 'Date cannot be in the past';
      }
    }

    if (!formData.time) {
      errors.time = 'Time is required';
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
      if (editingAppointment) {
        // Update existing appointment
        const updatedAppointment = await apiClient.updateAppointment(editingAppointment.id, formData);
        setAppointments(appointments.map(appointment => 
          appointment.id === editingAppointment.id ? updatedAppointment : appointment
        ));
      } else {
        // Create new appointment
        const newAppointment = await apiClient.createAppointment(formData);
        setAppointments([...appointments, newAppointment]);
      }

      setIsModalOpen(false);
      setFormData({ service_id: '', date: '', time: '' });
      setFormErrors({});
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      if (error.message?.includes('time slot is already booked')) {
        setFormErrors({ time: 'This time slot is already booked' });
      } else {
        alert('Failed to save appointment. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Unknown Service';
  };

  const filteredAppointments = appointments.filter(appointment => {
    const serviceName = getServiceName(appointment.service_id).toLowerCase();
    return serviceName.includes(searchTerm.toLowerCase()) ||
           appointment.date.includes(searchTerm) ||
           appointment.time.includes(searchTerm);
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-serif font-bold mb-4">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">
              Please log in to view and manage appointments.
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Appointments</h1>
            <p className="text-muted-foreground">
              {user?.role === 'ADMIN' ? 'Manage all appointments' : 'View your appointments'}
            </p>
          </div>
          <AdminOnly>
            <Button onClick={handleCreateAppointment} className="mt-4 sm:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </AdminOnly>
          <UserOnly>
            <Button onClick={() => window.location.href = '/booking'} className="mt-4 sm:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Book New Appointment
            </Button>
          </UserOnly>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
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

        {/* Appointments List */}
        {loading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-muted-foreground mb-4">
                {searchTerm ? 'No appointments found matching your search.' : 'No appointments scheduled.'}
              </div>
              {!searchTerm && (
                <Button onClick={handleCreateAppointment}>
                  <Plus className="w-4 h-4 mr-2" />
                  Book Your First Appointment
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Scissors className="w-4 h-4" />
                          <span className="font-medium">{getServiceName(appointment.service_id)}</span>
                        </div>
                        <Badge variant="secondary">
                          ID: {appointment.id}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(appointment.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(appointment.time)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span>User ID: {appointment.user_id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <AdminOnly>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAppointment(appointment)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AdminOnly>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Appointment Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingAppointment ? 'Edit Appointment' : 'Book New Appointment'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Service
              </label>
              <select
                value={formData.service_id}
                onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.price ? `$${service.price}` : ''}
                  </option>
                ))}
              </select>
              {formErrors.service_id && (
                <p className="text-sm text-destructive mt-1">{formErrors.service_id}</p>
              )}
            </div>

            <div>
              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                error={formErrors.date}
                required
              />
            </div>

            <div>
              <Input
                label="Time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                error={formErrors.time}
                required
              />
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
                {isSubmitting ? 'Saving...' : editingAppointment ? 'Update Appointment' : 'Book Appointment'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
