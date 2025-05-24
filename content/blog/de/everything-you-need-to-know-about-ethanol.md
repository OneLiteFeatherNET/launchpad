---
title: 'Alles, was du über Ethanol wissen solltest'
description: 'Relativ unbekannt und trotzdem schon jetzt auf mehreren hundert Servern. Genauso wie Fractureiser wird diese von dem User mori0 / Riesenrad beworben, um Server zu “trollen”. Was sich dahinter verbirgt.'
pubDate: 'Jul 23 2024'
heroImage: '/blog/cyber-theDigitalArtist-Ethanol-Post.webp'
slug: 'alles-was-man-ueber-ethanol-wissen-sollte'
---
Relativ unbekannt und trotzdem schon jetzt auf mehreren hundert Servern. Genauso wie Fractureiser wird diese von dem User mori0 / Riesenrad beworben, um Server zu “trollen”. Was sich dahinter verbirgt.

Gestartet hat Ethanol ganz anders als Fractureiser als unscheinbares “Troll Plugin” für Minecraft Server, genauer gesagt für die Paper und Spigot Server. Gemeinsamkeiten zu Fractureiser sind die Elemente, die man als bösartig oder untypisch für eine “harmlose Trolling Aktion” erkennen kann. Somit ist es eine Form der Malware, es handelt sich um eine **Backdoor**.

### Wie kommt Ethanol auf deinen Server

