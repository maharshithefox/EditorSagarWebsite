import { VideoItem, Testimonial } from '../types';

// Programmatic helper to generate 100 extra high-quality Wedding & Pre-wedding cinematic videos
const generateExtraWeddingVideos = (): VideoItem[] => {
  const brides = [
    'Priya', 'Aditi', 'Ananya', 'Riya', 'Sanjana', 'Meghana', 'Shreya', 'Trisha', 'Kavya', 'Deepika',
    'Neha', 'Aishwarya', 'Sneha', 'Shruti', 'Simran', 'Tanvi', 'Ishita', 'Divya', 'Aaradhya', 'Kiara',
    'Tara', 'Kriti', 'Alia', 'Sonam', 'Pooja', 'Kareena', 'Rani', 'Preity', 'Kajol', 'Madhuri'
  ];
  
  const grooms = [
    'Rahul', 'Rohan', 'Varun', 'Arnav', 'Vikram', 'Sameer', 'Vignesh', 'Kariappa', 'Sandeep', 'Amit',
    'Aditya', 'Abhishek', 'Ranbir', 'Sidharth', 'Ayush', 'Kartik', 'Vicky', 'Rajkummar', 'Arjun',
    'Akshay', 'Hrithik', 'Kunal', 'Dev', 'Kabir', 'Vivaan', 'Aarav', 'Reyansh', 'Sai', 'Karthik'
  ];

  const locations = [
    'Udaipur Lake Palace, Rajasthan',
    'Taj Exotica, Goa',
    'Fairmont Jaipur, Rajasthan',
    'Palace Grounds, Bangalore',
    'Backwaters Resort, Alleppey',
    'Lalitha Mahal Palace, Mysore',
    'Coffee Estates, Coorg',
    'Marari Beach, Kerala',
    'The Leela Raviz, Kovalam',
    'Ethereal Valley, Manali',
    'Umaid Bhawan, Jodhpur',
    'Suryagarh, Jaisalmer',
    'Jim Corbett, Uttarakhand',
    'Mubarak Mandi, Jammu',
    'Hills of Mussoorie, Uttarakhand',
    'Radisson Blu, Temple Bay Mahabalipuram',
    'Cliffs of Varkala, Kerala',
    'Grand Hyatt, Kochi',
    'The Oberoi Sukhvilas, Chandigarh',
    'ITC Mughal, Agra',
    'Amara Sanctuary, Pune',
    'Gateway of India, Mumbai',
    'Falashnuma Palace, Hyderabad',
    'Mahabalipuram Shore Temple, Tamil Nadu',
    'Chikmagalur Peak, Karnataka',
    'Heritage Ruins, Hampi'
  ];

  const themes = [
    {
      titleSuffix: 'Sunset Celebration',
      descriptionPrefix: 'A heartwarming golden hour sunset film capturing raw, intimate emotions, soft breeze, and romantic strolls.',
      tags: ['Sunset Drone', 'Golden Hour', 'Warm Glow', 'Light Leaks']
    },
    {
      titleSuffix: 'Royal Palace Pheras',
      descriptionPrefix: 'A grand architectural marvel wedding film capturing traditional royal rituals, holy vows, and heavy instrumentation.',
      tags: ['Royal Heritage', 'Multicam Edit', 'Anamorphic Crop', 'Warm Gold LUT']
    },
    {
      titleSuffix: 'Sangeet Choreography Spectacular',
      descriptionPrefix: 'High-energy, multi-angle dance film showcasing explosive stage lights, dynamic cuts, and crisp music synchronization.',
      tags: ['Beat Sync', 'Speed Ramping', 'Stage Bloom', 'Voice Isolation']
    },
    {
      titleSuffix: 'Intimate Meadow Vows',
      descriptionPrefix: 'A dreamy minimalist wedding in high country valleys, focusing on soft organic textures and tearful bridal speeches.',
      tags: ['Minimalist Edit', 'Nature Sounds', 'Film Grain', 'Soft Focus']
    },
    {
      titleSuffix: 'Traditional Temple Rituals',
      descriptionPrefix: 'Rich heritage documentary focusing on holy fire circles, traditional instrumental music, and traditional attire.',
      tags: ['Heritage Documentary', 'Classic Noir', 'Traditional Beats', 'HDR Master']
    },
    {
      titleSuffix: 'Glamorous Evening Reception',
      descriptionPrefix: 'Sleek cinematic celebration film featuring sparkling champagne toasts, crystal chandeliers, and heartfelt family speeches.',
      tags: ['Bokeh Enhancement', 'Sleek Grading', 'Low Light Boost', '3D Titles']
    },
    {
      titleSuffix: 'Misty Coffee Plantation Pre-Wedding',
      descriptionPrefix: 'Bespoke couple story in misty forest trails, chasing lens flares and candid whispers.',
      tags: ['Pre-wedding', 'Misty Grade', 'Lush Greens', 'Earth Tone LUT']
    },
    {
      titleSuffix: 'Coastal Beach Escapade',
      descriptionPrefix: 'Splendid couple trailer set against beautiful crashing waves, sandy paths, and cinematic blue grading.',
      tags: ['Teaser', 'Teal & Orange', 'Drone Panorama', 'Fluid Motion']
    }
  ];

  const unsplashIds = [
    'photo-1519741497674-611481863552',
    'photo-1606800052052-a08af7148866',
    'photo-1583939003579-730e3918a45a',
    'photo-1511285560929-80b456fea0bc',
    'photo-1519225495810-7512c696505a',
    'photo-1522673607200-164d1b6ce486',
    'photo-1544078751-58fed2b324d4',
    'photo-1515934751635-c81c6bc9a2d8',
    'photo-1532712938310-34cb3982ef74',
    'photo-1502444330042-d1a1ddf9bb5c',
    'photo-1511795409834-ef04bbd61622',
    'photo-1519741621255-6b7b71f98018',
    'photo-1465495976277-4387d4b0b4c6',
    'photo-1507504038482-7621c518ceab',
    'photo-1520854221256-17451cc35dcd',
    'photo-1591604466107-ec97de577aff',
    'photo-1549417229-aa67d3263c09',
    'photo-1537907690979-ee8e01276184',
    'photo-1510076857177-7470066aa490',
    'photo-1519671482749-fd09be7ccebf'
  ];

  const videoUrls = [
    'https://www.youtube.com/watch?v=XzP_w8qM37A',
    'https://www.youtube.com/watch?v=H7S3MugnEuo',
    'https://www.youtube.com/watch?v=kYJ0hZp_xzo',
    'https://www.youtube.com/watch?v=bC6_g4t_zL4',
    'https://www.youtube.com/watch?v=wXhXpD3p0h8'
  ];

  const list: VideoItem[] = [];

  for (let i = 1; i <= 50; i++) {
    const bride = brides[i % brides.length];
    let groom = grooms[i % grooms.length];
    if (bride === groom) {
      groom = grooms[(i + 1) % grooms.length];
    }
    const location = locations[i % locations.length];
    const theme = themes[i % themes.length];
    const unsplashId = unsplashIds[i % unsplashIds.length];
    const videoUrl = videoUrls[i % videoUrls.length];
    
    const min = Math.floor(Math.random() * 4) + 2;
    const sec = Math.floor(Math.random() * 50) + 10;
    const durationStr = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[i % months.length];
    const year = 2024 + (i % 3);

    list.push({
      id: `wedding_gen_${i}`,
      title: `${bride} & ${groom}: ${theme.titleSuffix}`,
      category: 'Wedding & Pre-wedding',
      description: `${theme.descriptionPrefix} Every glance, laughter, and tear masterfully captured and graded in FCP X.`,
      thumbnail: `https://images.unsplash.com/${unsplashId}?auto=format&fit=crop&q=80&w=800`,
      videoUrl,
      duration: durationStr,
      clientName: `${bride} & ${groom}`,
      location,
      date: `${month} ${year}`,
      fcpTags: ['Color Grading', 'Sound Design', ...theme.tags],
      isFeatured: i % 15 === 0
    });
  }

  return list;
};

