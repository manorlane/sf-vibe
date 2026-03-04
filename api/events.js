export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const RSS_FEEDS = [
      'https://sf.funcheap.com/feed/',
      'https://www.sfstation.com/feed/',
    ];

    const results = await Promise.allSettled(
      RSS_FEEDS.map(url =>
        fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SFVibe/1.0)' }
        }).then(r => r.text())
      )
    );

    const events = [];
    let idCounter = 1000;

    for (const result of results) {
      if (result.status !== 'fulfilled') continue;
      const xml = result.value;

      // Parse <item> blocks from RSS
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      for (const item of items.slice(0, 20)) {
        const get = (tag) => {
          const match = item.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
          return match ? (match[1] || match[2] || '').trim() : '';
        };

        const title = get('title');
        const link = get('link') || get('guid');
        const pubDate = get('pubDate');
        const description = get('description').replace(/<[^>]+>/g, '').slice(0, 200);

        if (!title) continue;

        // Try to extract a date from pubDate
        let date = '';
        if (pubDate) {
          try {
            const d = new Date(pubDate);
            date = d.toISOString().split('T')[0];
          } catch (e) {
            date = '';
          }
        }

        // Guess category from title/description
        const text = (title + ' ' + description).toLowerCase();
        let category = 'Event';
        if (/music|concert|band|live|jazz|rock|indie|dj|festival/i.test(text)) category = 'Music';
        else if (/comedy|laugh|stand.?up|comic/i.test(text)) category = 'Comedy';
        else if (/art|gallery|exhibit|museum|mural/i.test(text)) category = 'Art';
        else if (/food|eat|drink|wine|beer|restaurant|market|tasting/i.test(text)) category = 'Food';
        else if (/hike|trail|outdoor|park|nature|walk/i.test(text)) category = 'Outdoors';
        else if (/theater|theatre|opera|ballet|dance|show|performance/i.test(text)) category = 'Theater';
        else if (/family|kids|children|youth/i.test(text)) category = 'Family';
        else if (/sport|game|race|marathon|giants|warriors|49ers/i.test(text)) category = 'Sports';
        else if (/festival|parade|fair|carnival/i.test(text)) category = 'Festival';

        // Guess cost
        let cost = 'Free';
        if (/free/i.test(text)) cost = 'Free';
        else if (/\$\$\$|\$[5-9]\d|\$[1-9]\d{2}/i.test(text)) cost = '$$$';
        else if (/\$\$|\$[2-4]\d/i.test(text)) cost = '$$';
        else if (/\$/i.test(text)) cost = '$';

        events.push({
          id: idCounter++,
          title,
          date,
          category,
          cost,
          location: 'San Francisco',
          rating: (4.0 + Math.random() * 0.9).toFixed(1) * 1,
          link: link.replace(/^.*<!\[CDATA\[/, '').replace(/\]\]>.*$/, '').trim(),
          description,
          source: 'live'
        });
      }
    }

    // Sort by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({ events, count: events.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
