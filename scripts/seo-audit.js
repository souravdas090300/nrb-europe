#!/usr/bin/env node

/**
 * SEO Audit Script for NRB Europe
 * Checks all critical SEO requirements for Google News approval
 */

const https = require('https');
const http = require('http');
require('dotenv').config({ path: '.env.local' });

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const IS_LOCAL = SITE_URL.includes('localhost');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    }).on('error', reject);
  });
}

async function checkSitemap() {
  try {
    log('\n📄 Checking Sitemap...', 'cyan');
    
    const mainSitemap = await fetchUrl(`${SITE_URL}/sitemap.xml`);
    const newsSitemap = await fetchUrl(`${SITE_URL}/news-sitemap.xml`);
    
    const checks = [
      {
        name: 'Main sitemap exists',
        passed: mainSitemap.status === 200,
        message: mainSitemap.status !== 200 ? `Status: ${mainSitemap.status}` : null,
      },
      {
        name: 'Main sitemap has URLs',
        passed: mainSitemap.data.includes('<url>') && mainSitemap.data.includes('<loc>'),
        message: 'Sitemap appears empty or malformed',
      },
      {
        name: 'News sitemap exists',
        passed: newsSitemap.status === 200,
        message: newsSitemap.status !== 200 ? `Status: ${newsSitemap.status}` : null,
      },
      {
        name: 'News sitemap has proper namespace',
        passed: newsSitemap.data.includes('xmlns:news='),
        message: 'Missing Google News XML namespace',
      },
      {
        name: 'News sitemap has articles',
        passed: newsSitemap.data.includes('<news:news>'),
        message: 'No news articles found in sitemap',
      },
    ];
    
    return checks;
  } catch (error) {
    return [{
      name: 'Sitemap check',
      passed: false,
      message: `Error: ${error.message}`,
    }];
  }
}

