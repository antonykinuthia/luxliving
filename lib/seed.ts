import { ID } from "react-native-appwrite";
import { databases, config } from "./appwrite";

// Sample video URLs (replace with actual video URLs or use placeholder videos)
const videoUrls = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
];

// Sample thumbnail URLs
const thumbnailUrls = [
  "https://picsum.photos/seed/reel1/1080/1920",
  "https://picsum.photos/seed/reel2/1080/1920",
  "https://picsum.photos/seed/reel3/1080/1920",
  "https://picsum.photos/seed/reel4/1080/1920",
  "https://picsum.photos/seed/reel5/1080/1920",
  "https://picsum.photos/seed/reel6/1080/1920",
  "https://picsum.photos/seed/reel7/1080/1920",
  "https://picsum.photos/seed/reel8/1080/1920",
  "https://picsum.photos/seed/reel9/1080/1920",
  "https://picsum.photos/seed/reel10/1080/1920",
];

const usernames = [
  "PropertyAgent254", "HomeFinderKE", "KenyanHomes", "RealEstateProKE",
  "UrbanLivingNBO", "CoastalProperties", "LuxuryHomesKE", "AffordableHousesKE",
  "DreamHomeAgent", "PropertyGuruKE", "HomeHunterNBO", "EliteProperties",
  "PrimeRealtyKE", "ModernLivingKE", "PropertyShowcase"
];

const kenyanLocations = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi",
  "Kitale", "Nyeri", "Machakos", "Meru", "Lamu", "Kericho", "Kakamega",
  "Narok", "Embu", "Kilifi", "Kiambu", "Ruiru", "Karen"
];

const propertyDescriptions = [
  "Stunning 3BR apartment with ocean view 🌊",
  "Modern family home in gated community 🏡",
  "Luxury penthouse with rooftop terrace ✨",
  "Cozy studio perfect for young professionals 💼",
  "Spacious villa with private pool 🏊",
  "Prime commercial property in CBD 🏢",
  "Beautiful townhouse with garden 🌺",
  "Affordable starter home in quiet neighborhood 🏠",
  "Executive apartment with gym facilities 💪",
  "Beachfront property with private access 🏖️",
  "Newly renovated condo in prime location 🔑",
  "Investment opportunity - rental units 💰",
  "Eco-friendly home with solar panels ☀️",
  "Duplex with amazing city views 🌆",
  "Serene countryside retreat 🌳",
  "Student-friendly apartments near university 🎓",
  "Gated estate with 24/7 security 🔒",
  "Contemporary design with smart home features 📱",
  "Spacious family home with large yard 🎪",
  "Prime location near shopping malls 🛍️"
];

async function seedReels() {
  try {
    // Clear existing reels
    const existingReels = await databases.listDocuments(
      config.databaseId!,
      config.reelsCollectionId!
    );
    
    for (const doc of existingReels.documents) {
      await databases.deleteDocument(
        config.databaseId!,
        config.reelsCollectionId!,
        doc.$id
      );
    }
    console.log("Cleared all existing reels.");

    // Create 20 sample reels
    const reels = [];
    for (let i = 0; i < 20; i++) {
      const videoUrl = videoUrls[i % videoUrls.length];
      const thumbnailUrl = thumbnailUrls[i % thumbnailUrls.length];
      const username = usernames[i % usernames.length];
      const location = kenyanLocations[Math.floor(Math.random() * kenyanLocations.length)];
      const description = propertyDescriptions[i % propertyDescriptions.length];
      
      // Generate random price between 50k and 50M KES
      const price = Math.floor(Math.random() * (50000000 - 50000) + 50000);
      
      // Generate random likes and views
      const likes = Math.floor(Math.random() * 10000);
      const views = Math.floor(Math.random() * 50000) + likes; // Views should be >= likes
      
      const reel = await databases.createDocument(
        config.databaseId!,
        config.reelsCollectionId!,
        ID.unique(),
        {
          userId: `user_${Math.floor(Math.random() * 10) + 1}`, // Random user ID
          username: username,
          description: description,
          videoUrl: videoUrl,
          thumbnailUrl: thumbnailUrl,
          location: location,
          price: price,
          likes: likes,
          views: views,
        }
      );
      
      reels.push(reel);
      console.log(`Seeded reel ${i + 1}/20: ${username} - ${location}`);
    }

    console.log(`\n✅ Successfully seeded ${reels.length} reels!`);
    
    // Display sample data
    const sampleReel = reels[0];
    console.log("\nSample Reel Data:");
    console.log({
      username: sampleReel.username,
      location: sampleReel.location,
      price: `KES ${sampleReel.price.toLocaleString()}`,
      likes: sampleReel.likes,
      views: sampleReel.views,
      description: sampleReel.description
    });

    return reels;
  } catch (error) {
    console.error("❌ Error seeding reels:", error);
    throw error;
  }
}

export default seedReels;

// Optional: Function to add more reels without clearing
export async function addMoreReels(count: number = 10) {
  try {
    const reels = [];
    for (let i = 0; i < count; i++) {
      const videoUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)];
      const thumbnailUrl = thumbnailUrls[Math.floor(Math.random() * thumbnailUrls.length)];
      const username = usernames[Math.floor(Math.random() * usernames.length)];
      const location = kenyanLocations[Math.floor(Math.random() * kenyanLocations.length)];
      const description = propertyDescriptions[Math.floor(Math.random() * propertyDescriptions.length)];
      
      const price = Math.floor(Math.random() * (50000000 - 50000) + 50000);
      const likes = Math.floor(Math.random() * 10000);
      const views = Math.floor(Math.random() * 50000) + likes;
      
      const reel = await databases.createDocument(
        config.databaseId!,
        config.reelsCollectionId!,
        ID.unique(),
        {
          userId: `user_${Math.floor(Math.random() * 10) + 1}`,
          username: username,
          description: description,
          videoUrl: videoUrl,
          thumbnailUrl: thumbnailUrl,
          location: location,
          price: price,
          likes: likes,
          views: views,
         
        }
      );
      
      reels.push(reel);
      console.log(`Added reel ${i + 1}/${count}`);
    }

    console.log(`✅ Successfully added ${reels.length} more reels!`);
    return reels;
  } catch (error) {
    console.error("❌ Error adding reels:", error);
    throw error;
  }
}