import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@nexora/ui-tokens';
import { Badge, Card, Button } from '../components/ui';
import { useLocalization } from '../context/LocalizationContext';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  turnaround: string;
  rating: string;
  reviews: number;
}

const ALL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    title: 'Autonomous AI Agent Workflow',
    description: 'Custom multi-agent autonomous system with memory, tools integration, and human-in-the-loop triggers.',
    category: 'AI & Automation',
    price: '৳15,000',
    turnaround: '3 Days',
    rating: '4.9',
    reviews: 38,
  },
  {
    id: 'srv-2',
    title: 'Fullstack Monorepo Architecture',
    description: 'Production Next.js 14 + React Native Expo monorepo with Turborepo, shared packages, and typed contracts.',
    category: 'Web & Mobile',
    price: '৳35,000',
    turnaround: '7 Days',
    rating: '5.0',
    reviews: 62,
  },
  {
    id: 'srv-3',
    title: 'Database RLS & Security Audit',
    description: 'Exhaustive PostgreSQL audit, Row Level Security policies implementation, and penetration testing verification.',
    category: 'Security & RLS',
    price: '৳20,000',
    turnaround: '2 Days',
    rating: '4.8',
    reviews: 24,
  },
  {
    id: 'srv-4',
    title: 'Cloud DevOps & CI/CD Pipeline',
    description: 'Automated GitHub Actions, Docker containers, multi-environment deployments to Vercel, EAS, and Supabase.',
    category: 'Cloud & DevOps',
    price: '৳18,000',
    turnaround: '3 Days',
    rating: '4.9',
    reviews: 19,
  },
  {
    id: 'srv-5',
    title: 'Enterprise RBAC & Permission Matrix',
    description: 'Dynamic 8-tier role-based access control, remote feature overrides, and audit event dispatchers.',
    category: 'Business Logic',
    price: '৳25,000',
    turnaround: '4 Days',
    rating: '4.9',
    reviews: 41,
  },
  {
    id: 'srv-6',
    title: 'Generative UI & Analytics Dashboard',
    description: 'Interactive telemetry dashboards, metrics charts, and live real-time status monitors for business ops.',
    category: 'AI & Automation',
    price: '৳22,000',
    turnaround: '4 Days',
    rating: '4.7',
    reviews: 15,
  },
];

const CATEGORIES = [
  'All',
  'AI & Automation',
  'Web & Mobile',
  'Security & RLS',
  'Cloud & DevOps',
  'Business Logic',
];

interface ExploreScreenProps {
  initialCategory?: string;
}

