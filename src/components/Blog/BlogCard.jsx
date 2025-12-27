import { Clock, User, ArrowRight } from 'lucide-react';
import { memo } from 'react';
import PropTypes from 'prop-types';

const BlogCard = memo(({ blog }) => {
  // Calculate reading time if not provided
  const readingTime = blog.read_time_formatted || 
                     (blog.read_time ? `${blog.read_time} min read` : 'Quick read');

  return (
    <article 
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-100 flex flex-col h-full"
      aria-labelledby={`blog-title-${blog.id || blog.slug}`}
    >
      {/* Image with lazy loading and aspect ratio */}
      {blog.b_image && (
        <div className="relative h-56 w-full overflow-hidden">
          <img
            src={blog.b_image}
            alt={blog.b_title || 'Blog image'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            width={400}
            height={225}
            decoding="async"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      <div className="p-6 flex flex-col flex-grow">
        {/* Category badge with animation */}
        {blog.b_category && (
          <span className="inline-block bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold tracking-wide uppercase mb-3 self-start transition-all duration-300 group-hover:from-blue-200 group-hover:to-blue-300">
            {blog.b_category}
          </span>
        )}

        {/* Title with proper semantic markup */}
        <h3 
          id={`blog-title-${blog.id || blog.slug}`}
          className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-snug hover:text-blue-600 transition-colors"
        >
          <a 
            href={`/blog/${blog.id || blog.slug}`} 
            className="flex items-center gap-2 after:absolute after:inset-0 after:content-['']"
            aria-label={`Read more about ${blog.b_title}`}
          >
            {blog.b_title || 'Untitled Blog Post'}
            <ArrowRight 
              size={16} 
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-500" 
            />
          </a>
        </h3>

        {/* Description with proper line clamping */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {blog.b_description || 'No description available'}
        </p>

        {/* Author and reading time */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center min-w-0">
            {blog.meta_photo ? (
              <img
                src={blog.meta_photo}
                alt={blog.b_author || 'Author'}
                className="w-10 h-10 rounded-full object-cover mr-3 flex-shrink-0"
                loading="lazy"
                width={40}
                height={40}
                decoding="async"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                <User size={16} className="text-blue-600" />
              </div>
            )}

            <div className="text-sm truncate">
              <p className="font-medium text-gray-900 flex items-center truncate">
                <User size={14} className="mr-1.5 flex-shrink-0" />
                <span className="truncate">{blog.b_author || 'Anonymous'}</span>
              </p>
              {blog.author_position && (
                <p className="text-xs text-gray-500 truncate">{blog.author_position}</p>
              )}
            </div>
          </div>

          <div className="text-gray-500 text-sm flex items-center whitespace-nowrap">
            <Clock size={14} className="mr-1.5 flex-shrink-0" />
            {readingTime}
          </div>
        </div>

        {/* Tags with proper truncation */}
        {blog.b_tags?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {blog.b_tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-md transition-colors duration-200 truncate max-w-[100px]"
                  title={tag}
                >
                  #{tag}
                </span>
              ))}
              {blog.b_tags.length > 3 && (
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-md">
                  +{blog.b_tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
});

BlogCard.propTypes = {
  blog: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    slug: PropTypes.string,
    b_title: PropTypes.string,
    b_description: PropTypes.string,
    b_image: PropTypes.string,
    b_category: PropTypes.string,
    b_author: PropTypes.string,
    author_position: PropTypes.string,
    meta_photo: PropTypes.string,
    read_time: PropTypes.number,
    read_time_formatted: PropTypes.string,
    b_tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default BlogCard;