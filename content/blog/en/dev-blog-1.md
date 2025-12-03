---
title: 'DevBlog #1'
alternativeTitle: 'What we use and why it helps'
description: 'Today I would like to present you the active used technologies from our team and which advantages these offer to us...'
pubDate: '2023-10-21'
headerImage: 'images/blog/dev-blog-1.webp'
headerImageAlt: 'Title image for DevBlog #1'
slug: 'dev-blog-1-what-we-using'
translationKey: 'dev-blog-1-what-we-using'
author: phillipp-glanz
canonical: 'https://onelitefeather.net/en/blog/dev-blog-1-what-we-using'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/dev-blog-1-was-wir-verwenden'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/dev-blog-1-what-we-using'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/dev-blog-1-what-we-using'
schemaOrg:
  - type: 'BlogPosting'
    headline: 'DevBlog #1: What we use'
    alternativeHeadline: 'What we use and why it helps'
    description: 'Today I would like to present you the active used technologies from our team and which advantages these offer to us...'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2023-10-21T00:00:00+00:00'
---
This blog entry was translated, there is also a german version of it!

Hello all together,
my name is Phillipp. I am one of two lead developer and look after technologies and server architecture here in this team.
<!--more-->

Today I would like to present you the active used technologies from our team and which advantages these offer to us.

We split this list in more parts below to keep the main (focus) point and quality for you.

At first I give you a small listing which technology we are using.
Technologies (Services):
- Sentry *
- SonarQube *
- Gitlab * 
- OpenProject
- Outline
- Kubernetes
- NextCloud
- MailCow
- MariaDB
- MongoDB
- S3(Minio)
- KeyCloak
- Vaultwarden
- KeyDB(Redis)
- Weblate
- Renovate
(- WakaTime)

*: Is treated in this part.

In addition we are using principles, but these are going to be explained an another dev-blog.

---

### Sentry
Sentry is used for automatic error tracking for us.
With this we are hoping that we actively see a bug or error, produced by users, in productive and test environments, which could not be covered by Quality Assurance (QA) or which is a special case.

Advantages:
- Automatic notification of live and test systems when bugs or errors are produced.
- Stacktraces are saved central and connected to the project in Gitlab.
- Errors / bugs are recorded with the matching version to sort out priorities. These can be interpreted in our project management to filter out if this error / bug was already fixed in an earlier version.

---

### SonarQube
SonarQube is used by us for first layer feedback, it checks our source code via CI/CD active for safety, orientating on industry standards. We can take sure with this software that our source code quality stays constant. Simple mistakes can be excluded with SonarQube.

Advantages:
- Automatic and neutral feedback for the developer
- The project lead or lead developer only needs to help on the second layer (or step) which saves time for us.
- Constant source code quality

---
### Gitlab
Gitlab is our central source code management platform which allows us to roll out automatic updates with CI/CD workflow on several environments. It helps us to coordinate software. Gitlab gives us the possibility for metric integration on several enviroments as well. At the moment we are using the fork function to build projects based on equal data structures to use first settings which are important.

Advantages:
- Automatic setup by CI/CD workflow
- Big time saving while setting up the project
- Equal structures to save learn time to work with the project
- Dependency updates are quicker through central template management

---

Thank you very much for your attention.
I hope you liked this blog entry.
If you like to give active feedback, write us in our Discord.

Greetings,
TheMeinerLP - Phillipp
Software lead

Second correcture made by Michelle (owner of OneLiteFeather)

---

## Become Part of Our Journey

At OneLiteFeather, we value a relaxed working atmosphere and embody the flair of creative freedom coupled with structured organization. We operate under the **Kanban principle**, which allows us to work in a stress-free environment without rigid deadlines. Our focus lies on **active communication** and collective progress. If you have experience in the areas of **Moderation**, **Community Management**, **Development**, or **Concept Creation** and wish to engage in a community that values personal growth and teamwork, then you are exactly right with us. References are welcome and help us gain a better understanding of your skills and experiences.

We are excited to hear from you and realize exciting projects together. You can reach me, **themeinerlp**, directly on Discord, or you can get in touch via our Discord server, which you can find at [1lf.link/discord](https://1lf.link/discord). There, you can open a ticket to apply. Alternatively, you can also contact **OneLiteFeather** directly via Discord. Let’s chat about your ideas and how you can contribute to the OneLiteFeather community. Together, we can explore the digital world, expand our knowledge, and build a positive and supportive community.

Should any uncertainties arise, feel free to ask us. We are here to answer all your questions and are looking forward to learning more about you and your interests!
