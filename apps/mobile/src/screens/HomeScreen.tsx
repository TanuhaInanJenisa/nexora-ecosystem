import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@nexora/ui-tokens';
import { APP_NAME, APP_TAGLINE } from '@nexora/shared';
import { Badge, Card, Button } from '../components/ui';
import { useLocalization } from '../context/LocalizationContext';
import { getBrowserClient } from '@nexora/api';

interface HomeScreenProps {
  onNavigateToExplore: (category?: string) => void;
  onNavigateToCommunity: () => void;
  userName?: string;
}

export function HomeScreen({
  onNavigateToExplore,
  onNavigateToCommunity,
  userName = 'Member',
}: HomeScreenProps) {
  const { locale } = useLocalization();
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string; icon: string }>>([]);

  const defaultCategories = [
    { id: '1', name: 'AI & Automation', slug: 'ai-automation', icon: 'hardware-chip-outline' },
    { id: '2', name: 'Cloud & DevOps', slug: 'cloud-devops', icon: 'cloud-outline' },
    { id: '3', name: 'Web & Mobile', slug: 'web-mobile', icon: 'phone-portrait-outline' },
    { id: '4', name: 'Security & RLS', slug: 'security-rls', icon: 'shield-checkmark-outline' },
    { id: '5', name: 'Business Logic', slug: 'business-logic', icon: 'briefcase-outline' },
  ];

  const featuredServices = [
    {
      id: 'srv-1',
      title: 'Autonomous AI Agent Workflow',
      category: 'AI & Automation',
      price: '৳15,000',
      rating: '4.9',
      reviews: 38,
      turnaround: '3 Days',
    },
    {
      id: 'srv-2',
      title: 'Fullstack Monorepo Architecture',
      category: 'Web & Mobile',
      price: '৳35,000',
      rating: '5.0',
      reviews: 62,
      turnaround: '7 Days',
    },
    {
      id: 'srv-3',
      title: 'Database RLS & Security Audit',
      category: 'Security & RLS',
      price: '৳20,000',
      rating: '4.8',
      reviews: 24,
      turnaround: '2 Days',
    },
  ];

  useEffect(() => {
    loadLiveCategories();
  }, []);

  const loadLiveCategories = async () => {
    try {
      const client = getBrowserClient();
      const { data, error } = await client
        .from('categories')
        .select('id, name, slug, icon')
        .order('display_order', { ascending: true })
        .limit(6);

      if (!error && data && (data as any[]).length > 0) {
        setCategories(
          (data as any[]).map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            icon: c.icon || 'folder-outline',
          }))
        );
      } else {
        setCategories(defaultCategories);
      }
    } catch {
      setCategories(defaultCategories);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLiveCategories();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting Banner */}
      <View style={styles.greetingSection}>
        <View>
          <Text style={styles.greetingSub}>
            {locale === 'bn' ? 'স্বাগতম' : 'Welcome back,'}
          </Text>
          <Text style={styles.greetingName}>{userName}</Text>
        </View>
        <Badge label="PRO ECOSYSTEM" variant="primary" dot />
      </View>

      {/* Hero Announcement Card */}
      <Card style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroTag}>
            <Ionicons name="sparkles" size={14} color="#7C3AED" />
            <Text style={styles.heroTagText}>
              {locale === 'bn' ? 'সেন্ট্রাল ইকোসিস্টেম' : 'Central Ecosystem'}
            </Text>
          </View>
          <Text style={styles.heroStatus}>Live • Cloud</Text>
        </View>
        <Text style={styles.heroTitle}>{APP_NAME}</Text>
        <Text style={styles.heroSubtitle}>{APP_TAGLINE}</Text>
        <View style={styles.heroStatsRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>30+</Text>
            <Text style={styles.heroStatLabel}>Modules</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>8 Roles</Text>
            <Text style={styles.heroStatLabel}>RBAC</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>99.9%</Text>
            <Text style={styles.heroStatLabel}>Uptime</Text>
          </View>
        </View>
      </Card>

      {/* Quick Action Category Chips */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {locale === 'bn' ? 'ক্যাটাগরি সমূহ' : 'Explore Categories'}
        </Text>
        <TouchableOpacity onPress={() => onNavigateToExplore()} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>
            {locale === 'bn' ? 'সব দেখুন →' : 'See All →'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
        {(categories.length > 0 ? categories : defaultCategories).map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryChip}
            onPress={() => onNavigateToExplore(cat.slug)}
            activeOpacity={0.7}
          >
            <View style={styles.categoryIconBg}>
              <Ionicons name="layers-outline" size={18} color={colors.primary[400]} />
            </View>
            <Text style={styles.categoryName} numberOfLines={1}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Featured Services */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {locale === 'bn' ? 'জনপ্রিয় সার্ভিসসমূহ' : 'Featured Services'}
        </Text>
        <TouchableOpacity onPress={() => onNavigateToExplore()} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>
            {locale === 'bn' ? 'সব দেখুন →' : 'See All →'}
          </Text>
        </TouchableOpacity>
      </View>

      {featuredServices.map((srv) => (
        <Card key={srv.id} style={styles.serviceCard}>
          <View style={styles.serviceHeader}>
            <Badge label={srv.category} variant="info" />
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={styles.ratingText}>{srv.rating}</Text>
              <Text style={styles.reviewsText}>({srv.reviews})</Text>
            </View>
          </View>
          <Text style={styles.serviceTitle}>{srv.title}</Text>
          <View style={styles.serviceFooter}>
            <View>
              <Text style={styles.priceLabel}>{locale === 'bn' ? 'শুরু' : 'Starting at'}</Text>
              <Text style={styles.priceValue}>{srv.price}</Text>
            </View>
            <Button
              title={locale === 'bn' ? 'বুক করুন' : 'Book Now'}
              size="sm"
              variant="primary"
              onPress={() => onNavigateToExplore(srv.category)}
            />
          </View>
        </Card>
      ))}

      {/* Community Snippet Card */}
      <Card style={styles.communitySnippet}>
        <View style={styles.communityHeader}>
          <View style={styles.communityIconBg}>
            <Ionicons name="chatbubbles" size={18} color="#06B6D4" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.communityTitle}>
              {locale === 'bn' ? 'নেক্সোরা কমিউনিটি' : 'NEXORA Community'}
            </Text>
            <Text style={styles.communitySubtitle}>
              {locale === 'bn' ? 'ইকোসিস্টেম মেম্বারদের সাথে আলোচনা করুন' : 'Engage with developers, creators & leaders'}
            </Text>
          </View>
        </View>
        <Button
          title={locale === 'bn' ? 'কমিউনিটিতে যান' : 'Join Discussion'}
          variant="secondary"
          onPress={onNavigateToCommunity}
        />
      </Card>

      {/* Security Footer Assurance */}
      <View style={styles.securityBanner}>
        <Ionicons name="shield-checkmark" size={16} color={colors.primary[400]} />
        <Text style={styles.securityText}>
          {locale === 'bn'
            ? 'সুরক্ষিত রিয়েল-টাইম ডাটাবেজ • সুপাবেস RLS সংরক্ষিত'
            : 'End-to-End Enterprise Security • Supabase RLS Protected'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingSub: {
    fontSize: 13,
    color: colors.neutral[400],
  },
  greetingName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  heroCard: {
    backgroundColor: '#1E1B4B',
    borderColor: '#4338CA',
    borderWidth: 1,
    marginBottom: 24,
    padding: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  heroTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E0E7FF',
  },
  heroStatus: {
    fontSize: 11,
    color: '#34D399',
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#C7D2FE',
    marginTop: 4,
    marginBottom: 16,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 10,
    paddingVertical: 10,
  },
  heroStat: {
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroStatLabel: {
    fontSize: 11,
    color: '#A5B4FC',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  seeAllText: {
    fontSize: 13,
    color: colors.primary[400],
    fontWeight: '600',
  },
  categoriesRow: {
    gap: 10,
    paddingBottom: 8,
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  categoryIconBg: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 13,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  serviceCard: {
    marginBottom: 12,
    backgroundColor: '#111827',
    borderColor: '#1F2937',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  reviewsText: {
    color: colors.neutral[400],
    fontSize: 11,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    paddingTop: 10,
  },
  priceLabel: {
    fontSize: 11,
    color: colors.neutral[400],
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary[400],
  },
  communitySnippet: {
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    borderWidth: 1,
    marginVertical: 12,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  communityIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  communitySubtitle: {
    fontSize: 12,
    color: colors.neutral[400],
    marginTop: 2,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 12,
  },
  securityText: {
    fontSize: 11,
    color: colors.neutral[400],
    fontWeight: '500',
  },
});
