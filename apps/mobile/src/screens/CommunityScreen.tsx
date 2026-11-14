import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@nexora/ui-tokens';
import { Badge, Card, Button } from '../components/ui';
import { useLocalization } from '../context/LocalizationContext';

interface PostItem {
  id: string;
  authorName: string;
  authorRole: string;
  authorInitial: string;
  timestamp: string;
  category: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

const INITIAL_POSTS: PostItem[] = [
  {
    id: 'post-1',
    authorName: 'Rashid Al-Mamun',
    authorRole: 'DEVELOPER',
    authorInitial: 'R',
    timestamp: '2h ago',
    category: 'Architecture',
    title: 'Migrating Monorepos to Turborepo + pnpm 9',
    content: 'We noticed a 4x build speed improvement after sharing TypeScript configs and UI tokens across our Next.js and Expo workspaces. Has anyone tested remote caching on self-hosted buckets?',
    likes: 24,
    comments: 8,
    isLiked: false,
  },
  {
    id: 'post-2',
    authorName: 'Fatima Zahra',
    authorRole: 'AI ENGINEER',
    authorInitial: 'F',
    timestamp: '4h ago',
    category: 'AI & Automation',
    title: 'Self-improving AI Workflows with Supabase Vector',
    content: 'Integrating pgvector directly inside Supabase with RLS allowed us to isolate embeddings per tenant seamlessly. Highly recommended for multi-org setups!',
    likes: 42,
    comments: 15,
    isLiked: true,
  },
  {
    id: 'post-3',
    authorName: 'Tanvir Hossain',
    authorRole: 'CREATOR',
    authorInitial: 'T',
    timestamp: '1d ago',
    category: 'Showcase',
    title: 'NEXORA Mobile App dark theme tokens looking crisp!',
    content: 'Loving the Deep Indigo (#1E1B4B) + Electric Violet palette. Clean contrast on OLED screens and very readable typography.',
    likes: 31,
    comments: 6,
    isLiked: false,
  },
];

export function CommunityScreen() {
  const { locale } = useLocalization();
  const [posts, setPosts] = useState<PostItem[]>(INITIAL_POSTS);
  const [selectedTab, setSelectedTab] = useState<'All' | 'Discussions' | 'Showcase' | 'AI & Tech'>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Discussions');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: isLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  const handleCreatePost = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      Alert.alert('Required Fields', 'Please enter a title and content for your post.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newPost: PostItem = {
        id: `post-${Date.now()}`,
        authorName: 'NEXORA Member',
        authorRole: 'MEMBER',
        authorInitial: 'N',
        timestamp: 'Just now',
        category: newCategory,
        title: newTitle.trim(),
        content: newContent.trim(),
        likes: 1,
        comments: 0,
        isLiked: true,
      };

      setPosts([newPost, ...posts]);
      setIsSubmitting(false);
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewContent('');
      Alert.alert('Published', 'Your post has been broadcast to the NEXORA Community.');
    }, 600);
  };

  const filteredPosts = posts.filter((p) => {
    if (selectedTab === 'All') return true;
    if (selectedTab === 'Discussions') return p.category === 'Architecture' || p.category === 'Discussions';
    if (selectedTab === 'Showcase') return p.category === 'Showcase';
    if (selectedTab === 'AI & Tech') return p.category === 'AI & Automation' || p.category === 'Tech';
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Top Action Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.headerTitle}>
            {locale === 'bn' ? 'কমিউনিটি ফিড' : 'Community Feed'}
          </Text>
          <Text style={styles.headerSub}>
            {locale === 'bn' ? 'আলোচনা ও অভিজ্ঞতা শেয়ার করুন' : 'Share thoughts, questions & innovations'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.newPostButton}
          onPress={() => setIsCreateModalOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.newPostButtonText}>
            {locale === 'bn' ? 'পোস্ট' : 'New Post'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {(['All', 'Discussions', 'Showcase', 'AI & Tech'] as const).map((tab) => {
          const isActive = selectedTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabChip, isActive && styles.activeTabChip]}
              onPress={() => setSelectedTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabChipText, isActive && styles.activeTabChipText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Feed List */}
      <ScrollView contentContainerStyle={styles.feedContainer} showsVerticalScrollIndicator={false}>
        {filteredPosts.map((post) => (
          <Card key={post.id} style={styles.postCard}>
            {/* Author Row */}
            <View style={styles.authorRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{post.authorInitial}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.authorName}>{post.authorName}</Text>
                  <Badge label={post.authorRole} variant="info" />
                </View>
                <Text style={styles.postTime}>{post.timestamp} • in {post.category}</Text>
              </View>
            </View>

            {/* Post Content */}
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent}>{post.content}</Text>

            {/* Interaction Bar */}
            <View style={styles.interactionBar}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => toggleLike(post.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={post.isLiked ? 'heart' : 'heart-outline'}
                  size={18}
                  color={post.isLiked ? '#EF4444' : colors.neutral[400]}
                />
                <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
                  {post.likes}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                <Ionicons name="chatbubble-outline" size={17} color={colors.neutral[400]} />
                <Text style={styles.actionText}>{post.comments}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                <Ionicons name="share-social-outline" size={17} color={colors.neutral[400]} />
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Create Post Modal */}
      <Modal
        visible={isCreateModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {locale === 'bn' ? 'নতুন পোস্ট তৈরি করুন' : 'Create Community Post'}
              </Text>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="What are you discussing?"
              placeholderTextColor="#64748B"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.categorySelectRow}>
              {['Discussions', 'Showcase', 'AI & Automation'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catOption, newCategory === cat && styles.activeCatOption]}
                  onPress={() => setNewCategory(cat)}
                >
                  <Text style={[styles.catOptionText, newCategory === cat && styles.activeCatOptionText]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Content</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Share the details, code snippets, or ideas..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={4}
              value={newContent}
              onChangeText={setNewContent}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setIsCreateModalOpen(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Publish Post"
                variant="primary"
                isLoading={isSubmitting}
                onPress={handleCreatePost}
                style={{ flex: 1 }}
              />
            </View>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerSub: {
    fontSize: 12,
    color: colors.neutral[400],
    marginTop: 2,
  },
  newPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[600],
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  newPostButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeTabChip: {
    backgroundColor: colors.primary[700],
    borderColor: colors.primary[500],
  },
  tabChipText: {
    fontSize: 12,
    color: colors.neutral[300],
    fontWeight: '600',
  },
  activeTabChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  feedContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  postCard: {
    marginBottom: 14,
    backgroundColor: '#111827',
    borderColor: '#1F2937',
    padding: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  postTime: {
    fontSize: 11,
    color: colors.neutral[400],
    marginTop: 2,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 6,
  },
  postContent: {
    fontSize: 13,
    color: colors.neutral[300],
    lineHeight: 19,
    marginBottom: 14,
  },
  interactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    paddingTop: 10,
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    color: colors.neutral[400],
    fontWeight: '600',
  },
  likedText: {
    color: '#EF4444',
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
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  label: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  categorySelectRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  catOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeCatOption: {
    backgroundColor: colors.primary[700],
    borderColor: colors.primary[500],
  },
  catOptionText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  activeCatOptionText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textArea: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 14,
    textAlignVertical: 'top',
    height: 90,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
});
