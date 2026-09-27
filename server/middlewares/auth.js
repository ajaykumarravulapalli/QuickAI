import { clerkClient } from "@clerk/express";

export const auth = async (req, res, next) => {
  try {
    const authData = await req.auth();
    const userId = authData.userId;
    const has = authData.has;
    const hasPremiumPlan = typeof has === "function" ? await has({ plan: "premium" }) : false;

    const user = await clerkClient.users.getUser(userId);
    const metadata = user.privateMetadata || {};
    const isPremium = Boolean(hasPremiumPlan || metadata.plan === "premium");

    if (!isPremium && typeof metadata.free_usage === "number") {
      req.free_usage = metadata.free_usage;
    } else if (!isPremium) {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          ...metadata,
          free_usage: 0,
        },
      });
      req.free_usage = 0;
    } else {
      req.free_usage = metadata.free_usage || 0;
    }

    req.plan = isPremium ? "premium" : "free";
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};