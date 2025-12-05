---
title: 'Mit Proxmox und Ansible in eine Achterbahn der Automatisierung'
alternativeTitle: 'Wie wir Infrastruktur mit Proxmox und Ansible automatisieren'
description: 'In der unendlichen Weite der digitalen Welt hat unser Team, OneLiteFeather, eine kleine aber feine Spielwiese gefunden, auf der wir unsere kreativen und technischen Visionen verwirklichen. Im Zentrum dieser Entdeckungsreise stehen Proxmox und Ansible, zwei Werkzeuge, die uns nicht nur den Rücken freihalten, sondern auch die Türen zu unerforschten Gebieten öffnen.'
pubDate: '2023-10-15'
headerImage: 'images/blog/riding-the-rollercoaster-of-automation-with-proxmox-and-ansible.webp'
headerImageAlt: 'Mit Proxmox und Ansible in eine Achterbahn der Automatisierung Bild'
slug: 'mit-proxmox-und-ansible-in-eine-achterbahn-der-automatisierung-vserver'
translationKey: 'proxmox-ansible-automation'
tags:
  - automation
  - proxmox
  - ansible
  - infrastructure
author: phillipp-glanz
canonical: 'https://onelitefeather.net/de/blog/mit-proxmox-und-ansible-in-eine-achterbahn-der-automatisierung-vserver'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/mit-proxmox-und-ansible-in-eine-achterbahn-der-automatisierung-vserver'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/riding-the-rollercoaster-of-automation-with-proxmox-and-ansible'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/riding-the-rollercoaster-of-automation-with-proxmox-and-ansible'
schemaOrg:
  - type: 'BlogPosting'
    headline: 'Mit Proxmox und Ansible in eine Achterbahn der Automatisierung'
    alternativeHeadline: 'Wie wir Infrastruktur mit Proxmox und Ansible automatisieren'
    description: 'In der unendlichen Weite der digitalen Welt hat unser Team, OneLiteFeather, eine kleine aber feine Spielwiese gefunden, auf der wir unsere kreativen und technischen Visionen verwirklichen. Im Zentrum dieser Entdeckungsreise stehen Proxmox und Ansible, zwei Werkzeuge, die uns nicht nur den Rücken freihalten, sondern auch die Türen zu unerforschten Gebieten öffnen.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2023-10-15T00:00:00+00:00'
---
In der unendlichen Weite der digitalen Welt hat unser Team, OneLiteFeather, eine kleine aber feine Spielwiese gefunden, auf der wir unsere kreativen und technischen Visionen verwirklichen. Im Zentrum dieser Entdeckungsreise stehen Proxmox und Ansible, zwei Werkzeuge, die uns nicht nur den Rücken freihalten, sondern auch die Türen zu unerforschten Gebieten öffnen.
<!--more-->
Stell dir Proxmox als ein großzügiges Stück fruchtbaren Landes vor, auf dem wir nach Herzenslust bauen und gestalten können. Hier errichten wir virtuelle Maschinen (VMs) – unsere kleinen digitalen Häuser, jedes mit einem besonderen Zweck. Eines dieser Häuser beherbergt unser geliebtes Minecraft-Netzwerk, während andere wichtige Aufgaben übernehmen: das Sammeln wertvoller Daten, das Bereitstellen unserer Webseite, das Überwachen unserer Systeme und vieles mehr. Es gibt ein Haus für unsere Logs (Logging VM), ein anderes speichert häufig genutzte Daten (Cache VM), und dann gibt es noch Häuser für unsere Webseite (Web Service VM), unsere Netzwerksicherheit (OpnSense VM), unser Systemmonitoring (Monitoring VM mit CheckMK), unsere Datenbanken (Database VM) und unsere Netzwerkidentitäten (Domain Controller).

