---
title: 'Trojanised Minecraft plugin: how a hidden loader sits inside a bStats class'
alternativeTitle: 'What the trojanised JAR does, how you check your server and how you protect yourself'
description: 'A trojanised plugin JAR quietly loads a second plugin on every server start. Here is how to check whether your server is affected, and how to protect it.'
pubDate: '2026-11-25'
releaseDate: '2026-11-25T12:00:00+01:00'
slug: 'trojanised-minecraft-plugin-hidden-loader'
translationKey: 'trojanised-minecraft-plugin-hidden-loader'
tags:
  - minecraft
  - security
  - malware
  - plugins
author: themeinerlp
canonical: 'https://onelitefeather.net/en/blog/trojanised-minecraft-plugin-hidden-loader'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/manipuliertes-minecraft-plugin-versteckter-nachlader'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/trojanised-minecraft-plugin-hidden-loader'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/trojanised-minecraft-plugin-hidden-loader'
schemaOrg:
  - type: 'BlogPosting'
    headline: 'Trojanised Minecraft plugin: how a hidden loader sits inside a bStats class'
    alternativeHeadline: 'What the trojanised JAR does, how you check your server and how you protect yourself'
    description: 'A redistributed plugin JAR contains a tampered bStats class that quietly loads a second plugin on every server start. Indicators, check commands and protective measures for server admins and plugin developers.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2026-11-25T12:00:00+01:00'
---
A plugin JAR was reported to us by the community for review. It contains malicious code. This post is aimed at everyone who runs a Minecraft server or develops plugins: it explains what the file does, how you can check whether you are affected, and how you can protect yourself.

> **Important up front:** exactly **one** redistributed file was examined (SHA-256 see below). It is a genuine, working plugin into which malicious code was added afterwards. We deliberately do not name the plugin: it is itself a victim, and the same tampering could be present in any other plugin. Our concern is the malware behind it and countermeasures. The analysis was purely static: neither the file nor the second plugin it loads was ever started or loaded by a Java runtime.

## What happened

The JAR looks like the plugin and behaves like it too. Only a single class was changed, and not in the plugin itself but in a bundled library: **bStats**.

