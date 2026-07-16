export const STATE_DISTRICTS: Record<string, string[]> = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "Guntur", "Krishna", "Visakhapatnam", "Vijayawada"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "South Delhi", "West Delhi"],
  "Gujarat": ["Ahmedabad", "Gandhinagar", "Rajkot", "Surat", "Vadodara"],
  "Karnataka": ["Bengaluru Urban", "Belagavi", "Mangaluru", "Mysuru", "Udupi"],
  "Kerala": ["Ernakulam", "Kozhikode", "Thiruvananthapuram", "Thrissur"],
  "Madhya Pradesh": ["Bhopal", "Gwalior", "Indore", "Jabalpur"],
  "Maharashtra": ["Mumbai City", "Mumbai Suburban", "Nagpur", "Nashik", "Pune", "Thane"],
  "Rajasthan": ["Ajmer", "Jaipur", "Jodhpur", "Kota", "Udaipur"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli"],
  "Telangana": ["Hyderabad", "Karimnagar", "Khammam", "Medchal-Malkajgiri", "Warangal"],
  "Uttar Pradesh": ["Agra", "Ghaziabad", "Kanpur Nagar", "Lucknow", "Varanasi"],
  "West Bengal": ["Howrah", "Kolkata", "North 24 Parganas", "South 24 Parganas"],
};

export const STATES = Object.keys(STATE_DISTRICTS);

export function getDistrictsForState(state: string) {
  return STATE_DISTRICTS[state] ?? [];
}
