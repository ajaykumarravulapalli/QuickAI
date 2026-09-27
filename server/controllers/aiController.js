/*import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { prompt, length } = req.body;
    const plan = req.plan || "free";
    const free_usage = req.free_usage || 0;

    if (!prompt) {
      return res.json({ success: false, message: "Prompt is required." });
    }

    // ✅ Usage limit
    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    // ✅ Generate content using Gemini API (OpenAI compatible call)
    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: `Write an article of ${length || 500} words on: ${prompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: length || 800,
    });

    console.log("Gemini response:", response);

    const content = response?.choices?.[0]?.message?.content || "No content generated.";

    // ✅ Save to Neon
    const result = await sql`
      INSERT INTO creation (user_id, prompt, content, type)
      VALUES (${userId || "test_user"}, ${prompt}, ${content}, 'article')
      RETURNING *;
    `;

    // ✅ Update usage if free plan
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    // ✅ Success response
    res.json({
      success: true,
      message: "Article generated and saved successfully!",
      data: result[0],
    });
  } catch (error) {
    console.error("Error generating article:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};*/
import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import {v2 as cloudinary} from 'cloudinary';
import axios from "axios";
import FormData from "form-data";
import fs from 'fs';
import { PDFParse } from "pdf-parse";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

export const generateArticle = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const { prompt, length } = req.body;
    if (!prompt) {
      return res.json({ success: false, message: "Prompt is required." });
    }

    // ✅ Fetch current metadata from Clerk
    const user = await clerkClient.users.getUser(userId);
    const metadata = user.privateMetadata || {};
    const plan = metadata.plan || "free";
    const free_usage = metadata.free_usage || 0;

    // ✅ Usage limit
    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    // ✅ Generate content
    const response = await AI.chat.completions.create({
      model: GEMINI_MODEL,
      messages: [
        {
          role: "user",
          content: `Write an article of ${length || 500} words on: ${prompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: length || 800,
    });

    const content = response?.choices?.[0]?.message?.content || "No content generated.";

    // ✅ Save to Neon
    const result = await sql`
      INSERT INTO creation (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')
      RETURNING *;
    `;

    // ✅ Update Clerk usage
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          ...metadata,
          free_usage: free_usage + 1,
        },
      });
    }

    // ✅ Success response
    res.json({
      success: true,
      message: "Article generated and saved successfully!",
      data: result[0],
    });
  } catch (error) {
    console.error("Error generating article:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const generateBlogTitle = async (req, res) => {
  try {
   const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.json({ success: false, message: "Prompt is required." });
    }

    // ✅ Fetch current metadata from Clerk
    const user = await clerkClient.users.getUser(userId);
    const metadata = user.privateMetadata || {};
    const plan = metadata.plan || "free";
    const free_usage = metadata.free_usage || 0;

    // ✅ Usage limit
    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    // ✅ Generate content
    const response = await AI.chat.completions.create({
      model: GEMINI_MODEL,
      messages: [
        {
          role: "user",
          content:prompt,
        },
      ],
      temperature: 0.7,
     // max_tokens: 100,
    });

    const content = response?.choices?.[0]?.message?.content || "No content generated.";

    // ✅ Save to Neon
    const result = await sql`
      INSERT INTO creation (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
      RETURNING *;
    `;

    // ✅ Update Clerk usage
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          ...metadata,
          free_usage: free_usage + 1,
        },
      });
    }

    // ✅ Success response
    res.json({
      success: true,
      message: "Article generated and saved successfully!",
      data: result[0],
    });
  } catch (error) {
    console.error("Error generating article:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const generateImage  = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const { prompt, publish } = req.body;
    if (!prompt) {
      return res.json({ success: false, message: "Prompt is required." });
    }

    // ✅ Fetch user plan and usage
    const user = await clerkClient.users.getUser(userId);
    const plan = user.privateMetadata?.plan || "free";
    console.log("User plan:", plan);

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    // ✅ Generate image using ClipDrop
    const formData = new FormData();
    formData.append("prompt", prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "x-api-key": process.env.CLIPDROP_API_KEY,
        },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(data, "binary").toString("base64")}`;

    // ✅ Upload to Cloudinary
    const { secure_url } = await cloudinary.uploader.upload(base64Image, {
      folder: "quickai_generated_images",
    });

    // ✅ Save record to Neon database
    const result = await sql`
      INSERT INTO creation (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
      RETURNING *;
    `;

    // ✅ Increment free usage if user is not premium
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          ...metadata,
          free_usage: free_usage + 1,
        },
      });
    }

    // ✅ Success response
    res.json({
      success: true,
      message: "Image generated and saved successfully!",
      data: result[0],
    });
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeImagebackground = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const image = req.file;
    if (!image) {
      return res.json({ success: false, message: "Image is required." });
    }

    const user = await clerkClient.users.getUser(userId);
    const plan = user.privateMetadata?.plan || "free";
    console.log("User plan:", plan);

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [{ effect: "background_removal" }],
    });

    const result = await sql`
      INSERT INTO creation (user_id, prompt, content, type)
      VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')
      RETURNING *;
    `;

    res.json({
      success: true,
      data: { content: secure_url },
    });
  } catch (error) {
    console.error("Error removing background:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const removeImageObject = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const object = req.body.object; // ✅ extract string properly
    const image = req.file; // ✅ correct file assignment

    if (!object || !image) {
      return res.json({ success: false, message: "Image and object are required." });
    }

    // ✅ Fetch current metadata from Clerk
    const user = await clerkClient.users.getUser(userId);
    const metadata = user.privateMetadata || {};
    const plan = metadata.plan || "free";
    const free_usage = metadata.free_usage || 0;

    // ✅ Usage limit (premium only)
    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    // ✅ Upload image to Cloudinary
    const { public_id } = await cloudinary.uploader.upload(image.path);

    // ✅ Use Cloudinary’s AI object removal
    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    // ✅ Save to Neon DB
    const result = await sql`
      INSERT INTO creation (user_id, prompt, content, type)
      VALUES (${userId}, ${"Remove object: " + object}, ${imageUrl}, 'image')
      RETURNING *;
    `;

    // ✅ Success response
    res.json({
      success: true,
      content: imageUrl,
      data: result[0],
    });
  } catch (error) {
    console.error("Error generating article:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const resumeReview = async (req, res) => {
  const resume = req.file;

  try {
    const userId = req.auth?.userId;
    if (!userId) {
      if (resume?.path && fs.existsSync(resume.path)) {
        try { fs.unlinkSync(resume.path); } catch (_) {}
      }
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    if (!resume) {
      return res.status(400).json({ success: false, message: "Please upload a resume (PDF)." });
    }

    // Check file extension / mimetype
    const isPdf =
      resume.mimetype === "application/pdf" ||
      resume.originalname?.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      if (resume.path && fs.existsSync(resume.path)) {
        try { fs.unlinkSync(resume.path); } catch (_) {}
      }
      return res.status(400).json({ success: false, message: "Only PDF files are supported." });
    }

    if (resume.size > 5 * 1024 * 1024) {
      if (resume.path && fs.existsSync(resume.path)) {
        try { fs.unlinkSync(resume.path); } catch (_) {}
      }
      return res.status(400).json({
        success: false,
        message: "Resume file size exceeds allowed limit (5MB).",
      });
    }

    // Fetch current metadata from Clerk
    const user = await clerkClient.users.getUser(userId);
    const metadata = user.privateMetadata || {};
    const plan = metadata.plan || req.plan || "free";
    const free_usage = metadata.free_usage || 0;

    // Usage limit for free tier
    if (plan !== "premium" && free_usage >= 10) {
      if (resume.path && fs.existsSync(resume.path)) {
        try { fs.unlinkSync(resume.path); } catch (_) {}
      }
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    // Extract text from PDF
    let pdfText = "";
    try {
      const dataBuffer = fs.readFileSync(resume.path);
      const parser = new PDFParse({ data: dataBuffer });
      const textResult = await parser.getText();
      pdfText = textResult?.text?.trim() || "";
      await parser.destroy();
    } catch (parseError) {
      console.error("PDF parsing error:", parseError);
      return res.status(400).json({
        success: false,
        message: "Failed to read the PDF file. Please ensure it is a valid, uncorrupted PDF.",
      });
    } finally {
      // Clean up uploaded file from disk
      if (resume.path && fs.existsSync(resume.path)) {
        try { fs.unlinkSync(resume.path); } catch (_) {}
      }
    }

    if (!pdfText || pdfText.length < 20) {
      return res.status(400).json({
        success: false,
        message:
          "Could not extract readable text from the resume. Please ensure the PDF contains selectable text (not scanned images).",
      });
    }

    const prompt = `You are an expert HR professional and technical resume reviewer.
Review the following resume and provide a detailed, highly constructive, and structured review.

Use markdown format with clear headings, bullet points, and actionable advice:
### 1. Executive Summary & First Impressions
Briefly summarize the candidate's profile and overall visual/structural impression.

### 2. Key Strengths
Highlight 3-5 major positive points, achievements, and strong qualifications.

### 3. Areas for Improvement & Red Flags
Detail specific weaknesses, missing metrics, vague descriptions, or gaps.

### 4. ATS (Applicant Tracking System) & Formatting Tips
Advice on keywords, readability, structure, and ATS friendliness.

### 5. Actionable Next Steps
Top 3 concrete recommendations the candidate should implement immediately.

Resume Content:
${pdfText}`;

    // Generate content using Gemini
    let content = "";
    try {
      const response = await AI.chat.completions.create({
        model: GEMINI_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      content = response?.choices?.[0]?.message?.content || "No review content generated.";
    } catch (aiError) {
      console.error("Gemini AI error during resume review:", aiError);
      return res.status(500).json({
        success: false,
        message: aiError.message || "Failed to generate review from AI service.",
      });
    }

    // Save to Neon database
    let dbRecord = null;
    try {
      const result = await sql`
        INSERT INTO creation (user_id, prompt, content, type)
        VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')
        RETURNING *;
      `;
      dbRecord = result?.[0];
    } catch (dbError) {
      console.error("Database save error:", dbError);
    }

    // Increment usage for free tier
    if (plan !== "premium") {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: {
            ...metadata,
            free_usage: free_usage + 1,
          },
        });
      } catch (clerkErr) {
        console.error("Error updating Clerk metadata:", clerkErr);
      }
    }

    // Success response
    res.json({
      success: true,
      content,
      data: {
        content,
        creation: dbRecord,
      },
    });
  } catch (error) {
    if (resume?.path && fs.existsSync(resume.path)) {
      try { fs.unlinkSync(resume.path); } catch (_) {}
    }
    console.error("Error in resume review:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error during resume review.",
    });
  }
};




