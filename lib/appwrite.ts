import { Account, Avatars, Client, Databases, ID, OAuthProvider, Query, Storage, Teams, } from "react-native-appwrite"
import * as Linking from 'expo-linking'
import { openAuthSessionAsync } from 'expo-web-browser'

export const config = {
  platform : 'com.luxliving.luxliving',
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  galleriesCollectionId:process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,
  reviewsCollectionId:process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID,
  agentsCollectionId:process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID,
  propertiesCollectionId:process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID,
  chatsCollectionId:process.env.EXPO_PUBLIC_APPWRITE_CHATS_COLLECTION_ID,
  messagesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID,
  storageCollectionId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_BUCKET_COLLECTION_ID,
  notificationsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID,
}

export const client = new Client();

client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform!);


export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);
export const teams = new Teams(client);

export const DATABASE_ID = config.databaseId!;
export const projectId = config.projectId!;
export const storage = new Storage(client);
export const messages = config.messagesCollectionId!;
export const chats = config.chatsCollectionId!;
export const storageBucket = config.storageCollectionId!

export async function login() {
    try {
        const redirectUri = Linking.createURL('/');

        const response = await account.createOAuth2Token(OAuthProvider.Google, redirectUri);
        if(!response) throw new Error('something went wrong');

        const  browserResult = await openAuthSessionAsync(
            response.toString(),
            redirectUri
        )
        
        if (browserResult.type !== 'success') throw new Error ('something broke 💔');

        const url = new URL(browserResult.url);

        const secret = url.searchParams.get('secret')?.toString();
        const userId = url.searchParams.get('userId')?.toString();

        if(!secret || !userId) throw new Error('Something went wrong with the session');

        
        const session = await account.createSession(secret, userId);

        if(!session) throw new Error('You are cooked You failed to create a session');

        return true;

    } catch (error) {
        console.error(error)
        return false
    }
}

export async function logout() {
    try{
     await account.deleteSession('current');
     return true;
    }catch(error) {
       console.error(error);
       return false;
    }
}


export async function getUser(){
    try {
        const response = await account.get();

        if(response.$id) {
            const userAvatar = avatar.getInitials(response.name);

            return{
                ...response,
                avatar: userAvatar.toString(),
            }
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}
export async function getLatestProperties(){
    try {
        const  response = await databases.listDocuments(config.databaseId!, 
            config.propertiesCollectionId!,
            [Query.orderAsc('$createdAt'), Query.limit(5)]);

            return response.documents;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getProperties({filter, limit, query}: {filter?: string,
    query: string, 
    limit?: number}) {
        try{
         const buildQuery = [Query.orderDesc('$createdAt')];

         if(filter && filter !== 'All')  {
             buildQuery.push(Query.equal('type', filter));
         }

         if(query) {
            buildQuery.push(
                Query.or([
                    Query.search('name', query),
                    Query.search('description', query),
                    Query.search('location', query),
                    Query.search('type', query)
                ])
            )
         }

         if(limit) buildQuery.push(Query.limit(limit));

         const result = await databases.listDocuments(
            config.databaseId!,
            config.propertiesCollectionId!,
            buildQuery,
        )
    
        return result.documents;
    
        }catch(error) {
            console.error(error);
            return [];
        }

}
export async function getPropertyById({id}: { id: string}){
    try {
     const result = await databases.getDocument(
        config.databaseId!,
        config.propertiesCollectionId!,
        id
     );
     return result;
    } catch(error){
        console.error(error)
        return null;
    }
}

export interface PropertyUpload {
    name: string;
    type: string;
    description: string;
    location: string;
    price: number;
    area: number;
    bedrooms: number;
    bathrooms: number;
    facilities: string[];
    image: string;
    agentId: string;
  }

export async function UploadProperty(property: PropertyUpload) {
    try {
        const result = await databases.createDocument(
            config.databaseId!,
            config.propertiesCollectionId!,
            ID.unique(),
            {
                name: property.name,
                type: property.type,
                description: property.description,
                location: property.location,
                price: property.price,
                area: property.area,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                facilities: property.facilities,
                image: property.image,
                agent: property.agentId,
                rating: 5,
                reviews: [],
                gallery: []
            }
        );
        return {
            success: true,
            property: result
        }
        
    } catch (error) {
        console.error('Error uploading property',error);
        return null;
    }
}
export function validatePropertyData(data: Partial<PropertyUpload>): { 
    isValid: boolean; 
    errors: string[] 
  } {
    const errors: string[] = [];
  
    if (!data.name?.trim()) errors.push("Property name is required");
    if (!data.type?.trim()) errors.push("Property type is required");
    if (!data.description?.trim()) errors.push("Description is required");
    if (!data.location?.trim()) errors.push("Location is required");
    if (!data.price || data.price <= 0) errors.push("Valid price is required");
    if (!data?.area || data.area <= 0) errors.push("Valid area is required");
    if (!data?.bedrooms || data.bedrooms < 0) errors.push("Valid number of bedrooms is required");
    if (!data?.bathrooms || data.bathrooms < 0) errors.push("Valid number of bathrooms is required");
    if (!data.image?.trim()) errors.push("Property image is required");
    if (!data.agentId?.trim()) errors.push("Agent ID is required");
    if (!Array.isArray(data.facilities) || data.facilities.length === 0) {
      errors.push("At least one facility is required");
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  }

export async function getAgentWithProperties({agentId}: {agentId: string}){
try {
    if (!agentId || typeof agentId !== 'string' || agentId.trim() === '') 

    console.log('Fetching agent with ID:', agentId);
    
    const agent = await databases.getDocument(
        config.databaseId!,
        config.agentsCollectionId!,
        agentId
    )

    const properties = await databases.listDocuments(
        config.databaseId!,
        config.propertiesCollectionId!,
        [
            Query.equal('agent', agentId)
        ])

        return {
            agent,
            properties: properties.documents,
            propertiesCount: properties.total
        }
} catch (error) {
    console.error('Error getting agent with properties',error);
    return null;
}
}