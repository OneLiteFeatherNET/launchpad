---
title: 'Everything You Need to Know About Ethanol'
description: 'Relatively unknown yet already present on several hundred servers. Like Fractureiser, it is promoted by the user mori0 / Riesenrad to “troll” servers. What lies behind it.'
pubDate: 'Jul 23 2024'
headerImage: 'images/blog/cyber-theDigitalArtist-Ethanol-Post.webp'
slug: 'everything-you-need-to-know-about-ethanol'
language: 'en'
---

Relatively unknown yet already present on several hundred servers. Like Fractureiser, it is promoted by the user mori0 / Riesenrad to “troll” servers. What lies behind it.
<!--more-->
Ethanol started quite differently from Fractureiser, as an inconspicuous “troll plugin” for Minecraft servers, specifically for Paper and Spigot servers. The similarities to Fractureiser are the elements that can be recognized as malicious or untypical for a “harmless trolling action.” Thus, it is a form of malware, specifically a **backdoor**.

### How Ethanol Gets on Your Server

Ethanol itself is not a plugin you can find in your plugin folder. Perpetrators on the Ethanol Discord infect a plugin of their choice through their bot. For example, Skript, FastAsyncWorldEdit, or Multiverse is uploaded. In the background, the plugin is injected so that when the harmless plugin's `onEnable()` is called, a connection to the control server/FTP is made (similar to Fractureiser) with the obfuscated and changing [URIs](https://en.wikipedia.org/wiki/Uniform_Resource_Identifier).

In short: When you start the server with the infected plugin, the door is open for the perpetrators and the Ethanol developers, just like with Fractureiser.

### What Can the Perpetrators Do with My Server?

- Spread infection to individual or even all plugins
- If permissions are given, delete all your files on the server
- *Monitor your server live (player count, who is online, etc., logs)*
- Join as you or others
- Completely grief your server and gain operator/permissions with Luckperms
- Spawn a [reverse shell](https://en.wikipedia.org/wiki/Reverse_Connection) and thus bypass some firewalls (SELinux can block outgoing connections to prevent this)
- Make themselves invisible in the console, as well as use vanish
- Edit the whitelist and individual server files
- Upload other plugins, malware to the server
- Perform lots of trolling (there are about 100 commands)
- *Probably even worse*

\* Not sure due to insufficient information

At this point, there is not much detailed information since the code is encrypted at the bytecode level, and the obfuscator was self-written by the developer “SirLennox,” according to his statement. However, the solution also lies in the code, so it is only a **matter of time** until it can be read.

### What Can I Do to Avoid Getting Infected with Ethanol Malware?

- Do not give new developers, especially those pushing for server access, any access.
  - In general, avoid [social engineering](https://www.bsi.bund.de/EN/Themen/Verbraucherinnen-und-Verbraucher/Cyber-Sicherheitslage/Methoden-der-Cyber-Kriminalitaet/Social-Engineering/social-engineering_node.html)
- Do not accept jars in private or other chats; follow the zero-trust principle. See here
  - [BSI](https://www.bsi.bund.de/EN/Themen/Unternehmen-und-Organisationen/Informationen-und-Empfehlungen/Zero-Trust/zero-trust_node.html)
  - [Wikipedia](https://en.wikipedia.org/wiki/Zero_Trust_Security)
  - [CloudFlare](https://www.cloudflare.com/learning/security/glossary/what-is-zero-trust/)
- Download plugins, if possible, only from platforms like Hangar and Modrinth
  - Only those plugins that are open source and have a GitHub link
  - Do not download premium plugins that suddenly become free, especially not from sites like Blackspigot. Currently, plugins like Vulcan are deliberately or very likely uploaded there to infect new servers.
- Use SSH with a public key for your root/vServer/Linux server
  - Limit the users
- Every plugin should be built in a pipeline (explanation and example with [Atlassian](https://www.atlassian.com/devops/devops-tools/devops-pipeline)) and undergo a [security audit](https://en.wikipedia.org/wiki/Information_technology_security_audit). This is already done at [IntellectualSites](https://github.com/IntellectualSites) (athion) with [Jenkins](https://www.jenkins.io/doc/book/pipeline/getting-started/) and active maintenance of the plugin.
- Keep current backups and test the backups regularly!
  - Follow the [3-2-1 rule](https://www.ionos.com/digitalguide/server/security/what-is-a-backup/#c274485) in backup management
- Keep your software and operating system up-to-date and take care of the **security of your infrastructure**, including databases, file permissions, user permissions, and firewall (settings). Ideally, only the Minecraft port 25565 (tcp, java), VPN/SSH port, and optionally Bedrock 19172 (udp) should be accessible from the outside.
  - Set up your Linux users correctly so that they do **not** have root access, i.e., they cannot do everything. If you do not have a non-root user yet, create one (example with [Ubuntu](https://ubuntu.com/server/docs/user-management)).
  - It is also possible with **[SELinux](https://wiki.debian.org/SELinux/Setup)** to prevent programs from making unauthorized ports accessible to the outside.
  - Encrypt connections from databases and to your plugins.
  - Only allow internal installations, like databases, to run over internal IPs like 127.0.0.1.
  - You can **only** improve your security with the consent of your hoster and Shodan.io or/and nmap.
  - Control access to your platform with software like KeyCloak or EntraID
  - Each software gets its own dedicated user
  - Use a password manager and [2FA for consoles](https://linuxiac.com/how-to-set-up-ssh-to-use-two-factor-authentication) and websites
  - Use sudo for root commands only. Sudo appears in the logs and can notify you if someone gains unauthorized access. See [here](https://serverauth.com/posts/setting-up-sudo-user-notifications-on-linux)
  - Set up your firewall correctly; you can block and contain outgoing connections (server to internet) in addition to incoming connections (internet to server).
  - Have monitoring like [CheckMK](https://checkmk.com), [Zabbix](https://www.zabbix.com/), or something else. It helps you keep your server under control.

Excuses like [1.8 is still current](https://howoldisminecraft188.today/), see German community, do not apply here. An 8-year-old software is not current. No security auditing is done, 1.8 is not actively maintained, and Microsoft/Mojang does not offer active support anymore!

### What Can I Do If I Am Already Infected?

1. Make a backup
2. Check and restore the backup
3. Reinstall the server
4. Find the source of the infection based on point 1 backup
5. Report the person. See [Hacker Paragraph](https://www.gesetze-im-internet.de/englisch_stgb/englisch_stgb.html#p1962)

### Don't Know Where to Start?

Join [our Discord](https://discord.gg/aCHjPGJwBe) and open a ticket. We are happy to create a tutorial series based on feedback that covers many of the topics above.

## Join Our Journey

At OneLiteFeather, we value a relaxed working atmosphere and embrace the flair of creative freedom coupled with structured organization. We work according to the **Kanban principle**, which allows us to work in a stress-free environment without rigid deadlines. Our focus is on **active communication** and collective progress. If you have experience in **moderation**, **community management**, **development**, or **concept creation** and want to engage in a community that values personal growth and teamwork, then you are in the right place. References are welcome and help us better understand your skills and experiences.

We look forward to hearing from you and realizing exciting projects together. You can reach me, **themeinerlp**, directly on Discord, or you can contact us through our Discord server at [1lf.link/discord](https://1lf.link/Cg6yO). There, you can open a ticket to apply. Alternatively, you can contact **OneLiteFeather** directly via Discord. Let's talk about your ideas and how you can contribute to the OneLiteFeather community. Together we can explore the digital world, expand our knowledge, and build a positive and supportive community.

If you have any questions, feel free to ask us. We are here to answer all your questions and look forward to learning more about you and your interests!
