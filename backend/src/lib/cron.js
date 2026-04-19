import cron from "node-cron";
import Message from "../models/Message.js";
import cloudinary from "./cloudinary.js";

/**
 * Scheduled job to delete media messages older than 2 days
 * Runs every day at 12:00 AM
 */
export const initCronJobs = () => {
    // Cron schedule: "0 0 * * *" (Every day at midnight)
    // For testing you can use "* * * * *" (Every minute)
    cron.schedule("0 0 * * *", async () => {
        console.log("Running Scheduled Cleanup Task: Deleting messages with media older than 2 days...");
        
        try {
            const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

            // Find messages that have media (image) and are older than 2 days
            const oldMediaMessages = await Message.find({
                image: { $exists: true, $ne: null },
                createdAt: { $lt: twoDaysAgo }
            });

            console.log(`Found ${oldMediaMessages.length} messages with media to delete.`);

            for (const msg of oldMediaMessages) {
                // 1. Delete from Cloudinary if cloudinaryId exists
                if (msg.cloudinaryId) {
                    try {
                        await cloudinary.uploader.destroy(msg.cloudinaryId);
                    } catch (err) {
                        console.error(`Failed to delete Cloudinary image ${msg.cloudinaryId}:`, err);
                    }
                }

                // 2. Delete the message permanently from DB
                await Message.findByIdAndDelete(msg._id);
            }

            if (oldMediaMessages.length > 0) {
                console.log("Cleanup completed successfully.");
            }
        } catch (error) {
            console.error("Error during scheduled cleanup:", error);
        }
    });
};
