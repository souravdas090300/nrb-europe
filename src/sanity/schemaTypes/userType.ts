import {UserIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const userType = defineType({
  name: 'user',
  title: 'User',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          {title: '👑 Super Admin', value: 'superAdmin'},
          {title: '✏️ Editor', value: 'editor'},
          {title: '📝 Author', value: 'author'},
          {title: '👁️ Viewer', value: 'viewer'},
        ],
        layout: 'radio',
      },
      initialValue: 'author',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'photo',
      title: 'Profile Photo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'assignedCategories',
      title: 'Assigned Categories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
      description: 'Categories this user typically covers',
    }),
    defineField({
      name: 'socialMedia',
      title: 'Social Media',
      type: 'object',
      fields: [
        {name: 'twitter', type: 'url', title: 'Twitter'},
        {name: 'linkedin', type: 'url', title: 'LinkedIn'},
        {name: 'website', type: 'url', title: 'Website'},
      ],
    }),
    defineField({
      name: 'isActive',
      title: 'Active Account',
      type: 'boolean',
      initialValue: true,
      description: 'Inactive users cannot log in',
    }),
    defineField({
      name: 'lastActive',
      title: 'Last Active',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'email',
      media: 'photo',
      role: 'role',
    },
    prepare({title, subtitle, media, role}) {
      const roleEmoji: Record<string, string> = {
        superAdmin: '👑',
        editor: '✏️',
        author: '📝',
        viewer: '👁️',
      }
      
      return {
        title: `${roleEmoji[role] || '👤'} ${title}`,
        subtitle,
        media,
      }
    },
  },
})
