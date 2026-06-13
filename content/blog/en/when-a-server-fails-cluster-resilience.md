---
title: 'When a Server Fails: How We Made Our Cluster Resilient'
alternativeTitle: 'Resilience for Beginners: Our Journey to a Fail-Safe Kubernetes Cluster'
description: 'A server went down – and nobody noticed. That was exactly my goal. I tell the story in everyday images: how we made our cluster more resilient step by step, the highs and lows of the journey, and what it means in practice for OneLiteFeather.'
pubDate: '2026-06-13'
headerImage: 'images/blog/cluster-topology-social.png'
headerImageAlt: 'Topology of the feather-core cluster: control-plane, Ceph storage and workers in zone fr01'
slug: 'when-a-server-fails-cluster-resilience'
translationKey: 'cluster-resilience-light'
tags:
  - infrastructure
  - kubernetes
  - reliability
  - hardening
author: phillipp-glanz
canonical: 'https://onelitefeather.net/en/blog/when-a-server-fails-cluster-resilience'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/wenn-ein-server-ausfaellt-cluster-resilienz'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/when-a-server-fails-cluster-resilience'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/when-a-server-fails-cluster-resilience'
schemaOrg:
  - type: 'BlogPosting'
    headline: 'When a Server Fails: How We Made Our Cluster Resilient'
    alternativeHeadline: 'Resilience for Beginners: Our Journey to a Fail-Safe Kubernetes Cluster'
    description: 'A server went down – and nobody noticed. That was exactly my goal. I tell the story in everyday images: how we made our cluster more resilient step by step.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2026-06-13T00:00:00+00:00'
---
Let me share my favourite result of the past few weeks: a server went down – and nobody noticed. No broken login, no blank website, no "database temporarily unavailable." It sounds like the most boring sentence in the world, and that's exactly what I'd been working towards.
<!--more-->
> **Light Edition.** Here I tell the story in everyday images, no prior knowledge needed. If you'd rather see the actual nuts and bolts – with configuration and diagrams from the engine room – they're in the [deep-dive edition](https://onelitefeather.net/en/blog/resilience-in-detail-priorityclasses-pdb-affinities).

I'm the one looking after backend and infrastructure at OneLiteFeather. Our services stopped living on a single server long ago; they run on a cluster – a group of machines that share the work. The idea is simple: if one machine dies, the others take over. In theory. In practice, I first had to teach the cluster that "theory" – and that's the journey I want to walk you through. The easiest way is with three pictures you definitely already know.

## Picture 1: Don't put all your eggs in one basket

The first problem is ancient and fits in a saying my grandmother already knew: don't put all your eggs in one basket.

![Three eggs in one basket versus one egg in each of three baskets](/images/blog/analogy-eggs-baskets.drawio.svg)
*Left: three eggs, one basket – one stumble and all three are gone. Right: three baskets – if one tips over, only a single egg is lost.*

That's exactly how it started with us: some services did run more than one copy, but all the copies happened to sit on the same server. Three eggs, one basket. If that server buckled, every copy was gone at once – the redundancy existed on paper only.

So I taught the cluster to deliberately spread the copies across different servers. Sounds trivial, but it's the difference between "three eggs in one basket" and "three baskets." Only then is a second server genuinely a safety net rather than decoration.

## Picture 2: One checkout always stays open

Every now and then I need to pull a server out of rotation briefly – for an update or some cleanup. Picture a supermarket: sometimes a cashier needs a break. Totally fine – as long as they don't **all** put up the "closed" sign at the same time.

![Four supermarket checkout lanes, three open, one on break](/images/blog/analogy-checkout-lanes.drawio.svg)
*Maintenance is allowed – but only at one lane at a time. At least one stays open and keeps serving.*

In the past, such maintenance could accidentally close every lane at once – and the service was gone for a beat. Now there's a firm house rule: only one copy of any service may pause at a time. The rest keep serving, unbothered. Maintenance during the day, without breaking a sweat – that used to be unthinkable.

## Picture 3: When power runs short, the fairy lights go first

The third picture: imagine a power shortage at home, only a limited amount of juice left. What stays on, what do you unplug first? The fridge stays – obviously. The heating stays. The fairy lights from the last party? They can wait.

![A power strip: fridge and heating stay on, decoration gets unplugged first](/images/blog/analogy-power-strip.drawio.svg)
*When things get tight, the least important is unplugged first. The essentials stay connected.*

That's exactly the pecking order I gave the cluster. When space runs short, the machine knows on its own what to protect: the storage that holds all the data, and the databases everything depends on. And what steps back first? The nice-but-optional things – like our Minecraft map viewer. Nobody has to get up at night and decide; the order is fixed in advance.

## The highs – and the lows

Honestly, this didn't happen in one clean sweep. There were lovely moments and grinding ones.

The loveliest: the first time I deliberately sent a server "into maintenance" and stared at the screen, tense – and simply nothing happened. The services moved calmly, the website stayed up. That's what all the work had been for.

The most grinding: I'd written down several of my lovely rules, they looked correct – and were ignored anyway. It took a fair few cups of coffee and some detective work to realise that a rule has to sit in exactly the right place to count at all. "Written down" really isn't "applied" – that lesson runs through the whole journey.

And the trickiest: our database broker, the thing every request flows through. I wanted it doubly protected – but my spread-out rule was worded too strictly. The second copy couldn't find a free spot and got stuck in the waiting room. Only when I softened the rule from "must" to "preferably" did both run cleanly on two different servers. A tiny change in wording, a huge difference.

## What this means for OneLiteFeather

Sounds like a lot of effort for something you ideally never notice. That's precisely the point:

- **Fewer surprises.** A single failed server is a shrug today, not an emergency.
- **Calmer maintenance.** Updates run during the day without my hands shaking.
- **Clear priorities.** When things get tight, the system protects itself – essentials stay, the optional steps back.
- **More peace of mind for the team.** Fewer late-night "the website is down" jolts, more time for the projects we actually enjoy.

Our cluster hasn't become more spectacular as a result – it's become more boring, in the very best sense. And honestly: that's exactly the kind of boring I like most.

---

## Become Part of Our Journey

At OneLiteFeather, we value a relaxed working atmosphere and embody the flair of creative freedom coupled with structured organization. We operate under the **Kanban principle**, which allows us to work in a stress-free environment without rigid deadlines. Our focus lies on **active communication** and collective progress. If you have experience in the areas of **Moderation**, **Community Management**, **Development**, or **Concept Creation** and wish to engage in a community that values personal growth and teamwork, then you are exactly right with us. References are welcome and help us gain a better understanding of your skills and experiences.

We are excited to hear from you and realize exciting projects together. You can reach me, **themeinerlp**, directly on Discord, or you can get in touch via our Discord server, which you can find at [1lf.link/discord](https://1lf.link/discord). There, you can open a ticket to apply. Alternatively, you can also contact **OneLiteFeather** directly via Discord. Let’s chat about your ideas and how you can contribute to the OneLiteFeather community. Together, we can explore the digital world, expand our knowledge, and build a positive and supportive community.

Should any uncertainties arise, feel free to ask us. We are here to answer all your questions and are looking forward to learning more about you and your interests!
