import app from "./src/index";

const port = process.env.PORT || 3000;

console.log(`Server starting on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
