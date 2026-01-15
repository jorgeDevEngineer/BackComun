
import { IStorageService } from '../domain/port/IStorageService';
import { Media } from '../domain/entity/Media';
import { IMediaRepository } from '../domain/port/IMediaRepository';
import { Result } from '../../shared/Type Helpers/result';
import { IHandler } from '../../shared/IHandler';
import { Injectable } from '@nestjs/common';
import { AuthorId, MediaCategory, MediaName, MediaUrl, MediaMimeType, MediaSize, MediaFormat } from '../domain/value-object/MediaId';
import * as path from 'path';
import { ITokenProvider } from '../../auth/application/providers/ITokenProvider';

export interface UploadMediaDTO {
    file: Buffer;
    fileName: string;
    mimeType: string;
    category?: string;
    token: string;
}

@Injectable()
export class UploadMedia implements IHandler<UploadMediaDTO, Result<Media>> {
    constructor(
        private readonly storageService: IStorageService,
        private readonly mediaRepository: IMediaRepository,
        private readonly tokenProvider: ITokenProvider,
    ) {}

    async execute(request: UploadMediaDTO): Promise<Result<Media>> {
        const { file, fileName, mimeType, category, token } = request;

        // 1. Validate the token and get the user id. This will throw if the token is invalid.
        const tokenPayload = await this.tokenProvider.validateToken(token);
        const authorId = tokenPayload.id;

        // 2. Upload the file to the storage service
        const uploadResult = await this.storageService.upload(
            file,
            fileName,
            mimeType,
        );

        if (uploadResult.isFailure) {
            return Result.fail(uploadResult.error);
        }

        const { url } = uploadResult.getValue();

        // 3. Create the Media entity
        const media = Media.create(
            AuthorId.of(authorId),
            MediaName.of(fileName),
            MediaUrl.of(url),
            MediaMimeType.of(mimeType),
            MediaSize.of(file.length),
            MediaFormat.of(path.extname(fileName)),
            MediaCategory.of(category ?? 'generic'),
        );

        // 4. Save the media entity to the repository
        await this.mediaRepository.save(media);

        return Result.ok(media);
    }
}
