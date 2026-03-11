// Utility functions for RunTrack calculations

/**
 * Haversine formula — calculate distance between two GPS coordinates
 * Returns distance in meters
 */
export const calculateDistance = (
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number => {
  const R = 6371000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Estimate steps from distance
 * stride_length = height × 0.415 (meters)
 */
export const estimateSteps = (distanceMeters: number, heightCm: number = 170): number => {
  const strideLength = (heightCm / 100) * 0.415;
  return Math.round(distanceMeters / strideLength);
};

/**
 * Calculate calories burned
 * MET × weight(kg) × duration(hours)
 */
export const calculateCalories = (
  distanceMeters: number,
  durationSeconds: number,
  weightKg: number = 70,
  speedKmh: number = 0
): number => {
  const isRunning = speedKmh >= 7;
  const MET = isRunning ? 9.8 : 3.8;
  const durationHours = durationSeconds / 3600;
  return Math.round(MET * weightKg * durationHours);
};

/**
 * Calculate pace in seconds per km
 */
export const calculatePace = (distanceMeters: number, durationSeconds: number): number => {
  if (distanceMeters === 0) return 0;
  const distanceKm = distanceMeters / 1000;
  return durationSeconds / distanceKm;
};

/**
 * Format pace as "mm:ss /km"
 */
export const formatPace = (paceSecondsPerKm: number): string => {
  if (!paceSecondsPerKm || paceSecondsPerKm === Infinity || paceSecondsPerKm === 0) return '--:-- /km';
  const minutes = Math.floor(paceSecondsPerKm / 60);
  const seconds = Math.floor(paceSecondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
};

/**
 * Format duration as "mm:ss" or "hh:mm:ss"
 */
export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * Format distance
 */
export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
};

/**
 * Format distance for display (just number)
 */
export const formatDistanceValue = (meters: number): { value: string; unit: string } => {
  if (meters >= 1000) {
    return { value: (meters / 1000).toFixed(2), unit: 'km' };
  }
  return { value: Math.round(meters).toString(), unit: 'm' };
};

/**
 * Calculate speed in km/h from distance (meters) and time (seconds)
 */
export const calculateSpeed = (distanceMeters: number, durationSeconds: number): number => {
  if (durationSeconds === 0) return 0;
  const distanceKm = distanceMeters / 1000;
  const durationHours = durationSeconds / 3600;
  return distanceKm / durationHours;
};

/**
 * Determine activity type based on average speed
 */
export const getActivityType = (speedKmh: number): 'run' | 'walk' => {
  return speedKmh >= 7 ? 'run' : 'walk';
};

/**
 * Format date relative to now
 */
export const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Get BMI category (just for display)
 */
export const getBMI = (weightKg: number, heightCm: number): number => {
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
};

/**
 * Group activities by date for chart data
 */
export const groupActivitiesByDay = (activities: Array<{
  date?: string;
  distance?: number;
  steps?: number;
  calories?: number;
  duration?: number;
}>): Record<string, { distance: number; steps: number; calories: number; count: number }> => {
  const result: Record<string, { distance: number; steps: number; calories: number; count: number }> = {};
  
  activities.forEach(activity => {
    const date = activity.date || new Date().toISOString().split('T')[0];
    if (!result[date]) {
      result[date] = { distance: 0, steps: 0, calories: 0, count: 0 };
    }
    result[date].distance += (activity.distance || 0) / 1000; // km
    result[date].steps += activity.steps || 0;
    result[date].calories += activity.calories || 0;
    result[date].count += 1;
  });
  
  return result;
};

/**
 * Generate last N days of dates
 */
export const getLastNDays = (n: number): string[] => {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

/**
 * Format short date label
 */
export const formatShortDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
};
