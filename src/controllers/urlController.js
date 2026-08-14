import { createShortUrl, getOriginalUrl } from "../services/urlService.js";

export const createUrl = async (req, res) => {
  try {
    const originalUrl = req.body.url;
    if (!originalUrl) {
      console.error(error);
      return res.status(400).json({
        error: "Please provide a url!",
      });
    }
    const result = await createShortUrl(originalUrl);
    res.status(201).json(result);
  } catch {
    res.status(500).json({
      error: "Something went wrong!",
    });
  }
};

export const redirectToUrl = async (req, res) => {
  try {
    const shortCode = req.params.code;
    const originalUrl = await getOriginalUrl(shortCode);
    if (!originalUrl) {
        return res.status(404).json({
        error: "Url not found!",
      });
    }
    res.redirect(originalUrl);
  } catch {
    res.status(500).json({
      error: "Something went wrong!",
    });
  }
};
