---
title: 'Resilienz im Detail: PriorityClasses, PDBs und (Anti-)Affinitäten in unserem Kubernetes-Cluster'
alternativeTitle: 'Deep Dive: Wie ich unser GitOps-Cluster gegen Ausfälle gehärtet habe'
description: 'Die technische Langfassung: Wie ich unser Kubernetes-Cluster über drei Härtungs-Säulen – Ressourcen, PodDisruptionBudgets und ein fünfstufiges PriorityClass-Schema – plus Zone- und Pod-Anti-Affinitäten ausfallsicherer gemacht habe. Inklusive der Stolpersteine: stillschweigend ignorierte Helm-Values, webhook-immutable Felder und ein MaxScale-Pod, der hartnäckig im Pending hängen blieb.'
pubDate: '2026-06-13'
headerImage: 'images/blog/cluster-topology-social.png'
headerImageAlt: 'Topologie des feather-core-Clusters: Control-Plane, Ceph-Storage und Worker in Zone fr01'
slug: 'resilienz-im-detail-priorityclasses-pdb-affinitaeten'
translationKey: 'cluster-resilience-deep-dive'
tags:
  - infrastructure
  - kubernetes
  - gitops
  - hardening
  - reliability
author: phillipp-glanz
canonical: 'https://onelitefeather.net/de/blog/resilienz-im-detail-priorityclasses-pdb-affinitaeten'
sitemap:
  loc: '/de/blog/resilienz-im-detail-priorityclasses-pdb-affinitaeten'
  lastmod: '2026-06-13'
  changefreq: monthly
  priority: 0.8
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/resilienz-im-detail-priorityclasses-pdb-affinitaeten'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/resilience-in-detail-priorityclasses-pdb-affinities'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/resilience-in-detail-priorityclasses-pdb-affinities'
schemaOrg:
  - type: 'BlogPosting'
    headline: 'Resilienz im Detail: PriorityClasses, PDBs und (Anti-)Affinitäten in unserem Kubernetes-Cluster'
    alternativeHeadline: 'Deep Dive: Wie ich unser GitOps-Cluster gegen Ausfälle gehärtet habe'
    description: 'Die technische Langfassung: Wie ich unser Kubernetes-Cluster über drei Härtungs-Säulen plus Zone- und Pod-Anti-Affinitäten ausfallsicherer gemacht habe.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2026-06-13T00:00:00+00:00'
