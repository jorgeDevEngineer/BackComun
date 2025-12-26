
import { MediaRepository } from '../domain/port/MediaRepository';
import { Media } from '../domain/entity/Media';
import { MediaId } from '../domain/valueObject/Media';
import { IUseCase } from '../../../common/use-case.interface';
import { Result } from '../../../common/domain/result';

export type GetMediaResponse = { media: Media; file: Buffer };

export class GetMedia implements IUseCase<string, Result<GetMediaResponse>> {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async execute(id: string): Promise<Result<GetMediaResponse>> {
    try {
      const mediaId = MediaId.of(id);
      const media = await this.mediaRepository.findById(mediaId);

      if (!media) {
        return Result.fail<GetMediaResponse>('Media not found');
      }

      const response = { media, file: media.properties().data };
      return Result.ok<GetMediaResponse>(response);
    } catch (error: any) {
      return Result.fail<GetMediaResponse>(error.message);
    }
  }
}
