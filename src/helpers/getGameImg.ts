import { readdirSync } from "fs";
import { join } from "path";

const path = join(__dirname, "../../public/img");
const images = readdirSync(path).filter((file) => file.endsWith(".png"));

export default (game: string): string | null => {
  for (const img of images) {
    if (img.includes(game)) return img;
  }

  return null;
};
