
import { MediaRepository } from '../domain/port/MediaRepository';
import { IUseCase } from '../../../common/use-case.interface';
import { Result } from '../../../common/domain/result';

export type ListMediaResponseDTO = {
  id: string;
  mimeType: string;
  size: number;
  originalName: string;
  createdAt: Date;
  thumbnail: string | null;
}[];

export class ListMediaUseCase implements IUseCase<void, Result<ListMediaResponseDTO>> {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async execute(): Promise<Result<ListMediaResponseDTO>> {
    try {
      const mediaList = await this.mediaRepository.findAll();
      const response = mediaList.map(media => media.toListResponse());
      return Result.ok<ListMediaResponseDTO>(response);
    } catch (error: any) {
      return Result.fail<ListMediaResponseDTO>(error.message);
    }
  }
}
