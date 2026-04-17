export type ModuleStatus = 'active' | 'coming_soon';

export interface UnifiedModule {
  /** Unique identifier, e.g. "wibu" */
  id: string;
  /** URL slug, e.g. "wibu" */
  slug: string;
  /** Display name */
  name: string;
  /** Short description untuk card */
  description: string;
  /** Status modul */
  status: ModuleStatus;
  /** Emoji atau path ke gambar maskot */
  mascotEmoji: string;
  /** Alt text untuk aksesibilitas */
  mascotAlt: string;
  /** Hex color unik per modul */
  accentColor: string;
  /** URL tujuan saat card diklik */
  href: string;
  /** Kategori opsional untuk badge */
  category?: string;
}
