const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Stay = require('./models/Stay');

dotenv.config();

// Premium Coorg Homestays data from HolidayMonk website
const coorgHomestays = [
  {
    name: "Yana's Homestay",
    location: "Coorg, Karnataka",
    destination: "Coorg",
    type: "Homestay",
    price: "₹3,500/night",
    pricePerNight: 3500,
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&h=600&fit=crop"
    ],
    description: "Our homestay is well known for hospitality and exotic food. There are amazing places to visit around like Irpu Falls, River water rafting, Waynad, Nagarahole wildlife sanctuary. Come and indulge yourself in beauty of Coorg!!",
    amenities: ["WiFi", "Home-cooked Meals", "Parking", "Nature Walks", "Coffee Plantation", "River Rafting", "Wildlife Sanctuary Access"],
    rating: 5.0,
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    address: "Nera Irpu Falls, Manchalli village and post, Kutta, S.Coorg, Coorg, Karnataka, India, 571250",
    contactInfo: {
      phone: "+91-XXXXXXXXXX",
      email: "info@holidaymonk.com"
    },
    isPremium: true
  },
  {
    name: "Coorg Karishma",
    location: "Coorg, Karnataka",
    destination: "Coorg",
    type: "Homestay",
    price: "₹4,200/night",
    pricePerNight: 4200,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop"
    ],
    description: "Coorg (also known as Kodagu) is a place said to haunt you forever with its timeless beauty. It is popularly dubbed as 'Southern Kashmir' and 'Scotland of India'. Experience authentic Kodava culture and hospitality in this premium homestay.",
    amenities: ["WiFi", "Traditional Cuisine", "Parking", "Garden", "Coffee Estate", "Cultural Experience", "Mountain Views"],
    rating: 4.8,
    guests: 8,
    bedrooms: 4,
    bathrooms: 3,
    address: "Coorg, Karnataka, India",
    contactInfo: {
      phone: "+91-XXXXXXXXXX",
      email: "info@holidaymonk.com"
    },
    isPremium: true
  },
  {
    name: "Hinterland Homestay",
    location: "Coorg, Karnataka",
    destination: "Coorg",
    type: "Homestay",
    price: "₹3,800/night",
    pricePerNight: 3800,
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop"
    ],
    description: "A Home Away Home!! Hinterland homestay located in the beautiful and lush foot hills of Brahmagiri. Comes close to experience the Kodava culture. Amidst nature, all it takes is one visit to this extraordinary land to leave a part of your soul behind.",
    amenities: ["WiFi", "Home-cooked Meals", "Parking", "Nature Trails", "Coffee Plantation", "Mountain Views", "Bird Watching"],
    rating: 4.7,
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    address: "Brahmagiri Foothills, Coorg, Karnataka, India",
    contactInfo: {
      phone: "+91-XXXXXXXXXX",
      email: "info@holidaymonk.com"
    },
    isPremium: true
  },
  {
    name: "Coorg Hallimane",
    location: "Coorg, Karnataka",
    destination: "Coorg",
    type: "Homestay",
    price: "₹4,500/night",
    pricePerNight: 4500,
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop"
    ],
    description: "Coorg Hallimane is the Homestay with Resort facility and recreational facilities. This is the first and only water park resort in Coorg. This is situated in foot hill of Koodlur mountain range, 3 kms from Kushalnagar town. Coorg Hallimane consists of eco-friendly double bed rooms decorated interior and exterior by naturally available waste forest resource.",
    amenities: ["WiFi", "Water Park", "Parking", "Eco-friendly Rooms", "Recreational Facilities", "Mountain Views", "Resort Amenities"],
    rating: 4.6,
    guests: 10,
    bedrooms: 5,
    bathrooms: 4,
    address: "Koodlur Mountain Range, 3 kms from Kushalnagar, Coorg, Karnataka, India",
    contactInfo: {
      phone: "+91-XXXXXXXXXX",
      email: "info@holidaymonk.com"
    },
    isPremium: true
  },
  {
    name: "Sweet Land Estate Stay",
    location: "Coorg, Karnataka",
    destination: "Coorg",
    type: "Homestay",
    price: "₹3,200/night",
    pricePerNight: 3200,
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop"
    ],
    description: "Sweet Land offers Gracious blend of warm hospitality and quality furnishing resides at the stay home room. Independent and well furnished with full amenities which includes TV, Kitchen and common sitout. Sip coffee made in the tradition style that brings out its subtle and rich flavours and you will know why the place is special.",
    amenities: ["WiFi", "TV", "Kitchen", "Parking", "Common Sitout", "Traditional Coffee", "Estate Views"],
    rating: 4.5,
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    address: "Coorg, Karnataka, India",
    contactInfo: {
      phone: "+91-XXXXXXXXXX",
      email: "info@holidaymonk.com"
    },
    isPremium: true
  },
  {
    name: "Jagale Homestay",
    location: "Coorg, Karnataka",
    destination: "Coorg",
    type: "Homestay",
    price: "₹3,600/night",
    pricePerNight: 3600,
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"
    ],
    description: "Come to Coorg and you will be transported in time to a place of old world charm and hospitality, to a place so beautiful that it will take your breath away. To enjoy the best of what Coorg has to offer just come over to Jagale Homestay. Nestled amidst lush green coffee plantations that border the Nagarahole forest in south Coorg.",
    amenities: ["WiFi", "Home-cooked Meals", "Parking", "Coffee Plantation", "Forest Access", "Wildlife Viewing", "Nature Walks"],
    rating: 4.7,
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    address: "South Coorg, bordering Nagarahole Forest, Karnataka, India",
    contactInfo: {
      phone: "+91-XXXXXXXXXX",
      email: "info@holidaymonk.com"
    },
    isPremium: true
  },
  {
    name: "Coffee Camp",
    location: "Coorg, Karnataka",
    destination: "Coorg",
    type: "Homestay",
    price: "₹2,800/night",
    pricePerNight: 2800,
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop"
    ],
    description: "Escape to the peace and tranquillity of Coffee Camp, nestled amidst lush coffee estate. Coffee Camp is the perfect place to unwind and take in all that nature has to offer. Estate walk, bird watching and a visit to the local river are some of the activities on offer…all that and a breath of fresh air!!",
    amenities: ["WiFi", "Estate Walks", "Parking", "Bird Watching", "River Access", "Coffee Plantation", "Nature Experience"],
    rating: 4.5,
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    address: "Coffee Estate, Coorg, Karnataka, India",
    contactInfo: {
      phone: "+91-XXXXXXXXXX",
      email: "info@holidaymonk.com"
    },
    isPremium: true
  },
  {
    name: "Nava Green Homestay",
    location: "Coorg, Karnataka",
    destination: "Coorg",
    type: "Homestay",
    price: "₹3,400/night",
    pricePerNight: 3400,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop"
    ],
    description: "The home stay in a coffee estate with mere harangi rivers surrounding the place Navagreen is homestay located in kodagu district in Karnataka in India. Homestay is in a coffee estate bordering the backwaters of harangi Dam on Harangi River The river itself is a main stream most of the year.",
    amenities: ["WiFi", "River Views", "Parking", "Coffee Estate", "Dam Backwaters", "Fishing", "Boating"],
    rating: 4.6,
    guests: 5,
    bedrooms: 2,
    bathrooms: 2,
    address: "Harangi Dam Backwaters, Kodagu District, Karnataka, India",
    contactInfo: {
      phone: "+91-XXXXXXXXXX",
      email: "info@holidaymonk.com"
    },
    isPremium: true
  },
  {
    name: "Ganesh Estate Stay",
    location: "Coorg, Karnataka",
    destination: "Coorg",
    type: "Homestay",
    price: "₹3,900/night",
    pricePerNight: 3900,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"
    ],
    description: "Ganesh Estate homestay, A Holiday Destination which makes Your Stay amazing and un-forgetable. Located at just 3kms minutes drive from Madikeri Town. A Best in Class Estate Homestay, A Unique place surrounded with Coffee and almost all type of spice plantation. Ganesh estate is for Nature Lovers and a very delicious coorg food we Provide.",
    amenities: ["WiFi", "Traditional Coorg Food", "Parking", "Coffee Plantation", "Spice Plantation", "Nature Views", "Close to Madikeri"],
    rating: 4.8,
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    address: "3 kms from Madikeri Town, Coorg, Karnataka, India",
    contactInfo: {
      phone: "+91-XXXXXXXXXX",
      email: "info@holidaymonk.com"
    },
    isPremium: true
  },
  {
    name: "Raksh Cottage",
    location: "Coorg, Karnataka",
    destination: "Coorg",
    type: "Homestay",
    price: "₹4,000/night",
    pricePerNight: 4000,
    image: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop"
    ],
    description: "Get away from the stressful and insane life of the city. Recharge yourself with the purest of oxygen in an independent cottage nestled amidst coffee estates of coorg, overlooking enchanting hills that offers nirvana, combination of wilderness, solitude and luxurious comfort. Experience the warm, pristine, homely atmosphere with all the amenities.",
    amenities: ["WiFi", "Independent Cottage", "Parking", "Coffee Estate", "Hill Views", "Luxury Comfort", "Privacy"],
    rating: 4.7,
    guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    address: "Coffee Estates, Coorg, Karnataka, India",
    contactInfo: {
      phone: "+91-XXXXXXXXXX",
      email: "info@holidaymonk.com"
    },
    isPremium: true
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startup-village-county';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed homestays
const seedHomestays = async () => {
  try {
    await connectDB();
    
    // Clear existing Coorg homestays (optional - comment out if you want to keep existing)
    // await Stay.deleteMany({ destination: 'Coorg' });
    // console.log('🗑️  Cleared existing Coorg homestays');
    
    // Check if homestays already exist
    const existingCount = await Stay.countDocuments({ destination: 'Coorg', isPremium: true });
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing premium Coorg homestays. Skipping seed to avoid duplicates.`);
      console.log('💡 To re-seed, delete existing homestays first or modify the script.');
      process.exit(0);
    }
    
    // Insert homestays
    const inserted = await Stay.insertMany(coorgHomestays);
    console.log(`✅ Successfully inserted ${inserted.length} premium Coorg homestays`);
    
    // Display summary
    console.log('\n📋 Summary of inserted homestays:');
    inserted.forEach((stay, index) => {
      console.log(`${index + 1}. ${stay.name} - ${stay.price} (Rating: ${stay.rating})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding homestays:', error);
    process.exit(1);
  }
};

// Run the seed function
seedHomestays();

