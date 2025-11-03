import { Account, Avatars, Client, Databases, ID, OAuthProvider, Query, Storage, Teams,   } from "react-native-appwrite"
import * as Linking from 'expo-linking'
import { openAuthSessionAsync } from 'expo-web-browser'
import { ImagePickerAsset } from "expo-image-picker"
import { PropertyData, UploadResult, Video } from "@/utils/types"
import { convertOffsetToTimes } from "framer-motion"
import { Alert } from "react-native"


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
  reelsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REELS_COLLECTION_ID,
  commentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID,
  bookingCollectionId: process.env.EXPO_PUBLIC_APPWRITE_BOOKING_COLLECTION_ID
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

        const fileForUpload = {
            name: file.name,
            type: file.type,
            size: file.size,
            uri: typeof image === 'string' ? image : image.uri
          };

        const uploadFile = await storage.createFile(
            config.storageCollectionId!,
            ID.unique(),
            fileForUpload
        )

        return uploadFile.$id;

    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
}


export async function uploadProperty(propertyData: PropertyData): Promise<UploadResult> {
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
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString()
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

export async function sendPasswordResetEmail(email: string) {
    try {
      // Replace with your actual password reset URL
      const resetUrl = 'https://yourapp.com/reset-password';
      await account.createRecovery(email, resetUrl);
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to send reset email');
    }
  }
  
  export async function completePasswordReset(
    userId: string, 
    secret: string, 
    newPassword: string
  ) {
    try {
      await account.updateRecovery(userId, secret, newPassword);
      return true;
    } catch (error: any) {
      console.error('Complete password reset error:', error);
      throw new Error(error.message || 'Failed to reset password');
    }
  }

  export async function uploadReel(videoUri: string, userId: string, username: string, description: string, location: string, price: string) {
    try {
        const videoFile = {
            name: `video_${Date.now()}.mp4`,
            type: 'video/mp4',
            uri: videoUri
        };

        const response = await storage.createFile(
            config.storageCollectionId!,
            ID.unique(),
            videoFile as any
        );

        if(!response || !response.$id){
            throw new Error('Failed to upload video');
        }

        const videoUrl = storage.getFileView(
            config.storageCollectionId!,
            response.$id
        );

        const video = await databases.createDocument(
            config.databaseId!,
            config.reelsCollectionId!,
            ID.unique(),
            {
                videoUrl: videoUrl.toString(),
                thumbnailUrl: '',
                userId,
                username,
                description,
                location,
                price: price ? parseInt(price) : 0,
                likes: 0,
                views: 0,
                $createdAt: new Date().toISOString()
            }
        );

        return video;

    } catch (error) {
        console.error('Error uploading video:', error);
        throw error;
    }
  }

  export async function getReels(limit: number = 10, offset: number = 0): Promise<Video[] | undefined> {
    try {
        const response = await databases.listDocuments(
            config.databaseId!,
            config.reelsCollectionId!,
            [
                Query.orderDesc('$createdAt'),
                Query.limit(limit),
                Query.offset(offset)
            ]
        );

        console.log("this is the response", response);

        return response.documents as unknown as Video[];
    } catch (error) {
        console.error('Error getting reels:', error);
    }
  }

  export async function incrementView(videoId: string, currentViews:number) {
    try {
        const response =await databases.updateDocument(
            config.databaseId!,
            config.reelsCollectionId!,
            videoId,
            {
                views: currentViews + 1
            }
        )
        return response;

    } catch (error) {
        console.error('Error incrementing views:', error);
    }
  }

  export async function toggleLike(videoId:string, currentLikes: number, increment: boolean) {
      try {
        const result = await databases.updateDocument(
            config.databaseId!,
            config.reelsCollectionId!,
            videoId,
            {
                likes: increment? currentLikes + 1 : currentLikes - 1
            }
            )

            return result;

      } catch (error) {
        console.error('Error toggling like:', error);
        throw error;
      }
  }


  export async function createBooking ({ propertyId, agentId, date, time  }: { propertyId: string, agentId: string, date: string, time: string}) {
    try {
        
        const user = await account.get();

        const bookingDate = convertToDateTime(date, time);

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
    
        const existingBookings = await databases.listDocuments(
            config.databaseId!,
            config.bookingCollectionId!,
            [
                Query.equal('propertyId', propertyId),
                // Query.equal('bookingTime', time),
                // Query.greaterThanEqual('bookingDate', startOfDay.toISOString()),
                // Query.lessThanEqual('bookingDate', endOfDay.toISOString()),
                // Query.equal('status', ['pending', 'confirmed', 'cancelled'])
            ]
        );
    
        if(existingBookings.total > 0){
            const exactProperty = existingBookings.documents.find(
                (booking: any) => booking.propertyId === propertyId
              );
              if (exactProperty) {
                throw new Error('You already have a booking for this property');
              }
        }
    
        const booking = await databases.createDocument(
            config.databaseId!,
            config.bookingCollectionId!,
            ID.unique(),
            {
                userId: user.$id,
                propertyId,
                agentId,
                bookingDate: bookingDate,
                bookingTime: time,
                status: 'pending',
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString()
            }
        )
    
        return booking
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }

  };

export async function getBookings(status?: string) {
    try {
      const user = await account.get();
  
      const queries = [
        Query.equal('userId', user.$id),
        Query.orderDesc('$createdAt')
      ];
  
      if (status && typeof status === 'string' && status.trim() !== '') {
        queries.push(Query.equal('status', status));
      }
  
      const bookings = await databases.listDocuments(
        config.databaseId!,
        config.bookingCollectionId!,
        queries
      );
  
      if (!bookings.documents || bookings.documents.length === 0) {
        return [];
      }
  
      // Extract unique property and agent IDs
      const propertyIds = [...new Set(bookings.documents.map((b: any) => b.propertyId))];
      const agentIds = [...new Set(bookings.documents.map((b: any) => b.agentId))];
  
      // Fetch all properties and agents in parallel
      const [propertiesData, agentsData] = await Promise.all([
        Promise.all(
          propertyIds.map((id) =>
            databases.getDocument(
              config.databaseId!,
              config.propertiesCollectionId!,
              id
            ).catch((err) => {
              console.error(`Error fetching property ${id}:`, err);
              return {
                $id: id,
                name: 'Property Unavailable',
                address: 'N/A',
                image: 'https://via.placeholder.com/400x300',
              };
            })
          )
        ),
        Promise.all(
          agentIds.map((id) =>
            databases.getDocument(
              config.databaseId!,
              config.agentsCollectionId!,
              id
            ).catch((err) => {
              console.error(`Error fetching agent ${id}:`, err);
              return {
                $id: id,
                name: 'Agent Unavailable',
                avatar: 'https://via.placeholder.com/100',
              };
            })
          )
        ),
      ]);
  
      // Create lookup maps
      const propertiesMap = new Map(propertiesData.map((p: any) => [p.$id, p]));
      const agentsMap = new Map(agentsData.map((a: any) => [a.$id, a]));
  
      // Combine booking data with property and agent details
      const bookingsWithDetails = bookings.documents.map((booking: any) => ({
        ...booking,
        property: propertiesMap.get(booking.propertyId),
        agent: agentsMap.get(booking.agentId),
      }));
  
      return bookingsWithDetails;
    } catch (error) {
      console.error('Error getting bookings:', error);    
      throw error;
    }
  }

  export async function updateBookingStatus(bookingId:string, status: string) {
      try {
        const booking = await databases.getDocument(
            config.databaseId!,
            config.bookingCollectionId!,
            bookingId, 
            {
                status,
                $updatedAt: new Date().toISOString()
            }
            
        );
        return booking;
      } catch (error) {
        console.error('Error updating booking:', error);
      }
  }

  export async function getAvailableTimeSlots(propertyId: string, date: string) {
      try {
        const timeSlots = [
            '09:00 AM', '10:00 AM', '11:00 AM', 
            '12:00 PM', '01:00 PM', '02:00 PM', 
            '03:00 PM', '04:00 PM', '05:00 PM'
        ];

        const existingSlots = await databases.listDocuments(
            config.databaseId!,
            config.bookingCollectionId!,
            [
                Query.equal('property', propertyId),
                Query.equal('bookingDate', date),
                Query.equal('status', '["pending", "confirmed", "cancelled"]')
            ]
        );

        const bookedSlots = existingSlots.documents.map((booking) => booking.bookingTime);

        const availableSlots = timeSlots.filter((slot) => !bookedSlots.includes(slot));

        return availableSlots;

      } catch (error) {
        console.error('Error getting available time slots:', error);
      }
  }

  export async function cancelBooking(bookingId: string) {
      try {
        const booking =await databases.updateDocument(
            config.databaseId!,
            config.bookingCollectionId!,
            bookingId,
            {
                status: 'cancelled',
                $updatedAt: new Date().toISOString()
            }
        )

        return  booking;
      } catch (error) {
        console.error('Error canceling booking:', error);
        throw error;
      }
  }

  export async function rescheduleBooking(bookingId: string, newDate: string, newTime: string) {
      try {
        const bookingTime = convertToDateTime(newDate, newTime);

        const booking = await databases.updateDocument(
            config.databaseId!,
            config.bookingCollectionId!,
            bookingId,{
                bookingDate: bookingTime,
                bookingTime: newTime,
                status: 'pending',
                $updatedAt: new Date().toISOString()
            }
        )
        return booking
      } catch (error) {
        console.error('Error rescheduling booking:', error);
        throw error;
      }
  }
  function convertToDateTime (dateString: string, timeString: string):string{
    const [time, period] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      const dateTime = new Date(dateString);
        dateTime.setHours(hours, minutes, 0, 0);

        return dateTime.toISOString();
  }