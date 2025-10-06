import { Account, Avatars, Client, Databases, ID, OAuthProvider, Query, Storage, Teams,   } from "react-native-appwrite"
import * as Linking from 'expo-linking'
import { openAuthSessionAsync } from 'expo-web-browser'
import { Platform } from "react-native"
import { ImagePickerAsset } from "expo-image-picker"
import { SignInData, SignUpData, UploadResult } from "@/utils/types"

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

export async function signUserIn(email:string, password:string, ){
    try {
        const session = await account.createEmailPasswordSession(email, password, );

        if(!session) throw new Error(' failed to create a session oops😞');
        return session;
    } catch (error) {
        console.error('Login error:', error);
    }
}
export async function signUserUp (email: string, password: string, name:string){
 try {
    const newUser = await account.create(
        ID.unique(),
        email,
        password,
        name
    );

    if(!newUser) throw new Error('something broke oops😞');

   const session = await  signUserIn(email, password);

   return {session, user: newUser};
 } catch (error) {
    console.error(error)
    throw error;
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

export async function uploadImage(image: string | ImagePickerAsset): Promise<string | null> {
    try {
        let file;

        if(typeof image === 'string') {
            const response = await fetch(image);
            const blob = await response.blob();

            file = new File([blob], `image_${Date.now()}.jpg`)
        }else{
            const response = await fetch(image.uri);
            const blob = await response.blob();

            file = new File([blob], `image_${Date.now()}.jpg`,{
                type: image.mimeType || 'image/jpeg'
            });
        }

        const uploadFile = await storage.createFile(
            config.storageCollectionId!,
            ID.unique(),
            file
        )

        return uploadFile.$id;

    } catch (error) {
        console.error('Error uploading image:', error);
    }
}

export async function uploadProperty(propertyData: propertyData): Promise<UploadResult> {
    try {
        if(!propertyData.name || !propertyData.agentId){
            return {
                success: false,
                error: 'Name and Agent ID are required'
            };
        }

        let imageId: string | null = null;

        if(propertyData.image){
            imageId = await uploadImage(propertyData.image);

            if(!imageId){
                return{
                    success: false,
                    error: 'Error uploading image'
                };
            }
        }

        const documentData = {
            name: propertyData.name,
            type: propertyData.type,
            description: propertyData.description,
            location: JSON.stringify(propertyData.location),
            price: parseFloat(propertyData.price) || 0,
            bedrooms: parseInt(propertyData.bedrooms) || 0,
            bathrooms: parseInt(propertyData.bathrooms) || 0,
            facilities: propertyData.facilities, 
            imageId: imageId || '',
            agentId: propertyData.agentId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          const response = await databases.createDocument(
            config.databaseId!,
            config.propertiesCollectionId!,
            ID.unique(),
            documentData
          );

          return {
            success: true,
            propertyId: response.$id
          }

    } catch (error) {
        console.error('Error uploading property:', error);
        return {
            success: false,
            error: 'Error uploading property'
        }
    }
}

export function getImageUrl(imageId: string){
    if(!imageId) return '';

    return `https://cloud.appwrite.io/v1/storage/buckets/${config.storageCollectionId}/files/${imageId}/view?project=${config.projectId}`
}

export async function deleteProperty(propertyId: string,
    imageId: string){
    try {
        if(imageId){
            await storage.deleteFile(
                config.storageCollectionId!,
                imageId
            )
        }
        await databases.deleteDocument(
            config.databaseId!,
            config.propertiesCollectionId!,
            propertyId
        );
        return {success: true};
    
        }catch (error) {
            console.error('Error deleting property:', error);
            return {success: false, error: 'Error deleting property'};
        }
    }

export async function updateProperty(propertyId: string, propertyData: Partial<PropertyData>, existingImageId?: string): Promise<UploadResult> {
    try {
        let imageId = existingImageId;

        if(propertyData.image){
            const newimageId = await uploadImage(propertyData.image);

            if(newimageId){
                if(existingImageId){
                    await storage.deleteFile(
                        config.storageCollectionId!,
                        existingImageId
                    )
                }

                imageId = newimageId;
            }
        }

        const updateData: any = {
            updateAt: new Date().toISOString()
        };

        if (propertyData.name) updateData.name = propertyData.name;
        if (propertyData.type) updateData.type = propertyData.type;
        if (propertyData.description) updateData.description = propertyData.description;
        if (propertyData.location) updateData.location = JSON.stringify(propertyData.location);
        if (propertyData.price) updateData.price = parseFloat(propertyData.price);
        if (propertyData.bedrooms) updateData.bedrooms = parseInt(propertyData.bedrooms);
        if (propertyData.bathrooms) updateData.bathrooms = parseInt(propertyData.bathrooms);
        if (propertyData.facilities) updateData.facilities = propertyData.facilities;
        if (imageId) updateData.imageId = imageId;

        const response = await databases.updateDocument(
            config.databaseId!,
            config.propertiesCollectionId!,
            propertyId,
            updateData
        )

        return {
            success: true,
            propertyId: response.$id
          };
    } catch (erro:any) {
        return {
            success: false,
            error:  'Failed to update property'
          };
    }
}
export async function getAgentWithProperties({agentId}: {agentId: string}){
try {
    if (!agentId || typeof agentId !== 'string' || agentId.trim() === '') 

    console.log('Fetching agent with ID:');
    
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