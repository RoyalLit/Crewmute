interface Ride {
  departureDate?: string;
  departureTime?: string;
  date?: string;
  time?: string;
  status?: string;
}

export const getDerivedRideStatus = (ride?: Ride | null): 'active' | 'in_progress' | 'completed' | 'cancelled' | 'expired' => {
  if (!ride) return 'active';
  
  if (ride.status === 'cancelled') return 'cancelled';
  if (ride.status === 'completed') return 'completed';
  if (ride.status === 'expired') return 'expired';
  if (ride.status === 'in_progress') return 'in_progress';

  const depDate = ride.departureDate || ride.date;
  const depTime = ride.departureTime || ride.time;

  if (depDate && depTime) {
    const departureTimeMs = new Date(`${depDate}T${depTime}:00`).getTime();
    const now = new Date().getTime();
    // 10 minutes past departure
    if (now > departureTimeMs + 10 * 60 * 1000) {
      // Should we auto-complete? Just keep as active/in_progress based on backend if we do real tracking
      // but if the backend still says 'active' we could say expired.
      if (ride.status === 'active') {
        return 'expired';
      }
    }
  }

  return (ride.status || 'active') as 'active' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parts[0].substring(2); // "26"
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
  }
  return dateString;
};

export const parseLocation = (loc: string) => {
  if (!loc) return { city: '', state: '' };
  const parts = loc.split(',');
  if (parts.length > 1) {
    return { city: parts[0].trim(), state: parts.slice(1).join(',').trim() };
  }
  return { city: loc, state: '' };
};
