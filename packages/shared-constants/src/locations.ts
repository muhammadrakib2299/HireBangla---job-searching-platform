export interface Division {
  name: string;
  bn: string;
  districts: string[];
}

export const DIVISIONS: Division[] = [
  {
    name: 'Dhaka',
    bn: 'ঢাকা',
    districts: [
      'Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj',
      'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi',
      'Rajbari', 'Shariatpur', 'Tangail',
    ],
  },
  {
    name: 'Chattogram',
    bn: 'চট্টগ্রাম',
    districts: [
      'Bandarban', 'Brahmanbaria', 'Chandpur', 'Chattogram', 'Comilla',
      'Cox\'s Bazar', 'Feni', 'Khagrachhari', 'Lakshmipur', 'Noakhali',
      'Rangamati',
    ],
  },
  {
    name: 'Rajshahi',
    bn: 'রাজশাহী',
    districts: [
      'Bogura', 'Chapainawabganj', 'Joypurhat', 'Naogaon', 'Natore',
      'Nawabganj', 'Pabna', 'Rajshahi', 'Sirajganj',
    ],
  },
  {
    name: 'Khulna',
    bn: 'খুলনা',
    districts: [
      'Bagerhat', 'Chuadanga', 'Jessore', 'Jhenaidah', 'Khulna',
      'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira',
    ],
  },
  {
    name: 'Barishal',
    bn: 'বরিশাল',
    districts: [
      'Barguna', 'Barishal', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur',
    ],
  },
  {
    name: 'Sylhet',
    bn: 'সিলেট',
    districts: [
      'Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet',
    ],
  },
  {
    name: 'Rangpur',
    bn: 'রংপুর',
    districts: [
      'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari',
      'Panchagarh', 'Rangpur', 'Thakurgaon',
    ],
  },
  {
    name: 'Mymensingh',
    bn: 'ময়মনসিংহ',
    districts: [
      'Jamalpur', 'Mymensingh', 'Netrokona', 'Sherpur',
    ],
  },
];

export const ALL_DIVISIONS = DIVISIONS.map((d) => d.name);

export const ALL_DISTRICTS = DIVISIONS.flatMap((d) => d.districts);

export function getDistrictsByDivision(division: string): string[] {
  return DIVISIONS.find((d) => d.name === division)?.districts ?? [];
}
