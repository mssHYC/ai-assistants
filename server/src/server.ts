import "./config/env";
import app from "./app";
import cors from "cors";

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
