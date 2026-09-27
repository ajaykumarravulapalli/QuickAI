import sql from "../configs/db.js";


export const getUserCreations = async(req, res)=>{
    try {
        const {userId} = req.auth()

       const creation = await sql` SELECT * FROM creation WHERE user_id = ${userId} ORDER BY created_at DESC`;

      res.json({success: true,creation });

    }catch(error){
        res.json({success: false, message: error.message});
    }
}

export const getPublishedCreations = async(req, res)=>{
    try {

       const creation = await sql` SELECT * FROM creation WHERE publish = true ORDER BY created_at DESC`;

      res.json({success: true,creation });

    }catch(error){
        res.json({success: false, message: error.message});
    }
}

export const toggleLikeCreations = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    // Fetch the creation
    const [creation] = await sql`SELECT * FROM creation WHERE id = ${id}`;
    if (!creation) {
      return res.json({ success: false, message: "Creation not found" });
    }

    const currentLikes = creation.likes || [];
    const userIdStr = String(userId);
    let updatedLikes;
    let message;

    // Toggle like/unlike
    if (currentLikes.includes(userIdStr)) {
      updatedLikes = currentLikes.filter((u) => u !== userIdStr);
      message = "Creation unliked";
    } else {
      updatedLikes = [...currentLikes, userIdStr];
      message = "Creation liked";
    }

    // Convert JS array to PostgreSQL array literal format
    const formattedArray = `{${updatedLikes.map((u) => `"${u}"`).join(",")}}`;

    // ✅ Use proper Neon tagged template syntax
    await sql`
      UPDATE creation
      SET likes = ${formattedArray}::text[]
      WHERE id = ${id};
    `;

    res.json({ success: true, message });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
