import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  CheckCircle, 
  MapPin, 
  Phone,
  Mail,
  FileText,
  ChevronLeft,
  ChevronRight,
  Star,
  Building2,
  Users,
  Brain
} from 'lucide-react';

interface BookingPageProps {
  transcript: string;
  onBack: () => void;
}

interface PatientInfo {
  name: string;
  age: string;
  phone: string;
  email: string;
  reason: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  experience: string;
  avatar: string;
  availableSlots: string[];
}

interface Department {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  doctors: Doctor[];
}

const BookingPage: React.FC<BookingPageProps> = ({ transcript, onBack }) => {
  const [currentStep, setCurrentStep] = useState<'department' | 'doctor' | 'date' | 'time' | 'patient' | 'confirm'>('department');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '',
    age: '',
    phone: '',
    email: '',
    reason: ''
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [extractedDateTime, setExtractedDateTime] = useState<string>('');

  // Mock data
  const departments: Department[] = [
    {
      id: 'cardiology',
      name: 'Cardiology',
      description: 'Heart and cardiovascular health',
      icon: <Stethoscope className="w-6 h-6" />,
      doctors: [
        {
          id: 'dr-smith',
          name: 'Dr. Sarah Smith',
          specialization: 'Cardiologist',
          rating: 4.8,
          experience: '15 years',
          avatar: '👩‍⚕️',
          availableSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM']
        },
        {
          id: 'dr-johnson',
          name: 'Dr. Michael Johnson',
          specialization: 'Interventional Cardiologist',
          rating: 4.9,
          experience: '12 years',
          avatar: '👨‍⚕️',
          availableSlots: ['11:00 AM', '01:00 PM', '04:00 PM', '05:30 PM']
        }
      ]
    },
    {
      id: 'neurology',
      name: 'Neurology',
      description: 'Brain and nervous system disorders',
      icon: <Brain className="w-6 h-6" />,
      doctors: [
        {
          id: 'dr-williams',
          name: 'Dr. Emily Williams',
          specialization: 'Neurologist',
          rating: 4.7,
          experience: '18 years',
          avatar: '👩‍⚕️',
          availableSlots: ['08:30 AM', '10:00 AM', '01:30 PM', '03:00 PM']
        }
      ]
    },
    {
      id: 'orthopedics',
      name: 'Orthopedics',
      description: 'Bones, joints, and musculoskeletal system',
      icon: <Building2 className="w-6 h-6" />,
      doctors: [
        {
          id: 'dr-brown',
          name: 'Dr. David Brown',
          specialization: 'Orthopedic Surgeon',
          rating: 4.6,
          experience: '20 years',
          avatar: '👨‍⚕️',
          availableSlots: ['09:30 AM', '11:30 AM', '02:30 PM', '04:30 PM']
        }
      ]
    },
    {
      id: 'dermatology',
      name: 'Dermatology',
      description: 'Skin, hair, and nail conditions',
      icon: <Users className="w-6 h-6" />,
      doctors: [
        {
          id: 'dr-davis',
          name: 'Dr. Lisa Davis',
          specialization: 'Dermatologist',
          rating: 4.8,
          experience: '14 years',
          avatar: '👩‍⚕️',
          availableSlots: ['08:00 AM', '10:30 AM', '01:00 PM', '03:30 PM']
        }
      ]
    }
  ];

  // Extract date/time from transcript
  useEffect(() => {
    const dateTimePatterns = [
      /(?:tomorrow|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|today)\s+(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
      /(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s+(?:tomorrow|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|today)/i,
      /(?:appointment|meeting)\s+(?:for\s+)?(?:tomorrow|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|today)/i
    ];

    for (const pattern of dateTimePatterns) {
      const match = transcript.match(pattern);
      if (match) {
        setExtractedDateTime(match[0]);
        break;
      }
    }
  }, [transcript]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateSelect = (date: Date) => {
    if (!isPastDate(date)) {
      setSelectedDate(date);
      setCurrentStep('time');
    }
  };

  const handleBooking = () => {
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      setCurrentStep('department');
      // Reset all selections
      setSelectedDepartment('');
      setSelectedDoctor('');
      setSelectedDate(null);
      setSelectedTime('');
      setPatientInfo({
        name: '',
        age: '',
        phone: '',
        email: '',
        reason: ''
      });
    }, 3000);
  };

  const getSelectedDoctor = () => {
    const dept = departments.find(d => d.id === selectedDepartment);
    return dept?.doctors.find(d => d.id === selectedDoctor);
  };

  const renderDepartmentSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Select Department</h2>
        <p className="text-slate-600 dark:text-slate-300">Choose the medical department for your consultation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((dept) => (
          <motion.div
            key={dept.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
              selectedDepartment === dept.id
                ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/20 shadow-lg'
                : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/70 hover:border-blue-300 dark:hover:border-blue-600'
            }`}
            onClick={() => {
              setSelectedDepartment(dept.id);
              setCurrentStep('doctor');
            }}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                selectedDepartment === dept.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {dept.icon}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{dept.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{dept.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderDoctorSelection = () => {
    const dept = departments.find(d => d.id === selectedDepartment);
    if (!dept) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Select Doctor</h2>
          <p className="text-slate-600 dark:text-slate-300">Choose your preferred specialist</p>
        </div>

        <div className="space-y-4">
          {dept.doctors.map((doctor) => (
            <motion.div
              key={doctor.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                selectedDoctor === doctor.id
                  ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/20 shadow-lg'
                  : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/70 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
              onClick={() => {
                setSelectedDoctor(doctor.id);
                setCurrentStep('date');
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{doctor.avatar}</div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{doctor.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{doctor.specialization}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{doctor.rating}</span>
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">•</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{doctor.experience}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500 dark:text-slate-400">Available slots</div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{doctor.availableSlots.length}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderDateSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Select Date</h2>
        <p className="text-slate-600 dark:text-slate-300">Choose your preferred appointment date</p>
        {extractedDateTime && (
          <div className="mt-2 p-3 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Detected from transcript:</strong> {extractedDateTime}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white/60 dark:bg-slate-800/70 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {getDaysInMonth(currentMonth).map((date, index) => (
            <div key={index} className="aspect-square">
              {date ? (
                <button
                  onClick={() => handleDateSelect(date)}
                  disabled={isPastDate(date)}
                  className={`w-full h-full rounded-lg text-sm font-medium transition-all duration-200 ${
                    isToday(date)
                      ? 'bg-blue-500 text-white'
                      : isSelected(date)
                      ? 'bg-blue-600 text-white shadow-lg'
                      : isPastDate(date)
                      ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {date.getDate()}
                </button>
              ) : (
                <div className="w-full h-full" />
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderTimeSelection = () => {
    const doctor = getSelectedDoctor();
    if (!doctor) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Select Time</h2>
          <p className="text-slate-600 dark:text-slate-300">Choose your preferred appointment time</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {doctor.availableSlots.map((time) => (
            <motion.button
              key={time}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedTime(time);
                setCurrentStep('patient');
              }}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                selectedTime === time
                  ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/20 shadow-lg'
                  : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/70 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
            >
              <div className="text-center">
                <Clock className="w-5 h-5 mx-auto mb-2 text-slate-600 dark:text-slate-300" />
                <span className="font-medium text-slate-900 dark:text-white">{time}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderPatientForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Patient Information</h2>
        <p className="text-slate-600 dark:text-slate-300">Please provide your details for the appointment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={patientInfo.name}
            onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
            className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 dark:focus:ring-blue-400/50 dark:focus:border-blue-400"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Age *
          </label>
          <input
            type="number"
            value={patientInfo.age}
            onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
            className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 dark:focus:ring-blue-400/50 dark:focus:border-blue-400"
            placeholder="Enter your age"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={patientInfo.phone}
            onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
            className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 dark:focus:ring-blue-400/50 dark:focus:border-blue-400"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={patientInfo.email}
            onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
            className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 dark:focus:ring-blue-400/50 dark:focus:border-blue-400"
            placeholder="Enter your email address"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Reason for Visit *
        </label>
        <textarea
          value={patientInfo.reason}
          onChange={(e) => setPatientInfo({ ...patientInfo, reason: e.target.value })}
          rows={4}
          className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 dark:focus:ring-blue-400/50 dark:focus:border-blue-400 resize-none"
          placeholder="Describe your symptoms or reason for the appointment"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={() => setCurrentStep('time')}
          className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setCurrentStep('confirm')}
          disabled={!patientInfo.name || !patientInfo.age || !patientInfo.phone || !patientInfo.reason}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );

  const renderConfirmation = () => {
    const doctor = getSelectedDoctor();
    const dept = departments.find(d => d.id === selectedDepartment);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Confirm Appointment</h2>
          <p className="text-slate-600 dark:text-slate-300">Review your appointment details</p>
        </div>

        <div className="bg-white/60 dark:bg-slate-800/70 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-300">Department</p>
              <p className="text-blue-700 dark:text-blue-400">{dept?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-green-50/80 dark:bg-green-900/20 rounded-xl">
            <User className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-300">Doctor</p>
              <p className="text-green-700 dark:text-green-400">{doctor?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-purple-50/80 dark:bg-purple-900/20 rounded-xl">
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="font-medium text-purple-900 dark:text-purple-300">Date & Time</p>
              <p className="text-purple-700 dark:text-purple-400">
                {selectedDate?.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} at {selectedTime}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-amber-50/80 dark:bg-amber-900/20 rounded-xl">
            <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-300">Patient</p>
              <p className="text-amber-700 dark:text-amber-400">{patientInfo.name}, {patientInfo.age} years</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setCurrentStep('patient')}
            className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleBooking}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-300"
          >
            Confirm Booking
          </button>
        </div>
      </motion.div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'department':
        return renderDepartmentSelection();
      case 'doctor':
        return renderDoctorSelection();
      case 'date':
        return renderDateSelection();
      case 'time':
        return renderTimeSelection();
      case 'patient':
        return renderPatientForm();
      case 'confirm':
        return renderConfirmation();
      default:
        return renderDepartmentSelection();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto mt-8"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Book Appointment</h1>
            <p className="text-slate-600 dark:text-slate-300">Schedule your medical consultation</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {['department', 'doctor', 'date', 'time', 'patient', 'confirm'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep === step
                  ? 'bg-blue-500 text-white'
                  : ['department', 'doctor', 'date', 'time', 'patient', 'confirm'].indexOf(currentStep) > index
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {index + 1}
              </div>
              {index < 5 && (
                <div className={`w-12 h-1 mx-2 ${
                  ['department', 'doctor', 'date', 'time', 'patient', 'confirm'].indexOf(currentStep) > index
                    ? 'bg-green-500'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {renderCurrentStep()}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-xl shadow-lg z-50"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <div>
                <p className="font-semibold">Appointment Booked!</p>
                <p className="text-sm opacity-90">You will receive a confirmation email shortly.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BookingPage; 