const BASE_SHOWCASE_VIDEOS: VideoItem[] = [
  // SHOWREELS & PROMOS
  {
    id: 'p1',
    title: 'Studio Matrix Films: 2026 Cinematic Showreel',
    category: 'Showreels & Promos',
    description: 'The ultimate showcase of luxury wedding filmmaking, pre-wedding romantic essays, and lifestyle brand promos captured by Studio Matrix Films.',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://youtu.be/a6UKeK_B978',
    duration: '02:15',
    clientName: 'Studio Matrix Films',
    location: 'Bangalore Studio, Karnataka',
    date: 'Jan 2026',
    fcpTags: ['Cinematic Showreel', 'Color Grading', 'Luxury Weddings', 'Dynamic Transitions'],
    isFeatured: true
  },
  {
    id: 'p2',
    title: 'Pre-Wedding Promo: Love in Paradise',
    category: 'Showreels & Promos',
    description: 'A stylish, high-energy teaser showcasing our premium couple shoot packages across heritage palaces and coffee estates.',
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://www.youtube.com/watch?v=kYJ0hZp_xzo',
    duration: '01:30',
    clientName: 'Studio Matrix Films',
    location: 'Coorg, Karnataka',
    date: 'Dec 2025',
    fcpTags: ['Teaser', 'Speed Ramping', 'Light Leaks', 'Aesthetic Grading'],
    isFeatured: true
  },
  {
    id: 'p3',
    title: 'Minimalist Lifestyle Fashion Promo',
    category: 'Showreels & Promos',
    description: 'Elegant, slow-paced aesthetic edit showcasing custom lifestyle bridal collections, edited with crisp colors and clean cuts.',
    thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://www.youtube.com/watch?v=9L-e7KAsPz0',
    duration: '01:15',
    clientName: 'Aria Couture',
    location: 'Indiranagar, Bangalore',
    date: 'Feb 2026',
    fcpTags: ['Aesthetic Edit', 'Bridal Fashion', 'HDR Grading', 'Film Grain'],
    isFeatured: false
  },

  // WEDDING & PRE-WEDDING
  {
    id: 'w1',
    title: 'Royal Mysore Palace Wedding Film',
    category: 'Wedding & Pre-wedding',
    description: 'A grand traditional wedding film celebrating timeless rituals, majestic palace backdrops, and raw emotional moments.',
    thumbnail: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://www.youtube.com/watch?v=XzP_w8qM37A',
    duration: '05:40',
    clientName: 'Ananya & Rohan',
    location: 'Mysore Palace, Karnataka',
    date: 'Nov 2025',
    fcpTags: ['Royal Wedding', 'Heritage Film', 'Multicam Edit', 'Warm Glow'],
    isFeatured: true
  },
  {
    id: 'w2',
    title: 'Dreamy Nandi Hills Sunset Pre-Wedding',
    category: 'Wedding & Pre-wedding',
    description: 'Chasing the golden hour mist at Nandi Hills. A romantic pre-wedding cinematic masterpiece styled by Studio Matrix Films.',
    thumbnail: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://www.youtube.com/watch?v=H7S3MugnEuo',
    duration: '03:12',
    clientName: 'Meghana & Varun',
    location: 'Nandi Hills, Bangalore',
    date: 'Oct 2025',
    fcpTags: ['Pre-wedding', 'Golden Hour', 'Mist Shoot', 'Romantic Score'],
    isFeatured: true
  },
  {
    id: 'w3',
    title: 'Coorg Coffee Estate Pre-Wedding Story',
    category: 'Wedding & Pre-wedding',
    description: 'Bespoke couple shoot in the lush, misty coffee plantations of Coorg. Crisp editing focusing on candid nature walks.',
    thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://www.youtube.com/watch?v=kYJ0hZp_xzo',
    duration: '04:50',
    clientName: 'Shreya & Kariappa',
    location: 'Madikeri, Coorg',
    date: 'Jan 2026',
    fcpTags: ['Coffee Estate', 'Candid Story', 'Forest Drone', 'Earth Tone LUT'],
    isFeatured: false
  },
  {
    id: 'w4',
    title: 'Traditional Kerala Backwaters Wedding Teaser',
    category: 'Wedding & Pre-wedding',
    description: 'A serene traditional wedding on the banks of Vembanad Lake, capturing boat entries, oil lamps, and heavy temple music.',
    thumbnail: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://www.youtube.com/watch?v=bC6_g4t_zL4',
    duration: '02:45',
    clientName: 'Priya & Vignesh',
    location: 'Kumarakom, Kerala',
    date: 'Sep 2025',
    fcpTags: ['Backwaters', 'Traditional Teaser', 'Slow Motion', 'Cultural Beats'],
    isFeatured: false
  },
  {
    id: 'w5',
    title: 'Royal Heritage Jaipur Pre-Wedding shoot',
    category: 'Wedding & Pre-wedding',
    description: 'Stunning artistic narrative captured in Jaipur heritage havelis, styled like a luxury editorial magazine cover.',
    thumbnail: 'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://www.youtube.com/watch?v=wXhXpD3p0h8',
    duration: '03:15',
    clientName: 'Trisha & Rahul',
    location: 'Jaipur, Rajasthan',
    date: 'Dec 2025',
    fcpTags: ['Jaipur Palace', 'Editorial Couple', 'Anamorphic Crop', 'Deep Vintage Grade'],
    isFeatured: false
  },

  // CORPORATE
  {
    id: 'c1',
    title: 'Studio Matrix Corporate Headquarters Film',
    category: 'Corporate',
    description: 'High-end documentary-style profile highlighting architectural design, creative processes, and modern workspaces.',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://www.youtube.com/watch?v=Y8-L9H6L9Fk',
    duration: '03:20',
    clientName: 'Matrix Tech',
    location: 'Electronic City, Bangalore',
    date: 'Dec 2025',
    fcpTags: ['Corporate Video', 'Architectural Film', 'Lower Thirds', 'Clean Edits'],
    isFeatured: true
  },
  {
    id: 'c2',
    title: 'Wipro Leadership Summit Highlights',
    category: 'Corporate',
    description: 'Fast-paced corporate event recap featuring executive addresses, panel discussions, and premium networks.',
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://www.youtube.com/watch?v=9L-e7KAsPz0',
    duration: '02:30',
    clientName: 'Wipro India',
    location: 'Sarjapur, Bangalore',
    date: 'Nov 2025',
    fcpTags: ['Summit Highlights', 'Multicam Sync', 'Dynamic Lower Thirds'],
    isFeatured: false
  },

  // HOUSEWARMING & MATERNITY
  {
    id: 'hm1',
    title: 'Glow of Motherhood: Maternity in Meadows',
    category: 'Housewarming & Maternity',
    description: 'An ethereal sunset maternity celebration film capturing parent-to-be smiles in the botanical fields of Bangalore.',
    thumbnail: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://www.youtube.com/watch?v=x7Eicf8zFqM',
    duration: '02:40',
    clientName: 'Priya & Sandeep',
    location: 'Lalbagh Botanical, Bangalore',
    date: 'Dec 2025',
    fcpTags: ['Maternity Film', 'Golden hour', 'Soft lens focus', 'Warm Ambient Grade'],
    isFeatured: true
  },
  {
    id: 'hm2',
    title: 'Traditional Griha Pravesham Ceremony Film',
    category: 'Housewarming & Maternity',
    description: 'Blessing the new hearth. Emotional and colorful highlights of a traditional Kannada housewarming ritual.',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://youtu.be/a6UKeK_B978',
    duration: '03:50',
    clientName: 'Gowda Family',
    location: 'Rajajinagar, Bangalore',
    date: 'Feb 2026',
    fcpTags: ['Housewarming', 'Kannada Ritual', 'Family Documentary', 'Vibrant Grade'],
    isFeatured: false
  },

  // DJ NIGHTS
  {
    id: 'dj1',
    title: 'Oryza Neon Afterglow EDM Session',
    category: 'DJ Night',
    description: 'Electrifying visual recap of a massive club night, synced millisecond-perfectly with laser drops and heavy bass.',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://www.youtube.com/watch?v=9L-e7KAsPz0',
    duration: '01:45',
    clientName: 'Oryza Club',
    location: 'MG Road, Bangalore',
    date: 'Jan 2026',
    fcpTags: ['Beat Sync', 'Chromatic split', 'Laser glow boosting', 'EDM Teaser'],
    isFeatured: true
  },
  {
    id: 'dj2',
    title: 'Rhythmic Sangeet Night Dance Highlight',
    category: 'DJ Night',
    description: 'An action-packed dancing spectacular highlight edit from a grand royal sangeet gala in heritage palace.',
    thumbnail: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://www.youtube.com/watch?v=TzF7T3m_v50',
    duration: '02:20',
    clientName: 'Preethi & Sameer',
    location: 'Lalitha Mahal Palace, Mysore',
    date: 'Nov 2025',
    fcpTags: ['Sangeet', 'Bollywood Dance', 'Stage light bloom', 'Multi-Angle Sync'],
    isFeatured: false
  },

  // EDITING SAMPLES (FCP X SPECIALS)
  {
    id: 'ed1',
    title: 'Optical Flow: Butter-Smooth Slow-Mo',
    category: 'Editing Samples',
    description: 'An editing masterclass demonstrating FCP X Machine Learning Frame Blending for ultra high quality slow-motion.',
    thumbnail: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://www.youtube.com/watch?v=jW_T9vWpEio',
    duration: '03:15',
    clientName: 'Sagar Tutorial Lab',
    location: 'Bangalore Studio',
    date: 'Mar 2026',
    fcpTags: ['Optical Flow', 'Frame Blending', 'Retime Tool', 'Timeline Sync'],
    isFeatured: true
  }
];

export const SHOWCASE_VIDEOS: VideoItem[] = [
  ...BASE_SHOWCASE_VIDEOS,
  ...generateExtraWeddingVideos()
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Sandeep Gowda',
    role: 'Groom & Home Owner',
    content: 'Studio Matrix Films created absolute magic! They captured our wedding film and housewarming with stunning cinematic transitions and dreamy color grading.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    category: 'Wedding & Housewarming'
  },
  {
    id: 't2',
    name: 'Priyanka Sen',
    role: 'Marketing Director, Bio-Life',
    content: 'We hired Studio Matrix Films for our corporate brand launch film in Bangalore. Their clean edits, professional sound design, and timely delivery made them our go-to choice.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    category: 'Corporate'
  },
  {
    id: 't3',
    name: 'DJ Rohith',
    role: 'EDM Artist & Club Producer',
    content: 'Unbelievable work on our concert aftermovies! The beat mapping, transitions, and energy they bring out in the video is unmatched.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    category: 'DJ Night'
  }
];