Ethanol an sich ist kein Plugin, was du in deinem Plugin Ordner finden kannst. Täter, die auf dem Ethanol Discord sind, infizieren durch deren Bot ein Plugin ihrer Wahl. Dafür wird z.B. Skript, FastAsyncWorldEdit oder Multiverse hochgeladen. Im Hintergrund wird das Plugin injected, sodass beim `onEnable()` des harmlosen Plugins eine Verbindung mit dem Kontrollserver/FTP (wie bei Fractureiser) mit den unkenntlich gemachten und sich ändernden [URI’s](https://de.wikipedia.org/wiki/Uniform_Resource_Identifier) wird.

Kurz gesagt: Wenn du den Server mit dem infizierten Plugin startest, steht die Tür für die Täter und die Ethanol Entwickler offen, genauso wie bei Fractureiser.

### Was können die Täter mit meinem Server machen?


- Infizierung auf einzelne oder sogar alle Plugins ausbreiten  
- Wenn Rechte gegeben, alle deine Dateien auf dem Server löschen  
- *Deinen Server live überwachen (Spieleranzahl, wer ist online, usw, Logs)*\*  
- Als du oder andere joinen   
- Deinen Server komplett griefen (zerstören) und Operator / Rechte bei Luckperms erlangen  
- Eine [Reverse-Shell](https://de.wikipedia.org/wiki/Reverse_Connection) spawnen und somit manche Firewalls umgehen (SELinux kann ausgehende Verbindungen blockieren, um dies zu verhindern)  
- Sich in der Konsole unsichtbar machen, als auch Vanish verwenden  
- Die Whitelist bearbeiten und einzelne Server files  
- Andere Plugins, Malware auf den Server laden  
- Jede Menge Trolling (es sind etwa 100 Befehle)  
- *Wahrscheinlich noch Schlimmeres*  


\\\*  Nicht sicher zu wenig Informationen vorhanden

Ganz genaue Informationen gibt es zu diesem Zeitpunkt nicht, da der Code auf Bytecode Ebene verschlüsselt ist und der Obfuscator von den Entwickler “SirLennox” selbst geschrieben wurde, laut seiner Aussage. Allerdings steht die Lösung auch im Code, also es ist nur eine **Frage der Zeit**, bis man ihn lesen kann. 

### Was kann ich gegen die Ethanol-Malware machen, um nicht infiziert zu werden?

- Gebe neuen Entwicklern, besonders denen, die auf Server Zugriff drängen, keinen Zugang.
  - Lass dich im Allgemeinen nicht [Social Engineeren](https://www.bsi.bund.de/DE/Themen/Verbraucherinnen-und-Verbraucher/Cyber-Sicherheitslage/Methoden-der-Cyber-Kriminalitaet/Social-Engineering/social-engineering_node.html) 
- Nehme keine jars auf privaten oder anderen Chats an, gehe nach dem Zero-Trust Prinzip vor. Siehe hier
  - [BSI](https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Informationen-und-Empfehlungen/Zero-Trust/zero-trust_node.html)
  - [Wikipedia](https://de.wikipedia.org/wiki/Zero_Trust_Security)
  - [CloudFlare](https://www.cloudflare.com/de-de/learning/security/glossary/what-is-zero-trust/)
- Downloade Plugins, wenn möglich nur auf Plattformen wie Hangar und Modrinth
  - Davon auch nur die Plugins, die Open Source sind, also einen Github Link haben
  - Lade dir auf keinen Fall Premium Plugins herunter, die plötzlich kostenlos sind, besonders nicht auf Seiten wie Blackspigot. Aktuell werden dort absichtlich oder sehr wahrscheinlich Plugins wie Vulcan hochgeladen, um neue Server zu infizieren.
- Verwende für euren Root/vServer/Linux Server nur SSH mit Public Key
  - Grenze die Nutzer ein
- Jedes Plugin sollte in einer Pipeline (Erklärung, Beispiel mit [Atlassian](https://www.atlassian.com/de/devops/devops-tools/devops-pipeline)) gebaut werden und einen [Security Audit](https://de.wikipedia.org/wiki/IT-Sicherheitsaudit) (Sicherheitscheck) bestehen. Dies wird z. B. schon bei [IntellectualSites](https://github.com/IntellectualSites) (athion) mit [Jenkins](https://www.jenkins.io/doc/book/pipeline/getting-started/) durchgeführt und aktiver Wartung von Plugin.
- Habe aktuelle Backups und teste die Backups in regelmäßigen Abständen!
  - Achtet auf die [3-2-1 Regel](https://www.ionos.de/digitalguide/server/sicherheit/3-2-1-backup-regel/) im Backup Mangement
- Halte deine Software und Betriebssystem aktuell (Up-to-Date) und kümmere dich um die **Sicherheit deiner Infrastruktur**, also Datenbanken, Dateirechte, Benutzerrechte und Firewall (Einstellungen). Im besten Fall ist **nur** der Minecraft Port 25565 (tcp, java), VPN/SSH Port und optional für Bedrock 19172 (udp) von außen zu erreichen.
  - Stelle deine/n Linux User richtig ein, sodass diese **kein Root** haben, also nicht alles tun können. Wenn du noch keinen non-root User hast, erstelle dir einen (hier Beispiel mit [Ubuntu](https://ubuntu.com/server/docs/user-management)).
  - Dazu ist es möglich mit **[SELinux](https://wiki.debian.org/SELinux/Setup)** Programme zu unterbinden, unbewilligte Ports nach außen erreichbar zu machen.
  - Verschlüssel Verbindungen von Datenbanken und zu deinen Plugins.
  - Lasse interne Installationen, wie Datenbank(en) nur über interne IPs wie 127.0.0.1 laufen.
  - Du kannst **nur** mit Absprache deines Hosters und Shodan.io oder/und nmap deine Sicherheit verbessern.
  - Kontrolliere Zugriffe auf deine Plattform mit Software wie KeyCloak oder EntraID
  - Jede Software bekommt ihren eigen dedizierten Nutzer
  - Nutze ein Password Manager und [2FA für die Konsolen](https://www.thomas-krenn.com/de/wiki/SSH-Login_mit_2-Faktor-Authentifizierung_absichern) und Webseiten
  - Verwendet für Root Commands nur sudo. Sudo taucht in den Logs auf und kann benachrichtigen wenn jemand sich unberechtigter Zugriff erlangt. Siehe [hier](https://serverauth.com/posts/setting-up-sudo-user-notifications-on-linux)
  - Stellt eure Firewall richtig ein, ihr könnt neben Eingehenen Verbindungen (Internet zu Server) auch ausgehende Verbindungen (Server zu Internet) blockieren und eindämmen. 
  - Habt ein Monitoring wie [CheckMK](https://checkmk.com/de), [Zabbix](https://www.zabbix.com/) oder was anderes. Es hilft euch, euren Server im Griff zu halten.

Ausreden wie [1.8 ist noch aktuell](https://howoldisminecraft188.today/), siehe Deutsche Community, gilt hier nicht. Eine 8 Jahre alte Software ist nicht aktuell. Es wird keine Security auditing gemacht, die 1.8 wird nicht aktiv gewartet und Microsoft/Mojang bietet keinen aktiven Support mehr! 

### Was kann ich machen, wenn ich schon infiziert bin?

1. Backup machen
2. Backup überprüfen und wiederherstellen.
3. Server neu installieren
4. Quelle des Ursprunges finden anhand von Punkt 1 Backup
5. Person zur Anzeige bringen. Siehe [Hacker Paragraf](https://www.beckmannundnorda.de/serendipity/index.php?/archives/143-Gesetzestext-202c-StGB-Hackerparagraph.html)


### Du weißt nicht, wo man anfangen sollte?

Joint auf [unseren Discord](https://discord.gg/aCHjPGJwBe) und öffnet ein Ticket. Gerne gestalten wir anhand des Feedbacks eine Tutorialreihe, die viele Sachen von oben abdeckt.


## Werde Teil unserer Reise

Bei OneLiteFeather schätzen wir eine entspannte Arbeitsatmosphäre und leben den Flair von kreativer Freiheit gepaart mit strukturierter Organisation. Wir arbeiten nach dem **Kanban-Prinzip**, das uns ermöglicht, in einem stressfreien Umfeld ohne starre Deadlines zu arbeiten. Dabei liegt unser Fokus auf **aktiver Kommunikation** und dem gemeinsamen Fortschritt. Wenn du in den Bereichen **Moderation**, **Community Management**, **Entwicklung** oder **Konzepterstellung** Erfahrung hast und dich in einer Gemeinschaft engagieren möchtest, die Wert auf persönliches Wachstum und Teamarbeit legt, dann bist du bei uns genau richtig. Referenzen sind willkommen und helfen uns, ein besseres Verständnis für deine Fähigkeiten und Erfahrungen zu bekommen.

Wir sind gespannt darauf, von dir zu hören und gemeinsam spannende Projekte zu verwirklichen. Du kannst mich, **themeinerlp**, direkt auf Discord erreichen, oder du kannst über unseren Discord-Server in Kontakt treten, den du unter [1lf.link/discord](https://1lf.link/Cg6yO) findest. Dort kannst du ein Ticket eröffnen, um dich zu bewerben. Alternativ kannst du auch **OneLiteFeather** direkt via Discord kontaktieren. Lass uns über deine Ideen plaudern und wie du zur OneLiteFeather-Community beitragen kannst. Zusammen können wir die digitale Welt erkunden, unser Wissen erweitern und eine positive und unterstützende Gemeinschaft aufbauen.

Falls Unklarheiten aufkommen sollten, sei frei uns zu fragen. Wir sind hier, um alle deine Fragen zu beantworten und freuen uns darauf, mehr über dich und deine Interessen zu erfahren!