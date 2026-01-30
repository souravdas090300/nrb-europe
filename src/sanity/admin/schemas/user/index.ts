import { defineField, defineType } from 'sanity';
import { UserIcon } from '@sanity/icons';
import { ROLES, getUserRole } from '../../config/roles';
import RoleSelector from './roleSelector';

export default defineType({
  name: 'user',
  title: 'User',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().email(),
    }),
    
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: Object.entries(ROLES).map(([key, role]) => ({
          title: `${role.name} - ${role.description}`,
          value: key,
        })),
      },
      initialValue: 'author',
      validation: Rule => Rule.required(),
      components: {
        input: RoleSelector,
      },
      readOnly: ({ currentUser }) => {
        const currentUserRole = getUserRole(currentUser);
        return currentUserRole !== 'superAdmin';
      },
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
      name: 'position',
      title: 'Position',
      type: 'string',
      options: {
        list: [
          { title: 'Journalist', value: 'journalist' },
          { title: 'Senior Journalist', value: 'senior_journalist' },
          { title: 'Correspondent', value: 'correspondent' },
          { title: 'Editor', value: 'editor' },
          { title: 'Senior Editor', value: 'senior_editor' },
          { title: 'Managing Editor', value: 'managing_editor' },
        ],
      },
    }),
    
    defineField({
      name: 'assignedCategories',
      title: 'Assigned Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
      description: 'Categories this user typically writes about',
    }),
    
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      fields: [
        { name: 'twitter', type: 'url', title: 'Twitter' },
        { name: 'linkedin', type: 'url', title: 'LinkedIn' },
        { name: 'website', type: 'url', title: 'Website' },
      ],
    }),
    
    defineField({
      name: 'lastActive',
      title: 'Last Active',
      type: 'datetime',
      readOnly: true,
    }),
    
    defineField({
      name: 'articleCount',
      title: 'Articles Published',
      type: 'number',
      readOnly: true,
      initialValue: 0,
    }),
    
    defineField({
      name: 'isActive',
      title: 'Active Status',
      type: 'boolean',
      initialValue: true,
      description: 'Deactivate user account',
      hidden: ({ currentUser }) => {
        const currentUserRole = getUserRole(currentUser);
        return currentUserRole !== 'superAdmin';
      },
    }),
  ],
  
  preview: {
    select: {
      title: 'name',
      role: 'role',
      photo: 'photo',
      articleCount: 'articleCount',
      isActive: 'isActive',
    },
    prepare(selection) {
      const { title, role, photo, articleCount, isActive } = selection;
      const roleConfig = ROLES[role as keyof typeof ROLES];
      const roleName = roleConfig?.name || 'Unknown';
      
      const subtitle = [
        `${roleName.toUpperCase()}`,
        articleCount && `• ${articleCount} articles`,
        !isActive && '(INACTIVE)',
      ].filter(Boolean).join(' ');
      
      return {
        title,
        subtitle,
        media: photo,
      };
    },
  },
  
  orderings: [
    {
      title: 'Name, A-Z',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
    {
      title: 'Role',
      name: 'roleAsc',
      by: [{ field: 'role', direction: 'asc' }],
    },
    {
      title: 'Most Articles',
      name: 'articleCountDesc',
      by: [{ field: 'articleCount', direction: 'desc' }],
    },
  ],
});
