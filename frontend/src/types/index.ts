/**
 * Shared TypeScript types for the Companionly application.
 */

/** A navigation link item. */
export interface NavLink {
  readonly label: string;
  readonly href: string;
}

/** A grouped set of footer navigation links. */
export interface FooterLinkGroup {
  readonly title: string;
  readonly links: readonly NavLink[];
}

/** A social media link. */
export interface SocialLink {
  readonly label: string;
  readonly href: string;
  readonly icon: string;
}