Ansible ist unser treuer Gefährte auf dieser Reise. Es ist wie ein geschickter Baumeister, der uns hilft, unsere digitalen Häuser effizient zu errichten und zu verwalten. Mit Ansible können wir uns auf das Große Ganze konzentrieren, während es die wiederkehrenden Aufgaben erledigt. Doch das Erlernen von Ansible gepaart mit Proxmox war wie eine Fahrt in einer Gefühlsachterbahn. Ein Moment der Euphorie, gefolgt von einer steilen Lernkurve, die uns schneller den Magen umdrehte als eine Loopingbahn. Doch mit jeder Drehung und Wendung gewannen wir an Geschwindigkeit und meisterten die Kurven, bis wir schließlich die Fahrt genossen und die Aussicht von oben schätzten.

Um alles im Blick zu behalten, haben wir ein virtuelles Baubüro namens GitLab eingerichtet. Dort planen und organisieren wir unsere Bauvorhaben. Und wenn es Zeit ist, Änderungen umzusetzen, haben wir einen fleißigen Helfer namens GitLab Runner, der in unserer Proxmox-Spielwiese arbeitet und dafür sorgt, dass alles reibungslos läuft.

Dieses Abenteuer hat uns nicht nur lehrreiche Lektionen erteilt, sondern auch unsere Gemeinschaft gestärkt. Wir haben viel gelernt, und diese Erfahrungen ermöglichen es uns nun, unseren Entwicklern vereinfachte Entwicklungs- und Testumgebungen bereitzustellen. Das beschleunigt unsere Arbeit und bringt uns einander näher, während wir gemeinsam an unseren Projekten arbeiten.

Mit jedem Tag wächst unsere digitale Spielwiese, und wir entdecken neue Möglichkeiten, um unsere Arbeit effizienter und unsere Gemeinschaft stärker zu machen. Mit Ansible, Proxmox und GitLab haben wir nicht nur eine solide Grundlage für unsere Projekte geschaffen, sondern auch eine warme und einladende Heimat für unser Team. Hier blicken wir gespannt in die Zukunft, bereit, die nächsten Herausforderungen anzunehmen und unser digitales Reich weiter auszubauen.

---

## Werde Teil unserer Reise

Bei OneLiteFeather schätzen wir eine entspannte Arbeitsatmosphäre und leben den Flair von kreativer Freiheit gepaart mit strukturierter Organisation. Wir arbeiten nach dem **Kanban-Prinzip**, das uns ermöglicht, in einem stressfreien Umfeld ohne starre Deadlines zu arbeiten. Dabei liegt unser Fokus auf **aktiver Kommunikation** und dem gemeinsamen Fortschritt. Wenn du in den Bereichen **Moderation**, **Community Management**, **Entwicklung** oder **Konzepterstellung** Erfahrung hast und dich in einer Gemeinschaft engagieren möchtest, die Wert auf persönliches Wachstum und Teamarbeit legt, dann bist du bei uns genau richtig. Referenzen sind willkommen und helfen uns, ein besseres Verständnis für deine Fähigkeiten und Erfahrungen zu bekommen.

Wir sind gespannt darauf, von dir zu hören und gemeinsam spannende Projekte zu verwirklichen. Du kannst mich, **themeinerlp**, direkt auf Discord erreichen, oder du kannst über unseren Discord-Server in Kontakt treten, den du unter [1lf.link/discord](https://1lf.link/discord) findest. Dort kannst du ein Ticket eröffnen, um dich zu bewerben. Alternativ kannst du auch **OneLiteFeather** direkt via Discord kontaktieren. Lass uns über deine Ideen plaudern und wie du zur OneLiteFeather-Community beitragen kannst. Zusammen können wir die digitale Welt erkunden, unser Wissen erweitern und eine positive und unterstützende Gemeinschaft aufbauen.

Falls Unklarheiten aufkommen sollten, sei frei uns zu fragen. Wir sind hier, um alle deine Fragen zu beantworten und freuen uns darauf, mehr über dich und deine Interessen zu erfahren!
