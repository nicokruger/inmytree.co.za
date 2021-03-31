module.exports = {
  title: 'inmytree',
  head: [
    ['link', { rel: 'icon', href: '/icon.svg', }],
    ['link', { rel: 'stylesheet', href: '//fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Dosis:wght@300;400;500;600;700&display=swap' }],
//    ['link', { rel: 'alternative', type: 'application/rss+xml', href: '/feed.rss', title: 'RSS Feed inmytree.co.za' }]
  ],
  description: 'inmytree - a devblog by some programmer dude',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'About', link: '/about/' },
      { text: 'Contact', link: '/contact/' }
    ],
  },
}
