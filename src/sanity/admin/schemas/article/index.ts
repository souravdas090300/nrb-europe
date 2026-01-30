import { defineField, defineType } from 'sanity';
import { ROLES, getUserRole } from '../../config/roles';
import StatusBadge from './statusBadge';

export default defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: () => '📰',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO & Metadata' },
    { name: 'editorial', title: 'Editorial', icon: () => '✏️' },
    { name: 'media', title: 'Media' },
    { name: 'settings', title: 'Settings' },
  ],
  
  fields: [
    // Basic content
    defineField({
      name: 'title',
      title: 'Headline',
      type: 'string',
      group: 'content',
      validation: Rule => Rule
        .required()
        .min(10)
        .max(120)
        .warning('Headlines should be 10-120 characters'),
    }),
    
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    }),
    
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      description: 'Short summary for listings and SEO (140-160 characters)',
      type: 'text',
      group: 'content',
      rows: 3,
      validation: Rule => Rule
        .required()
        .min(100)
        .max(200)
        .warning('Optimal length: 140-160 characters'),
    }),
    
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      group: 'content',
      of: [
        { type: 'block' },
        { 
          type: 'image', 
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              validation: Rule => Rule.required(),
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
      validation: Rule => Rule.required().min(1),
    }),
    
    // Editorial workflow
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'editorial',
      options: {
        list: [
          { title: '💭 Draft', value: 'draft' },
          { title: '👁️ Under Review', value: 'review' },
          { title: '✅ Approved', value: 'approved' },
          { title: '🚀 Published', value: 'published' },
          { title: '📦 Archived', value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: Rule => Rule.required(),
      components: {
        input: StatusBadge,
      },
      readOnly: ({ currentUser }) => {
        const role = getUserRole(currentUser);
        return role === 'author';
      },
    }),
    
    defineField({
      name: 'isBreakingNews',
      title: '🚨 Breaking News',
      type: 'boolean',
      group: 'editorial',
      description: 'This will appear in breaking news ticker and notifications',
      initialValue: false,
      hidden: ({ currentUser }) => {
        const role = getUserRole(currentUser);
        return !ROLES[role].restrictions?.canSetBreakingNews;
      },
    }),
    
    defineField({
      name: 'priority',
      title: 'Editorial Priority',
      type: 'string',
      group: 'editorial',
      options: {
        list: [
          { title: 'Normal', value: 'normal' },
          { title: 'High', value: 'high' },
          { title: 'Urgent', value: 'urgent' },
        ],
      },
      initialValue: 'normal',
      hidden: ({ currentUser }) => {
        const role = getUserRole(currentUser);
        return role === 'author';
      },
    }),
    
    defineField({
      name: 'scheduledPublish',
      title: '📅 Scheduled Publish',
      type: 'datetime',
      group: 'editorial',
      description: 'Article will auto-publish at this time',
      hidden: ({ currentUser }) => {
        const role = getUserRole(currentUser);
        return !ROLES[role].restrictions?.canSchedule;
      },
    }),
    
    // Metadata
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      group: 'settings',
      to: [{ type: 'user' }],
      validation: Rule => Rule.required(),
    }),
    
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      group: 'settings',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
      validation: Rule => Rule.required().min(1).max(3),
    }),
    
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'settings',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    
    // SEO
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      group: 'seo',
      description: 'Title for search engines (optional, defaults to headline)',
    }),
    
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      group: 'seo',
      rows: 2,
      description: 'Description for search engines (optional, defaults to excerpt)',
    }),
    
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      group: 'seo',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    
    // Media
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      group: 'media',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          validation: Rule => Rule.required(),
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
        {
          name: 'credit',
          type: 'string',
          title: 'Photo Credit',
        },
      ],
      validation: Rule => Rule.required(),
    }),
    
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      description: 'Optional larger image for featured sections',
      type: 'image',
      group: 'media',
      options: {
        hotspot: true,
      },
    }),
    
    // Internal tracking
    defineField({
      name: 'editorNotes',
      title: 'Editor Notes',
      type: 'text',
      group: 'editorial',
      rows: 4,
      description: 'Internal notes for editorial team',
      hidden: ({ currentUser }) => {
        const role = getUserRole(currentUser);
        return role === 'author';
      },
    }),
    
    defineField({
      name: 'readTime',
      title: 'Reading Time',
      type: 'number',
      group: 'content',
      description: 'Estimated reading time in minutes (auto-calculated)',
      readOnly: true,
      initialValue: 3,
    }),
    
    defineField({
      name: 'wordCount',
      title: 'Word Count',
      type: 'number',
      group: 'content',
      readOnly: true,
    }),
    
    defineField({
      name: 'lastEditedBy',
      title: 'Last Edited By',
      type: 'reference',
      to: [{ type: 'user' }],
      readOnly: true,
      hidden: true,
    }),
    
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: 'settings',
      readOnly: true,
    }),
    
    defineField({
      name: 'version',
      title: 'Version',
      type: 'number',
      readOnly: true,
      hidden: true,
      initialValue: 1,
    }),
  ],
  
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      status: 'status',
      media: 'mainImage',
      scheduled: 'scheduledPublish',
      breaking: 'isBreakingNews',
    },
    prepare(selection) {
      const { title, author, status, media, scheduled, breaking } = selection;
      
      const subtitle = [
        author && `by ${author}`,
        status && `• ${status.toUpperCase()}`,
        breaking && '🚨 BREAKING',
        scheduled && `📅 ${new Date(scheduled).toLocaleDateString()}`,
      ].filter(Boolean).join(' ');
      
      return {
        title,
        subtitle,
        media,
      };
    },
  },
  
  orderings: [
    {
      title: 'Publication Date, New',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Last Updated',
      name: 'updatedAtDesc',
      by: [{ field: '_updatedAt', direction: 'desc' }],
    },
    {
      title: 'Breaking News First',
      name: 'breakingFirst',
      by: [
        { field: 'isBreakingNews', direction: 'desc' },
        { field: 'publishedAt', direction: 'desc' },
      ],
    },
    {
      title: 'Scheduled Posts',
      name: 'scheduled',
      by: [{ field: 'scheduledPublish', direction: 'asc' }],
    },
  ],
});
