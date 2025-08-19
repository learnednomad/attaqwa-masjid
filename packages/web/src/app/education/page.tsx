'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FeatureFlagService } from '@attaqwa/shared/feature-flags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Brain, 
  TrendingUp, 
  Users, 
  Clock, 
  Award,
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';
import { AgeTierFilter } from '@/components/features/education/AgeTierFilter';
import { EducationContentCard } from '@/components/features/education/EducationContentCard';
import { useEducationContent, useUserEducationStats } from '@/lib/hooks/useEducation';
import { generateSEOMetadata } from '@/lib/seo';
import { BreadcrumbStructuredData, MosqueStructuredData } from '@/components/seo/StructuredData';
import type { AgeTier, IslamicSubject, DifficultyLevel, EducationContentType } from '@attaqwa/shared';

// Note: Metadata export removed because this is a Client Component
// SEO metadata should be handled in a layout.tsx or through other means for client components

// Mock data for demonstration
const mockEducationContent = [
  {
    id: '1',
    title: 'Introduction to Quran',
    description: 'Learn the basics of Quranic reading and understanding with proper pronunciation and meaning.',
    subject: 'QURAN' as IslamicSubject,
    ageTier: 'CHILDREN' as AgeTier,
    difficultyLevel: 'BEGINNER' as DifficultyLevel,
    contentType: 'LESSON' as EducationContentType,
    estimatedDuration: 30,
    thumbnailUrl: '/images/quran-basics.jpg',
    isPublished: true,
    tags: ['basics', 'reading', 'pronunciation'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    author: {
      id: '1',
      name: 'Imam Abdullah'
    },
    _count: {
      userProgress: 24,
      quizAttempts: 18
    },
    arabicContent: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
    transliteration: 'Bismillah ar-Rahman ar-Raheem'
  },
  {
    id: '2',
    title: 'Five Pillars of Islam',
    description: 'Understanding the fundamental pillars that form the foundation of Islamic faith and practice.',
    subject: 'AQIDAH' as IslamicSubject,
    ageTier: 'YOUTH' as AgeTier,
    difficultyLevel: 'BEGINNER' as DifficultyLevel,
    contentType: 'LESSON' as EducationContentType,
    estimatedDuration: 45,
    isPublished: true,
    tags: ['pillars', 'faith', 'practice'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
    author: {
      id: '2',
      name: 'Sister Aisha'
    },
    _count: {
      userProgress: 31,
      quizAttempts: 25
    }
  },
  {
    id: '3',
    title: 'Prayer (Salah) Fundamentals',
    description: 'Learn the correct way to perform the five daily prayers with proper movements and recitations.',
    subject: 'WORSHIP' as IslamicSubject,
    ageTier: 'ALL_AGES' as AgeTier,
    difficultyLevel: 'BEGINNER' as DifficultyLevel,
    contentType: 'VIDEO' as EducationContentType,
    estimatedDuration: 25,
    isPublished: true,
    tags: ['salah', 'prayer', 'worship'],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-10'),
    author: {
      id: '1',
      name: 'Imam Abdullah'
    },
    _count: {
      userProgress: 45,
      quizAttempts: 0
    }
  }
];

const stats = [
  {
    title: 'Total Lessons',
    value: '126',
    change: '+12%',
    icon: BookOpen,
    description: 'Available Islamic lessons'
  },
  {
    title: 'Your Progress',
    value: '73%',
    change: '+8%',
    icon: TrendingUp,
    description: 'Learning completion'
  },
  {
    title: 'Completed Quizzes',
    value: '24',
    change: '+5',
    icon: Brain,
    description: 'Knowledge assessments'
  },
  {
    title: 'Certificates Earned',
    value: '3',
    change: '+1',
    icon: Award,
    description: 'Achievement milestones'
  }
];

const subjects = [
  { name: 'Quran', icon: '📖', count: 45, color: 'bg-islamic-green-100 text-islamic-green-800' },
  { name: 'Hadith', icon: '📜', count: 32, color: 'bg-islamic-gold-100 text-islamic-gold-800' },
  { name: 'Fiqh', icon: '⚖️', count: 28, color: 'bg-blue-100 text-blue-800' },
  { name: 'Aqidah', icon: '💡', count: 21, color: 'bg-purple-100 text-purple-800' },
  { name: 'Seerah', icon: '🕌', count: 19, color: 'bg-indigo-100 text-indigo-800' },
  { name: 'Worship', icon: '🤲', count: 15, color: 'bg-emerald-100 text-emerald-800' }
];

export default function EducationPage() {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Islamic Education', url: '/education' }
  ];

  // Feature flag protection - disable education system
  if (!FeatureFlagService.canAccessEducationUI()) {
    return (
      <>
        {/* Structured Data for SEO */}
        <BreadcrumbStructuredData items={breadcrumbs} />
        <MosqueStructuredData />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <header>
              <h1 className="text-4xl font-bold text-islamic-navy-800 mb-4">
                Islamic Education System
              </h1>
              <p className="text-lg text-islamic-navy-600 mb-6">
                Comprehensive Islamic learning programs for all ages - Coming Soon
              </p>
            </header>
            
            <section className="bg-islamic-gold-50 border border-islamic-gold-200 rounded-lg p-6 mb-6" aria-labelledby="development-notice">
              <h2 id="development-notice" className="text-xl font-semibold text-islamic-gold-800 mb-2">
                🚧 Under Development
              </h2>
              <p className="text-islamic-gold-700 mb-4">
                Our Islamic education platform is currently being enhanced to provide you with the best learning experience. 
                Please check back soon for access to comprehensive Islamic lessons, quizzes, and progress tracking.
              </p>
              
              <div className="text-left space-y-3">
                <h3 className="font-semibold text-islamic-gold-800">Coming Features:</h3>
                <ul className="list-disc list-inside text-sm text-islamic-gold-700 space-y-1">
                  <li>Interactive Quran study with Tafsir</li>
                  <li>Hadith collections and explanations</li>
                  <li>Fiqh (Islamic jurisprudence) lessons</li>
                  <li>Seerah (Prophet's biography) courses</li>
                  <li>Age-appropriate Islamic curriculum</li>
                  <li>Progress tracking and certificates</li>
                  <li>Interactive quizzes and assessments</li>
                  <li>Arabic language learning</li>
                </ul>
              </div>
            </section>
            
            <nav className="space-y-4">
              <Link href="/">
                <Button className="bg-islamic-green-600 hover:bg-islamic-green-700">
                  Return to Home
                </Button>
              </Link>
              <p className="text-sm text-gray-500">
                In the meantime, explore our prayer times, announcements, and community events.
              </p>
            </nav>
          </div>
        </div>
      </>
    );
  }

  const [selectedAgeTier, setSelectedAgeTier] = useState<AgeTier | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  // Use real API data when available, fallback to mock data
  const { data: educationData, isLoading: contentLoading } = useEducationContent({
    ageTier: selectedAgeTier,
    search: searchQuery,
    isPublished: true
  });

  const { data: userStats, isLoading: statsLoading } = useUserEducationStats();

  // Use API data if available, otherwise use mock data
  const contentToDisplay = educationData?.data || mockEducationContent;
  
  const filteredContent = contentToDisplay.filter((content: any) => {
    const matchesAge = !selectedAgeTier || content.ageTier === selectedAgeTier || content.ageTier === 'ALL_AGES';
    const matchesSearch = !searchQuery || 
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesAge && matchesSearch;
  });

  // Update stats with real data when available
  const displayStats = userStats ? [
    {
      title: 'Total Lessons',
      value: educationData?.pagination?.total || '126',
      change: '+12%',
      icon: BookOpen,
      description: 'Available Islamic lessons'
    },
    {
      title: 'Your Progress',
      value: `${Math.round((userStats.totalContentsCompleted / (educationData?.pagination?.total || 126)) * 100)}%`,
      change: '+8%',
      icon: TrendingUp,
      description: 'Learning completion'
    },
    {
      title: 'Completed Quizzes',
      value: userStats.totalContentsCompleted.toString(),
      change: '+5',
      icon: Brain,
      description: 'Knowledge assessments'
    },
    {
      title: 'Certificates Earned',
      value: userStats.certificates.toString(),
      change: '+1',
      icon: Award,
      description: 'Achievement milestones'
    }
  ] : stats;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-islamic-navy-800 mb-4">
          Islamic Education
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Deepen your understanding of Islam through our comprehensive educational platform. 
          Learn at your own pace with age-appropriate content, interactive quizzes, and progress tracking.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {displayStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-islamic-navy-800">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.description}</p>
                  </div>
                  <div className="bg-islamic-green-100 p-3 rounded-lg">
                    <Icon className="h-6 w-6 text-islamic-green-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                  <span className="text-sm text-gray-500 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Continue Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-islamic-green-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-islamic-navy-800">Prayer Fundamentals</h4>
                  <p className="text-sm text-gray-600">Continue from: Wudu (Ablution)</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-islamic-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <Button size="sm" className="bg-islamic-green-600 hover:bg-islamic-green-700">
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-islamic-gold-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-islamic-navy-800">Quran Recitation</h4>
                  <p className="text-sm text-gray-600">Next: Surah Al-Fatiha Practice</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-islamic-gold-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Start
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-islamic-green-100 p-2 rounded-full">
                  <Award className="h-4 w-4 text-islamic-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Quran Basics</p>
                  <p className="text-xs text-gray-500">Completed 3 days ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-islamic-gold-100 p-2 rounded-full">
                  <Brain className="h-4 w-4 text-islamic-gold-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Prayer Quiz Master</p>
                  <p className="text-xs text-gray-500">Earned 1 week ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Study Streak: 7 days</p>
                  <p className="text-xs text-gray-500">Keep it up!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Islamic Subjects */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Explore Islamic Subjects</CardTitle>
          <p className="text-gray-600">Choose a subject to begin your learning journey</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {subjects.map((subject) => (
              <Link key={subject.name} href={`/education/subject/${subject.name.toLowerCase()}`}>
                <div className="text-center p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-3xl mb-2">{subject.icon}</div>
                  <h3 className="font-semibold text-islamic-navy-800 mb-1">{subject.name}</h3>
                  <Badge variant="secondary" className={subject.color}>
                    {subject.count} lessons
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Browser */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Browse Educational Content</CardTitle>
              <p className="text-gray-600">Discover lessons, quizzes, and resources tailored for your learning</p>
            </div>
            <div className="flex gap-2">
              <Link href="/education/browse">
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Advanced Search
                </Button>
              </Link>
              <Link href="/education/progress">
                <Button size="sm" className="bg-islamic-green-600 hover:bg-islamic-green-700">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Progress
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search lessons, topics, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-auto">
              <AgeTierFilter 
                value={selectedAgeTier} 
                onChange={setSelectedAgeTier}
                showLabel={false}
              />
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((content) => (
              <EducationContentCard 
                key={content.id} 
                content={content}
                onClick={(content) => {
                  window.location.href = `/education/content/${content.id}`;
                }}
              />
            ))}
          </div>

          {filteredContent.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No content found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}