import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Calendar, ArrowRight } from 'lucide-react';

// Load all MDX files eagerly
const postsModules = import.meta.glob('../../content/posts/*.mdx', { eager: true });

export interface PostMeta {
  title: string;
  date: string;
  tags?: string[];
  description?: string;
  slug: string;
}

// Transform the glob object into an array of metadata
export const getPosts = (): PostMeta[] => {
  return Object.entries(postsModules).map(([path, module]: [string, any]) => {
    // Extract slug from filename (e.g., '../../content/posts/hello-world.mdx' -> 'hello-world')
    const slug = path.split('/').pop()?.replace('.mdx', '') || '';
    return {
      slug,
      ...(module.frontmatter || {}),
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const BrainIndex = () => {
  const posts = getPosts();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem' }}>
        <h1 style={{ fontSize: '3rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Brain size={40} color="var(--accent-purple)" />
          The Brain
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
          My digital garden. A collection of raw thoughts, engineering lessons, and interactive notes that grow over time.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {posts.map((post, index) => (
          <motion.div 
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link to={`/brain/${post.slug}`} className="glass-card" style={{ display: 'block', textDecoration: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{post.title}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    <Calendar size={14} />
                    <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>{post.description}</p>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(176, 0, 255, 0.1)', borderRadius: '50%', color: 'var(--accent-purple)' }}>
                  <ArrowRight size={20} />
                </div>
              </div>
              
              {post.tags && post.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  {post.tags.map(tag => (
                    <span key={tag} style={{ fontSize: '0.8rem', padding: '0.2rem 0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', color: 'var(--text-secondary)' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BrainIndex;
