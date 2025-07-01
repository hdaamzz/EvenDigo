import { IFileService } from '../../../../services/interfaces/user/dashboard/IFile.service';
import { uploadToCloudinary } from '../../../../utils/helpers';
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
        const mainBannerResult = await uploadToCloudinary(files.mainBanner[0].path);
        mainBannerUrl = mainBannerResult.secure_url;
      }
      
      if (files.promotionalImage && files.promotionalImage[0]) {
        const promoImageResult = await uploadToCloudinary(files.promotionalImage[0].path);
        promotionalImageUrl = promoImageResult.secure_url;
      }
    }
    
    return {
      mainBannerUrl,
      promotionalImageUrl
    };
  }
}