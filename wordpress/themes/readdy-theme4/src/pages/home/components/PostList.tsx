import { WordPressPost } from '../../../hooks/useWordPressPosts';
import BlogCard from '../../../components/BlogCard';

interface PostListProps {
  posts: WordPressPost[];
}

export default function PostList({ posts }: PostListProps) {
  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}