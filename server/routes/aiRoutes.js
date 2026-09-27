import express from "express";
import { auth } from "../middlewares/auth.js";
import { generateArticle, generateBlogTitle, generateImage, removeImagebackground, removeImageObject, resumeReview } from "../controllers/aiController.js";
import { upload } from "../configs/multer.js";

const aiRouter = express.Router();

aiRouter.get("/test", (req, res) => {
  res.json({ message: "AI Router is working ✅" });
});

aiRouter.post("/generate-article", auth, generateArticle);
aiRouter.post("/generate-blog-title", auth, generateBlogTitle);
aiRouter.post("/generate-image", auth, generateImage);
aiRouter.post("/remove-image-background", upload.single('image'), auth, removeImagebackground);
aiRouter.post("/remove-image-object",upload.single('image'), auth, removeImageObject);
const handleResumeUpload = (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to process uploaded file.",
      });
    }
    next();
  });
};

aiRouter.post("/resume-review", handleResumeUpload, auth, resumeReview);

export default aiRouter;
