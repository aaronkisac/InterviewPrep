import {
  Anchor,
  Atom,
  BookOpen,
  Boxes,
  Braces,
  FileCode,
  FlaskConical,
  GitBranch,
  Globe,
  Layers,
  Network,
  Palette,
  Puzzle,
  RefreshCw,
  Type,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Topic slug → icon. Topics are dynamic (DB-driven), so unknown and
 * custom topic slugs fall back to BookOpen.
 */
const TOPIC_ICONS: Record<string, LucideIcon> = {
  react: Atom,
  "react-hooks": Anchor,
  typescript: Type,
  nextjs: Layers,
  redux: Boxes,
  javascript: Braces,
  html5: FileCode,
  css: Palette,
  git: GitBranch,
  "agile-scrum": RefreshCw,
  websockets: Zap,
  "unit-testing": FlaskConical,
  "design-patterns": Puzzle,
  "software-architecture": Network,
  "api-design": Globe,
};

export function getTopicIcon(slug: string): LucideIcon {
  return TOPIC_ICONS[slug] ?? BookOpen;
}
