import { Injectable } from "@nestjs/common";
import { IAssetUrlResolver } from "../../application/providers/IAssetUrlResolver";

@Injectable()
export class AssetUrlResolver implements IAssetUrlResolver {
  resolveAvatarUrl(id: string): string {
    if (!id || id.trim() === "") return "";
    // Basic resolver: map id to a predictable media route
    return `/media/assets/${id}`;
  }
}
