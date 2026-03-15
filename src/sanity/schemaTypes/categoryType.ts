/**
 * @file categoryType.ts — Sanity schema for the "category" document type
 *
 * Categories are used to classify articles (e.g. Politics, Technology, Immigration).
 * Each category has a title, slug (for URL routing), optional description,
 * and a badge color used in the UI.
 *
 * Referenced by posts via the `categories` array field.
 */

import {TagIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'parent',
      title: 'Parent Category',
      type: 'reference',
      to: [{type: 'category'}],
      options: {
        disableNew: true,
      },
    }),
    defineField({
      name: 'color',
      title: 'Badge Color',
      type: 'string',
      options: {
        list: [
          {title: 'Red', value: 'red'},
          {title: 'Blue', value: 'blue'},
          {title: 'Green', value: 'green'},
          {title: 'Purple', value: 'purple'},
          {title: 'Orange', value: 'orange'},
          {title: 'Gray', value: 'gray'},
        ],
      },
      initialValue: 'blue',
    }),
    defineField({
      name: 'nameTranslations',
      title: 'Name Translations',
      description: 'Localized category names (auto-synced from admin panel).',
      type: 'object',
      fields: [
        defineField({name: 'bn', title: 'Bengali', type: 'string'}),
        defineField({name: 'es', title: 'Spanish', type: 'string'}),
        defineField({name: 'de', title: 'German', type: 'string'}),
        defineField({name: 'fr', title: 'French', type: 'string'}),
      ],
    }),
    defineField({
      name: 'descriptionTranslations',
      title: 'Description Translations',
      description: 'Localized category descriptions (auto-synced from admin panel).',
      type: 'object',
      fields: [
        defineField({name: 'bn', title: 'Bengali', type: 'text', rows: 3}),
        defineField({name: 'es', title: 'Spanish', type: 'text', rows: 3}),
        defineField({name: 'de', title: 'German', type: 'text', rows: 3}),
        defineField({name: 'fr', title: 'French', type: 'text', rows: 3}),
      ],
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      readOnly: true,
      initialValue: 'manual',
    }),
  ],
})