export function ExploreScreen({ initialCategory }: ExploreScreenProps) {
  const { locale } = useLocalization();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [requestNotes, setRequestNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredServices = useMemo(() => {
    return ALL_SERVICES.filter((srv) => {
      const matchesCategory =
        selectedCategory === 'All' || srv.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesQuery =
        srv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const handleBookService = (service: ServiceItem) => {
    setSelectedService(service);
    setRequestNotes('');
  };

  const handleConfirmRequest = async () => {
    if (!selectedService) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSelectedService(null);
      Alert.alert(
        locale === 'bn' ? 'অনুরোধ গৃহীত হয়েছে' : 'Service Request Submitted',
        locale === 'bn'
          ? `আপনার "${selectedService.title}" সার্ভিসের অনুরোধ সফলভাবে জমা হয়েছে। আমাদের প্রতিনিধি যোগাযোগ করবেন।`
          : `Your request for "${selectedService.title}" has been placed. An ecosystem specialist will contact you.`
      );
    }, 800);
  };

  return (
    <View style={styles.container}>
      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder={locale === 'bn' ? 'সার্ভিস বা ক্যাটাগরি অনুসন্ধান করুন...' : 'Search services or categories...'}
            placeholderTextColor={colors.neutral[500]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.neutral[400]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter Pills */}
      <View style={styles.categoryPillsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPills}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.pill, isSelected && styles.activePill]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, isSelected && styles.activePillText]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Services List */}
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.resultsInfoRow}>
          <Text style={styles.resultsCount}>
            {locale === 'bn'
              ? `${filteredServices.length}টি সার্ভিস পাওয়া গেছে`
              : `${filteredServices.length} services available`}
          </Text>
        </View>

        {filteredServices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={colors.neutral[600]} />
            <Text style={styles.emptyTitle}>
              {locale === 'bn' ? 'কোনো সার্ভিস পাওয়া যায়নি' : 'No Services Found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {locale === 'bn' ? 'অন্য কোনো কি-ওয়ার্ড দিয়ে চেষ্টা করুন' : 'Try searching with different keywords'}
            </Text>
          </View>
        ) : (
          filteredServices.map((srv) => (
            <Card key={srv.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Badge label={srv.category} variant="info" />
                <View style={styles.turnaroundBadge}>
                  <Ionicons name="time-outline" size={12} color="#94A3B8" />
                  <Text style={styles.turnaroundText}>{srv.turnaround}</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{srv.title}</Text>
              <Text style={styles.cardDesc}>{srv.description}</Text>

              <View style={styles.cardBottom}>
                <View>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={13} color="#FBBF24" />
                    <Text style={styles.ratingText}>{srv.rating}</Text>
                    <Text style={styles.reviewText}>({srv.reviews})</Text>
                  </View>
                  <Text style={styles.cardPrice}>{srv.price}</Text>
                </View>
                <Button
                  title={locale === 'bn' ? 'অনুরোধ করুন' : 'Request Service'}
                  size="sm"
                  variant="primary"
                  onPress={() => handleBookService(srv)}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Service Booking Modal */}
      <Modal
        visible={!!selectedService}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedService(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {locale === 'bn' ? 'সার্ভিস রিকোয়েস্ট' : 'Request Service'}
              </Text>
              <TouchableOpacity onPress={() => setSelectedService(null)}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {selectedService && (
              <>
                <Text style={styles.modalServiceTitle}>{selectedService.title}</Text>
                <Text style={styles.modalServicePrice}>{selectedService.price} • {selectedService.turnaround}</Text>

                <Text style={styles.inputLabel}>
                  {locale === 'bn' ? 'প্রয়োজনীয় বিবরণ / নোট লিখুন:' : 'Project requirements or notes:'}
                </Text>
                <TextInput
                  style={styles.modalTextArea}
                  placeholder={locale === 'bn' ? 'আপনার প্রয়োজনীয় বিবরণ দিন...' : 'Describe what you need delivered...'}
                  placeholderTextColor="#64748B"
                  multiline
                  numberOfLines={4}
                  value={requestNotes}
                  onChangeText={setRequestNotes}
                />

                <View style={styles.modalActions}>
                  <Button
                    title={locale === 'bn' ? 'বাতিল' : 'Cancel'}
                    variant="outline"
                    onPress={() => setSelectedService(null)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title={locale === 'bn' ? 'নিশ্চিত করুন' : 'Confirm Request'}
                    variant="primary"
                    isLoading={isSubmitting}
                    onPress={handleConfirmRequest}
                    style={{ flex: 1 }}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
  },
  categoryPillsContainer: {
    paddingBottom: 8,
  },
  categoryPills: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  activePill: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[500],
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[300],
  },
  activePillText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  resultsInfoRow: {
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 12,
    color: colors.neutral[400],
    fontWeight: '600',
  },
  card: {
    marginBottom: 14,
    backgroundColor: '#111827',
    borderColor: '#1F2937',
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  turnaroundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  turnaroundText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.neutral[400],
    lineHeight: 18,
    marginBottom: 14,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    paddingTop: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  reviewText: {
    fontSize: 11,
    color: colors.neutral[400],
  },
  cardPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary[400],
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.neutral[400],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  modalServiceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary[300],
    marginBottom: 4,
  },
  modalServicePrice: {
    fontSize: 14,
    color: colors.neutral[400],
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: '#E2E8F0',
    marginBottom: 8,
    fontWeight: '600',
  },
  modalTextArea: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 14,
    textAlignVertical: 'top',
    height: 100,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
