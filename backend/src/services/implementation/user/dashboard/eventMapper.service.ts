import { Schema } from 'mongoose';
import { injectable } from 'tsyringe';
import { EventDocument } from '../../../../models/interfaces/event.interface';
import { EventFileData } from '../../../../services/interfaces/user/dashboard/IFile.service';


@injectable()
export class EventMapper {
  mapCreateRequestToEventData(
    requestBody: any, 
    userId: Schema.Types.ObjectId | string,
    fileData: EventFileData
  ): Partial<EventDocument> {
    return {
      ...requestBody,
      user_id: userId,
      mainBanner: fileData.mainBannerUrl,
      promotionalImage: fileData.promotionalImageUrl,
      ageRestriction: requestBody.ageRestriction === 'Yes',
      tickets: typeof requestBody.tickets === 'string' 
        ? JSON.parse(requestBody.tickets) 
        : requestBody.tickets,
      startDate: new Date(requestBody.startDate),
      endingDate: new Date(requestBody.endingDate)
    };
  }

  mapUpdateRequestToEventData(
    requestBody: any,
    fileData: EventFileData
  ): Partial<EventDocument> {
    const updateData: Partial<EventDocument> = { ...requestBody };
    
    if (fileData.mainBannerUrl) {
      updateData.mainBanner = fileData.mainBannerUrl;
    }
    
    if (fileData.promotionalImageUrl) {
      updateData.promotionalImage = fileData.promotionalImageUrl;
    }
    
    if (updateData.ageRestriction) {
      updateData.ageRestriction = updateData.ageRestriction === true;
    }
    
    if (updateData.tickets && typeof updateData.tickets === 'string') {
      updateData.tickets = JSON.parse(updateData.tickets);
    }
    
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    
    if (updateData.endingDate) {
      updateData.endingDate = new Date(updateData.endingDate);
    }
    
    return updateData;
  }
}