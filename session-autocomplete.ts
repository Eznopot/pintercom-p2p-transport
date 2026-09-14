import type { AutocompleteProvider, AutocompleteSuggestions } from "@earendil-works/pi-coding-agent";
import { fuzzyFilter } from "@earendil-works/pi-tui";
import type { SessionInfo } from "./types.ts";

export function createSessionAutocompleteProvider(
  current: AutocompleteProvider,
  getSessions: (signal: AbortSignal) => Promise<{ selfId?: string; sessions: SessionInfo[] } | undefined>,
): AutocompleteProvider {
  return {
    triggerCharacters: ["@"],
    async getSuggestions(lines, line, col, options): Promise<AutocompleteSuggestions | null> {
      const match = (lines[line] ?? "").slice(0, col).match(/(?:^|\s)@([^\s@]*)$/);
      if (!match) return current.getSuggestions(lines, line, col, options);

      let live;
      try {
        live = await getSessions(options.signal);
      } catch {
        return current.getSuggestions(lines, line, col, options);
      }
      if (options.signal.aborted || !live) return current.getSuggestions(lines, line, col, options);

      const query = (match[1] ?? "").toLowerCase();
      const peers = live.sessions.filter((session) => session.id !== live.selfId);
      const duplicateNames = new Set(live.sessions
        .map((session) => session.name?.toLowerCase())
        .filter((name): name is string => Boolean(name))
        .filter((name, index, names) => names.indexOf(name) !== index));
      const shortId = (session: SessionInfo) => {
        let length = 8;
        while (live.sessions.some((other) => other.id !== session.id && other.id.startsWith(session.id.slice(0, length)))) length += 1;
        return session.id.slice(0, length);
      };
      const matches = query
        ? fuzzyFilter(peers, query, (session) => [session.name, session.cwd, session.hostname, shortId(session)].filter(Boolean).join(" "))
        : peers;
      const items = matches.map((session) => {
          const duplicate = Boolean(session.name && duplicateNames.has(session.name.toLowerCase()));
          const target = duplicate ? shortId(session) : (session.name || shortId(session));
          return { value: `@${target}`, label: `@${target}`, description: session.cwd };
        });
      return items.length ? { prefix: `@${match[1] ?? ""}`, items } : current.getSuggestions(lines, line, col, options);
    },
    applyCompletion(lines, line, col, item, prefix) {
      return current.applyCompletion(lines, line, col, item, prefix);
    },
    shouldTriggerFileCompletion(lines, line, col) {
      return current.shouldTriggerFileCompletion?.(lines, line, col) ?? true;
    },
  };
}
