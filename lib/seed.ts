import { ID } from "react-native-appwrite";
import { databases, config } from "./appwrite";
import {
  agentImages,
  galleryImages,
  propertiesImages,
  reviewImages,
} from "./data";

const COLLECTIONS = {
  AGENT: config.agentsCollectionId,
  REVIEWS: config.reviewsCollectionId,
  GALLERY: config.galleriesCollectionId,
  PROPERTY: config.propertiesCollectionId,
};

const propertyTypes = [
  "House", "Townhouse", "Condo", "Duplex", "Studio", "Villa", "Apartment", "Rental","Others"
];

const agentTypes = ["Agent", "Broker", "Developer","Broker", "Others"];

const facilities = ["Parking", "Wifi", "Others"];

const kenyanLocations = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", 
  "Kitale", "Garissa", "Nyeri", "Machakos", "Meru", "Lamu", "Kericho", 
  "Kakamega", "Narok", "Embu", "Moyale", "Isiolo", "Migori"
];

const typeOf = ["Sale", "Rental"];

function getRandomSubset<T>(array: T[], minItems: number, maxItems: number) {
  const subsetSize = Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;
  return [...array].sort(() => 0.5 - Math.random()).slice(0, subsetSize);
}

async function seed() {
  try {
    for (const key in COLLECTIONS) {
      const collectionId = COLLECTIONS[key as keyof typeof COLLECTIONS];
      const documents = await databases.listDocuments(config.databaseId!, collectionId!);
      for (const doc of documents.documents) {
        await databases.deleteDocument(config.databaseId!, collectionId!, doc.$id);
      }
    }
    console.log("Cleared all existing data.");

    const agents = [];
    for (let i = 1; i <= 5; i++) {
      const agent = await databases.createDocument(
        config.databaseId!,
        COLLECTIONS.AGENT!,
        ID.unique(),
        {
          name: `Agent ${i}`,
          email: `agent${i}@example.com`,
          type: agentTypes[Math.floor(Math.random() * agentTypes.length)],
          avatar: agentImages[Math.floor(Math.random() * agentImages.length)],
        }
      );
      agents.push(agent);
    }
    console.log(`Seeded ${agents.length} agents.`);

    const reviews = [];
    for (let i = 1; i <= 20; i++) {
      const review = await databases.createDocument(
        config.databaseId!,
        COLLECTIONS.REVIEWS!,
        ID.unique(),
        {
          name: `Reviewer ${i}`,
          avatar: reviewImages[Math.floor(Math.random() * reviewImages.length)],
          review: `This is a review by Reviewer ${i}.`,
          rating: Math.floor(Math.random() * 5) + 1,
        }
      );
      reviews.push(review);
    }
    console.log(`Seeded ${reviews.length} reviews.`);

    const galleries = [];
    for (const image of galleryImages) {
      const gallery = await databases.createDocument(
        config.databaseId!,
        COLLECTIONS.GALLERY!,
        ID.unique(),
        { image }
      );
      galleries.push(gallery);
    }
    console.log(`Seeded ${galleries.length} galleries.`);

    for (let i = 1; i <= 20; i++) {
      const assignedAgent = agents[Math.floor(Math.random() * agents.length)];
      const assignedReviews = getRandomSubset(reviews, 5, 7);
      const assignedGalleries = getRandomSubset(galleries, 3, 8);
      const selectedFacilities = facilities.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * facilities.length) + 1);
      const image = propertiesImages.length - 1 >= i ? propertiesImages[i] : propertiesImages[Math.floor(Math.random() * propertiesImages.length)];
      
      const property = await databases.createDocument(
        config.databaseId!,
        COLLECTIONS.PROPERTY!,
        ID.unique(),
        {
          name: `Property ${i}`,
          type: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
          description: `This is the description for Property ${i}.`,
          // address: `123 Property Street, City ${i}`,
          location: kenyanLocations[Math.floor(Math.random() * kenyanLocations.length)],
          price: Math.floor(Math.random() * 9000) + 1000,
          area: Math.floor(Math.random() * 3000) + 500,
          bedrooms: Math.floor(Math.random() * 5) + 1,
          bathrooms: Math.floor(Math.random() * 5) + 1,
          rating: Math.floor(Math.random() * 5) + 1,
          facilities: selectedFacilities,
          image: image,
          agent: assignedAgent.$id,
          reviews: assignedReviews.map((review) => review.$id),
          gallery: assignedGalleries.map((gallery) => gallery.$id),
        }
      );
      const properties = await databases.listDocuments(config.databaseId!, COLLECTIONS.PROPERTY!);
      console.log(properties);
      console.log(`Seeded property: ${property.name}`);
    }

    console.log("Data seeding completed.");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

export default seed;
