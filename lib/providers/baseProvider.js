export class BaseProvider {
  constructor() {
    if (this.constructor === BaseProvider) {
      throw new Error(
        "Abstract class BaseProvider cannot be instantiated directly",
      );
    }
  }

  async fetch() {
    throw new Error("fetch() method must be implemented by subclass");
  }

  async transform(rawData) {
    throw new Error("transform() method must be implemented by subclass");
  }
}
