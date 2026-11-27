export const RESERVATION_LATE_GRACE_PERIOD_MS = 30 * 60 * 1000;

export function getReservationDateTime(reservation, isEnd) {
    const dateValue = isEnd ? reservation.endsAtDate : reservation.startsAtDate;
    const timeValue = isEnd ? reservation.endsAtHours : reservation.startsAtHours;
    if (!dateValue || !timeValue) return null;

    const dateString = dateValue instanceof Date ? dateValue.toISOString() : String(dateValue);
    const timeString = timeValue instanceof Date ? timeValue.toISOString() : String(timeValue);
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const timeMatch = timeString.match(/(?:T|^)(\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!dateMatch || !timeMatch) return null;

    const date = new Date(
        Number(dateMatch[1]),
        Number(dateMatch[2]) - 1,
        Number(dateMatch[3]),
        Number(timeMatch[1]),
        Number(timeMatch[2]),
        Number(timeMatch[3] ?? 0),
        0,
    );
    return Number.isNaN(date.getTime()) ? null : date;
}

export function isPendingReservationOverdue(reservation, at = new Date()) {
    if (reservation.status !== "Pendente") return false;

    const startsAt = getReservationDateTime(reservation, false);
    return startsAt !== null &&
        at.getTime() >= startsAt.getTime() + RESERVATION_LATE_GRACE_PERIOD_MS;
}
