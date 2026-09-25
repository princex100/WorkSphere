import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

export interface UploadOptions {
    folder?: string;
    resource_type?: "image" | "raw" | "video" | "auto";
    public_id?: string;
}

export const uploadBufferToCloudinary = async (
    buffer: Buffer,
    options: UploadOptions = {}
): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: options.folder || "worksphere",
                resource_type: options.resource_type || "auto",
                public_id: options.public_id
            },
            (error, result) => {
                if (error || !result) {
                    return reject(error || new Error("Cloudinary upload failed"));
                }
                resolve(result);
            }
        );

        uploadStream.end(buffer);
    });
};

export const deleteFromCloudinary = async (
    publicId: string,
    resourceType: string = "image"
): Promise<{ result: string }> => {
    try {
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType === "raw" ? "raw" : resourceType === "video" ? "video" : "image"
        });
        return response;
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        return { result: "error" };
    }
};

export default cloudinary;
