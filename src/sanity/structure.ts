import type {StructureResolver} from 'sanity/structure'
import {
  DocumentTextIcon,
  UserIcon,
  TagIcon,
  UsersIcon,
  CogIcon,
  DashboardIcon,
  ClockIcon,
  EyeOpenIcon,
  PublishIcon,
} from '@sanity/icons'

// Editorial workflow structure for Sanity Studio
export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Content')
    .items([
      // Editorial Dashboard
      S.listItem()
        .title('Editorial Dashboard')
        .icon(DashboardIcon)
        .child(
          S.list()
            .title('Dashboard')
            .items([
              S.listItem()
                .title('Awaiting Review')
                .icon(EyeOpenIcon)
                .child(
                  S.documentList()
                    .title('Awaiting Review')
                    .filter('_type == "post" && status == "review"')
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                ),
              S.listItem()
                .title('Approved & Ready')
                .icon(PublishIcon)
                .child(
                  S.documentList()
                    .title('Approved Articles')
                    .filter('_type == "post" && status == "approved"')
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                ),
              S.listItem()
                .title('Scheduled Posts')
                .icon(ClockIcon)
                .child(
                  S.documentList()
                    .title('Scheduled Posts')
                    .filter('_type == "post" && defined(scheduledPublish) && scheduledPublish > now()')
                    .defaultOrdering([{field: 'scheduledPublish', direction: 'asc'}])
                ),
              S.listItem()
                .title('Breaking News')
                .icon(() => '🔴')
                .child(
                  S.documentList()
                    .title('Breaking News')
                    .filter('_type == "post" && isBreaking == true && status == "published"')
                    .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
                ),
            ])
        ),

      S.divider(),

      // Articles (All Status)
      S.listItem()
        .title('All Articles')
        .icon(DocumentTextIcon)
        .child(
          S.documentList()
            .title('All Articles')
            .filter('_type == "post"')
            .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
        ),

      // Articles by Status
      S.listItem()
        .title('Articles by Status')
        .icon(() => '📊')
        .child(
          S.list()
            .title('Filter by Status')
            .items([
              S.listItem()
                .title('📝 Drafts')
                .child(
                  S.documentList()
                    .title('Drafts')
                    .filter('_type == "post" && status == "draft"')
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                ),
              S.listItem()
                .title('👀 Under Review')
                .child(
                  S.documentList()
                    .title('Under Review')
                    .filter('_type == "post" && status == "review"')
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                ),
              S.listItem()
                .title('✅ Approved')
                .child(
                  S.documentList()
                    .title('Approved')
                    .filter('_type == "post" && status == "approved"')
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                ),
              S.listItem()
                .title('🚀 Published')
                .child(
                  S.documentList()
                    .title('Published')
                    .filter('_type == "post" && status == "published"')
                    .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
                ),
              S.listItem()
                .title('📦 Archived')
                .child(
                  S.documentList()
                    .title('Archived')
                    .filter('_type == "post" && status == "archived"')
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                ),
            ])
        ),

      S.divider(),

      // Content Management
      S.listItem()
        .title('Categories')
        .icon(TagIcon)
        .child(S.documentTypeList('category').title('Categories')),

      S.listItem()
        .title('Authors')
        .icon(UsersIcon)
        .child(S.documentTypeList('author').title('Authors')),

      S.listItem()
        .title('Live Updates')
        .icon(ClockIcon)
        .child(S.documentTypeList('liveUpdate').title('Live Updates')),

      S.listItem()
        .title('Sponsors')
        .icon(() => '💼')
        .child(S.documentTypeList('sponsor').title('Sponsors')),

      S.divider(),

      // User Management
      S.listItem()
        .title('Users & Permissions')
        .icon(UserIcon)
        .child(S.documentTypeList('user').title('Users')),

      S.divider(),

      // Settings
      S.listItem()
        .title('Settings')
        .icon(CogIcon)
        .child(
          S.list()
            .title('Settings')
            .items([
              S.documentTypeListItem('category').title('Manage Categories'),
              S.documentTypeListItem('author').title('Manage Authors'),
            ])
        ),
    ])
