import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, Scissors, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../lib/utils';
import type { Service, CreateAppointmentData } from '../types';

interface BookingFormData {
  service_id: string;
  date: string;
  time: string;
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30'
];

export function Booking() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    service_id: '',
    date: '',
    time: ''
  });
  const [errors, setErrors] = useState<Partial<BookingFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: Select Service, 2: Select Date/Time, 3: Confirmation
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Load services on component mount
  useEffect(() => {
    loadServices();
    
    // Check if service is pre-selected from URL
    const serviceId = searchParams.get('service');
    if (serviceId) {
      setFormData(prev => ({ ...prev, service_id: serviceId }));
    }
  }, [searchParams]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getServices();
      setServices(data);
      
      // Set pre-selected service if from URL
      const serviceId = searchParams.get('service');
      if (serviceId) {
        const service = data.find(s => s.id === serviceId);
        if (service) {
          setSelectedService(service);
          setStep(2);
        }
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setFormData(prev => ({ ...prev, service_id: service.id }));
    setStep(2);
  };

  const handleDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, date, time: '' }));
    setErrors(prev => ({ ...prev, date: undefined, time: undefined }));
  };

  const handleTimeSelect = (time: string) => {
    setFormData(prev => ({ ...prev, time }));
    setErrors(prev => ({ ...prev, time: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BookingFormData> = {};

    if (!formData.service_id) {
      newErrors.service_id = 'Please select a service';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }

    if (!formData.time) {
      newErrors.time = 'Please select a time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/booking' } } });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.createAppointment(formData);
      setStep(3);
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      if (error.message?.includes('time slot is already booked')) {
        setErrors({ time: 'This time slot is already booked. Please select another time.' });
      } else {
        alert('Failed to book appointment. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-64 mb-8" />
            <div className="grid md:grid-cols-2 gap-8">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-serif font-bold">Book Appointment</h1>
              <p className="text-muted-foreground">Schedule your barber shop visit</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${step >= stepNumber 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      step > stepNumber ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Side - Booking Form */}
            <div className="space-y-6">
              {/* Step 1: Service Selection */}
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scissors className="w-5 h-5" />
                      Select Service
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => handleServiceSelect(service)}
                        className="p-4 border border-border rounded-xl cursor-pointer hover:border-primary hover:bg-muted/50 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{service.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {service.description || 'Professional barbering service'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {formatPrice(service.price)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {service.duration} min
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Date & Time Selection */}
              {step === 2 && selectedService && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Select Date & Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Selected Service Summary */}
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{selectedService.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedService.duration} minutes
                          </p>
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {formatPrice(selectedService.price)}
                        </div>
                      </div>
                    </div>

                    {/* Date Selection */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Select Date
                      </label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleDateChange(e.target.value)}
                        error={errors.date}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {/* Time Selection */}
                    {formData.date && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Select Time
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {TIME_SLOTS.map((time) => (
                            <Button
                              key={time}
                              variant={formData.time === time ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleTimeSelect(time)}
                              className="text-xs"
                            >
                              {formatTime(time)}
                            </Button>
                          ))}
                        </div>
                        {errors.time && (
                          <p className="text-sm text-destructive mt-2">{errors.time}</p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleBooking}
                        disabled={!formData.date || !formData.time || isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting ? 'Booking...' : 'Book Appointment'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-serif font-bold mb-2">Appointment Booked!</h2>
                    <p className="text-muted-foreground mb-6">
                      Your appointment has been successfully scheduled.
                    </p>
                    <div className="space-y-2 mb-6">
                      <p><strong>Service:</strong> {selectedService?.name}</p>
                      <p><strong>Date:</strong> {formatDate(formData.date)}</p>
                      <p><strong>Time:</strong> {formatTime(formData.time)}</p>
                      <p><strong>Duration:</strong> {selectedService?.duration} minutes</p>
                      <p><strong>Price:</strong> {formatPrice(selectedService?.price || 0)}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => navigate('/appointments')}
                        className="flex-1"
                      >
                        View Appointments
                      </Button>
                      <Button
                        onClick={() => {
                          setStep(1);
                          setFormData({ service_id: '', date: '', time: '' });
                          setSelectedService(null);
                        }}
                        className="flex-1"
                      >
                        Book Another
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Side - Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Flexible Scheduling</h4>
                      <p className="text-sm text-muted-foreground">
                        Book appointments up to 30 days in advance with our convenient online system.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Time Slots</h4>
                      <p className="text-sm text-muted-foreground">
                        We offer 30-minute time slots from 9:00 AM to 7:30 PM, Monday through Saturday.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Cancellation Policy</h4>
                      <p className="text-sm text-muted-foreground">
                        Please cancel or reschedule at least 24 hours in advance to avoid any charges.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!isAuthenticated && (
                <Card className="border-destructive">
                  <CardContent className="p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Login Required</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You need to be logged in to book an appointment.
                    </p>
                    <Button onClick={() => navigate('/login')} className="w-full">
                      Sign In
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
