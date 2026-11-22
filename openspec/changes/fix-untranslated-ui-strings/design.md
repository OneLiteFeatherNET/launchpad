# Design: Fest verdrahtete UI-Beschriftungen übersetzen

## Context

Gelesen an `origin/main` `83fc3fe`. `tests/i18n/hardcoded-attributes.spec.ts`
und `bound-attributes.spec.ts` decken Attribute ab, `message-keys.spec.ts` und
`unused-keys.spec.ts` die Schlüssel. Sichtbare Textknoten waren ungeprüft.

## Goals / Non-Goals

**Goals:** keine deutschen Wörter auf `/en`; eine Regel, die Rückfälle fängt.

**Non-Goals:** Rechtstexte übersetzen; Inhalte unter `content/`; Prop-Defaults
in Skripten.

## Decisions

1. **Schlüssel unter `carousel.*`**, neben `read`/`new`, weil die Beschriftungen
   nur dort vorkommen. `carousel.details` ist ein eigener Schlüssel statt
   `events.details`, damit die Karte nicht an den Event-Seitentext gekoppelt ist.
2. **Textknoten-Test statt Vollscanner.** Zwischen Tags wird `{{ … }}`
   entfernt; was an Buchstaben bleibt, ist Klartext. Erlaubt sind Eigennamen
   (Liste im Test) und die zwei Rechtstext-Seiten. Das ist ohne Parser
   zuverlässig und lieferte beim Sweep keine Fehlalarme.
3. **Typ `fix(i18n)`**, weil Besucher auf `/en` sichtbar falschen Text sahen.

## Risks / Trade-offs

- Neue Eigennamen müssen in die Liste des Tests; das ist gewollt.
- Text in Skript-Strings (z. B. Prop-Defaults) wird nicht erfasst.

## Open Questions

Keine.
