import { EventFileData } from "../../../../services/implementation/user/dashboard/file.service";

export interface IFileService {
  processEventFiles(files: { [fieldname: string]: Express.Multer.File[] } | undefined): Promise<EventFileData>;
}