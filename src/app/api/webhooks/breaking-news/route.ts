import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-sanity-secret');
    
    if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { articleId, type } = body;
    
    // Fetch article details from Sanity
    const sanityResponse = await fetch(
      `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/production?query=*[_id == "${articleId}"][0]{title,excerpt,slug,mainImage,author->{name}}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SANITY_API_TOKEN}`,
        },
      }
    );
    
    const data = await sanityResponse.json();
    const article = data.result;
    
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    // Handle different types of breaking news events
    switch (type) {
      case 'breaking-news':
        // New breaking news published
        console.log(`🚨 BREAKING NEWS: ${article.title}`);
        
        // Revalidate homepage to show breaking news
        revalidatePath('/');
        revalidatePath('/[lang]', 'page');
        
        // TODO: Send Slack notification
        if (process.env.SLACK_WEBHOOK_URL) {
          await fetch(process.env.SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: `🚨 BREAKING NEWS: ${article.title}\n\n${article.excerpt}\n\nRead more: ${process.env.NEXT_PUBLIC_BASE_URL}/en/news/${article.slug?.current}`,
            }),
          });
        }
        
        // TODO: Send email alert to subscribers
        // await sendEmailAlert({ article, type: 'breaking-news' });
        
        // TODO: Send push notifications
        // await sendPushNotifications({ article, type: 'breaking-news' });
        
        break;
        
      case 'breaking-news-added':
        // Breaking news flag added to existing article
        console.log(`📢 Breaking News flag added to: ${article.title}`);
        
        revalidatePath('/');
        revalidatePath('/[lang]', 'page');
        
        if (process.env.SLACK_WEBHOOK_URL) {
          await fetch(process.env.SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: `📢 Breaking News flag added to: ${article.title}\n\n${process.env.NEXT_PUBLIC_BASE_URL}/en/news/${article.slug?.current}`,
            }),
          });
        }
        break;
        
      case 'breaking-news-removed':
        // Breaking news flag removed
        console.log(`⚠️ Breaking News flag removed from: ${article.title}`);
        
        revalidatePath('/');
        revalidatePath('/[lang]', 'page');
        break;
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Breaking news processed: ${type}`,
      article: article.title,
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
