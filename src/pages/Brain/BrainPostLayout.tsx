import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';

const postsModules = import.meta.glob('../../content/posts/*.mdx', { eager: true });

const BrainPostLayout = () => {
  const { slug } = useParams();
  
  // Find the exact module for this slug
  const postEntry = Object.entries(postsModules).find(([path]) => path.includes(`${slug}.mdx`));
  
  if (!postEntry) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }}>
        <h1>404 - Thought Not Found</h1>
        <Link to="/brain" style={{ color: 'var(--accent-purple)' }}>Return to The Brain</Link>
      </div>
    );
  }

  const [, module] = postEntry;
  const MDXContent = (module as any).default;
  const frontmatter = (module as any).frontmatter || {};

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <Link to="/brain" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '3rem', textDecoration: 'none', transition: 'color 0.2s' }}>
        <ArrowLeft size={16} /> Back to index
      </Link>
      
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
          {frontmatter.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} />
            {frontmatter.date && new Date(frontmatter.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          {frontmatter.tags && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {frontmatter.tags.map((tag: string) => (
                <span key={tag} style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <article className="prose-container">
        <MDXContent />
      </article>
    </div>
  );
};

export default BrainPostLayout;
