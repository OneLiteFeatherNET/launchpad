---
title: 'Riding the Rollercoaster of Automation with Proxmox and Ansible'
alternativeTitle: 'How we automate infrastructure with Proxmox and Ansible'
description: 'In the boundless expanse of the digital world, our team, OneLiteFeather, has discovered a quaint yet vibrant playground where we realize our creative and technical visions. At the heart of this expedition are Proxmox and Ansible, two tools that not only have our backs but also open doors to uncharted territories.'
pubDate: '2023-10-15'
headerImage: 'images/blog/riding-the-rollercoaster-of-automation-with-proxmox-and-ansible.webp'
headerImageAlt: 'Riding the Rollercoaster of Automation with Proxmox and Ansible Image'
slug: 'riding-the-rollercoaster-of-automation-with-proxmox-and-ansible'
translationKey: 'proxmox-ansible-automation'
author: phillipp-glanz
canonical: 'https://onelitefeather.net/en/blog/riding-the-rollercoaster-of-automation-with-proxmox-and-ansible'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/mit-proxmox-und-ansible-in-eine-achterbahn-der-automatisierung-vserver'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/riding-the-rollercoaster-of-automation-with-proxmox-and-ansible'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/riding-the-rollercoaster-of-automation-with-proxmox-and-ansible'
schemaOrg:
  - type: 'BlogPosting'
    headline: 'Riding the Rollercoaster of Automation with Proxmox and Ansible'
    alternativeHeadline: 'How we automate infrastructure with Proxmox and Ansible'
    description: 'In the boundless expanse of the digital world, our team, OneLiteFeather, has discovered a quaint yet vibrant playground where we realize our creative and technical visions. At the heart of this expedition are Proxmox and Ansible, two tools that not only have our backs but also open doors to uncharted territories.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2023-10-15T00:00:00+00:00'
---
In the boundless expanse of the digital world, our team, OneLiteFeather, has discovered a quaint yet vibrant playground where we realize our creative and technical visions. At the heart of this expedition are Proxmox and Ansible, two tools that not only have our backs but also open doors to uncharted territories.
<!--more-->
Imagine Proxmox as a generous piece of fertile land where we can build and design to our heart's content. Here, we erect virtual machines (VMs) – our little digital homes, each with a special purpose. One of these homes hosts our beloved Minecraft network, while others take on crucial tasks: collecting valuable data, powering our website, monitoring our systems, and so much more. There’s a home for our logs (Logging VM), another stores frequently used data (Cache VM), and then there are homes for our website (Web Service VM), our network security (OpnSense VM), our system monitoring (Monitoring VM with CheckMK), our databases (Database VM), and our network identities (Domain Controller).

Ansible is our loyal companion on this journey. It’s like a skillful builder, aiding us in efficiently constructing and managing our digital homes. With Ansible, we can focus on the bigger picture while it handles the recurring chores. Yet, learning Ansible paired with Proxmox was like a ride on an emotional rollercoaster. A moment of euphoria, followed by a steep learning curve that twisted our stomachs faster than a loop-the-loop. But with every twist and turn, we gained momentum and mastered the curves, until we finally enjoyed the ride and appreciated the view from the top.

To keep everything in sight, we set up a virtual construction office named GitLab. Here, we plan and organize our construction projects. And when it's time to implement changes, we have a diligent helper named GitLab Runner, who operates in our Proxmox playground ensuring everything runs smoothly.

This adventure not only imparted valuable lessons but also strengthened our community. We learned a lot, and these experiences now enable us to provide our developers with simplified development and testing environments. This accelerates our work and brings us closer together as we collaborate on our projects.

With each day, our digital playground grows, and we discover new ways to make our work more efficient and our community stronger. With Ansible, Proxmox, and GitLab, we have not only created a solid foundation for our projects but also a warm and inviting home for our team. Here, we look forward to the future, ready to embrace the next challenges and expand our digital kingdom.

---

## Become Part of Our Journey

At OneLiteFeather, we value a relaxed working atmosphere and embody the flair of creative freedom coupled with structured organization. We operate under the **Kanban principle**, which allows us to work in a stress-free environment without rigid deadlines. Our focus lies on **active communication** and collective progress. If you have experience in the areas of **Moderation**, **Community Management**, **Development**, or **Concept Creation** and wish to engage in a community that values personal growth and teamwork, then you are exactly right with us. References are welcome and help us gain a better understanding of your skills and experiences.

We are excited to hear from you and realize exciting projects together. You can reach me, **themeinerlp**, directly on Discord, or you can get in touch via our Discord server, which you can find at [1lf.link/discord](https://1lf.link/discord). There, you can open a ticket to apply. Alternatively, you can also contact **OneLiteFeather** directly via Discord. Let’s chat about your ideas and how you can contribute to the OneLiteFeather community. Together, we can explore the digital world, expand our knowledge, and build a positive and supportive community.

Should any uncertainties arise, feel free to ask us. We are here to answer all your questions and are looking forward to learning more about you and your interests!
