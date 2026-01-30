import type { StructureResolver } from 'sanity/structure';
import { getUserRole } from './roles';

export const getDeskStructure: StructureResolver = (S, context) => {
  const { currentUser } = context;
  const role = getUserRole(currentUser);
  
  // Define which lists are visible to each role
  const visibleLists: Record<string, string[]> = {
    superAdmin: ['articles', 'categories', 'users', 'media'],
    editor: ['articles', 'categories', 'media'],
    author: ['myArticles', 'categories'],
    viewer: ['articles', 'categories'],
  };
  
  const allowedLists = visibleLists[role] || [];
  const lists: any[] = [];
  
  // Articles with filtered views
  if (allowedLists.includes('articles')) {
    lists.push(
      S.listItem()
        .title('Articles')
        .icon(() => '📰')
        .child(
          S.list()
            .title('Articles')
            .items([
              // All articles (filtered by role)
              S.listItem()
                .title('All Articles')
                .child(
                  S.documentList()
                    .title('All Articles')
                    .filter(role === 'author' 
                      ? `_type == "article" && author._ref == $userId`
                      : `_type == "article"`
                    )
                    .params({ userId: currentUser?.id })
                    .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                ),
              
              S.divider(),
              
              S.listItem()
                .title('💭 Drafts')
                .child(
                  S.documentList()
                    .title('Drafts')
                    .filter(`_type == "article" && status == "draft"`)
                    .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                ),
              
              S.listItem()
                .title('👁️ Under Review')
                .child(
                  S.documentList()
                    .title('Under Review')
                    .filter(`_type == "article" && status == "review"`)
                    .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                ),
              
              S.listItem()
                .title('✅ Approved')
                .child(
                  S.documentList()
                    .title('Approved')
                    .filter(`_type == "article" && status == "approved"`)
                    .defaultOrdering([{ field: 'scheduledPublish', direction: 'asc' }])
                ),
              
              S.listItem()
                .title('🚀 Published')
                .child(
                  S.documentList()
                    .title('Published')
                    .filter(`_type == "article" && status == "published"`)
                    .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                ),
              
              S.listItem()
                .title('🚨 Breaking News')
                .child(
                  S.documentList()
                    .title('Breaking News')
                    .filter(`_type == "article" && isBreakingNews == true`)
                    .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                ),
              
              S.listItem()
                .title('📅 Scheduled')
                .child(
                  S.documentList()
                    .title('Scheduled')
                    .filter(`_type == "article" && status == "approved" && scheduledPublish != null`)
                    .defaultOrdering([{ field: 'scheduledPublish', direction: 'asc' }])
                ),
              
              S.listItem()
                .title('📦 Archived')
                .child(
                  S.documentList()
                    .title('Archived')
                    .filter(`_type == "article" && status == "archived"`)
                    .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                ),
            ])
        )
    );
  }
  
  // My Articles (for authors)
  if (allowedLists.includes('myArticles')) {
    lists.push(
      S.listItem()
        .title('My Articles')
        .icon(() => '✏️')
        .child(
          S.documentList()
            .title('My Articles')
            .filter(`_type == "article" && author._ref == $userId`)
            .params({ userId: currentUser?.id })
            .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
        )
    );
  }
  
  // Categories
  if (allowedLists.includes('categories')) {
    lists.push(
      S.listItem()
        .title('Categories')
        .icon(() => '🏷️')
        .child(
          S.documentList()
            .title('Categories')
            .filter('_type == "category"')
            .defaultOrdering([{ field: 'title', direction: 'asc' }])
        )
    );
  }
  
  // Users (admin only)
  if (allowedLists.includes('users') && role === 'superAdmin') {
    lists.push(
      S.listItem()
        .title('Users')
        .icon(() => '👥')
        .child(
          S.list()
            .title('Users')
            .items([
              S.listItem()
                .title('All Users')
                .child(
                  S.documentList()
                    .title('All Users')
                    .filter('_type == "user"')
                    .defaultOrdering([{ field: 'name', direction: 'asc' }])
                ),
              
              S.divider(),
              
              S.listItem()
                .title('Super Admins')
                .child(S.documentList().filter('_type == "user" && role == "superAdmin"').title('Super Admins')),
              
              S.listItem()
                .title('Editors')
                .child(S.documentList().filter('_type == "user" && role == "editor"').title('Editors')),
              
              S.listItem()
                .title('Authors')
                .child(S.documentList().filter('_type == "user" && role == "author"').title('Authors')),
              
              S.listItem()
                .title('Viewers')
                .child(S.documentList().filter('_type == "user" && role == "viewer"').title('Viewers')),
              
              S.divider(),
              
              S.listItem()
                .title('Active Users')
                .child(S.documentList().filter('_type == "user" && isActive == true').title('Active Users')),
              
              S.listItem()
                .title('Inactive Users')
                .child(S.documentList().filter('_type == "user" && isActive == false').title('Inactive Users')),
            ])
        )
    );
  }
  
  // Media Library
  if (allowedLists.includes('media')) {
    lists.push(
      S.listItem()
        .title('Media Library')
        .icon(() => '🖼️')
        .child(
          S.documentList()
            .title('Media')
            .filter('_type == "sanity.imageAsset"')
            .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
        )
    );
  }
  
  return S.list()
    .title('Content')
    .items(lists);
};
