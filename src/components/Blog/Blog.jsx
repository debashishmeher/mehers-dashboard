

import React, { useState } from "react"
import { X, Plus, ImageIcon } from "lucide-react"

const categories = ["technology", "business", "health", "entertainment", "sports", "science"]
const postTypes = ["blog", "news", "article"]

export default function BlogCreateForm() {
  const [formData, setFormData] = useState({
    b_title: "",
    b_content: "",
    b_author: "Anonymous",
    author_image: "",
    author_position: "",
    b_description: "",
    b_image: "",
    b_category: "",
    b_tags: [],
    read_time: 1,
    b_gallery: [],
    meta_tag: "",
    meta_title: "",
    meta_description: "",
    meta_photo: "",
    type: "blog",
    slug: "",
  })

  const [currentTag, setCurrentTag] = useState("")
  const [currentGalleryImage, setCurrentGalleryImage] = useState("")
  const [errors, setErrors] = useState({})

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))

    if (field === "b_title") {
      const slug = value
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim("-")
      setFormData(prev => ({
        ...prev,
        slug: slug,
      }))
    }

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const addTag = () => {
    if (currentTag.trim() && formData.b_tags.length < 5 && !formData.b_tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        b_tags: [...prev.b_tags, currentTag.trim()],
      }))
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      b_tags: prev.b_tags.filter(tag => tag !== tagToRemove),
    }))
  }

  const addGalleryImage = () => {
    if (currentGalleryImage.trim() && formData.b_gallery.length < 10 && !formData.b_gallery.includes(currentGalleryImage.trim())) {
      setFormData(prev => ({
        ...prev,
        b_gallery: [...prev.b_gallery, currentGalleryImage.trim()],
      }))
      setCurrentGalleryImage("")
    }
  }

  const removeGalleryImage = (imageToRemove) => {
    setFormData(prev => ({
      ...prev,
      b_gallery: prev.b_gallery.filter(image => image !== imageToRemove),
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.b_title.trim()) {
      newErrors.b_title = "Blog title is required"
    } else if (formData.b_title.length > 120) {
      newErrors.b_title = "Blog title cannot exceed 120 characters"
    }

    if (!formData.b_content.trim()) {
      newErrors.b_content = "Blog content is required"
    } else if (formData.b_content.length < 200) {
      newErrors.b_content = "Blog content should be at least 200 characters"
    }

    if (!formData.b_description.trim()) {
      newErrors.b_description = "Blog description is required"
    } else if (formData.b_description.length > 160) {
      newErrors.b_description = "Description cannot exceed 160 characters"
    }

    if (!formData.b_image.trim()) {
      newErrors.b_image = "Featured image is required"
    }

    if (!formData.b_category) {
      newErrors.b_category = "Category is required"
    }

    if (formData.b_tags.length === 0) {
      newErrors.b_tags = "At least one tag is required"
    }

    if (!formData.meta_tag.trim()) {
      newErrors.meta_tag = "Meta tag is required"
    }

    if (!formData.meta_title.trim()) {
      newErrors.meta_title = "Meta title is required"
    } else if (formData.meta_title.length > 60) {
      newErrors.meta_title = "Meta title cannot exceed 60 characters"
    }

    if (!formData.meta_description.trim()) {
      newErrors.meta_description = "Meta description is required"
    } else if (formData.meta_description.length > 160) {
      newErrors.meta_description = "Meta description cannot exceed 160 characters"
    }

    if (!formData.meta_photo.trim()) {
      newErrors.meta_photo = "Meta photo is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      console.log("Form submitted:", formData)
      alert("Blog post created successfully!")
    }
  }

  const estimateReadTime = (content) => {
    const wordsPerMinute = 200
    const wordCount = content.trim().split(/\s+/).length
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-2 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
            Create New Blog Post
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Fill in the details below to create your blog post</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <p className="text-sm text-gray-600 mt-1">Essential details about your blog post</p>
            </div>
            <div className="space-y-4 p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="b_title" className="block text-sm font-medium text-gray-700">
                    Blog Title *
                  </label>
                  <input
                    type="text"
                    id="b_title"
                    value={formData.b_title}
                    onChange={(e) => handleInputChange("b_title", e.target.value)}
                    placeholder="Enter blog title"
                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.b_title ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.b_title && <p className="text-xs sm:text-sm text-red-500">{errors.b_title}</p>}
                  <p className="text-xs text-gray-500">{formData.b_title.length}/120 characters</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    placeholder="auto-generated-from-title"
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500">Auto-generated from title</p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="b_description" className="block text-sm font-medium text-gray-700">
                  Blog Description *
                </label>
                <textarea
                  id="b_description"
                  value={formData.b_description}
                  onChange={(e) => handleInputChange("b_description", e.target.value)}
                  placeholder="Brief description of your blog post"
                  rows={3}
                  className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                    errors.b_description ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.b_description && <p className="text-xs sm:text-sm text-red-500">{errors.b_description}</p>}
                <p className="text-xs text-gray-500">{formData.b_description.length}/160 characters</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="b_content" className="block text-sm font-medium text-gray-700">
                  Blog Content *
                </label>
                <textarea
                  id="b_content"
                  value={formData.b_content}
                  onChange={(e) => {
                    handleInputChange("b_content", e.target.value)
                    handleInputChange("read_time", estimateReadTime(e.target.value))
                  }}
                  placeholder="Write your blog content here..."
                  rows={8}
                  className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                    errors.b_content ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.b_content && <p className="text-xs sm:text-sm text-red-500">{errors.b_content}</p>}
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-gray-500">
                  <span>{formData.b_content.length} characters (min 200)</span>
                  <span>Estimated read time: {formData.read_time} min</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="b_category" className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    id="b_category"
                    value={formData.b_category}
                    onChange={(e) => handleInputChange("b_category", e.target.value)}
                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.b_category ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.b_category && <p className="text-xs sm:text-sm text-red-500">{errors.b_category}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Post Type
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {postTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Author Information */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Author Information</h3>
              <p className="text-sm text-gray-600 mt-1">Details about the blog post author</p>
            </div>
            <div className="space-y-4 p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="b_author" className="block text-sm font-medium text-gray-700">
                    Author Name
                  </label>
                  <input
                    type="text"
                    id="b_author"
                    value={formData.b_author}
                    onChange={(e) => handleInputChange("b_author", e.target.value)}
                    placeholder="Author name"
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="author_position" className="block text-sm font-medium text-gray-700">
                    Author Position
                  </label>
                  <input
                    type="text"
                    id="author_position"
                    value={formData.author_position}
                    onChange={(e) => handleInputChange("author_position", e.target.value)}
                    placeholder="e.g., Senior Writer"
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <label htmlFor="author_image" className="block text-sm font-medium text-gray-700">
                    Author Image URL
                  </label>
                  <input
                    type="url"
                    id="author_image"
                    value={formData.author_image}
                    onChange={(e) => handleInputChange("author_image", e.target.value)}
                    placeholder="https://example.com/author.jpg"
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Media</h3>
              <p className="text-sm text-gray-600 mt-1">Images and visual content for your blog post</p>
            </div>
            <div className="space-y-4 p-4 sm:p-6">
              <div className="space-y-2">
                <label htmlFor="b_image" className="block text-sm font-medium text-gray-700">
                  Featured Image URL *
                </label>
                <input
                  type="url"
                  id="b_image"
                  value={formData.b_image}
                  onChange={(e) => handleInputChange("b_image", e.target.value)}
                  placeholder="https://example.com/featured-image.jpg"
                  className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.b_image ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.b_image && <p className="text-xs sm:text-sm text-red-500">{errors.b_image}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Gallery Images (Optional)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={currentGalleryImage}
                    onChange={(e) => setCurrentGalleryImage(e.target.value)}
                    placeholder="https://example.com/gallery-image.jpg"
                    className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={addGalleryImage}
                    disabled={formData.b_gallery.length >= 10}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1 sm:mr-0 inline" />
                    <span className="sm:hidden">Add Image</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500">{formData.b_gallery.length}/10 images</p>
                {formData.b_gallery.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.b_gallery.map((image, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        <ImageIcon className="h-3 w-3" />
                        <span className="hidden sm:inline">Image {index + 1}</span>
                        <span className="sm:hidden">{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(image)}
                          className="ml-1 hover:text-red-500 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
              <p className="text-sm text-gray-600 mt-1">Add relevant tags to help categorize your blog post</p>
            </div>
            <div className="space-y-4 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Enter a tag"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={formData.b_tags.length >= 5}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1 sm:mr-0 inline" />
                  <span className="sm:hidden">Add Tag</span>
                </button>
              </div>
              {errors.b_tags && <p className="text-xs sm:text-sm text-red-500">{errors.b_tags}</p>}
              <p className="text-xs text-gray-500">{formData.b_tags.length}/5 tags (at least 1 required)</p>
              {formData.b_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.b_tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-blue-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SEO Meta Data */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">SEO Meta Data</h3>
              <p className="text-sm text-gray-600 mt-1">Search engine optimization information</p>
            </div>
            <div className="space-y-4 p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700">
                    Meta Title *
                  </label>
                  <input
                    type="text"
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => handleInputChange("meta_title", e.target.value)}
                    placeholder="SEO title for search engines"
                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.meta_title ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.meta_title && <p className="text-xs sm:text-sm text-red-500">{errors.meta_title}</p>}
                  <p className="text-xs text-gray-500">{formData.meta_title.length}/60 characters</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="meta_tag" className="block text-sm font-medium text-gray-700">
                    Meta Tag *
                  </label>
                  <input
                    type="text"
                    id="meta_tag"
                    value={formData.meta_tag}
                    onChange={(e) => handleInputChange("meta_tag", e.target.value)}
                    placeholder="Primary meta tag"
                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.meta_tag ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.meta_tag && <p className="text-xs sm:text-sm text-red-500">{errors.meta_tag}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700">
                  Meta Description *
                </label>
                <textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => handleInputChange("meta_description", e.target.value)}
                  placeholder="SEO description for search engines"
                  rows={3}
                  className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                    errors.meta_description ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.meta_description && (
                  <p className="text-xs sm:text-sm text-red-500">{errors.meta_description}</p>
                )}
                <p className="text-xs text-gray-500">{formData.meta_description.length}/160 characters</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="meta_photo" className="block text-sm font-medium text-gray-700">
                  Meta Photo URL *
                </label>
                <input
                  type="url"
                  id="meta_photo"
                  value={formData.meta_photo}
                  onChange={(e) => handleInputChange("meta_photo", e.target.value)}
                  placeholder="https://example.com/meta-image.jpg"
                  className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.meta_photo ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.meta_photo && <p className="text-xs sm:text-sm text-red-500">{errors.meta_photo}</p>}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors order-2 sm:order-1"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors order-1 sm:order-2"
            >
              Create Blog Post
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}