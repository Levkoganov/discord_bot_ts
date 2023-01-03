import { connect, ConnectOptions, set } from "mongoose";

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as ConnectOptions;

export default (url: string): void => {
  set("strictQuery", false); // strictQuery: true is Depricated

  connect(url, options)
    .then(() => {
      console.log(`Connected to: ${url}`);
    })
    .catch((err) => {
      `Failed to connect: ${url},\n ${err}`;
    });
};
