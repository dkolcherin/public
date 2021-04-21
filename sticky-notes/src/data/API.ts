export class API {
  static save = (data: Array<object>) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(`Data was saved: ${JSON.stringify(data)}`);
      }, 1000);
    });
  }
}