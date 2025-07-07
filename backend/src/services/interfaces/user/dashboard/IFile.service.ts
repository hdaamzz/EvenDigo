
export interface IFileService {
  processEventFiles(files: { [fieldname: string]: Express.Multer.File[] } | undefined): Promise<EventFileData>;
}


export interface EventFileData {
  mainBannerUrl: string | null;
  promotionalImageUrl: string | null;
}