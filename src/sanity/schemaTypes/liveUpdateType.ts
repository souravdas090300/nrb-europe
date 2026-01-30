import {defineField, defineType} from 'sanity'

export const liveUpdateType = defineType({
  name: 'liveUpdate',
  title: 'Live Update',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Update Title',
      type: 'string',
    }),
    defineField({
      name: 'content',
      title: 'Update Content',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'time',
      title: 'Update Time',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'isImportant',
      title: 'Important Update',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'liveBlog',
      title: 'Live Blog Article',
      type: 'reference',
      to: [{ type: 'post' }],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      time: 'time',
      isImportant: 'isImportant',
    },
    prepare(selection) {
      const {title, time, isImportant} = selection
      return {
        title: title || 'Live Update',
        subtitle: `${new Date(time).toLocaleString()} ${isImportant ? '⚠️' : ''}`,
      }
    },
  },
})
