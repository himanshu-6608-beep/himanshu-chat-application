import Messages from "../models/messages.js";

export const getMessages = async (req, res) => {
  try {
    const {  receiverId } = req.params;
    const senderId = req.user._id
    console.log("senderID=",senderId)
    const messages = await Messages.find({
      $or: [
        {
          sender: senderId,
          receiver: receiverId,
        },
        {
          sender: receiverId,
          receiver: senderId,
        },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};