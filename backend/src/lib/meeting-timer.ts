import { notify } from "../services/notification.service.js";
import { emitToUser } from "./socket.js";

/**
 * In-memory map of active meeting timers.
 * Key: bookingId, Value: { warningTimer, endTimer }
 *
 * In production, this would be backed by a job queue (BullMQ/Redis).
 * For our MVP, in-process setTimeout is sufficient.
 */
const activeTimers = new Map<string, { warningTimer: NodeJS.Timeout; endTimer: NodeJS.Timeout }>();

/**
 * Schedule a 15-minute warning before the meeting's booked end time.
 * Also schedule an auto-end warning at the exact end time.
 *
 * Called when OTP is verified and meeting starts.
 */
export function scheduleMeetingEndWarning(
  bookingId: string,
  clientId: string,
  companionUserId: string,
  durationHours: number,
  clientName: string,
  companionName: string,
) {
  // Clear any existing timers for this booking
  clearMeetingTimers(bookingId);

  const now = Date.now();
  const meetingEndMs = now + durationHours * 60 * 60 * 1000;
  const warningMs = meetingEndMs - 15 * 60 * 1000; // 15 min before end

  const msUntilWarning = Math.max(warningMs - now, 0);
  const msUntilEnd = Math.max(meetingEndMs - now, 0);

  console.log(`⏰ Meeting timer set for booking ${bookingId}: warning in ${Math.round(msUntilWarning / 60000)}min, end in ${Math.round(msUntilEnd / 60000)}min`);

  // 15-minute warning timer
  const warningTimer = setTimeout(async () => {
    try {
      // Notify both parties
      await notify({
        userId: clientId,
        type: "MEETING",
        title: "Meeting Ending Soon ⏰",
        body: `Your meeting with ${companionName} will end in 15 minutes. Would you like to extend?`,
        icon: "clock",
        linkUrl: "/bookings",
      });

      await notify({
        userId: companionUserId,
        type: "MEETING",
        title: "Meeting Ending Soon ⏰",
        body: `Your meeting with ${clientName} will end in 15 minutes.`,
        icon: "clock",
        linkUrl: "/bookings",
      });

      // Also emit socket events for real-time pop-up
      emitToUser(clientId, "meeting_ending_soon", { bookingId, minutesLeft: 15 });
      emitToUser(companionUserId, "meeting_ending_soon", { bookingId, minutesLeft: 15 });
    } catch (error) {
      console.error("Meeting warning notification error:", error);
    }
  }, msUntilWarning);

  // End-time notification (meeting time is over)
  const endTimer = setTimeout(async () => {
    try {
      await notify({
        userId: clientId,
        type: "MEETING",
        title: "Meeting Time Over 🏁",
        body: `Your ${durationHours}-hour meeting with ${companionName} has reached its scheduled end time. The companion can now end the meeting.`,
        icon: "clock",
        linkUrl: "/bookings",
      });

      await notify({
        userId: companionUserId,
        type: "MEETING",
        title: "Meeting Time Over 🏁",
        body: `The ${durationHours}-hour meeting with ${clientName} has reached its end time. Please tap "End Meeting" to complete and receive your payment.`,
        icon: "clock",
        linkUrl: "/bookings",
      });

      emitToUser(clientId, "meeting_time_over", { bookingId });
      emitToUser(companionUserId, "meeting_time_over", { bookingId });

      // Clean up
      activeTimers.delete(bookingId);
    } catch (error) {
      console.error("Meeting end notification error:", error);
    }
  }, msUntilEnd);

  activeTimers.set(bookingId, { warningTimer, endTimer });
}

/**
 * Clear timers for a booking (called when meeting ends early).
 */
export function clearMeetingTimers(bookingId: string) {
  const timers = activeTimers.get(bookingId);
  if (timers) {
    clearTimeout(timers.warningTimer);
    clearTimeout(timers.endTimer);
    activeTimers.delete(bookingId);
    console.log(`⏰ Meeting timers cleared for booking ${bookingId}`);
  }
}
