
import { MediaRepository } from '../domain/port/MediaRepository';
import { MediaId } from '../domain/valueObject/Media';
import { IUseCase } from '../../../common/use-case.interface';
import { Result } from '../../../common/domain/result';

export class DeleteMedia implements IUseCase<string, Result<void>> {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      const mediaId = MediaId.of(id);
      const media = await this.mediaRepository.findById(mediaId);

      if (!media) {
        return Result.fail<void>('Media not found');
      }

      await this.mediaRepository.delete(mediaId);
      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
