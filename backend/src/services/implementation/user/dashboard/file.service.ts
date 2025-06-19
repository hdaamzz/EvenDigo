import { IFileService } from '../../../../../src/services/interfaces/user/dashboard/IFile.service';
import { generateSecureImageUrl, uploadToCloudinarySecure } from '../../../../../src/utils/helpers';
import { injectable } from 'tsyringe';


export interface EventFileData {
  mainBannerUrl: string | null;
  promotionalImageUrl: string | null;
}

@injectable()
export class FileService implements IFileService {
  async processEventFiles(files: { [fieldname: string]: Express.Multer.File[] } | undefined): Promise<EventFileData> {
  let mainBannerUrl = null;
  let promotionalImageUrl = null;
  
  if (files) {      
    if (files.mainBanner && files.mainBanner[0]) {
      const mainBannerResult = await uploadToCloudinarySecure(files.mainBanner[0].path, 'events/banners');
      mainBannerUrl = generateSecureImageUrl(mainBannerResult.public_id);
    }
    
    if (files.promotionalImage && files.promotionalImage[0]) {
      const promoImageResult = await uploadToCloudinarySecure(files.promotionalImage[0].path, 'events/promotional');
      promotionalImageUrl = generateSecureImageUrl(promoImageResult.public_id);
    }
  }
  
  return {
    mainBannerUrl,
    promotionalImageUrl
  };
}
}