async function checkRobotsTxt() {
  try {
    log('\n🤖 Checking robots.txt...', 'cyan');
    
    const robots = await fetchUrl(`${SITE_URL}/robots.txt`);
    
    const checks = [
      {
        name: 'robots.txt exists',
        passed: robots.status === 200,
        message: robots.status !== 200 ? `Status: ${robots.status}` : null,
      },
      {
        name: 'robots.txt has sitemap directive',
        passed: robots.data.includes('Sitemap:'),
        message: 'Missing sitemap directive',
      },
      {
        name: 'Allows Googlebot',
        passed: !robots.data.match(/User-agent:\s*Googlebot[\s\S]*?Disallow:\s*\//),
        message: 'Googlebot is being blocked',
      },
      {
        name: 'News sitemap included',
        passed: robots.data.includes('news-sitemap.xml'),
        message: 'News sitemap not referenced in robots.txt',
      },
    ];
    
    return checks;
  } catch (error) {
    return [{
      name: 'robots.txt check',
      passed: false,
      message: `Error: ${error.message}`,
    }];
  }
}

async function checkRSSFeed() {
  try {
    log('\n📡 Checking RSS Feed...', 'cyan');
    
    const rss = await fetchUrl(`${SITE_URL}/rss.xml`);
    
    const checks = [
      {
        name: 'RSS feed exists',
        passed: rss.status === 200,
        message: rss.status !== 200 ? `Status: ${rss.status}` : null,
      },
      {
        name: 'RSS feed is valid XML',
        passed: rss.data.includes('<?xml') && rss.data.includes('<rss'),
        message: 'RSS feed appears malformed',
      },
      {
        name: 'RSS has items',
        passed: rss.data.includes('<item>'),
        message: 'No items found in RSS feed',
      },
      {
        name: 'RSS has full content',
        passed: rss.data.includes('<content:encoded>') || rss.data.includes('<description>'),
        message: 'RSS feed should include full article content',
      },
    ];
    
    return checks;
  } catch (error) {
    return [{
      name: 'RSS feed check',
      passed: false,
      message: `Error: ${error.message}`,
    }];
  }
}

async function checkStructuredData() {
  try {
    log('\n🏷️  Checking Structured Data...', 'cyan');
    
    const homepage = await fetchUrl(IS_LOCAL ? `${SITE_URL}/en` : SITE_URL);
    
    const checks = [
      {
        name: 'Has structured data',
        passed: homepage.data.includes('application/ld+json'),
        message: 'No JSON-LD structured data found',
      },
      {
        name: 'Has Organization schema',
        passed: homepage.data.includes('"@type":"Organization') || 
                homepage.data.includes('"@type": "Organization') ||
                homepage.data.includes('"@type":"NewsMediaOrganization'),
        message: 'Organization structured data missing',
      },
      {
        name: 'Has proper Open Graph tags',
        passed: homepage.data.includes('og:title') && homepage.data.includes('og:description'),
        message: 'Missing essential Open Graph tags',
      },
      {
        name: 'Has Twitter Card tags',
        passed: homepage.data.includes('twitter:card'),
        message: 'Missing Twitter Card tags',
      },
    ];
    
    return checks;
  } catch (error) {
    return [{
      name: 'Structured data check',
      passed: false,
      message: `Error: ${error.message}`,
    }];
  }
}

async function checkPages() {
  try {
    log('\n📱 Checking Required Pages...', 'cyan');
    
    const aboutPage = await fetchUrl(`${SITE_URL}/about`);
    const editorialPage = await fetchUrl(`${SITE_URL}/en/editorial-policy`);
    const contactPage = await fetchUrl(`${SITE_URL}/contact`);
    
    const checks = [
      {
        name: 'About page exists',
        passed: aboutPage.status === 200,
        message: 'About page is required for Google News',
      },
      {
        name: 'Editorial policy page exists',
        passed: editorialPage.status === 200,
        message: 'Editorial policy is required for Google News',
      },
      {
        name: 'Contact page exists',
        passed: contactPage.status === 200,
        message: 'Contact page is required for Google News',
      },
      {
        name: 'About page has content',
        passed: aboutPage.data.length > 1000,
        message: 'About page should have comprehensive information',
      },
      {
        name: 'Editorial policy has corrections policy',
        passed: editorialPage.data.toLowerCase().includes('correction'),
        message: 'Corrections policy is required',
      },
    ];
    
    return checks;
  } catch (error) {
    return [{
      name: 'Required pages check',
      passed: false,
      message: `Error: ${error.message}`,
    }];
  }
}

async function checkSecurity() {
  try {
    log('\n🔒 Checking Security Headers...', 'cyan');
    
    const homepage = await fetchUrl(IS_LOCAL ? `${SITE_URL}/en` : SITE_URL);
    const headers = homepage.headers;
    
    const checks = [
      {
        name: 'Has X-Frame-Options',
        passed: !!headers['x-frame-options'],
        message: 'X-Frame-Options header recommended',
      },
      {
        name: 'Has X-Content-Type-Options',
        passed: !!headers['x-content-type-options'],
        message: 'X-Content-Type-Options header recommended',
      },
      {
        name: 'Has Referrer-Policy',
        passed: !!headers['referrer-policy'],
        message: 'Referrer-Policy header recommended',
      },
    ];
    
    return checks;
  } catch (error) {
    return [{
      name: 'Security headers check',
      passed: false,
      message: `Error: ${error.message}`,
    }];
  }
}

async function runAudit() {
  log('\n' + '='.repeat(60), 'blue');
  log('🔍 NRB EUROPE SEO AUDIT', 'blue');
  log('='.repeat(60), 'blue');
  log(`\nAuditing: ${SITE_URL}`, 'cyan');
  
  if (IS_LOCAL) {
    log('\n⚠️  Running audit on localhost. Some checks may not be accurate.', 'yellow');
    log('For full audit, deploy to production first.', 'yellow');
  }
  
  const allChecks = [
    ...(await checkSitemap()),
    ...(await checkRobotsTxt()),
    ...(await checkRSSFeed()),
    ...(await checkStructuredData()),
    ...(await checkPages()),
    ...(await checkSecurity()),
  ];
  
  log('\n' + '='.repeat(60), 'blue');
  log('📊 AUDIT RESULTS', 'blue');
  log('='.repeat(60), 'blue');
  
  allChecks.forEach(check => {
    const icon = check.passed ? '✅' : '❌';
    const color = check.passed ? 'green' : 'red';
    log(`${icon} ${check.name}`, color);
    if (!check.passed && check.message) {
      log(`   ⚠️  ${check.message}`, 'yellow');
    }
  });
  
  const passed = allChecks.filter(c => c.passed).length;
  const total = allChecks.length;
  const percentage = Math.round((passed / total) * 100);
  
  log('\n' + '='.repeat(60), 'blue');
  log(`SCORE: ${passed}/${total} (${percentage}%)`, percentage === 100 ? 'green' : 'yellow');
  log('='.repeat(60), 'blue');
  
  if (percentage === 100) {
    log('\n🎉 Excellent! Your site meets all SEO requirements.', 'green');
    log('✅ Ready for Google News Publisher Center submission!', 'green');
  } else if (percentage >= 80) {
    log('\n✅ Good! Most requirements are met.', 'yellow');
    log('⚠️  Fix remaining issues before Google News submission.', 'yellow');
  } else {
    log('\n⚠️  Attention needed. Several issues must be fixed.', 'red');
    log('❌ Not ready for Google News submission yet.', 'red');
  }
  
  log('\n📚 Next Steps:', 'cyan');
  log('1. Fix any issues shown above', 'cyan');
  log('2. Deploy to production if testing locally', 'cyan');
  log('3. Submit to Google News Publisher Center:', 'cyan');
  log('   https://publishercenter.google.com', 'cyan');
  log('4. Add sitemaps in Google Search Console:', 'cyan');
  log(`   ${SITE_URL}/sitemap.xml`, 'cyan');
  log(`   ${SITE_URL}/news-sitemap.xml`, 'cyan');
  log('\n');
}

// Run the audit
runAudit().catch(error => {
  log(`\n❌ Audit failed: ${error.message}`, 'red');
  process.exit(1);
});
