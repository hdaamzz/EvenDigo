import { IFileService } from '../../../../../src/services/interfaces/user/dashboard/IFile.service';
import { uploadToCloudinaryPrivate, generateSecurePrivateUrl } from '../../../../../src/utils/helpers';
import { injectable } from 'tsyringe';

export interface EventFileData {
  mainBannerUrl: string | null;
  promotionalImageUrl: string | null;
  mainBannerPublicId: string | null;
  promotionalImagePublicId: string | null;
}

@injectable()
export class FileService implements IFileService {
  async processEventFiles(files: { [fieldname: string]: Express.Multer.File[] } | undefined): Promise<EventFileData> {
    let mainBannerUrl = null;
    let promotionalImageUrl = null;
    let mainBannerPublicId = null;
    let promotionalImagePublicId = null;
    
    if (files) {      
      if (files.mainBanner && files.mainBanner[0]) {
        const mainBannerResult = await uploadToCloudinaryPrivate(files.mainBanner[0].path);
        mainBannerPublicId = mainBannerResult.public_id;
        mainBannerUrl = generateSecurePrivateUrl(mainBannerResult.public_id, 24);
      }
      
      if (files.promotionalImage && files.promotionalImage[0]) {
        const promoImageResult = await uploadToCloudinaryPrivate(files.promotionalImage[0].path);
        promotionalImagePublicId = promoImageResult.public_id;
        promotionalImageUrl = generateSecurePrivateUrl(promoImageResult.public_id, 24);
      }
    }
    
    return {
      mainBannerUrl,
      promotionalImageUrl,
      mainBannerPublicId,
      promotionalImagePublicId
    };
  }

  generateFreshSecureUrl(publicId: string, expirationHours: number = 24): string {
    return generateSecurePrivateUrl(publicId, expirationHours);
  }

  generateMultipleSecureUrls(publicIds: string[], expirationHours: number = 24): string[] {
    return publicIds.map(publicId => generateSecurePrivateUrl(publicId, expirationHours));
  }
}