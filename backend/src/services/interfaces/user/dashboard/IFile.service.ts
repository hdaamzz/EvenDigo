export interface EventFileData {
  mainBannerUrl: string | null;
  promotionalImageUrl: string | null;
  mainBannerPublicId: string | null;
  promotionalImagePublicId: string | null;
}

export interface IFileService {
  processEventFiles(
    files: { [fieldname: string]: Express.Multer.File[] } | undefined
  ): Promise<EventFileData>;

  generateFreshSecureUrl(
    publicId: string,
    expirationHours?: number
  ): string;


  generateMultipleSecureUrls(
    publicIds: string[],
    expirationHours?: number
  ): string[];
}
