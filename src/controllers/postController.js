import * as postService from "../services/postService.js";

export const getPosts = async (req, res, next) => {
  try {
    const { skip, take } = req.query;
    const currentUserId = req.user?.id;
    const posts = await postService.getAllPosts(currentUserId, skip, take);
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const { title, content, thumbnailUrl, destinationIds } = req.body;
    const userId = req.user.id;

    console.log("Create Post Request:", { 
      title, 
      userId, 
      filesCount: req.files ? req.files.length : 0 
    });
    
    // Xử lý files upload
    let mediaFiles = [];
    let finalThumbnailUrl = thumbnailUrl;

    if (req.files && req.files.length > 0) {
      mediaFiles = req.files.map(file => {
        console.log("Processing file:", { originalname: file.originalname, mimetype: file.mimetype });
        return {
          fileUrl: `/uploads/${file.filename}`,
          fileType: file.mimetype.startsWith('video/') ? 'video' : 'image'
        };
      });
      
      // Nếu không có thumbnailUrl từ client, lấy ảnh/video đầu tiên làm thumbnail
      if (!finalThumbnailUrl) {
        finalThumbnailUrl = mediaFiles[0].fileUrl;
      }
    }

    const post = await postService.createPost(userId, { 
      title, 
      content, 
      thumbnailUrl: finalThumbnailUrl, 
      destinationIds,
      mediaFiles 
    });
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const getPostDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;
    const post = await postService.getPostDetail(id, currentUserId);
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await postService.toggleLike(userId, id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { content } = req.body;
    if (!content) throw new Error("Vui lòng nhập nội dung bình luận");
    const comment = await postService.addComment(userId, id, content);
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

export const getMyPosts = async (req, res, next) => {
  try {
    const { skip, take } = req.query;
    const posts = await postService.getUserPosts(req.user.id, skip, take);
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
};

export const getSavedPosts = async (req, res, next) => {
  try {
    const { skip, take } = req.query;
    const posts = await postService.getSavedPosts(req.user.id, skip, take);
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
};

export const toggleSave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await postService.toggleSavePost(userId, id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
