/**
 * Phone number helpers shared by auth, user and verification services.
 *
 * All phone numbers are stored as bare 10-digit Indian mobile numbers
 * (no +91 prefix, no spaces) so equality checks are reliable.
 */
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+91")) return cleaned.slice(3);
  if (cleaned.startsWith("91") && cleaned.length === 12) return cleaned.slice(2);
  return cleaned;
}