[bStats](https://bstats.org/) is a widely used open-source library that lets plugins report anonymous usage statistics. Many plugins ship it inside their own JAR. This is called "shading": the library is copied into the plugin file and given its own package name. That is exactly why it makes a good hiding place. Anyone who looks inside a plugin reads the plugin's own code, not the statistics library, which looks the same in hundreds of other plugins. bStats itself is not the problem; only the copy in this one JAR was tampered with.

This copy contains an additional method called `preparePluginBridge()`. The class constructor calls it, so **on every server start**, as soon as the plugin sets up its statistics. It is a **loader** (or dropper): the actual malicious code is not in the JAR, but is fetched at runtime from a server controlled by the attacker. We therefore call the JAR stage 1 and the loaded plugin stage 2.

For you, this means: what actually happened on an affected server is determined solely by the attacker's server. It can deliver something different today than yesterday, and something different to each server. What it delivered on 25 November 2026 is described in the "Stage 2" section: a complete remote control for the server.

## How the trick works

```text
Server start
   │
   ▼
Plugin sets up bStats ──► hidden method runs along
   │
   ▼
Mute the plugin's console output
   │
   ▼
Stage 2 already loaded? ── yes ──► do nothing
   │ no
   ▼
Fetch the encrypted plugin from the attacker's server
   │                         (if that fails: read it from the hiding place in ./logs)
   ▼
Store a copy in ./logs, disguised as a rotated log file
   │
   ▼
Decrypt ──► store as a temp file ──► load via the PluginManager
   │
   ▼
Delete the temp file, re-enable console output
```

### 1. The method hides from decompilers

A decompiler turns a compiled `.class` file back into readable Java code. Most of them hide methods that the Java compiler generates automatically. Such methods carry the flags `synthetic` and `bridge`. The malicious method carries exactly these two flags, plus a forged generic signature. Anyone who opens the class in a decompiler therefore sees an ordinary bStats class.

The size gives it away: the class is **76 KB**, while the original is about **10 KB**.

One inconspicuous line remains in the constructor:

```java
this.metricsBase = new MetricsBase("bukkit", serverUUID, serviceId, /* ... */);
this.pluginBridge = this.preparePluginBridge();   // not part of bStats
```

### 2. The code is obfuscated

Even if you find the method, nothing you read at first makes sense:

- Every number is written as a chain of arithmetic (4,868 expressions that can be evaluated to simple numbers).
- Every string is stored as a byte sequence and encrypted with XOR. XOR is a very simple form of encryption here, using a single byte as the key. A text search for the domain in the JAR therefore finds nothing.
- All calls go through reflection. This is the Java technique of addressing classes and methods at runtime by their name as text. As a result, no suspicious method call appears directly in the code.

### 3. Protection and console are switched off

First, the method tries to remove Java's SecurityManager by setting the internal field `System.security` to `null`. It then turns off console output from the plugin logger (`setUseParentHandlers(false)`). The reason: when loading a plugin, Bukkit writes a line to the console, and that line would give away the foreign plugin. After loading, the method restores the old value.

A check for an expiry date is also built in. Its value is empty, so the sample is active with no time limit.

### 4. Download only if stage 2 is still missing

The method checks whether the class `net.s0lar.SolarLoader` is already present. Only if it is missing does it load the payload: an HTTP request to `hxxps://s0lar[.]net/routes/0/d.php` with a hard-coded value in the header `a`. The response is Base64 text.

### 5. The hiding place: a log file with an invisible character

The response is saved in the `./logs` folder. There, the method looks for the newest `*.log.gz`, increments its running number by one, and saves the file as `<date>-<n+1>.log.gz`, **with a zero-width space appended**. This is the Unicode character U+200B, a space with no width. In a file manager or a plain `ls`, the file looks like an ordinary rotated log.

This hiding place lets the malicious code survive without a network connection: if the download fails on a later start, stage 2 is loaded from this file. The method removes older hiding places itself. It recognises them by a trailing U+200B or U+0001 character.

### 6. Decrypt, load, remove traces

The Base64 text is decoded and decrypted with AES-256. The key is hard-coded in the JAR. The result is a second plugin JAR. It briefly lands in the temp directory under a name that begins with a 13-digit timestamp, is loaded through Bukkit's ordinary PluginManager, and is deleted immediately afterwards.

Deobfuscated, the loading looks like this (shortened, variables renamed for readability, `STR(...)` stands for a decrypted string):

```java
plugin = pluginManager.getClass().getMethod(STR("loadPlugin"), file.getClass())
        .invoke(pluginManager, file);
plugin.getClass().getMethod(STR("onLoad")).invoke(plugin);

Class<?> entry = plugin.getClass().getClassLoader().loadClass(STR("p.AsyncTimings"));
entry.getDeclaredMethod(STR("o"), String.class, String.class, String.class)
        .invoke(null, token, pluginName, domain);   // value, name of the host plugin, attacker's domain

pluginManager.getClass().getMethod(STR("enablePlugin"), pluginClass)
        .invoke(pluginManager, plugin);
```

The entire sequence is wrapped in `catch (Throwable)` blocks with no output. If something goes wrong, you will not hear about it.

## Stage 2: a remote control called "Solar"

For the analysis, the loaded plugin was fetched **once** on 25 November 2026, in the same way the loader does it, decrypted offline and deobfuscated statically. This file, too, was never started. Please do not repeat this: the attacker's server sees your IP address on every request.

The result is a snapshot. The attacker can deliver something different at any time.

### What stage 2 is

Stage 2 is a complete remote control for Minecraft servers that calls itself "Solar". It disguises itself as a plugin called **"DataFixerUpper"** in the package `com.mojang.datafixers.util.impl`. That is also the name of a genuine Mojang library, so the name does not stand out in a list of classes.

It is controlled in two ways. Player accounts that the attacker has enabled send commands in chat. The message is intercepted and does not appear in the chat. In addition, the attacker's server distributes batches of commands that do not require anyone to be online.

### The most serious functions

Stage 2 comes with 51 commands. The four points below were traced in the deobfuscated code:

- **Run operating system commands.** The attacker can start arbitrary commands on the host and receive their output. The damage therefore does not stop at Minecraft: anything the user running the server process is allowed to do, the attacker can do too.
- **Load further code.** Stage 2 can load and run plugins and individual Java classes from a URL, update itself, and change the address of its control server.
- **Infect other JARs.** On the attacker's command, stage 2 embeds the stage 1 loader into other plugin JARs and into the server JAR; in doing so it searches the `./plugins` folder. Whether it also does this on its own initiative is not shown. It removes signature files that would reveal the change. This is worm behaviour: a single infected plugin can thus contaminate the entire plugin folder.
- **Attacks on third parties.** The server can be used as a tool for DoS attacks, that is, to flood foreign targets with data packets or connections. The consequences land on you and your host.

In addition, there are file access (download, replace, delete), console commands with server privileges, granting operator rights, switching online mode and the whitelist, redirecting players to foreign servers, and a filter that suppresses console output. On command, stage 2 also uploads the file `logs/latest.log` to the attacker's server.

**What happens without any command:** as soon as it is enabled, stage 2 removes itself from the server's plugin management. It removes itself from the internal plugin list and from Bukkit's name registry, so `/plugins` no longer shows it. It then registers the server with the attacker and sends a profile containing: MOTD, world seed, world names, operating system, computer name, server icon, maximum player count, and the server identifiers from the bStats and LiteBans configurations. After that, it polls for new instructions every two minutes.

**Code present, execution path not shown:** stage 2 contains code that reads the DiscordSRV bot token, the Velocity forwarding secret (from `config/paper-global.yml`) and, on Windows hosts, Discord account tokens from Discord and browser profiles. Classes and strings are unambiguous. What is not shown is when this code runs and where the data goes: no caller is visible in the deobfuscated code, and the profile sent at sign-up does not contain this data. Nevertheless, assume the worse case and change both secrets.

The full list of commands, ordered by severity, will follow in a separate post.

### A third module that only selected servers receive

Stage 2 is itself a loader again: it can fetch a further module called **"Door"**. However, the attacker's server does not deliver it to every infected server. It enables servers one at a time, and only an enabled server receives "Door". A test entry created for the analysis was not enabled. At this point we stopped and did not bypass the enablement. We therefore do not know what "Door" does.

We were able to trace the protocol between stage 2 and the attacker's server. Two points matter to you:

- **The traffic is disguised as an error page.** Every server response looks like an ordinary "404 Not Found" page. The actual data is hidden, encrypted, in an HTML comment that begins with `<!-- B: `. This pattern is not tied to the domain, so it is suitable as a search pattern for proxy and firewall logs.
- **Infected JARs are sent to the attacker.** When stage 2 embeds the loader into a plugin JAR, it also uploads that JAR to the attacker's server. Any private, unpublished plugins that were in the plugin folder of an infected server must therefore be considered leaked.

The server response also contains a list of player names that are allowed to operate the remote control in chat. The names appear there only as hashes. The accounts that could be worked out from these we are reporting to Mojang, and we are not publishing them: a name on the list does not prove who uses the account today.

### Where the tampered JAR probably came from

The hidden method from stage 1 carries a forged generic signature. This exact signature is one of five that the stage 2 injector uses for built-in methods. This suggests that the JAR examined was itself infected by this malware, for example on a server that was already compromised, and was not modified by hand.

For you, this is the most important finding: the file in question is probably not the only one of its kind. Any plugin that once sat on an infected server and was passed on from there may carry the loader.

## Am I affected?

The commands below are for Linux and assume you are in the server folder, that is, where `plugins/` and `logs/` are located. None of them starts or loads a JAR.

**A clean result is not an all-clear.** The checks detect exactly this sample. A differently repacked file has a different hash and may use different names.

### 1. Compare the hashes of the plugin files

A hash is a fingerprint of a file. Same hash means: the same file, no matter what it is called.

```bash
sha256sum plugins/*.jar | grep -i 5d147a987780de9e5f39167f71638397075ceb0c6dd69471bb6400dbcdb0d857
```

On Windows (PowerShell):

```powershell
Get-ChildItem plugins\*.jar | Get-FileHash -Algorithm SHA256 |
  Where-Object Hash -eq '5d147a987780de9e5f39167f71638397075ceb0c6dd69471bb6400dbcdb0d857'
```

If there is any output, the exact file examined is on your server.

### 2. Search all JARs for traces of the injector

The name of the stage 1 method and the injector's five forged signatures appear unencrypted in the classes. This loop looks into every JAR without executing it. Use it to check your server JAR as well, not just the plugin folder:

```bash
for jar in plugins/*.jar *.jar; do
  if unzip -p "$jar" '*.class' 2>/dev/null | grep -a -q -F \
      -e 'preparePluginBridge' \
      -e '<Hp6:Ljava/lang/Iterable;>' -e '<Kx3:Ljava/io/Serializable;>' \
      -e '<Bm9:Ljava/lang/Comparable;>' -e '<Rq7:Ljava/lang/Runnable;>' \
      -e '<Nv2:Ljava/io/Closeable;>'; then
    echo "VERDACHT: $jar"
  fi
done
```

It is also worth checking the size of every embedded bStats class. The reference values from the analysis: original about 10 KB, tampered 76 KB.

```bash
for jar in plugins/*.jar; do
  unzip -lv "$jar" 2>/dev/null |
    awk -v j="$jar" '/bstats.*\/Metrics\.class$/ && $1 > 30000 {print j": "$NF" ("$1" Bytes)"}'
done
```

### 3. Check the log folder for disguised files

Look for file names that contain characters other than printable ASCII. The `LC_ALL=C` in front is important: without it, `find` reports every file on most systems.

```bash
LC_ALL=C find logs -name '*[! -~]*'
LC_ALL=C ls -b logs
```

`ls -b` shows the invisible character as `\342\200\213` at the end of the name.

A second check based on the content: the hiding place contains Base64 text and is therefore not a valid gzip archive.

```bash
for f in logs/*.log.gz*; do
  gzip -t "$f" 2>/dev/null || echo "kein gzip: $f"
done
```

On Windows (PowerShell):

```powershell
Get-ChildItem logs | Where-Object { $_.Name -match '[^\x20-\x7E]' }
```

If you find such a file: **do not delete it, back it up.** It contains the encrypted stage 2 and is the best clue to what ran on your server.

### 4. Temp directory and network

The decrypted JAR sits in the temp directory only briefly. If the server is forcibly terminated, it can be left behind:

```bash
find "${TMPDIR:-/tmp}" -maxdepth 1 -regextype posix-extended -regex '.*/[0-9]{13}[^/]*\.jar'
```

If you have DNS or firewall logs, search them for requests to `s0lar[.]net` and connections to `198.167.197[.]139`. If a proxy intercepts the traffic, also search for paths containing `/routes/0/` and for 404 responses that contain `<!-- B: `.

### 5. Traces of stage 2

If a plugin called `DataFixerUpper` appears in `/plugins`, that is a clear match. But do not rely on it appearing there: stage 2 removes itself from the plugin list when it is enabled and suppresses console output. A clean list and a quiet console prove nothing.

Stage 2 also creates files with inconspicuous names. The analysis does not show exactly where, so search the entire server folder:

```bash
find . \( -name particles_store.dat -o -name entity_registry.dat -o -name session_cache.dat \
  -o -name skin_cache.dat -o -name profile_cache.dat -o -name checksums.md5 \)
```

A match is a hint, not proof; a harmless plugin can use names like these too.

### You only have a hosting panel

Without a shell, you can download the plugin files and the server JAR and run steps 1 and 2 on your own computer. You will not see the invisible character in the panel's file manager. In the `logs` folder, look for a `.log.gz` that cannot be extracted or whose number does not fit with the others, and if in doubt ask your host's support to run step 3 for you.

## What to do if you are affected

If your server loaded the file, it counts as **compromised**, and that means the entire host, not just Minecraft. Stage 2 can run operating system commands, and nobody apart from the attacker knows which ones have run.

1. **Stop the server and take it off the network.** Deleting the plugin is not enough.
2. **Secure the traces** before you clean up: the suspicious JAR and the disguised file from `logs/`. It is best to rename the JAR (for example to `.jar.quarantine`) so that no server loads it by accident.
3. **Treat all JARs in the plugin folder and the server JAR as infected**, not just the plugin that triggered it. Stage 2 embeds the loader into other JARs. Obtain everything anew from the original source and compare the hashes. Do not copy any JAR from this server to another one, and do not pass any on.
4. **Change every secret the server process could read.** Start with the two that stage 2 carries its own code for: the **DiscordSRV bot token** and the **Velocity forwarding secret**. Then database credentials, the RCON password, Discord webhooks, panel access and SSH keys. If the server ran on a Windows machine where someone is signed in to Discord: sign out all Discord sessions of that user and change their passwords.
5. **Check the host itself:** cron jobs and autostart entries, new users, foreign SSH keys.
6. **Compare the server settings against the intended state:** `online-mode`, whitelist, ban list, OP list, permissions and `enable-command-block`. Stage 2 can switch all of these.
7. **Cleanest of all: rebuild the host** and restore world and configuration data from a backup.

If you are a customer of a hosting provider, report the incident there. They can check whether more than your own server is affected.

## How to prevent it

### For server admins

- **Only obtain plugins from the original source** and compare the hash with the release. No "free" passed-around premium plugins: that is exactly how a file like this ends up on a server.
- **Restrict outbound network traffic.** A Minecraft server only needs to reach a few destinations: Mojang's session servers, your database, and services you deliberately allow. This stops the loading, the data exfiltration and the misuse for DoS attacks. Additionally block `s0lar[.]net` via DNS or firewall, but do not rely on that alone: stage 2 can change its domain at runtime.
- **Give the server as few rights as possible.** A dedicated user without special privileges, ideally in a container, with the file system kept read-only as far as possible, and no access to other services' keys.
- **Monitor for what would have stood out here:** new files in `logs/` with non-ASCII names, `.jar` files in the temp directory, and loaded plugins that do not sit in the plugin folder.

### For plugin developers and anyone who reviews plugins

- **Compare embedded libraries with the original.** A bStats class that is seven times the size of the original does not need any further analysis.
- **`javap`, not just decompilers.** `javap` is part of the JDK and shows every method, including those that decompilers leave out:

  ```bash
  javap -p -v -cp Plugin.jar <paket.des.plugins>.bstats.bukkit.Metrics |
    grep -E 'ACC_SYNTHETIC|ACC_BRIDGE'
  ```

  Suspicious are methods with `ACC_SYNTHETIC` and `ACC_BRIDGE` that contain a lot of code. Genuine bridge methods consist of a few statements. The injector's five forged signatures are listed in the indicators table.
- **Watch for missing signature files.** If a JAR that is meant to be signed lacks the `.SF`, `.RSA` or `.DSA` files under `META-INF`, someone has altered it. The injector removes them.
- **Watch for patterns:** long hex constants, reflection on `loadPlugin`, byte arrays followed by an XOR loop.
- **Publish your own releases with a hash,** so that your users have something to compare against at all.

## Indicators of compromise (IOCs)

Indicators of compromise are features that reveal an infection. The domain and URL are deliberately defanged (`hxxps`, `[.]`) so that nobody clicks them by accident.

### Stage 1

| Type | Value |
|---|---|
| SHA-256 of the JAR | `5d147a987780de9e5f39167f71638397075ceb0c6dd69471bb6400dbcdb0d857` |
| JAR file size | 5 109 544 Bytes, all entries dated 2026-06-28 23:04 |
| Domain | `s0lar[.]net` |
| URL | `hxxps://s0lar[.]net/routes/0/d.php` |
| Classes of stage 2 | `net.s0lar.SolarLoader`, `p.AsyncTimings` (method `o(String,String,String)`) |
| File | `logs/*.log.gz` with appended U+200B (older variant: U+0001), content Base64 |
| File | `<java.io.tmpdir>/<13-digit number>*.jar` |
| Code feature | Field `pluginBridge` and method `preparePluginBridge` in the bStats class `Metrics` |

Encryption is AES-256 in CBC mode. We do not publish the key material or the value from the header. Hosts, platforms and security teams can receive both on request, in order to decrypt hiding-place files that they find.

### Stage 2

| Type | Value |
|---|---|
| SHA-256 of the decrypted JAR | `11429437397e84d9278757f8bc4832a4f59a1553bc4414310638a8caa6d83c4e` (as of 2026-11-25, build of 2026-11-22) |
| Server | `s0lar[.]net` → `198.167.197[.]139` (nginx/1.24.0, Ubuntu) |
| Paths on the server | `routes/0/a.php` to `routes/0/v.php`, `download.php?uuid=` |
| Network pattern | Responses with status 404 that contain an HTML comment `<!-- B: ` with Base64 content |
| Request headers | single-letter headers `a`, `b`, `d` with Base64 values, `User-Agent: Java/…` |
| Plugin name | `DataFixerUpper` 1.0-SNAPSHOT, main class `com.mojang.datafixers.util.impl.ChunkCarvingFixer` |
| Packages | `net.s0lar`, `p` (`p.AsyncTimings`), `ab.sixseven.onetwo` (obfuscated ASM), plus JNA and JvmDowngrader |
| Plugin channel | `serve:run` (registered for both inbound and outbound on activation) |
| Decoy files | `particles_store.dat`, `session_cache.dat`, `entity_registry.dat`, `skin_cache.dat`, `profile_cache.dat`, `checksums.md5` |
| Built-in UUIDs | `e19212b9-53d8-44cd-8eac-41c85f8b0e28`, `d7b77c65-23fe-4159-b73c-50fc3d2c293d` |
| Forged signatures of built-in methods | `<Hp6:Ljava/lang/Iterable;>(THp6;J)V`, `<Kx3:Ljava/io/Serializable;>()TKx3;`, `<Bm9:Ljava/lang/Comparable;>(TBm9;)V`, `<Rq7:Ljava/lang/Runnable;>(TRq7;I)TRq7;`, `<Nv2:Ljava/io/Closeable;>()TNv2;` |
| Injector method names | `getDataRevision`, `getSemanticsId`, `getTelemetryId`, `patchRuntimeLibs`, `patchLibs`, `patchLibraries` |

The stage 2 hash applies only to the state as of 25 November 2026. If the attacker ships a new build, it will change.

## What we do not know

- **What the third module "Door" does.** The attacker's server delivers it only to servers it has enabled individually.
- **Whether your server received the same stage 2.** The analysis is a snapshot of a single fetch.
- **When the token-theft code runs and where the data goes.** The code is present, but no caller is visible in the deobfuscated code.
- **Whether stage 2 infects other JARs without a command.** The command for it is evidenced. An automatic trigger could neither be found nor ruled out. Overall, 94 % of the hidden calls and 87 % of the encrypted strings of stage 2 could be resolved; some individual methods could not be decompiled.
- **Whether the rest of the examined JAR is clean.** The remaining classes were inconspicuous, but were only checked roughly by pattern search and not line by line. A comparison with the original JAR is still outstanding.
- **Who is behind it and how widely the malware has spread.**

## How the analysis ran without starting the sample

You do not examine malicious code by running it. Everything here is static analysis: the file is read, but never executed and never loaded by a Java runtime.

1. **Extract as data.** A JAR is a ZIP archive. Extracting runs nothing.
2. **`javap`** shows the structure of the class, including all flags and constants. This is where the hidden method stood out.
3. **Evaluate arithmetic chains.** A small tool built on the [ASM](https://asm.ow2.io/) library reads the class as a file, replaces every arithmetic chain with its result, and removes the disguise flags. Specialists call this "constant folding". It is around 70 lines of Java.
4. **Decompile** with [CFR](https://www.benf.org/other/cfr/). The method now appears, and the numbers are readable.
5. **Decrypt strings.** A 26-line Python script finds every byte array together with its associated XOR loop and replaces both with the plaintext. Afterwards, names such as `loadPlugin` and `net.s0lar.SolarLoader` appear in the code.

The original file was renamed to `.jar.quarantine` so that no server would load it by accident.

Stage 2 is far more heavily obfuscated (Zelix). For it, we built a dedicated, deliberately restricted bytecode interpreter. It reads the classes as data and only re-executes the sample's decryption routines. Access to files, the network, processes, reflection and class loaders is blocked in it. This allowed the hidden calls and strings to be restored and then decompiled with CFR, without a single line of the malware ever running in a real Java runtime.

## In short

- A redistributed plugin JAR contains a tampered bStats class. The original plugin is itself a victim, which is why we do not name it.
- On every server start it quietly loads a second plugin from the attacker's server and hides a copy as a log file with an invisible character in its name.
- This second plugin ("Solar", disguised as "DataFixerUpper") is a remote control: operating system commands, loading further code, infecting other JARs, and DoS attacks launched from the server. A third module ("Door") is received only by servers enabled individually; its content is unknown.
- Check: compare the hash, search all JARs including the server JAR for traces of the injector, and check `logs/` with `LC_ALL=C find logs -name '*[! -~]*'`.
- If affected: take the server off the network, secure the traces, obtain all plugin JARs and the server JAR anew, change the DiscordSRV token, the Velocity secret and all other secrets, check the host itself, and ideally rebuild it.
- Prevent it: only plugins from the original source, restricted outbound traffic, and as few rights as possible for the server.

If you have questions or find something on your own server, get in touch with us on [Discord](https://1lf.link/discord).

## Sources and further reading

- [bStats](https://bstats.org/), the statistics library whose copy was tampered with here
- [`javap` in the JDK documentation](https://docs.oracle.com/en/java/javase/21/docs/specs/man/javap.html)
- [ASM](https://asm.ow2.io/), a library for reading and rewriting Java bytecode
- [CFR](https://www.benf.org/other/cfr/), a Java decompiler
