import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as uniqueFilename from "unique-filename";
import { S3 } from "aws-sdk";

@Injectable()
export class S3Service {
  constructor(private readonly configService: ConfigService) {}

  getS3Instance() {
    return new S3({
      accessKeyId: this.configService.get("IAM_USER_KEY"),
      secretAccessKey: this.configService.get("IAM_USER_SECRET"),
    });
  }

  async uploadImageToS3(dataBuffer: Buffer) {
    const uploadResult = await this.getS3Instance()
      .upload({
        Bucket: this.configService.get("BUCKET_NAME"),
        ACL: "private",
        Body: dataBuffer,
        Key: uniqueFilename("", ""),
        ContentType: "image/webp",
      })
      .promise();
    return uploadResult.Key;
  }

  async uploadImagesToS3(dataBuffer: Buffer[]): Promise<[image: string, images: string[]]> {
    const uploadPromises = dataBuffer.map((img) =>
      this.getS3Instance()
        .upload({
          Bucket: this.configService.get("BUCKET_NAME"),
          ACL: "private",
          Body: img,
          Key: uniqueFilename("", ""),
          ContentType: "image/webp",
        })
        .promise(),
    );

    const results = await Promise.all(uploadPromises);

    return [results.shift().Key, results.map((i) => i.Key)];
  }
}