---
Diese Ausgabe ist für alle, die mit mir in den Maschinenraum klettern wollen. Ich gehe die konkreten Schritte durch, mit denen ich unser GitOps-verwaltetes Kubernetes-Cluster gegen Knotenausfälle, Drains und Ressourcenknappheit gehärtet habe – inklusive der Stellen, an denen ich mir die Zähne ausgebissen habe.
<!--more-->
> **Deep-Dive-Ausgabe.** Die nicht-technische Kurzfassung mit Alltagsbildern gibt es in der [Light Edition](https://onelitefeather.net/de/blog/wenn-ein-server-ausfaellt-cluster-resilienz). Alle Änderungen leben in einem Flux-gemanagten Git-Repository – jede Zeile hier ist ein echter Commit.

## Ausgangslage

Unser `feather-core`-Cluster läuft in einer Zone (`fr01`) mit getrennten Node-Rollen: Control-Plane, dedizierte Storage-Nodes (Ceph) und Worker in zwei Größen. Darauf liegt der komplette Stack.

![feather-core: Control-Plane, Storage und Worker in Zone fr01, mit den Workloads nach Wichtigkeit gestapelt](/images/blog/cluster-topology.drawio.svg)
*Das Cluster auf einen Blick: drei Control-Plane-Knoten, drei Ceph-Storage-Knoten, vier Worker – und darunter, nach Wichtigkeit gestapelt, was tatsächlich darauf läuft.*

„Es läuft" war nie mein Problem. Meine Frage war: Was passiert beim ersten echten Knotenausfall? Die Antwort habe ich entlang dreier Härtungs-Säulen gesucht.

## Säule 1: Ressourcen – Schluss mit BestEffort

Bevor man über Scheduling-Garantien reden kann, brauchen Pods überhaupt `requests` und `limits`. Pods ohne Angaben landen in der QoS-Klasse `BestEffort` und werden bei Speicherdruck als Erste vom Kubelet gekillt – egal wie kritisch sie sind.

Ich bin den Stack systematisch durchgegangen und habe die letzten BestEffort-Workloads beseitigt: Postgres, die MariaDB-/MaxScale-Metrics-Exporter, MetalLB, der CNPG-Barman-Plugin-Sidecar, Mimir, Loki, der Envoy-Data-Plane und etliche mehr bekamen explizite `requests`/`limits`. Wo nur Memory-Limits existierten, habe ich CPU-Limits ergänzt – großzügig über der beobachteten Last, um Throttling zu vermeiden:

```yaml
resources:
  requests:
    cpu: "2"
    memory: 8Gi
  limits:
    memory: 8Gi   # Memory-Limit == Request: Guaranteed-QoS, kein OOM-Lotteriespiel
```

Diese Säule ist unspektakulär, aber Voraussetzung für alles Weitere: Erst mit sauberen Ressourcen-Angaben werden QoS-Klasse und Priorität für den Scheduler überhaupt aussagekräftig.

## Säule 2: PodDisruptionBudgets gegen den „alle-auf-einmal"-Effekt

Ein Knoten-Drain (Update, Wartung) verschiebt alle Pods des Knotens. Ohne Leitplanke kann das bei einem mehrfach replizierten Dienst alle Replicas gleichzeitig treffen – kurzzeitiger Totalausfall. Ein PodDisruptionBudget mit `maxUnavailable: 1` verbietet das:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: bluemap
  namespace: bluemap
spec:
  maxUnavailable: 1
  selector:
    matchLabels:
      app.kubernetes.io/instance: bluemap
      app.kubernetes.io/name: bluemap
```

Solche PDBs habe ich für alle mehrfach replizierten Dienste eingezogen: BlueMap (3), Dependency-Track-Frontend (3), Harbor-Komponenten core/registry/jobservice/portal (je 2), Reposilite (3) und den Prometheus-Agent (2). Bewusst **kein** PDB bekamen Single-Replica-Workloads – ein `maxUnavailable: 1` bei nur einer Replica würde Node-Drains komplett blockieren. Weil die zugrunde liegenden Helm-Charts oft kein natives PDB anbieten, liegen diese als eigenständige Manifeste neben den Releases.

## Säule 3: Ein fünfstufiges PriorityClass-Schema

Wenn der Speicher cluster­weit knapp wird, entscheidet die Pod-Priorität, wer bleibt und wer dem Preemption/Eviction weicht. Ich habe fünf Stufen unterhalb der eingebauten `system-*`-Klassen definiert:

![Fünf PriorityClasses von feather-critical bis feather-low, mit Eviction-Reihenfolge](/images/blog/priority-tiers.drawio.svg)
*Höherer Wert gewinnt. Oben steht der Speicher, ganz unten die Best-Effort-Apps – die fliegen unter Druck zuerst.*

Storage und Datenbanken sind damit strukturell geschützt; verzichtbare Apps treten zuerst zurück. So weit die Theorie – jetzt zu den zwei Stellen, an denen es wehtat.

### Stolperstein 1: Der stillschweigende No-Op

Die Zuweisung lief gut – bis sie es nicht mehr tat. Bei einigen unserer Charts (Outline, Leantime, Shlink, Reposilite, Otis, BlueMap) trug ich brav `priorityClassName` als Helm-Value ein – und nichts geschah. Diese Charts referenzieren `.Values.priorityClassName` schlicht nicht; der Wert war ein stiller No-Op. Kein Fehler, keine Warnung – einfach wirkungslos.

Die Lösung waren HelmRelease-`postRenderers`, die das gerenderte Deployment direkt patchen:

```yaml
postRenderers:
  - kustomize:
      patches:
        - target:
            kind: Deployment
            name: grafana
          patch: |
            - op: add
              path: /spec/template/spec/priorityClassName
              value: feather-high
```

Lektion: Ein in `values` gesetzter Schlüssel zählt nur, wenn das Template ihn auch konsumiert. Im Zweifel patcht man das gerenderte Objekt.

### Stolperstein 2: Webhook-immutable Felder, die den Reconcile blockieren

Der eigentliche Lehrmeister war MaxScale, unser MariaDB-Proxy. Ich wollte ihm `feather-platform` geben – analog zu Postgres und Envoy im selben Commit. Der Admission-Webhook des MariaDB-Operators lehnte den Patch ab: `spec.priorityClassName` ist auf einer bestehenden MaxScale-CR **immutable**.

Schlimmer noch: Die Ablehnung schon beim Dry-Run ließ die gesamte `configs`-Kustomization in Flux scheitern – und blockierte damit auch die *erfolgreichen* Prioritäts-Änderungen an Postgres und Envoy im selben Reconcile. Ich musste das MaxScale-Feld zurücknehmen, um den Rest durchzubekommen:

> `revert(maxscale): drop priorityClassName (immutable, blocked configs reconcile)`

Lektion: In GitOps ist ein einzelnes immutable-Feld kein lokaler Fehler – es kann eine ganze Kustomization anhalten und unbeteiligte Änderungen mitreißen.

## Affinitäten: Topologie als Resilienz-Hebel

Priorität und PDBs regeln das *Ob*, Affinitäten das *Wo*.

**Node-Affinität (Zone-Pinning):** Alle PVC-gebundenen Workloads gehören auf `fr01`-Nodes, wo der `ceph-rbd-fr01`-Storage lokal liegt – sonst leidet die I/O-Performance. Das habe ich z. B. für Harbor-Trivy, step-ca und MariaDB hart verankert:

```yaml
nodeAffinity:
  requiredDuringSchedulingIgnoredDuringExecution:
    nodeSelectorTerms:
      - matchExpressions:
          - key: topology.kubernetes.io/zone
            operator: In
            values: ["fr01"]
```

**Pod-Anti-Affinität (Spreading):** Mehrere Replicas auf demselben Knoten sind keine echte Redundanz. Für BlueMap, Reposilite, Shlink und das Dependency-Track-Frontend habe ich eine *weiche* (preferred) Anti-Affinität ergänzt, damit die Replicas bevorzugt auf verschiedene Knoten gehen, das Scheduling bei Knappheit aber nicht blockieren:

```yaml
podAntiAffinity:
  preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchLabels:
            app.kubernetes.io/name: bluemap
        topologyKey: kubernetes.io/hostname
```

### Stolperstein 3: Die harte Anti-Affinität, die einen Pod im Pending ließ

Hier kommt die MaxScale-Saga zum Höhepunkt. Ich wollte die 2 MaxScale-Replicas auf verschiedene Knoten verteilen und aktivierte die Operator-Option `antiAffinityEnabled: true`. Was ich übersah: Diese Option erzeugt eine **harte** (`required`) Anti-Affinität gegen *beide* Instanzen – MaxScale **und** MariaDB.

![MaxScale: harte Anti-Affinität lässt den zweiten Pod im Pending, die weiche Regel verteilt zwei Pods auf zwei Knoten](/images/blog/maxscale-spread.drawio.svg)
*Links die harte Regel: 4 DB-fähige Worker, 3 davon schon mit MariaDB belegt – der zweite MaxScale-Pod findet keinen Platz und bleibt Pending. Rechts die weiche Regel: zwei MaxScale-Pods, zwei Knoten, echte Redundanz.*

Die Rechnung ging nicht auf: 4 DB-fähige Worker, darauf bereits 3 MariaDB-Pods. Eine harte Regel, die 3 MariaDB- und 2 MaxScale-Pods auf je eigene Knoten zwingt, braucht 5 Knoten. Der zweite MaxScale-Pod fand keinen Platz und blieb `Pending` – was erneut die `configs`-Kustomization ausbremste. Als Sofortmaßnahme skalierte ich nicht-disruptiv auf 1 Replica.

Der saubere Endzustand brauchte zwei Erkenntnisse:

1. **Soft statt hard, und nur gegen sich selbst.** Die Replicas sollen sich voneinander fernhalten (preferred), dürfen aber mit MariaDB einen Knoten teilen – es gibt schlicht nicht genug Knoten, um beide vollständig zu trennen.
2. **`antiAffinityEnabled` ist immutable.** Der Wechsel von der harten zur weichen Regel – wie auch das Nachziehen der Priorität – ließ sich auf der bestehenden CR nicht per Update anwenden. Es half nur, die CR neu zu erstellen.

Der finale Spec für MaxScale:

```yaml
spec:
  replicas: 2
  priorityClassName: feather-platform
  affinity:
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchExpressions:
                - key: app.kubernetes.io/instance
                  operator: In
                  values: ["maxscale-galera"]
            topologyKey: kubernetes.io/hostname
```

Weil Flux das immutable-Update niemals selbst durchbekommen hätte, war die Neuerstellung der CR der entscheidende Schritt:

```bash
kubectl delete maxscale maxscale-galera -n mariadb-galera
# Flux/Operator bauen die CR aus dem aktualisierten Manifest neu auf
```

Ergebnis: zwei MaxScale-Pods, `1/1 Running`, auf zwei verschiedenen Knoten, die LoadBalancer-VIPs (rw-router und GUI) wieder online – echte Knoten-Redundanz statt eines Single Point of Failure. Der einzige Preis war ein kurzer VIP-Blip von ~30–60 Sekunden während der Neuerstellung.

## Impact

- **Graceful Degradation statt Dominoeffekt.** Knotenausfall oder Drain nimmt keinen Dienst mehr komplett vom Netz; PDBs und Spreading fangen den Schlag ab.
- **Strukturierter Selbstschutz.** Unter Ressourcendruck weicht zuerst `feather-low` (BlueMap, Node-RED, Uptime-Kuma); Storage und Datenbanken sind durch `feather-critical`/`feather-platform` abgesichert.
- **Echte Redundanz an der heißesten Stelle.** Der Datenbank-Proxy – durch den jede DB-Anfrage läuft – läuft jetzt doppelt und knotenverteilt.
- **GitOps-Disziplin als Sicherheitsnetz.** Jede dieser Änderungen ist ein reviewter Commit; der Reconcile zeigt sofort, wenn etwas wie ein immutable-Feld quer steht – manchmal schmerzhaft, aber immer transparent.

Die größte Lektion war weniger eine einzelne Einstellung als ein Muster: **Aufgeschrieben ist nicht angewendet.** Ein Value, den niemand liest; ein Feld, das sich nicht ändern lässt; eine harte Regel ohne genug Knoten – die Tücke steckt selten in der Idee, fast immer im Zusammenspiel. Genau dafür ist unser Cluster jetzt ein gutes Stück robuster.

---

## Werde Teil unserer Reise

Bei OneLiteFeather schätzen wir eine entspannte Arbeitsatmosphäre und leben den Flair von kreativer Freiheit gepaart mit strukturierter Organisation. Wir arbeiten nach dem **Kanban-Prinzip**, das uns ermöglicht, in einem stressfreien Umfeld ohne starre Deadlines zu arbeiten. Dabei liegt unser Fokus auf **aktiver Kommunikation** und dem gemeinsamen Fortschritt. Wenn du in den Bereichen **Moderation**, **Community Management**, **Entwicklung** oder **Konzepterstellung** Erfahrung hast und dich in einer Gemeinschaft engagieren möchtest, die Wert auf persönliches Wachstum und Teamarbeit legt, dann bist du bei uns genau richtig. Referenzen sind willkommen und helfen uns, ein besseres Verständnis für deine Fähigkeiten und Erfahrungen zu bekommen.

Wir sind gespannt darauf, von dir zu hören und gemeinsam spannende Projekte zu verwirklichen. Du kannst mich, **themeinerlp**, direkt auf Discord erreichen, oder du kannst über unseren Discord-Server in Kontakt treten, den du unter [1lf.link/discord](https://1lf.link/discord) findest. Dort kannst du ein Ticket eröffnen, um dich zu bewerben. Alternativ kannst du auch **OneLiteFeather** direkt via Discord kontaktieren. Lass uns über deine Ideen plaudern und wie du zur OneLiteFeather-Community beitragen kannst. Zusammen können wir die digitale Welt erkunden, unser Wissen erweitern und eine positive und unterstützende Gemeinschaft aufbauen.

Falls Unklarheiten aufkommen sollten, sei frei uns zu fragen. Wir sind hier, um alle deine Fragen zu beantworten und freuen uns darauf, mehr über dich und deine Interessen zu erfahren!
