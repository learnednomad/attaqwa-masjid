import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Users, 
  BookOpen, 
  Heart,
  Clock,
  Calendar,
  GraduationCap,
  Handshake,
  Baby,
  UserCheck,
  Home,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    category: 'Worship Services',
    items: [
      {
        title: 'Daily Congregational Prayers',
        description: 'Five daily prayers in congregation with Adhan and Iqamah',
        icon: Building,
        schedule: 'Daily at prayer times',
        color: 'bg-islamic-green-100 text-islamic-green-800'
      },
      {
        title: 'Friday Jummah Prayer',
        description: 'Weekly Friday congregational prayer with khutbah (sermon)',
        icon: Users,
        schedule: 'Fridays at 1:30 PM',
        color: 'bg-islamic-green-100 text-islamic-green-800'
      },
      {
        title: 'Eid Celebrations',
        description: 'Special prayers and community celebration for Eid al-Fitr and Eid al-Adha',
        icon: Calendar,
        schedule: 'Twice yearly',
        color: 'bg-islamic-gold-100 text-islamic-gold-800'
      },
      {
        title: 'Ramadan Programs',
        description: 'Tarawih prayers, community Iftar, and Itikaf programs',
        icon: Clock,
        schedule: 'During Ramadan',
        color: 'bg-purple-100 text-purple-800'
      }
    ]
  },
  {
    category: 'Educational Services',
    items: [
      {
        title: 'Islamic Education Classes',
        description: 'Comprehensive Islamic studies for children, youth, and adults',
        icon: BookOpen,
        schedule: 'Weekly sessions',
        color: 'bg-blue-100 text-blue-800'
      },
      {
        title: 'Quran Recitation Classes',
        description: 'Learn proper Quran recitation with Tajweed rules',
        icon: GraduationCap,
        schedule: 'Saturdays & Sundays',
        color: 'bg-blue-100 text-blue-800'
      },
      {
        title: 'Arabic Language Classes',
        description: 'Learn Arabic to better understand Islamic texts and prayers',
        icon: BookOpen,
        schedule: 'Weekends',
        color: 'bg-blue-100 text-blue-800'
      },
      {
        title: 'Adult Islamic Studies',
        description: 'In-depth study of Islamic theology, jurisprudence, and history',
        icon: Users,
        schedule: 'Wednesday evenings',
        color: 'bg-blue-100 text-blue-800'
      }
    ]
  },
  {
    category: 'Community Support',
    items: [
      {
        title: 'Marriage Services',
        description: 'Islamic marriage ceremonies (Nikah) and pre-marriage counseling',
        icon: Heart,
        schedule: 'By appointment',
        color: 'bg-pink-100 text-pink-800'
      },
      {
        title: 'Funeral Services',
        description: 'Islamic funeral rites including Janazah prayer and burial services',
        icon: Heart,
        schedule: 'As needed',
        color: 'bg-gray-100 text-gray-800'
      },
      {
        title: 'New Muslim Support',
        description: 'Guidance and support for those new to Islam',
        icon: UserCheck,
        schedule: 'Ongoing support',
        color: 'bg-green-100 text-green-800'
      },
      {
        title: 'Family Counseling',
        description: 'Islamic guidance for family relationships and conflicts',
        icon: Home,
        schedule: 'By appointment',
        color: 'bg-orange-100 text-orange-800'
      }
    ]
  },
  {
    category: 'Youth & Family Programs',
    items: [
      {
        title: 'Children\'s Islamic School',
        description: 'Weekend Islamic education for children ages 5-15',
        icon: GraduationCap,
        schedule: 'Sundays 10 AM - 2 PM',
        color: 'bg-yellow-100 text-yellow-800'
      },
      {
        title: 'Youth Group Activities',
        description: 'Islamic youth programs including sports, discussions, and community service',
        icon: Users,
        schedule: 'Bi-weekly',
        color: 'bg-yellow-100 text-yellow-800'
      },
      {
        title: 'Family Events',
        description: 'Regular family gatherings, picnics, and educational workshops',
        icon: Heart,
        schedule: 'Monthly',
        color: 'bg-yellow-100 text-yellow-800'
      },
      {
        title: 'Baby Blessing Ceremonies',
        description: 'Aqiqah ceremonies and Islamic baby naming traditions',
        icon: Baby,
        schedule: 'By appointment',
        color: 'bg-pink-100 text-pink-800'
      }
    ]
  }
];

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <section className="text-center mb-12">
        <h1 className="text-5xl font-bold text-islamic-navy-800 mb-6">
          Our Services
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Masjid At-Taqwa offers comprehensive Islamic services to support our community's 
          spiritual, educational, and social needs throughout life's journey.
        </p>
      </section>

      {/* Services by Category */}
      <div className="space-y-12">
        {services.map((category, categoryIndex) => (
          <section key={categoryIndex}>
            <h2 className="text-3xl font-bold text-islamic-navy-800 mb-8 text-center">
              {category.category}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.items.map((service, serviceIndex) => {
                const Icon = service.icon;
                
                return (
                  <Card key={serviceIndex} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-islamic-green-100 p-3 rounded-lg">
                          <Icon className="h-6 w-6 text-islamic-green-600" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-islamic-navy-800 mb-2">
                            {service.title}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {service.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge className={service.color}>
                              {service.schedule}
                            </Badge>
                            <Button variant="ghost" size="sm" className="text-islamic-green-600">
                              Learn More
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Contact for Services */}
      <section className="mt-16">
        <Card className="bg-gradient-to-r from-islamic-green-50 to-islamic-gold-50 border-islamic-green-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-3xl font-bold text-islamic-navy-800 mb-4">
              Need Our Services?
            </h3>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
              We're here to serve our community. Contact us to schedule services, 
              ask questions, or learn more about our programs.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex flex-col items-center gap-2">
                <Phone className="h-6 w-6 text-islamic-green-600" />
                <h4 className="font-semibold text-islamic-navy-800">Call Us</h4>
                <p className="text-gray-600 text-sm">
                  For urgent matters and appointments
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Mail className="h-6 w-6 text-islamic-green-600" />
                <h4 className="font-semibold text-islamic-navy-800">Email Us</h4>
                <p className="text-gray-600 text-sm">
                  For general inquiries and information
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <MapPin className="h-6 w-6 text-islamic-green-600" />
                <h4 className="font-semibold text-islamic-navy-800">Visit Us</h4>
                <p className="text-gray-600 text-sm">
                  Come to the mosque for in-person assistance
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-islamic-green-600 hover:bg-islamic-green-700">
                  <Phone className="h-5 w-5 mr-2" />
                  Contact Us
                </Button>
              </Link>
              
              <Link href="/prayer-times">
                <Button size="lg" variant="outline" className="border-islamic-green-600 text-islamic-green-600 hover:bg-islamic-green-50">
                  <Clock className="h-5 w-5 mr-2" />
                  Prayer Times
                </Button>
              </Link>
              
              <Link href="/events">
                <Button size="lg" variant="outline" className="border-islamic-navy-600 text-islamic-navy-600 hover:bg-islamic-navy-50">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Events
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}